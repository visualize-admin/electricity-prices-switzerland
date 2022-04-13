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
    "^@/(.*)$": "<rootDir>/$1",
  },
  transform: {
    "^.+\\.[t|j]sx?$": "babel-jest",
    "\\.xml$": "jest-raw-loader",
  },
  transformIgnorePatterns: ["<rootDir>/node_modules/(?!(node-fetch)/)"],
};
