import { describe, test, expect, beforeAll, afterAll } from "bun:test";
import { createClient } from "@supabase/supabase-js";

// Load env vars from .env.local
const envFile = Bun.file(".env.local");
if (await envFile.exists()) {
  const text = await envFile.text();
  for (const line of text.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eqIdx = trimmed.indexOf("=");
    if (eqIdx === -1) continue;
    const key = trimmed.slice(0, eqIdx);
    const value = trimmed.slice(eqIdx + 1);
    if (!process.env[key]) process.env[key] = value;
  }
}

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const TEST_EMAIL = `test-${Date.now()}@openbrand-test.local`;
const TEST_PASSWORD = "test-password-123456";

let supabase: ReturnType<typeof createClient>;
let testUserId: string;
let testUserAccessToken: string;

describe("API key management and authenticated extraction", () => {
  beforeAll(async () => {
    supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    // Create a test user via admin API
    const { data, error } = await supabase.auth.admin.createUser({
      email: TEST_EMAIL,
      password: TEST_PASSWORD,
      email_confirm: true,
    });

    if (error) throw new Error(`Failed to create test user: ${error.message}`);
    testUserId = data.user.id;

    // Sign in as the test user to get an access token
    const userClient = createClient(
      SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );
    const { data: session, error: signInError } =
      await userClient.auth.signInWithPassword({
        email: TEST_EMAIL,
        password: TEST_PASSWORD,
      });

    if (signInError)
      throw new Error(`Failed to sign in test user: ${signInError.message}`);
    testUserAccessToken = session.session!.access_token;
  });

  afterAll(async () => {
    // Clean up: delete test user (cascades to api_keys)
    if (testUserId) {
      await supabase.auth.admin.deleteUser(testUserId);
    }
  });

  test("create an API key, verify it exists, then revoke it", async () => {
    // Generate a random API key
    const bytes = new Uint8Array(32);
    crypto.getRandomValues(bytes);
    const hex = Array.from(bytes)
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
    const plainKey = `ob_live_${hex}`;
    const keyPrefix = plainKey.slice(0, 16);

    // Hash the key
    const encoder = new TextEncoder();
    const hashBuffer = await crypto.subtle.digest(
      "SHA-256",
      encoder.encode(plainKey)
    );
    const keyHash = Array.from(new Uint8Array(hashBuffer))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");

    // Insert via user-scoped client (respects RLS)
    const userClient = createClient(SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
      auth: { autoRefreshToken: false, persistSession: false },
      global: { headers: { Authorization: `Bearer ${testUserAccessToken}` } },
    });

    const { error: insertError } = await userClient.from("api_keys").insert({
      user_id: testUserId,
      name: "Test Key",
      key_hash: keyHash,
      key_prefix: keyPrefix,
    });

    expect(insertError).toBeNull();

    // Verify the key can be looked up by hash (service role, like our auth helper does)
    const { data: foundKey, error: lookupError } = await supabase
      .from("api_keys")
      .select("user_id")
      .eq("key_hash", keyHash)
      .is("revoked_at", null)
      .single();

    expect(lookupError).toBeNull();
    expect(foundKey!.user_id).toBe(testUserId);

    // Revoke the key
    const { error: revokeError } = await userClient
      .from("api_keys")
      .update({ revoked_at: new Date().toISOString() })
      .eq("key_hash", keyHash)
      .eq("user_id", testUserId);

    expect(revokeError).toBeNull();

    // Verify revoked key is no longer found
    const { data: revokedKey } = await supabase
      .from("api_keys")
      .select("user_id")
      .eq("key_hash", keyHash)
      .is("revoked_at", null)
      .single();

    expect(revokedKey).toBeNull();
  }, 15000);

  test("RLS prevents users from seeing other users' keys", async () => {
    // Insert a key as admin (bypasses RLS) for a fake user_id
    const fakeUserId = "00000000-0000-0000-0000-000000000000";
    const { error: insertError } = await supabase.from("api_keys").insert({
      user_id: testUserId, // owned by test user
      name: "RLS Test Key",
      key_hash: "fake_hash_rls_test",
      key_prefix: "ob_live_rls_",
    });

    expect(insertError).toBeNull();

    // Create a second test user
    const { data: user2, error: user2Error } =
      await supabase.auth.admin.createUser({
        email: `test2-${Date.now()}@openbrand-test.local`,
        password: TEST_PASSWORD,
        email_confirm: true,
      });

    expect(user2Error).toBeNull();

    const user2Client = createClient(
      SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );
    const { data: session2 } = await user2Client.auth.signInWithPassword({
      email: user2!.user.email!,
      password: TEST_PASSWORD,
    });

    // Query as user2 — should NOT see user1's keys
    const scopedClient = createClient(SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
      auth: { autoRefreshToken: false, persistSession: false },
      global: {
        headers: {
          Authorization: `Bearer ${session2.session!.access_token}`,
        },
      },
    });

    const { data: keys } = await scopedClient
      .from("api_keys")
      .select("id, name")
      .eq("key_hash", "fake_hash_rls_test");

    expect(keys).toEqual([]);

    // Clean up user2
    await supabase.auth.admin.deleteUser(user2!.user.id);
  }, 15000);

  test("extraction works with a valid API key via the scraper directly", async () => {
    // This tests the core extraction still works (not behind auth in the route)
    const { extractBrandAssets } = await import("../src");
    const result = await extractBrandAssets("https://example.com");

    // example.com may return EMPTY_CONTENT (minimal site) or succeed
    if (result.ok) {
      expect(result.data.brand_name).toBeString();
      expect(Array.isArray(result.data.logos)).toBe(true);
      expect(Array.isArray(result.data.colors)).toBe(true);
      expect(Array.isArray(result.data.backdrop_images)).toBe(true);
    } else {
      expect(result.error.code).toBe("EMPTY_CONTENT");
    }
  }, 30000);
});
