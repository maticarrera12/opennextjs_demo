// eslint.config.js
import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

export default [
  // Extensiones base de Next + TypeScript
  ...compat.extends("next/core-web-vitals", "next/typescript"),

  // Ignorar rutas
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      "out/**",
      "build/**",
      "next-env.d.ts",
    ],
  },

  // Reglas y plugins personalizados
  {
    plugins: ["import", "unused-imports"],
    rules: {
      "unused-imports/no-unused-imports": "error",
      "import/order": ["warn", { alphabetize: { order: "asc" } }],
      "react/no-unescaped-entities": "off",
    },
  },
];
