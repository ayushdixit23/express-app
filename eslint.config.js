export default [
  {
    files: ["**/*.ts"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      parser: await import("typescript-eslint"),
    },
    plugins: {
      "@typescript-eslint": await import("@typescript-eslint"),
      "import": await import("import"),
    },
    rules: {
      "no-unused-vars": "off",
      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
        },
      ],
      "@typescript-eslint/no-explicit-any": "warn",
      "import/extensions": [
        "error",
        "ignorePackages",
        {
          ts: "never",
        },
      ],
      "no-console": "warn",
    },
  },
  {
    ignores: ["dist/", "node_modules/", "coverage/"],
  },
];