import type { Config } from '@jest/types';

const config: Config.InitialOptions = {
  coverageReporters: [
    'text'
  ],
  transform: {
    '^.+\\.(t|j)sx?$': '@swc/jest',
  },
  // The root of your source code, typically /src
  // `<rootDir>` is a token Jest substitutes
  roots: ['<rootDir>'],
  // moduleNameMapper: {
  //   '^nimma/legacy$': '<rootDir>/node_modules/nimma/dist/legacy/cjs/index.js',
  //   '^nimma/(.*)': '<rootDir>/node_modules/nimma/dist/cjs/$1',
  //   '^@stoplight/spectral-ruleset-bundler/(.*)$': '<rootDir>/node_modules/@stoplight/spectral-ruleset-bundler/dist/$1'
  // },
  
  // Test spec file resolution pattern
  // Matches parent folder `__tests__` and filename
  // should contain `test` or `spec`.
  testRegex: '(/__tests__/.*|(\\.|/)(test|spec))\\.[jt]sx?$',
  // Module file extensions for importing
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  testTimeout: 10000,
  setupFiles: ['./test/jest.setup.ts'],
  collectCoverageFrom: [
    'src/**'
  ],
};

export default config;
