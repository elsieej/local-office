//  @ts-check

import { tanstackConfig } from '@tanstack/eslint-config'

export default [
  ...tanstackConfig,
  {
    rules: {
      'import/no-cycle': 'off',
      'import/order': 'off',
      'sort-imports': 'off',
      '@typescript-eslint/array-type': 'off',
      '@typescript-eslint/require-await': 'off',
      'pnpm/json-enforce-catalog': 'off',
    },
  },
  {
    // shadcn sinh ra src/components/ui/** và CLI sẽ ghi đè khi nâng cấp —
    // sửa tay để làm vừa lòng rule chỉ tồn tại tới lần `add --overwrite` kế tiếp.
    files: ['src/components/ui/**'],
    rules: {
      '@typescript-eslint/no-unnecessary-condition': 'off',
    },
  },
  {
    ignores: [
      'eslint.config.js',
      'prettier.config.js',
      'commitlint.config.js',
      // Asset ONLYOFFICE do scripts/vendor-onlyoffice.mjs sinh ra (gitignored) —
      // mã bên thứ ba, không phải code của repo.
      'public/onlyoffice/**',
    ],
  },
]
