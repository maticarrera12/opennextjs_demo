"use client";

import { useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { LogOutIcon, ArrowLeftIcon, type LucideIcon } from "lucide-react";
import React, { useState } from "react";

import { LanguageSwitcher } from "@/components/navbar/languaje-switcher";
import ThemeToggle from "@/components/navbar/theme-toggle";
import { useLocaleRouting } from "@/hooks/useLocaleRouting";
import { Link } from "@/i18n/routing";
import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";

export interface SidebarItem {
  name: string;
  href: string;
  icon: LucideIcon;
  localeAware?: boolean;
  matchPrefixes?: string[];
}

export interface SidebarSection {
  label: string;
  items: SidebarItem[];
}

interface AppSidebarProps {
  title: string;
  sections: SidebarSection[];
  logoutLabel: string;
  topContent?: React.ReactNode;
  topContentHeightClass?: string;
  bottomContent?: React.ReactNode;
  variant?: "card" | "flush";
}

export default function AppSidebar({
  title,
  sections,
  logoutLabel,
  topContent,
  topContentHeightClass,
  bottomContent,
  variant = "card",
}: AppSidebarProps) {
  const { pathname, push } = useLocaleRouting();
  const [isOpen, setIsOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const queryClient = useQueryClient();

  const handleSignOut = async () => {
    await authClient.signOut();
    queryClient.removeQueries({ queryKey: ["session"], exact: true });
    queryClient.invalidateQueries();
    push("/");
  };

  return (
    <>
      {/* -------- MOBILE TOGGLE -------- */}
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={isOpen}
        className={cn(
          "group fixed top-3 left-3 z-50 flex h-9 w-9 items-center justify-center rounded-lg bg-transparent transition-colors md:hidden",
          isOpen ? "text-white" : "text-black"
        )}
        aria-label="Toggle sidebar"
      >
        <svg
          className="pointer-events-none stroke-current"
          width={20}
          height={20}
          viewBox="0 0 24 24"
          fill="none"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path
            d="M4 12L20 12"
            className="origin-center -translate-y-[7px] transition-all duration-300 group-aria-expanded:translate-y-0 group-aria-expanded:rotate-[315deg]"
          />
          <path
            d="M4 12H20"
            className="origin-center transition-all duration-300 group-aria-expanded:rotate-45"
          />
          <path
            d="M4 12H20"
            className="origin-center translate-y-[7px] transition-all duration-300 group-aria-expanded:translate-y-0 group-aria-expanded:rotate-[135deg]"
          />
        </svg>
      </button>

      {/* -------- OVERLAY (MOBILE) -------- */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 z-30 bg-black/60 md:hidden"
        />
      )}

      {/* -------- SIDEBAR -------- */}
      <motion.aside
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        initial={false}
        animate={{ width: isHovered || isOpen ? 240 : 80 }}
        transition={{ duration: 0.12, ease: "easeInOut" }}
        className={cn(
          "z-40 h-screen shrink-0 fixed left-0 top-0 md:sticky md:top-0 transition-transform",
          isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",
          variant === "flush" ? "bg-background border-r border-border/80" : "bg-primary shadow-lg"
        )}
      >
        <div className="flex h-full flex-col">
          {/* -------- TOP AREA -------- */}
          <div className="flex-1 overflow-y-auto pl-4 py-4 scrollbar-hide">
            {/* Go back button */}
            <div className="mb-3 text-white pr-0">
              <Link
                href="/"
                className={cn(
                  "flex h-9 w-full items-center justify-end rounded-md text-sm transition-colors",
                  "hover:bg-white/10 rounded-lg pr-4"
                )}
              >
                <ArrowLeftIcon size={24} className="text-white" />
              </Link>
            </div>

            {/* Title */}
            <div
              className={cn(
                "mb-4 h-6 transition-all",
                isHovered || isOpen ? "opacity-100" : "opacity-0"
              )}
            >
              <span className="text-lg font-semibold text-white whitespace-nowrap">{title}</span>
            </div>

            {/* Optional top content */}
            {topContent && (
              <div className="mb-4 pr-4">
                <div
                  className={cn(
                    isHovered || isOpen ? "opacity-100 visible" : "opacity-0 invisible",
                    "transition-opacity",
                    topContentHeightClass
                  )}
                >
                  {topContent}
                </div>
              </div>
            )}

            {/* Sections */}
            {sections.map((section) => (
              <div key={section.label} className="mb-4">
                {/* Section label */}
                <div className="h-5 mb-1">
                  <span
                    className={cn(
                      "block text-[11px] font-semibold uppercase tracking-wider text-white/70 transition-all",
                      isHovered || isOpen ? "opacity-100" : "opacity-0"
                    )}
                  >
                    {section.label}
                  </span>
                </div>

                {/* Items */}
                <nav className="flex flex-col">
                  {section.items.map((item) => {
                    const Icon = item.icon;

                    // Active route detection (simple, reliable)
                    const isActive = pathname.startsWith(item.href);

                    return (
                      <Link
                        key={item.name}
                        href={item.href} // ← ¡YA AGREGA EL LOCALE SOLO!
                        onClick={() => setIsOpen(false)}
                        className={cn(
                          "group grid h-10 grid-cols-[24px_1fr] items-center gap-3 pl-4 text-sm",
                          isActive
                            ? "bg-background text-primary rounded-l-xl"
                            : "text-white hover:bg-white/10 rounded-l-xl"
                        )}
                      >
                        <Icon size={18} className={cn(isActive ? "text-primary" : "text-white")} />
                        <span
                          className={cn(
                            "whitespace-nowrap transition-all",
                            isHovered || isOpen ? "opacity-100 w-auto" : "opacity-0 w-0"
                          )}
                        >
                          {item.name}
                        </span>
                      </Link>
                    );
                  })}
                </nav>
              </div>
            ))}
          </div>

          {/* -------- BOTTOM AREA -------- */}
          <div className="border-t border-white/10 pr-0">
            {/* Theme + Language */}
            <div className="pl-4 py-2">
              <div
                className={cn(
                  "flex items-center gap-2 w-full text-white",
                  isHovered || isOpen ? "opacity-100" : "opacity-0 pointer-events-none",
                  "transition-opacity"
                )}
              >
                <ThemeToggle variant="sidebar" />
                <div className="h-6 w-px bg-white/20" />
                <LanguageSwitcher variant="sidebar" />
              </div>
            </div>

            {/* Logout */}
            <div className="pl-4 pr-4 py-1.5">
              <button
                onClick={() => {
                  setIsOpen(false);
                  handleSignOut();
                }}
                className={cn(
                  "grid h-9 w-full grid-cols-[24px_1fr] items-center rounded-md text-sm text-white",
                  "hover:bg-white/10"
                )}
              >
                <LogOutIcon size={18} className="text-white" />
                <span
                  className={cn(
                    "whitespace-nowrap transition-all",
                    isHovered || isOpen ? "opacity-100" : "opacity-0 w-0"
                  )}
                >
                  {logoutLabel}
                </span>
              </button>
            </div>
          </div>
        </div>
      </motion.aside>
    </>
  );
}
