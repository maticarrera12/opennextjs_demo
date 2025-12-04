import { getPageMap } from "nextra/page-map";
import { Layout } from "nextra-theme-docs";
import "nextra-theme-docs/style.css";
import React from "react";

import Footer from "@/components/footer/footer";
import Navbar from "@/components/navbar/comp-582";

// Titles mapping for sidebar
const TITLES: Record<string, Record<string, string>> = {
  en: {
    docs: "Documentation",
    index: "Introduction",
    "getting-started": "Getting Started",
    "api-reference": "API Reference",
  },
  es: {
    docs: "Documentación",
    index: "Introducción",
    "getting-started": "Comenzando",
    "api-reference": "Referencia de API",
  },
};

// Helper function to get title based on route segment and locale
const getTitle = (name: string, route: string, locale: string): string => {
  const titles = TITLES[locale] || TITLES["en"];

  // Try to match by name
  if (titles[name]) {
    return titles[name];
  }

  // Extract last segment from route
  const segments = route.split("/").filter(Boolean);
  const lastSegment = segments[segments.length - 1];

  if (titles[lastSegment]) {
    return titles[lastSegment];
  }

  // For "page" entries, use parent folder name
  if (name === "page" && segments.length > 1) {
    const parentSegment = segments[segments.length - 2];
    if (titles[parentSegment]) {
      return titles[parentSegment];
    }
  }

  return name;
};

// Helper function to replace [locale] in routes and fix titles
const normalizePageMap = (pageMap: any[], locale: string): any[] => {
  return pageMap.map((item) => {
    const newItem = { ...item };

    if (newItem.route) {
      newItem.route = newItem.route.replace("[locale]", locale);
    }

    // Fix the title/name
    if (newItem.name && newItem.route) {
      newItem.title = getTitle(newItem.name, newItem.route, locale);
    }

    if (newItem.children) {
      newItem.children = normalizePageMap(newItem.children, locale);
    }

    return newItem;
  });
};

export default async function DocsLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const pageMap = await getPageMap();

  // Normalize the pageMap to replace [locale] with the actual locale
  const normalizedPageMap = normalizePageMap(pageMap, locale);

  // Filter to find the docs section
  const findDocsSection = (map: any[]): any[] => {
    for (const item of map) {
      if (item.name === "docs" || item.route === `/${locale}/docs`) {
        return item.children || [];
      }
      if (item.children) {
        const found = findDocsSection(item.children);
        if (found.length > 0) return found;
      }
    }
    return [];
  };

  const docsPageMap = findDocsSection(normalizedPageMap);

  // Transform the docs pageMap to use folder names as titles for pages
  const transformPageMap = (items: any[]): any[] => {
    return items.map((item) => {
      const newItem = { ...item };

      // If this is a "page" item, use the folder name from route
      if (newItem.name === "page" && newItem.route) {
        const segments = newItem.route.split("/").filter(Boolean);
        const folderName = segments[segments.length - 1] || segments[segments.length - 2];
        newItem.title = getTitle(folderName, newItem.route, locale);
        newItem.name = folderName;
      }

      if (newItem.children) {
        newItem.children = transformPageMap(newItem.children);
      }

      return newItem;
    });
  };

  const finalPageMap = transformPageMap(docsPageMap);

  return (
    <>
      <Navbar />
      <div className="pt-16 min-h-screen">
        <Layout
          navbar={null}
          pageMap={finalPageMap}
          docsRepositoryBase="https://github.com/maticarrera12/open_next"
          footer={null}
          sidebar={{ defaultMenuCollapseLevel: 1 }}
        >
          {children}
        </Layout>
      </div>
      <Footer />
    </>
  );
}
