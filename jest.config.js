export default {
  preset: "ts-jest",
  testEnvironment: "node",
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"],
  testMatch: ["**/__tests__/**/*.spec.ts"],
  modulePathIgnorePatterns: [
    "node_modules/@cuttinboard-solutions/types-helpers/dist/index.js",
  ],
};
