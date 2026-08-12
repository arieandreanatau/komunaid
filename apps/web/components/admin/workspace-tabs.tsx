"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { workspaces, getWorkspaceFromPath, isActiveHref } from "./navigation";
import { useAuth } from "@/components/auth-provider";

export function WorkspaceTabs() {
  const pathname = usePathname();
  const { user } = useAuth();
  const workspaceKey = getWorkspaceFromPath(pathname);
  if (!workspaceKey) return null;
  const workspace = workspaces[workspaceKey];
  if (!workspace) return null;

  return (
    <div className="border-b border-gray-200 bg-white sticky top-16 z-20">
      <div className="max-w-7xl mx-auto px-4">
        <nav className="flex gap-0 overflow-x-auto scrollbar-hide" aria-label={`${workspace.label} tabs`}>
          {workspace.tabs.filter((tab) => !tab.superAdminOnly || user?.roles.includes("SUPER_ADMIN")).map((tab) => {
            const active = isActiveHref(pathname, tab.href);
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={`px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                  active
                    ? "border-komuna-blue text-komuna-blue"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
                aria-current={active ? "page" : undefined}
              >
                {tab.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
