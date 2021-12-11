module.exports = {
  root: true,
  env: {
    browser: true,
    es2020: true,
    node: true,
  },
  // rules applied to only JS
  extends: ["eslint:recommended", "plugin:prettier/recommended"],
  rules: {
    "prettier/prettier": "warn",
  },
  overrides: [
    // typescript
    {
      files: ["*.ts", "*.tsx"],
      excludedFiles: ["*.js", ".jsx"],
      parser: "@typescript-eslint/parser",
      parserOptions: {
        project: "./packages/**/tsconfig.json",
      },
      plugins: ["@typescript-eslint"],
      extends: [
        "plugin:prettier/recommended",
        "plugin:@typescript-eslint/eslint-recommended",
        "plugin:@typescript-eslint/recommended",
        "plugin:@typescript-eslint/recommended-requiring-type-checking",
      ],
      rules: {
        "prettier/prettier": "warn",
        "@typescript-eslint/no-unsafe-call": "off",
        "@typescript-eslint/no-unsafe-member-access": "off",
        "@typescript-eslint/no-unsafe-return": "off",
        "@typescript-eslint/no-redeclare": "error",
        "@typescript-eslint/explicit-function-return-type": "off",
        "@typescript-eslint/interface-name-prefix": "off",
        "@typescript-eslint/no-floating-promises": "error",
        "@typescript-eslint/no-empty-interface": "warn",
        "@typescript-eslint/unbound-method": "warn",
        "@typescript-eslint/no-use-before-define": [
          "error",
          { functions: false, classes: false },
        ],
      },
    },
  ],
};
