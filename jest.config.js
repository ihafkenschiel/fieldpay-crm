module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/packages', '<rootDir>/server'],
  testMatch: ['**/__tests__/**/*.ts', '**/?(*.)+(spec|test).ts'],
  collectCoverageFrom: [
    'packages/*/src/**/*.ts',
    'server/src/**/*.ts',
    '!**/*.d.ts',
    '!**/node_modules/**',
    '!**/dist/**',
  ],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },
};
