"use client";

import { scaleLinear } from "d3-scale";
import { motion, AnimatePresence } from "framer-motion";
import { FC, useEffect, useState, useMemo } from "react";
import { ComposableMap, Geographies, Geography } from "react-simple-maps";
import { feature } from "topojson-client";

import { cn } from "@/lib/utils";

// ISO2 → ISO numeric (UN M49)
const ISO2_TO_ISONUM: Record<string, string> = {
  AR: "032",
  US: "840",
  BR: "076",
  MX: "484",
  ES: "724",
  FR: "250",
  DE: "276",
  CL: "152",
  GB: "826",
  AU: "036",
};

const geoUrl = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

interface TooltipData {
  country: string;
  count: number;
  x: number;
  y: number;
}

interface WorldUserMapProps {
  data?: Record<string, number>;
  className?: string;
}

const WorldUserMap: FC<WorldUserMapProps> = ({ data, className }) => {
  const [tooltip, setTooltip] = useState<TooltipData | null>(null);
  const [geoFeatures, setGeoFeatures] = useState<any[]>([]);

  const internalData = useMemo(
    () =>
      data || {
        AR: 142,
        US: 920,
        BR: 450,
        ES: 210,
        MX: 180,
        FR: 120,
        DE: 90,
        CL: 80,
        GB: 300,
        AU: 60,
      },
    [data]
  );

  // Procesar datos
  const { dataIsoNum, totalUsers, maxUsers } = useMemo(() => {
    const mapping: Record<string, number> = {};
    let total = 0;
    let max = 0;

    Object.entries(internalData).forEach(([iso2, count]) => {
      const isoNum = ISO2_TO_ISONUM[iso2];
      if (isoNum) {
        mapping[isoNum] = count;
        total += count;
        if (count > max) max = count;
      }
    });
    return { dataIsoNum: mapping, totalUsers: total, maxUsers: max };
  }, [internalData]);

  // Escala de color: Gris medio -> Azul Intenso
  const colorScale = scaleLinear<string>().domain([0, maxUsers]).range(["#E2E8F0", "#3b82f6"]);

  useEffect(() => {
    fetch(geoUrl)
      .then((res) => res.json())
      .then((worldData) => {
        const geoCollection = feature(worldData, worldData.objects.countries) as any;
        setGeoFeatures(geoCollection.features || []);
      });
  }, []);

  return (
    <div
      className={cn(
        "relative flex flex-col p-8 bg-white dark:bg-white/5 rounded-[2.5rem] border border-border/50 shadow-sm",
        // AUMENTADO: max-w-5xl permite que sea mucho más grande en pantallas anchas
        "w-full max-w-5xl mx-auto",
        className
      )}
    >
      {/* Header */}
      <div className="flex justify-between items-end mb-6 px-2">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">Global Reach</h2>
          <p className="text-base text-muted-foreground font-medium mt-1">Active users by region</p>
        </div>
        <div className="text-right">
          <div className="text-3xl font-bold tracking-tighter text-primary">
            {totalUsers.toLocaleString()}
          </div>
          <div className="text-xs font-bold uppercase tracking-widest text-muted-foreground/60">
            Total Users
          </div>
        </div>
      </div>

      {/* Contenedor del Mapa */}
      <div className="relative w-full aspect-[1.9/1] flex items-center justify-center bg-muted/5 rounded-[2rem] border border-border/20 overflow-hidden">
        <ComposableMap
          projection="geoMercator"
          // ESCALA AUMENTADA: 140 para llenar mejor el espacio
          projectionConfig={{
            scale: 140,
            center: [0, 20], // Centrado para cortar Antártida y exceso de norte
          }}
          className="w-full h-full"
        >
          <Geographies geography={geoFeatures}>
            {({ geographies }) =>
              geographies.map((geo) => {
                const isoNum = geo.id as string;
                const count = dataIsoNum[isoNum] ?? 0;
                const hasData = count > 0;

                return (
                  <motion.g
                    key={geo.rsmKey}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5 }}
                  >
                    <Geography
                      geography={geo}
                      // Color de relleno: Si no hay datos, usamos un gris visible (#F1F5F9)
                      // Para dark mode, CSS class maneja el fill, pero aquí usamos valores hex seguros.
                      fill={hasData ? colorScale(count) : "#F1F5F9"}
                      stroke={hasData ? "transparent" : "#E2E8F0"} // Borde sutil para países vacíos
                      strokeWidth={0.5}
                      style={{
                        default: { outline: "none", transition: "all 0.3s ease" },
                        hover: {
                          fill: hasData ? "#2563eb" : "#E5E7EB", // Hover más oscuro
                          stroke: hasData ? "transparent" : "#CBD5E1",
                          outline: "none",
                          cursor: "pointer", // Cursor pointer siempre
                        },
                        pressed: { outline: "none" },
                      }}
                      // Evento MouseEnter SIEMPRE activo, tenga datos o no
                      onMouseEnter={(event) => {
                        const bounds = event.currentTarget.getBoundingClientRect();
                        setTooltip({
                          country: geo.properties.name,
                          count,
                          x: bounds.left + bounds.width / 2,
                          y: bounds.top,
                        });
                      }}
                      onMouseLeave={() => setTooltip(null)}
                    />
                  </motion.g>
                );
              })
            }
          </Geographies>
        </ComposableMap>
      </div>

      {/* Tooltip Flotante */}
      <AnimatePresence>
        {tooltip && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 5, scale: 0.95 }}
            transition={{ duration: 0.2, type: "spring" }}
            className="pointer-events-none fixed z-50 flex flex-col items-center"
            style={{
              left: tooltip.x,
              top: tooltip.y - 12,
              transform: "translate(-50%, -100%)",
            }}
          >
            <div className="bg-foreground text-background px-5 py-3 rounded-2xl shadow-2xl flex flex-col items-center min-w-[120px] border border-white/10">
              <span className="text-[11px] font-bold opacity-60 uppercase tracking-widest mb-1">
                {tooltip.country}
              </span>
              <span
                className={cn(
                  "text-xl font-bold leading-none",
                  tooltip.count === 0 ? "opacity-50 text-lg" : ""
                )}
              >
                {tooltip.count > 0 ? tooltip.count.toLocaleString() : "No active users"}
              </span>
            </div>
            {/* Triangulito */}
            <div className="w-4 h-4 bg-foreground rotate-45 -mt-2 rounded-[2px]" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default WorldUserMap;
