import { defineConfig } from 'eslint/config'
import nuxt from '@nuxt/eslint'

export default defineConfig([
  ...nuxt,
  {
    rules: {
      'vue/multi-word-component-names': 'off',
      '@typescript-eslint/no-explicit-any': 'warn',
    },
  },
])
