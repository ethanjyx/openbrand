import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ApiKeyManager } from "@/components/api-key-manager";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <main className="max-w-4xl mx-auto px-6 py-16">
        <div className="mb-10 flex items-start justify-between">
          <div>
            <a href="/" className="flex items-center gap-3 mb-2 no-underline">
              <img
                src="/logo.svg"
                alt="OpenBrand logo"
                width={32}
                height={34}
              />
              <h1 className="text-3xl font-bold text-neutral-900">
                OpenBrand
              </h1>
            </a>
            <p className="text-neutral-500">Manage your API keys</p>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <span className="text-neutral-500">{user.email}</span>
            <a
              href="/"
              className="text-neutral-400 hover:text-neutral-900 transition-colors font-medium"
            >
              Extract
            </a>
          </div>
        </div>
        <ApiKeyManager />
      </main>
    </div>
  );
}
