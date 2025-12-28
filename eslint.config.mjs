import globals from 'globals';
import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import prettierPlugin from 'eslint-plugin-prettier/recommended';
import commentsPlugin from '@eslint-community/eslint-plugin-eslint-comments/configs';
import promisePlugin from 'eslint-plugin-promise';
import importPlugin from 'eslint-plugin-import-x';
import jestPlugin from 'eslint-plugin-jest';

export default tseslint.config(
  {
    files: ['**/*.{js,mjs,ts}'],
    languageOptions: {
      globals: globals.node,
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
        allowDefaultProject: ['*.mjs', '*.js'],
      },
    },
    extends: [
      eslint.configs.recommended,
      ...tseslint.configs.recommendedTypeChecked,
      commentsPlugin.recommended,
      promisePlugin.configs['flat/recommended'],
      importPlugin.flatConfigs.errors,
      importPlugin.flatConfigs.warnings,
      importPlugin.flatConfigs.typescript,
      prettierPlugin,
    ],
    rules: {
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/interface-name-prefix': 'off',
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-floating-promises': 'off',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/prefer-readonly': 'error',
      'no-console': 'error',
      'prettier/prettier': ['error', { endOfLine: 'auto' }],
    },
  },
  {
    files: ['src/commands/**/*.ts', 'src/jobs/**/*.ts'],
    rules: {
      'no-console': 'off',
    },
  },
  {
    files: ['**/*.spec.ts'],
    ...jestPlugin.configs['flat/recommended'],
    ...jestPlugin.configs['flat/style'],
    rules: {
      ...jestPlugin.configs['flat/recommended'].rules,
      '@typescript-eslint/unbound-method': 'off',
    },
  },
);
