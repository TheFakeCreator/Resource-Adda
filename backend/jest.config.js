/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  testMatch: ["**/**/*.test.ts"],
  verbose: true,
  forceExit: true,
  moduleNameMapper: {
    "^jsdom$": "<rootDir>/src/__mocks__/jsdom.ts",
  },
};
