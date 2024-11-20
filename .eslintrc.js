const { resolve } = require("path");

module.exports = {
  root: true,
  ignorePatterns: ["node_modules", "build", "dist", "public"],
  plugins: ["prettier"],
  settings: {
    "react": {
      version: "detect",
    },
    "import/resolver": {
      node: {
        paths: [resolve(__dirname)],
        extensions: [".js", ".jsx", ".ts", ".tsx"],
      },
    },
  },
  env: {
    browser: true,
    es2021: true,
    node: true,
  },
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:react/recommended",
    "plugin:react-hooks/recommended",
    "plugin:jsx-a11y/recommended",
    "eslint-config-prettier",
    "prettier",
  ],
  rules: {
    "@typescript-eslint/indent": ["error", 2],
    "@typescript-eslint/no-unused-vars": ["error"],
    "@typescript-eslint/no-var-requires": "off",
    "@typescript-eslint/semi": ["error"],
    "brace-style": ["error", "1tbs"],
    "comma-dangle": ["error", "only-multiline"],
    "curly": "error",
    "import/no-unresolved": "off",
    "no-console": "error",
    "no-unused-vars": "off",
    "object-curly-spacing": ["error", "always"],
    "prefer-const": "error",
    "quote-props": ["error", "consistent"],
    "quotes": ["error", "double"],
    "react/jsx-closing-bracket-location": ["error", "tag-aligned"],
    "react/jsx-first-prop-new-line": ["error", "multiline-multiprop"],
    "react/jsx-max-props-per-line": ["error", { maximum: 1, when: "multiline" }],
    "react/react-in-jsx-scope": "off",
    "semi": "off",
  },
};
