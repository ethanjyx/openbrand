import { createClient } from "@/lib/supabase/server";
import { createClient as createServiceClient } from "@supabase/supabase-js";

export async function getAuthenticatedUserId(
  request: Request
): Promise<string | null> {
  // 1. Check for Bearer token (API key)
  const authHeader = request.headers.get("authorization");
  if (authHeader?.startsWith("Bearer ")) {
    const token = authHeader.slice(7);
    return await validateApiKey(token);
  }

  // 2. Fall back to session cookie
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user?.id ?? null;
}

async function validateApiKey(key: string): Promise<string | null> {
  const encoder = new TextEncoder();
  const data = encoder.encode(key);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashHex = Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  const supabase = createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data: apiKey } = await supabase
    .from("api_keys")
    .select("user_id")
    .eq("key_hash", hashHex)
    .is("revoked_at", null)
    .single();

  if (apiKey) {
    // Update last_used_at (fire-and-forget)
    supabase
      .from("api_keys")
      .update({ last_used_at: new Date().toISOString() })
      .eq("key_hash", hashHex)
      .then();
    return apiKey.user_id;
  }

  return null;
}
