import nextCoreWebVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";

const eslintConfig = [...nextCoreWebVitals, ...nextTypescript, {
  // Plain Node/CommonJS tooling scripts, not part of the linted app source -
  // next lint never covered these either.
  ignores: [
    "node_modules/**",
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    "deploy.js",
    "postcss.config.mjs",
    "tailwind.config.js",
  ]
}];

export default eslintConfig;
