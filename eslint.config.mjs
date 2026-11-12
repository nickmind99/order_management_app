import js from '@eslint/js';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  { ignores: ['**/dist/', '**/node_modules/', 'packages/db/src/generated/', 'packages/generator/lambda/', 'task/'] },
  js.configs.recommended,
  tseslint.configs.recommended,
  { rules: { '@typescript-eslint/no-unused-vars': ['error', { ignoreRestSiblings: true }] } },
);
