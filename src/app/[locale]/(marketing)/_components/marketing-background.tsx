"use client";

import React, { useEffect, useState } from "react";
import UnicornScene from "unicornstudio-react";

export default function MarketingBackground() {
  const baseWidth = 1920;
  const baseHeight = 1080;

  const [scale, setScale] = useState(() => {
    if (typeof window !== "undefined") {
      const width = window.innerWidth;
      const height = window.innerHeight;
      const scaleX = width / baseWidth;
      const scaleY = height / baseHeight;
      return Math.max(scaleX, scaleY);
    }
    return 1;
  });

  useEffect(() => {
    const updateScale = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;

      // Calcular escala para cubrir toda la pantalla manteniendo el centro
      const scaleX = width / baseWidth;
      const scaleY = height / baseHeight;
      setScale(Math.max(scaleX, scaleY));
    };

    updateScale();
    window.addEventListener("resize", updateScale);
    return () => window.removeEventListener("resize", updateScale);
  }, []);

  return (
    <div
      className="fixed -z-10 overflow-hidden opacity-30"
      style={{
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: "100vw",
        height: "100vh",
      }}
    >
      {/* Unicorn Studio Scene */}
      <div
        className="absolute inset-0"
        style={{
          width: "100vw",
          height: "100vh",
        }}
      >
        <div
          className="w-full h-full"
          style={{
            position: "relative",
            overflow: "hidden",
            width: "100%",
            height: "100%",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: `${baseWidth}px`,
              height: `${baseHeight}px`,
            }}
          >
            <div
              style={{
                width: `${baseWidth}px`,
                height: `${baseHeight}px`,
                transform: `scale(${scale})`,
                transformOrigin: "center center",
              }}
            >
              <UnicornScene
                projectId="QLWnr38UVEEcx89hmluA"
                width={baseWidth}
                height={baseHeight}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
