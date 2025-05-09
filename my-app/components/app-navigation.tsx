"use client";

import { Page } from "@/data/pages";
import { useLanguage } from "@/hooks/language-context";
import { cn } from "@/lib/utils";
import { AppUser } from "@/types/auth";
import { useClickAway } from "@uidotdev/usehooks";
import { AnimatePresence, motion } from "framer-motion";
import * as LucideIcons from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import * as React from "react";
import LanguageSwitcher from "./language-switcher";
import UserAvatar from "./user-avatar";

// Helper to convert kebab-case to PascalCase for Lucide icons
function getIcon(name?: string) {
  if (!name) return null;
  const pascalName = name
    .split("-")
    .map((chunk) => chunk.charAt(0).toUpperCase() + chunk.slice(1))
    .join("");

  const Icon = (LucideIcons as any)[pascalName];
  return typeof Icon === "function"
    ? (Icon as React.FC<React.SVGProps<SVGSVGElement>>)
    : null;
}

interface AppNavigationProps {
  pages: Page[];
  user: AppUser;
}

export default function AppNavigation({ pages, user }: AppNavigationProps) {
  const { language } = useLanguage();
  const pathname = usePathname();
  const [activeMenu, setActiveMenu] = React.useState<string | null>(null);
  const menuRef = useClickAway<HTMLDivElement>(() => {
    setActiveMenu(null);
  });

  // Function to get the title based on language
  const getTitle = React.useCallback(
    (page: Page) => {
      return language === "ar" ? page.ar_title : page.en_title;
    },
    [language]
  );

  const getDescription = React.useCallback(
    (page: Page) => {
      return language === "ar" ? page.ar_description : page.en_description;
    },
    [language]
  );

  // Group pages by first path segment
  const navItems = React.useMemo(() => {
    const groups = new Map<string, Page[]>();

    // Group pages by first segment
    for (const page of pages) {
      const segment = page.path.split("/").filter(Boolean)[0];
      if (!segment) continue;

      if (!groups.has(segment)) groups.set(segment, []);
      groups.get(segment)!.push(page);
    }

    // Transform into nav items
    return Array.from(groups.entries())
      .map(([segment, items]) => {
        const parent = items.find((p) => p.path === `/${segment}`);
        const children = items.filter((p) => p.path !== `/${segment}`);
        children.sort((a, b) => getTitle(a).localeCompare(getTitle(b)));

        return {
          key: segment,
          label: parent
            ? getTitle(parent)
            : segment[0].toUpperCase() + segment.slice(1),
          path: parent?.path,
          icon: parent?.icon,
          children,
        };
      })
      .sort((a, b) => a.label.localeCompare(b.label));
  }, [pages, getTitle]);

  // Check if a path is active
  const isActive = React.useCallback(
    (path: string) => {
      if (!path) return false;
      if (path === pathname) return true;

      // For parent paths, check if current path starts with this path
      if (path.split("/").filter(Boolean).length === 1) {
        return pathname?.startsWith(path) && pathname !== "/";
      }

      return false;
    },
    [pathname]
  );

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur-sm">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Brand logo */}
        <Link href="/" className="flex items-center">
          <div className="relative h-8 w-8 mr-2 rounded-md bg-gradient-to-br from-primary to-primary-foreground">
            <LucideIcons.Shield className="absolute inset-0 m-auto text-white h-5 w-5" />
          </div>
          <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary-foreground">
            RBAC Admin
          </span>
        </Link>

        {/* Custom Navigation Menu */}
        <div className="flex-1 flex justify-center" ref={menuRef}>
          <ul className="flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = getIcon(item.icon);
              const hasChildren = item.children.length > 0;
              const isItemActive = item.path ? isActive(item.path) : false;
              const isChildActive =
                hasChildren &&
                item.children.some((child) => pathname === child.path);
              const isActiveItem = isItemActive || isChildActive;
              const isMenuOpen = activeMenu === item.key;

              return (
                <li key={item.key} className="relative">
                  {hasChildren ? (
                    <>
                      <button
                        onClick={() =>
                          setActiveMenu(isMenuOpen ? null : item.key)
                        }
                        className={cn(
                          "px-3 py-2 rounded-md inline-flex items-center gap-1.5 transition-all",
                          "hover:bg-accent hover:text-accent-foreground",
                          isActiveItem &&
                            "bg-primary/10 text-primary font-medium",
                          isMenuOpen && "bg-primary/10"
                        )}
                      >
                        {Icon && <Icon className="h-4 w-4" />}
                        <span>{item.label}</span>
                        <LucideIcons.ChevronDown
                          className={cn(
                            "h-3.5 w-3.5 transition-transform",
                            isMenuOpen && "rotate-180"
                          )}
                        />
                      </button>

                      <AnimatePresence>
                        {isMenuOpen && (
                          <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 10 }}
                            transition={{ duration: 0.15 }}
                            className="absolute left-0 mt-2 bg-white rounded-xl shadow-xl border border-gray-100 z-50 w-[650px] overflow-hidden"
                          >
                            <div className="p-4 grid grid-cols-2 gap-3">
                              {item.children.map((child) => {
                                const ChildIcon = getIcon(child.icon);
                                const isChildItemActive =
                                  pathname === child.path;

                                return (
                                  <Link
                                    key={child.id}
                                    href={child.path}
                                    onClick={() => setActiveMenu(null)}
                                    className={cn(
                                      "group flex items-start p-3 rounded-lg transition-all",
                                      "hover:bg-gray-50 hover:shadow-sm",
                                      isChildItemActive
                                        ? "bg-primary/5 ring-1 ring-primary/10"
                                        : ""
                                    )}
                                  >
                                    {ChildIcon && (
                                      <div
                                        className={cn(
                                          "flex-shrink-0 mr-3 p-2.5 rounded-lg transition-colors",
                                          isChildItemActive
                                            ? "bg-primary/10 text-primary"
                                            : "bg-gray-100 text-gray-500 group-hover:bg-primary/5 group-hover:text-primary/80"
                                        )}
                                      >
                                        <ChildIcon className="h-5 w-5" />
                                      </div>
                                    )}
                                    <div>
                                      <div
                                        className={cn(
                                          "font-medium mb-0.5",
                                          isChildItemActive
                                            ? "text-primary"
                                            : "text-gray-700 group-hover:text-primary/90"
                                        )}
                                      >
                                        {getTitle(child)}
                                      </div>
                                      {getDescription(child) && (
                                        <p className="text-xs leading-relaxed text-gray-500 group-hover:text-gray-600">
                                          {getDescription(child)}
                                        </p>
                                      )}
                                    </div>

                                    {/* Subtle arrow indicator on hover */}
                                    <div className="ml-auto self-center opacity-0 group-hover:opacity-100 transition-opacity">
                                      <LucideIcons.ArrowRight className="h-3.5 w-3.5 text-primary/70" />
                                    </div>
                                  </Link>
                                );
                              })}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </>
                  ) : (
                    <Link
                      href={item.path!}
                      className={cn(
                        "px-3 py-2 rounded-md inline-flex items-center gap-1.5 transition-all",
                        "hover:bg-accent hover:text-accent-foreground",
                        isActiveItem && "bg-primary/10 text-primary font-medium"
                      )}
                    >
                      {Icon && <Icon className="h-4 w-4" />}
                      <span>{item.label}</span>
                    </Link>
                  )}
                </li>
              );
            })}
          </ul>
        </div>

        {/* User section */}
        <div className="flex items-center gap-5">
          <LanguageSwitcher />
          <UserAvatar user={user} />
        </div>
      </div>
    </nav>
  );
}
