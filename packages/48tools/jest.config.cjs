const path = require('node:path');

/** @type { import('jest').Config } */
const config = {
  testEnvironment: 'node',
  testMatch: [
    '**/__tests__/**/*.test.(m|c)?ts',
    '**/test/**/*.test.(m|c)?ts',
    '**/?(*.)+(spec|test).(m|c)?ts'
  ],
  transform: {
    '^.+\\.(m|c)?ts?$': ['ts-jest', {
      tsconfig: path.join(__dirname, 'tsconfig.json'),
      useESM: true
    }]
  },
  moduleFileExtensions: ['ts', 'tsx', 'mts', 'cts', 'js', 'mjs', 'cjs', 'json'],
  collectCoverage: false,
  preset: 'ts-jest/presets/default-esm'
};

module.exports = config;