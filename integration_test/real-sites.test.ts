import { describe, test, expect } from "bun:test";
import { extractBrandAssets } from "../src";

function unwrap(result: Awaited<ReturnType<typeof extractBrandAssets>>) {
  if (!result.ok) throw new Error(`Extraction failed: ${result.error.code} — ${result.error.message}`);
  return result.data;
}

describe("real site extraction", () => {
  test("github.com — extracts brand name, logos, and colors", async () => {
    const data = unwrap(await extractBrandAssets("https://github.com"));

    expect(data.brand_name).toBeString();
    expect(data.brand_name.length).toBeGreaterThan(0);
    expect(data.logos.length).toBeGreaterThanOrEqual(1);

    for (const logo of data.logos) {
      expect(logo.url).toBeString();
      expect(logo.url.length).toBeGreaterThan(0);
    }

    for (const color of data.colors) {
      expect(color.hex).toMatch(/^#[0-9a-fA-F]{6}$/);
    }
  }, 30000);

  test("stripe.com — extracts logos, colors, and backdrop images", async () => {
    const data = unwrap(await extractBrandAssets("https://stripe.com"));

    expect(data.brand_name).toBeString();
    expect(data.brand_name.length).toBeGreaterThan(0);
    expect(data.logos.length).toBeGreaterThanOrEqual(1);

    for (const logo of data.logos) {
      expect(logo.url).toBeString();
      expect(logo.url.length).toBeGreaterThan(0);
    }

    for (const color of data.colors) {
      expect(color.hex).toMatch(/^#[0-9a-fA-F]{6}$/);
    }

    for (const backdrop of data.backdrop_images) {
      expect(backdrop.url).toBeString();
      expect(backdrop.url.length).toBeGreaterThan(0);
    }
  }, 30000);

  test("example.com — minimal site returns valid result or EMPTY_CONTENT", async () => {
    const result = await extractBrandAssets("https://example.com");

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
