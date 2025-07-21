module.exports = {
  env: {
    browser: true,
    es2021: true,
    node: true,
    jest: true
  },
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
    'plugin:react/jsx-runtime'
  ],
  parserOptions: {
    ecmaFeatures: {
      jsx: true
    },
    ecmaVersion: 12,
    sourceType: 'module'
  },
  plugins: [
    'react',
    'react-hooks'
  ],
  rules: {
    // React rules
    'react/prop-types': 'off',
    'react/react-in-jsx-scope': 'off',
    'react/display-name': 'off',
    'react/no-unescaped-entities': 'off',
    'react/no-children-prop': 'off',
    'react/jsx-no-undef': 'warn',
    'react/no-unknown-property': 'warn',
    
    // Hooks rules
    'react-hooks/exhaustive-deps': 'warn',
    'react-hooks/rules-of-hooks': 'error',
    
    // General rules - be more lenient
    'no-unused-vars': 'warn',
    'no-console': 'off', // Allow console statements for now
    'prefer-const': 'warn',
    'no-var': 'error',
    'no-undef': 'error',
    'no-case-declarations': 'warn'
  },
  settings: {
    react: {
      version: 'detect'
    }
  },
  ignorePatterns: [
    'dist/**',
    'build/**',
    '*.min.js',
    'sw.js',
    'public/sw.js',
    'node_modules/**'
  ]
}; 