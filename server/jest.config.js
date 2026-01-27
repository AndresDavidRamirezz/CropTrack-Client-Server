export default {
  testEnvironment: 'node',
  
  // Buscar tests en carpeta tests/
  testMatch: [
    '<rootDir>/tests/unit/**/*.test.js',
    '<rootDir>/tests/integration/**/*.test.js'
  ],
  
  setupFilesAfterEnv: ['<rootDir>/tests/setup/setupTests.js'],
  
  transform: {
    '^.+\\.js$': 'babel-jest'
  },
  
  collectCoverageFrom: [
    'controllers/**/*.js',
    'models/**/*.js',
    'routes/**/*.js',
    'middleware/**/*.js',
    '!index.js',
    '!config/dbConfig.js'
  ],
  
  coverageDirectory: 'coverage',
  
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  },
  
  testTimeout: 10000,
  verbose: true
};