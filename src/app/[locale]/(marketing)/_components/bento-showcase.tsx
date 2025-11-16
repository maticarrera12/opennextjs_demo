"use client";

import { motion } from "framer-motion";
import {
  CloudUploadIcon,
  CreditCardIcon,
  LanguageSquareIcon,
  SecurityValidationIcon,
} from "hugeicons-react";
import Image from "next/image";
import { useState } from "react";

const items = [
  {
    title: "Authentication",
    desc: "Plug & Play auth with Better Auth. Supports Email, OAuth, and Magic Links.",
    img: "https://picsum.photos/800/600?random=1",
    icon: SecurityValidationIcon,
  },
  {
    title: "Payments",
    desc: "Stripe & Lemon Squeezy integration. Subscriptions and billing ready.",
    img: "https://picsum.photos/800/600?random=2",
    icon: CreditCardIcon,
  },
  {
    title: "Storage",
    desc: "Upload files with Vercel Blob or Cloudinary. Optimized image management.",
    img: "https://picsum.photos/800/600?random=3",
    icon: CloudUploadIcon,
  },
  {
    title: "Internationalization",
    desc: "Multi-language support with next-intl. Built-in i18n routing.",
    img: "https://picsum.photos/800/600?random=4",
    icon: LanguageSquareIcon,
  },
];

export default function BentoShowcase() {
  return (
    <div className="w-full max-w-6xl mx-auto px-4 md:px-6 grid gap-2 py-16">
      {/* ROW 1 → 70 / 30 */}
      <div className="grid grid-cols-1 md:grid-cols-10 gap-2 w-full">
        <div className="col-span-1 md:col-span-7 w-full min-w-0">
          <BentoCard {...items[0]} />
        </div>
        <div className="col-span-1 md:col-span-3 w-full min-w-0">
          <BentoCard {...items[1]} />
        </div>
      </div>

      {/* ROW 2 → 30 / 70 */}
      <div className="grid grid-cols-1 md:grid-cols-10 gap-2 w-full">
        <div className="col-span-1 md:col-span-3 w-full min-w-0">
          <BentoCard {...items[2]} />
        </div>
        <div className="col-span-1 md:col-span-7 w-full min-w-0">
          <BentoCard {...items[3]} />
        </div>
      </div>
    </div>
  );
}

function BentoCard({ title, desc, img, icon: Icon }: any) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      whileHover={{ scale: 1.01 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="relative group w-full h-[260px] md:h-[300px] rounded-2xl overflow-hidden border border-white/10 bg-black"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Background image */}
      <motion.div
        className="absolute inset-0"
        animate={{
          scale: isHovered ? 1.15 : 1,
        }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        <Image
          src={img}
          fill
          alt=""
          className="object-cover opacity-[0.35] group-hover:opacity-[0.55] transition-all duration-500"
        />
      </motion.div>

      {/* Light translucent overlay on hover */}
      <motion.div className="absolute inset-0 bg-white/0 group-hover:bg-white/[0.08] transition-all duration-500" />

      {/* Animated glow */}
      <motion.div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 pointer-events-none"
        animate={{ opacity: [0, 0.2, 0.1, 0.2, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      >
        <div className="absolute inset-0 bg-white/20 blur-3xl" />
      </motion.div>

      {/* Content (bottom aligned) */}
      <motion.div
        className="absolute bottom-0 left-0 right-0 p-6 z-20 flex flex-col gap-2"
        animate={{
          y: isHovered ? -24 : 0,
        }}
        transition={{ duration: 0.3, ease: "easeOut" }}
      >
        {/* Icon */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="mb-1"
        >
          <Icon className="w-6 h-6 text-white/90" />
        </motion.div>

        {/* Title and Description Container */}
        <div className="flex flex-col gap-2">
          <h3 className="text-lg md:text-xl font-semibold text-white">{title}</h3>
          <p className="text-neutral-300 text-sm leading-tight">{desc}</p>
        </div>

        {/* Learn More */}
        <motion.div
          animate={{
            opacity: isHovered ? 1 : 0,
            height: isHovered ? "auto" : 0,
          }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="overflow-hidden"
        >
          <motion.div
            className="text-white text-sm flex items-center gap-1 mt-2"
            animate={{
              opacity: isHovered ? 1 : 0,
              y: isHovered ? 0 : -10,
            }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          >
            Learn more →
          </motion.div>
        </motion.div>
      </motion.div>

      {/* Border glow */}
      <div className="absolute inset-0 rounded-2xl border border-transparent group-hover:border-white/20 group-hover:shadow-[0_0_25px_rgba(255,255,255,0.15)] transition-all duration-500" />
    </motion.div>
  );
}
