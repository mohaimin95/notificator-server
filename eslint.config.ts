/* eslint-disable*/
import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import eslintPluginPrettierRecommended from "eslint-plugin-prettier/recommended";
import { defineConfig } from "eslint/config";

export default defineConfig([
  {
    ignores: [
      "webpack.config.js",
      "dist/**/*",
      "node_modules/**/*",
      "eslint.config.js",
    ],
  },
  {
    files: ["**/*.{js,mjs,cjs,ts,mts,cts}"],
    plugins: { js },

    extends: ["js/recommended"],
    languageOptions: {
      globals: globals.node,
      parserOptions: {
        tsconfigRootDir: __dirname,
        project: "./tsconfig.json",
      },
    },
    rules: {
      "no-console": "warn",
    },
  },
  tseslint.configs.recommended as any,
  eslintPluginPrettierRecommended,
]);
