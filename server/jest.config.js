export default {
  testEnvironment: 'node',
  collectCoverage: true,
  coverageDirectory: 'coverage',
  collectCoverageFrom: [
    'controllers/**/*.js',
    'middleware/**/*.js',
    'routes/**/*.js',
    'models/**/*.js',
    'config/**/*.js'
  ],
  transform: {
    '^.+\\.js$': 'babel-jest'
  },
  transformIgnorePatterns: [
    'node_modules/(?!uuid)'
  ],
  // Usar mock de uuid para evitar problemas de ESM
  moduleNameMapper: {
    '^uuid$': '<rootDir>/__mocks__/uuid.js'
  },
  setupFilesAfterEnv: ['<rootDir>/tests/setup/setupTests.js'],
  testMatch: [
    '<rootDir>/tests/**/*.test.js'
  ],
  // Timeout más alto para tests de integración con DB
  testTimeout: 15000,
  verbose: true
};