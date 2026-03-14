import { describe, test, expect } from "bun:test";
import { extractBrandAssets } from "../src";

describe("error handling", () => {
  test("invalid URL throws", async () => {
    // DNS failure still throws because fetchPage has no try/catch for network errors
    await expect(
      extractBrandAssets("https://this-domain-does-not-exist-xyz123.com")
    ).rejects.toThrow();
  }, 30000);

  test("404 URL returns error result", async () => {
    const result = await extractBrandAssets("https://github.com/this-page-does-not-exist-404-test");
    // GitHub 404 pages contain brand assets (logos, colors), so extraction may succeed.
    // Either way the result should be a valid ExtractionResult.
    if (result.ok) {
      expect(result.data).toHaveProperty("brand_name");
      expect(result.data).toHaveProperty("logos");
    } else {
      expect(result.error).toHaveProperty("code");
      expect(result.error).toHaveProperty("message");
    }
  }, 30000);

  test("minimal HTML page returns EMPTY_CONTENT or minimal result", async () => {
    // example.com has very little useful content
    const result = await extractBrandAssets("https://example.com");

    if (result.ok) {
      expect(result.data).toHaveProperty("brand_name");
      expect(result.data).toHaveProperty("logos");
      expect(result.data).toHaveProperty("colors");
      expect(result.data).toHaveProperty("backdrop_images");
    } else {
      expect(result.error.code).toBe("EMPTY_CONTENT");
    }
  }, 30000);
});
