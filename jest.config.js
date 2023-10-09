/** @type {import('jest').Config} */
module.exports = {
  preset: "ts-jest",
  testEnvironment: "jsdom",
  globals: {
    "ts-jest": {
      isolatedModules: true,
      tsconfig: "tsconfig.test.json",
    },
  },
  moduleNameMapper: {
    "^src/(.*)$": "<rootDir>/src/$1",
  },
  transform: {
    "^.+\\.[t|j]sx?$": "babel-jest",
    "\\.xml$": "jest-raw-loader",
  },
  testPathIgnorePatterns: ["/node_modules/", "<rootDir>/e2e"],
  transformIgnorePatterns: ["<rootDir>/node_modules/(?!(node-fetch)/)"],
};
