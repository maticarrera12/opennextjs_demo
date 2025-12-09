"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import React, { useRef } from "react";
import { IoMdArrowForward } from "react-icons/io";

import { useViewTransition } from "../../hooks/useViewTransition";
import { cn } from "@/lib/utils";

gsap.registerPlugin(ScrollTrigger);

interface AnimatedButtonProps {
  label: string;
  route?: string;
  animate?: boolean;
  animateOnScroll?: boolean;
  delay?: number;
  className?: string;
}

const AnimatedButton: React.FC<AnimatedButtonProps> = ({
  label,
  route,
  animate = true,
  animateOnScroll = true,
  delay = 0,
  className,
}) => {
  const { navigateWithTransition } = useViewTransition();
  const buttonRef = useRef<HTMLAnchorElement | HTMLButtonElement>(null);
  const circleRef = useRef<HTMLSpanElement>(null);
  const iconRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLSpanElement>(null);

  const waitForFonts = async () => {
    try {
      await document.fonts.ready;
      const customFonts = ["Manrope"];
      const fontCheckPromises = customFonts.map((fontFamily) => {
        return document.fonts.check(`16px ${fontFamily}`);
      });
      await Promise.all(fontCheckPromises);
      await new Promise((resolve) => setTimeout(resolve, 100));
      return true;
    } catch {
      await new Promise((resolve) => setTimeout(resolve, 200));
      return true;
    }
  };

  useGSAP(
    () => {
      if (!buttonRef.current || !textRef.current) return;

      if (!animate) {
        gsap.set(buttonRef.current, { scale: 1 });
        gsap.set(circleRef.current, { scale: 1, opacity: 1 });
        gsap.set(iconRef.current, { opacity: 1, x: 0 });
        gsap.set(textRef.current, { opacity: 1, y: 0 });
        return;
      }

      const initializeAnimation = async () => {
        await waitForFonts();

        gsap.set(buttonRef.current, { scale: 0, transformOrigin: "center" });
        gsap.set(circleRef.current, {
          scale: 0,
          transformOrigin: "center",
          opacity: 0,
        });
        gsap.set(iconRef.current, { opacity: 0, x: -20 });
        gsap.set(textRef.current, { opacity: 0, y: 20 });

        const tl = gsap.timeline({ delay: delay });

        tl.to(buttonRef.current, {
          scale: 1,
          duration: 0.5,
          ease: "back.out(1.7)",
        });

        tl.to(
          circleRef.current,
          {
            scale: 1,
            opacity: 1,
            duration: 0.5,
            ease: "power3.out",
          },
          "-=0.3"
        );

        tl.to(
          iconRef.current,
          {
            opacity: 1,
            x: 0,
            duration: 0.5,
            ease: "power3.out",
          },
          "-=0.4"
        );

        tl.to(
          textRef.current,
          {
            opacity: 1,
            y: 0,
            duration: 0.6,
            ease: "power4.out",
          },
          "-=0.3"
        );

        if (animateOnScroll) {
          ScrollTrigger.create({
            trigger: buttonRef.current,
            start: "top 90%",
            once: true,
            animation: tl,
          });
        } else {
          tl.play();
        }
      };

      initializeAnimation();

      return () => {
        ScrollTrigger.getAll().forEach((trigger) => {
          if (trigger.trigger === buttonRef.current) {
            trigger.kill();
          }
        });
      };
    },
    { scope: buttonRef, dependencies: [animate, animateOnScroll, delay] }
  );

  const buttonContent = (
    <>
      <span
        className="relative block m-0 w-[3.2rem] h-[3.2rem] bg-primary rounded-full text-2xl scale-0 overflow-hidden transition-[width] duration-500 ease-[cubic-bezier(0.65,0,0.076,1)]"
        ref={circleRef}
        aria-hidden="true"
      />
      <div
        className="absolute top-[0.85rem] left-[1.05rem] text-primary-foreground text-2xl translate-x-0 transition-all duration-500 ease-[cubic-bezier(0.65,0,0.076,1)] will-change-transform"
        ref={iconRef}
      >
        <IoMdArrowForward />
      </div>
      <span
        className="absolute inset-0 flex items-center justify-center pl-10 text-foreground font-semibold whitespace-nowrap transition-all duration-500 ease-[cubic-bezier(0.65,0,0.076,1)] opacity-0"
        ref={textRef}
      >
        {label}
      </span>
    </>
  );

  const buttonClasses = cn(
    "animated-btn group relative inline-flex items-center w-56 h-14 p-[0.2rem] outline-none border-2 border-border text-sm bg-card backdrop-blur-[10px] rounded-full cursor-pointer my-4 mx-2 scale-0 no-underline shadow-[0_2px_8px_rgba(0,0,0,0.1)] dark:shadow-[0_2px_8px_rgba(0,0,0,0.3)]",
    // Hover styles using group
    "[&:hover_.circle]:w-full",
    "[&:hover_.icon]:translate-x-2 [&:hover_.icon]:text-primary-foreground",
    "[&:hover_.button-text]:text-primary-foreground",
    className
  );

  if (route) {
    return (
      <a
        href={route}
        className={buttonClasses}
        ref={buttonRef as React.RefObject<HTMLAnchorElement>}
        onClick={(e) => {
          e.preventDefault();
          navigateWithTransition(route);
        }}
      >
        <span
          className="circle relative block m-0 w-[3.2rem] h-[3.2rem] bg-primary rounded-full text-2xl scale-0 overflow-hidden transition-[width] duration-500 ease-[cubic-bezier(0.65,0,0.076,1)]"
          ref={circleRef}
          aria-hidden="true"
        />
        <div
          className="icon absolute top-[0.85rem] left-[1.05rem] text-primary-foreground text-2xl translate-x-0 transition-all duration-500 ease-[cubic-bezier(0.65,0,0.076,1)] will-change-transform"
          ref={iconRef}
        >
          <IoMdArrowForward />
        </div>
        <span
          className="button-text absolute inset-0 flex items-center justify-center pl-10 text-foreground font-semibold whitespace-nowrap transition-all duration-500 ease-[cubic-bezier(0.65,0,0.076,1)] opacity-0"
          ref={textRef}
        >
          {label}
        </span>
      </a>
    );
  }

  return (
    <button className={buttonClasses} ref={buttonRef as React.RefObject<HTMLButtonElement>}>
      <span
        className="circle relative block m-0 w-[3.2rem] h-[3.2rem] bg-primary rounded-full text-2xl scale-0 overflow-hidden transition-[width] duration-500 ease-[cubic-bezier(0.65,0,0.076,1)]"
        ref={circleRef}
        aria-hidden="true"
      />
      <div
        className="icon absolute top-[0.85rem] left-[1.05rem] text-primary-foreground text-2xl translate-x-0 transition-all duration-500 ease-[cubic-bezier(0.65,0,0.076,1)] will-change-transform"
        ref={iconRef}
      >
        <IoMdArrowForward />
      </div>
      <span
        className="button-text absolute inset-0 flex items-center justify-center pl-10 text-foreground font-semibold whitespace-nowrap transition-all duration-500 ease-[cubic-bezier(0.65,0,0.076,1)] opacity-0"
        ref={textRef}
      >
        {label}
      </span>
    </button>
  );
};

export default AnimatedButton;
