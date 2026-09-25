import js from "@eslint/js";
import ts from "typescript-eslint";
import vue from "eslint-plugin-vue";
export default ts.config(
  {
    ignores: [
      "dist/**",
      "coverage/**",
      "src/api/schema.d.ts",
      "playwright-report/**",
      "test-results/**",
    ],
  },
  js.configs.recommended,
  ...ts.configs.recommended,
  ...vue.configs["flat/recommended"],
  {
    files: ["**/*.vue"],
    languageOptions: { parserOptions: { parser: ts.parser } },
  },
  {
    files: ["src/**/*.{ts,vue}"],
    ignores: ["src/api/**"],
    rules: { "no-restricted-globals": ["error", "fetch"] },
  },
  {
    files: ["src/shared/**/*.{ts,vue}"],
    rules: {
      "no-restricted-imports": [
        "error",
        { patterns: ["**/features/**", "@/features/**"] },
      ],
    },
  },
);
