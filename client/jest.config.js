module.exports = {
  testEnvironment: 'jsdom',
  
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  
  roots: ['<rootDir>/src', '<rootDir>/tests'],
  
  moduleNameMapper: {
    // IMPORTANTE: usar identity-obj-proxy es mejor que styleMock.js
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    '\\.(jpg|jpeg|png|gif|svg)$': '<rootDir>/__mocks__/fileMock.js',
  },
  
  transform: {
    '^.+\\.(js|jsx)$': ['babel-jest', { 
      configFile: './.babelrc' 
    }],
  },
  
  testMatch: [
    '<rootDir>/tests/**/*.test.js',
    '<rootDir>/tests/**/*.test.jsx',
  ],
  
  testPathIgnorePatterns: [
    '/node_modules/',
    '/build/',
    '/dist/',
  ],
  
  collectCoverageFrom: [
    'src/**/*.{js,jsx}',
    '!src/index.js',
    '!src/**/*.test.{js,jsx}',
  ],
  
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },
  
  coverageDirectory: '<rootDir>/coverage',
  
  moduleDirectories: ['node_modules', 'src'],
  
  moduleFileExtensions: ['js', 'jsx', 'json'],
  
  verbose: true,
  
  transformIgnorePatterns: [
    'node_modules/(?!(axios)/)',
  ],
};