import { UrlForm } from "@/components/url-form";
import { createClient } from "@/lib/supabase/server";
import { SignOutButton } from "@/components/sign-out-button";

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ url?: string }>;
}) {
  const { url } = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="min-h-screen bg-neutral-50">
      <main className="max-w-4xl mx-auto px-6 py-16">
        <div className="mb-10 flex items-start justify-between">
          <div>
            <a href="/" className="flex items-center gap-3 mb-2 no-underline">
              <img src="/logo.svg" alt="OpenBrand logo" width={32} height={34} />
              <h1 className="text-3xl font-bold text-neutral-900">
                OpenBrand
              </h1>
            </a>
            <p className="text-neutral-500">
              Enter a website to extract its brand assets - logos, colors, and
              images.
            </p>
          </div>
          <div className="flex items-center gap-4 text-sm">
            {user && (
              <>
                <span className="text-neutral-500">{user.email}</span>
                <a
                  href="/dashboard"
                  className="text-neutral-400 hover:text-neutral-900 transition-colors font-medium"
                >
                  API Keys
                </a>
                <SignOutButton />
              </>
            )}
            <a
              href="https://github.com/ethanjyx/openbrand"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-neutral-400 hover:text-neutral-900 transition-colors font-medium"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0 1 12 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" />
              </svg>
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="text-amber-400"
              >
                <path d="M12 .587l3.668 7.568 8.332 1.151-6.064 5.828 1.48 8.279L12 19.771l-7.416 3.642 1.48-8.279L0 9.306l8.332-1.151z" />
              </svg>
              <span>Star us</span>
              <span className="text-neutral-400">({starCount})</span>
            </a>
          </div>
        </div>
        <UrlForm initialUrl={url} />

        <section className="mt-16">
          <h2 className="text-xl font-semibold text-neutral-900 mb-4">
            Get Started
          </h2>
          <p className="text-neutral-500 mb-3 text-sm">
            Install the npm package:
          </p>
          <pre className="p-4 rounded-xl bg-neutral-900 text-neutral-100 text-sm overflow-x-auto font-mono mb-4">
            npm add openbrand
          </pre>
          <p className="text-neutral-500 mb-3 text-sm">
            Extract brand assets from any URL:
          </p>
          <pre className="p-4 rounded-xl bg-neutral-900 text-neutral-100 text-sm overflow-x-auto font-mono leading-relaxed mb-4">{`import { extractBrandAssets } from "openbrand";

const brand = await extractBrandAssets("https://stripe.com");
// brand.brand_name → "Stripe"
// brand.logos → LogoAsset[]
// brand.colors → ColorAsset[]
// brand.backdrop_images → BackdropAsset[]`}</pre>
          <p className="text-neutral-400 text-sm">
            Server-side only — requires Node.js or Bun.
          </p>
        </section>
      </main>
      <footer className="max-w-4xl mx-auto px-6 pb-10 text-center text-sm text-neutral-400">
        OpenBrand is designed, built, and backed by{" "}
        <a
          href="http://tight.software/"
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:text-neutral-600 transition-colors"
        >
          Tight Software LLC
        </a>
        .
      </footer>
    </div>
  );
}
