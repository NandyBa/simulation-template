import type { Config } from "jest";

const config: Config = {
  preset: "ts-jest",
  testEnvironment: "node",
  roots: ["<rootDir>/src/__tests__"],
  transform: {
    "^.+\\.tsx?$": [
      "ts-jest",
      {
        tsconfig: "tsconfig.jest.json",
      },
    ],
  },
  moduleNameMapper: {
    "^@core/(.*)$": "<rootDir>/src/core/$1",
    "^@presets/(.*)$": "<rootDir>/src/presets/$1",
    "^@agents/(.*)$": "<rootDir>/src/agents/$1",
    "^@ui/(.*)$": "<rootDir>/src/ui/$1",
  },
  coverageDirectory: "coverage",
  collectCoverageFrom: [
    "src/core/**/*.ts",
    "src/agents/**/*.ts",
    "src/presets/**/*.ts",
    "!src/**/*.d.ts",
  ],
};

export default config;
