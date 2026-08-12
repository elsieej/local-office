import { defineConfig } from 'vite'
import { devtools } from '@tanstack/devtools-vite'

import { tanstackStart } from '@tanstack/react-start/plugin/vite'

import viteReact from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

const config = defineConfig({
  resolve: { tsconfigPaths: true },
  // strictPort: BETTER_AUTH_URL ghi cứng cổng — Vite âm thầm đổi cổng khi bị
  // chiếm sẽ làm Better Auth từ chối request thật với lỗi "Invalid origin"
  // (403) thay vì báo lỗi rõ ràng ngay từ đầu.
  server: { strictPort: true },
  plugins: [devtools(), tailwindcss(), tanstackStart(), viteReact()],
})

export default config
