import type { Config } from '@jest/types';

const config: Config.InitialOptions = {
  coverageReporters: [
    'text'
  ],
  transform: {
    '^.+\\.(t|j)sx?$': '@swc/jest',
  },
  roots: ['<rootDir>'],
  testRegex: '(/__tests__/.*|(\\.|/)(test|spec))\\.[jt]sx?$',
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  testTimeout: 100000,
  setupFiles: ['./test/jest.setup.ts'],
  collectCoverageFrom: [
    'src/**'
  ],
};

export default config;
