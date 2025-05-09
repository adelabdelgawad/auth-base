// app/(pages)/layout.tsx
import { getPages } from "@/actions/page-actions";
import AppNavigation from "@/components/app-navigation";
import { LanguageProvider } from "@/hooks/language-context";
import { currentUser } from "@/lib/auth.actions";
import { cookies } from "next/headers";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { ReactNode } from "react";
import { Toaster } from "sonner";

interface RootLayoutProps {
  children: ReactNode;
}

export default async function RootLayout({ children }: RootLayoutProps) {
  // Get the language cookie
  const langCookie =
    ((await cookies()).get("lang")?.value as "en" | "ar") || "en";

  const pages = await getPages();
  const user = await currentUser();

  return (
    <div className="min-h-screen flex flex-col text-gray-900 antialiased">
      <LanguageProvider initialLanguage={langCookie}>
        {/* Content container */}
        <div className="min-h-screen bg-gray-50">
          <AppNavigation
            pages={pages}
            user={
              user || {
                id: "",
                username: "Guest",
                fullname: "Guest User",
                title: "Guest",
                email: "guest@example.com",
                roles: [],
              }
            }
          />

          <main className="container mx-auto py-6 px-0">
            <NuqsAdapter>{children}</NuqsAdapter>
          </main>
        </div>

        <Toaster />
      </LanguageProvider>
    </div>
  );
}
