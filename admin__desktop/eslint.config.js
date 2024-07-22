import pluginJs from '@eslint/js'
import pluginReactHooks from 'eslint-plugin-react-hooks'
import pluginReactConfig from 'eslint-plugin-react/configs/recommended.js'
import globals from 'globals'
import tseslint from 'typescript-eslint'

export default [
  { files: ['**/*.{js,mjs,cjs,ts,jsx,tsx}'] },
  { languageOptions: { parserOptions: { ecmaFeatures: { jsx: true } } } },
  { languageOptions: { globals: globals.browser } },
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,
  pluginReactConfig,
  {
    plugins: { 'react-hooks': pluginReactHooks },
    rules: { ...pluginReactHooks.configs.recommended.rules },
    settings: {
      react: {
        version: 'detect',
      },
    },
  },
  {
    rules: {
      'react/react-in-jsx-scope': 'off',
      '@typescript-eslint/no-unused-vars': 'warn',
      'react/jsx-filename-extension': [1, { extensions: ['.tsx'] }],
      'react/jsx-indent': 'off',
      'react/self-closing-comp': [
        'warn',
        {
          component: true,
          html: true,
        },
      ],
      'object-curly-spacing': ['error', 'always'],
    },
  },
]
