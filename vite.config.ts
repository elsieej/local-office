import { execFileSync } from 'node:child_process'
import { defineConfig } from 'vite'
import { devtools } from '@tanstack/devtools-vite'

import { tanstackStart } from '@tanstack/react-start/plugin/vite'

import viteReact from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// Ghi cứng lúc build — trang /source (nghĩa vụ "Tải mã nguồn" của AGPL §13)
// cần biết đúng commit đang chạy. Không có .git (vd cài từ tarball, không
// qua git clone) thì báo rõ "không xác định" thay vì giả vờ có commit.
function readGitCommitSha() {
  try {
    return execFileSync('git', ['rev-parse', 'HEAD']).toString().trim()
  } catch {
    return null
  }
}

const config = defineConfig({
  resolve: { tsconfigPaths: true },
  // strictPort: BETTER_AUTH_URL ghi cứng cổng — Vite âm thầm đổi cổng khi bị
  // chiếm sẽ làm Better Auth từ chối request thật với lỗi "Invalid origin"
  // (403) thay vì báo lỗi rõ ràng ngay từ đầu.
  server: { strictPort: true },
  define: {
    __GIT_COMMIT_SHA__: JSON.stringify(readGitCommitSha()),
  },
  plugins: [
    // consolePiping tắt: cơ chế mirror console server->client của
    // TanStack Devtools lặp lại toàn bộ lịch sử log mỗi lần kết nối SSE
    // lại (dev only), tích luỹ thành các dòng console cực lớn — làm
    // Playwright MCP mất kết nối nhiều lần khi kiểm thử TASK-21/22.
    devtools({ consolePiping: { enabled: false } }),
    tailwindcss(),
    tanstackStart(),
    viteReact(),
  ],
})

export default config
