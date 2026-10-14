import nx from '@nx/eslint-plugin';
import baseConfig from '../../eslint.config.mjs';

export default [
  ...nx.configs['flat/react'],
  ...baseConfig,
  {
    ignores: ['**/src-tauri/target/**'],
  },
  {
    files: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
    // Override or add rules here
    rules: {},
  },
  {
    files: ['src/app/**/*.{ts,tsx}'],
    ignores: ['src/app/**/*.spec.{ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          paths: [
            {
              name: '@tamabuddy/tamabuddy-client',
              message:
                'Compose a desktop feature adapter instead of using the shared client from the app layer.',
            },
            {
              name: '@tamabuddy/tamabuddy-engine',
              message:
                'Keep engine types and behavior behind desktop feature adapters.',
            },
          ],
          patterns: [
            {
              regex: '^\\.\\./features/[^/]+/(?!index\\.js$)',
              message: 'Import each feature through its public index.',
            },
          ],
        },
      ],
    },
  },
  {
    files: ['src/features/**/*.{ts,tsx}'],
    ignores: [
      'src/features/**/__tests__/**',
      'src/features/**/*.spec.{ts,tsx}',
    ],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['**/app/**'],
              message: 'Features must not depend on the app composition layer.',
            },
            {
              regex:
                '^(?:\\.\\./)+(?:game|mascot|pet|settings)/(?!index\\.js$)',
              message: 'Import sibling features through their public index.',
            },
          ],
        },
      ],
    },
  },
  {
    files: ['src/features/**/*.{ts,tsx}'],
    ignores: [
      'src/features/**/__tests__/**',
      'src/features/**/*.spec.{ts,tsx}',
      'src/features/pet/hooks/**',
      'src/features/pet/model/**',
      'src/features/pet/services/**',
    ],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          paths: [
            {
              name: '@tamabuddy/tamabuddy-client',
              message:
                'Keep the shared client behind a desktop feature adapter.',
            },
            {
              name: '@tamabuddy/tamabuddy-engine',
              message:
                'Use the desktop presentation contract from entities/pet.',
            },
          ],
          patterns: [
            {
              group: ['**/app/**'],
              message: 'Features must not depend on the app composition layer.',
            },
            {
              regex:
                '^(?:\\.\\./)+(?:game|mascot|pet|settings)/(?!index\\.js$)',
              message: 'Import sibling features through their public index.',
            },
          ],
        },
      ],
    },
  },
  {
    files: ['src/entities/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          paths: [
            {
              name: '@tamabuddy/tamabuddy-client',
              message: 'Entities must remain independent from client adapters.',
            },
            {
              name: '@tamabuddy/tamabuddy-engine',
              message:
                'Entities define desktop contracts; feature adapters translate engine types.',
            },
          ],
          patterns: [
            {
              group: ['**/app/**', '**/features/**'],
              message: 'Entities must not depend on app or feature layers.',
            },
          ],
        },
      ],
    },
  },
];
