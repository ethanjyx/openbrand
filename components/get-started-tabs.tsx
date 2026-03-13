"use client";

import { useState } from "react";

const tabs = ["With API Key", "Self Hosting"] as const;
type Tab = (typeof tabs)[number];

export function GetStartedTabs({ isLoggedIn = false }: { isLoggedIn?: boolean }) {
  const [active, setActive] = useState<Tab>("With API Key");

  return (
    <section className="mt-16">
      <h2 className="text-xl font-semibold text-neutral-900 mb-4">
        Get Started
      </h2>

      <div className="flex gap-1 mb-6 bg-neutral-200/60 rounded-lg p-1 w-fit">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActive(tab)}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
              active === tab
                ? "bg-white text-neutral-900 shadow-sm"
                : "text-neutral-500 hover:text-neutral-700"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {active === "With API Key" ? <ApiKeyContent isLoggedIn={isLoggedIn} /> : <SelfHostingContent />}
    </section>
  );
}

function ApiKeyContent({ isLoggedIn }: { isLoggedIn: boolean }) {
  return (
    <div>
      <p className="text-neutral-500 mb-3 text-sm">
        Use the hosted API with your API key for programmatic access.
      </p>
      <a
        href={isLoggedIn ? "/dashboard" : "/login"}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-neutral-900 text-white text-sm font-medium hover:bg-neutral-800 transition-colors"
      >
        {isLoggedIn ? "Manage API keys" : "Login to get API key"}
      </a>
    </div>
  );
}

function SelfHostingContent() {
  return (
    <div>
      <p className="text-neutral-500 mb-3 text-sm">
        Install the npm package:
      </p>
      <pre className="p-4 rounded-xl bg-neutral-900 text-neutral-100 text-sm overflow-x-auto font-mono mb-4">
        npm add openbrand
      </pre>
      <p className="text-neutral-400 text-sm mb-4">
        Server-side only - requires Node.js or Bun.
      </p>
      <p className="text-neutral-500 mb-3 text-sm">
        Extract brand assets from any URL:
      </p>
      <pre className="p-4 rounded-xl bg-neutral-900 text-neutral-100 text-sm overflow-x-auto font-mono leading-relaxed mb-4">{`import { extractBrandAssets } from "openbrand";

const brand = await extractBrandAssets("https://stripe.com");
// brand.brand_name → "Stripe"
// brand.logos → LogoAsset[]
// brand.colors → ColorAsset[]
// brand.backdrop_images → BackdropAsset[]`}</pre>
    </div>
  );
}
