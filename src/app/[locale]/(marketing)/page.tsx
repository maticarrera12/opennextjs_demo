"use client";
import React, { useEffect } from "react";

import FeatureStepper from "./_components/feature-stepper";
import { FeatureTabs } from "./_components/feature-tabs";
import LogoMarquee from "./_components/logo-marquee";
import BentoShowcase from "@/app/[locale]/(marketing)/_components/bento-showcase";
import Faq from "@/app/[locale]/(marketing)/_components/faq";
import Hero from "@/app/[locale]/(marketing)/_components/hero";
import { PricingCards } from "@/app/[locale]/(marketing)/_components/pricing/pricing-cards";

const Page = () => {
  // Handle hash navigation (e.g., from /docs clicking on #pricing)
  useEffect(() => {
    const hash = window.location.hash.slice(1); // Remove the '#'
    if (hash) {
      // Small delay to ensure the page has rendered
      setTimeout(() => {
        const element = document.getElementById(hash);
        if (element) {
          const headerOffset = 80;
          const elementPosition = element.getBoundingClientRect().top;
          const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
          window.scrollTo({ top: offsetPosition, behavior: "smooth" });
        }
      }, 100);
    }
  }, []);

  return (
    <div className="w-full bg-background">
      <Hero />
      <LogoMarquee />
      <BentoShowcase />
      <FeatureTabs />
      <FeatureStepper />
      <PricingCards />
      <Faq />
    </div>
  );
};

export default Page;
