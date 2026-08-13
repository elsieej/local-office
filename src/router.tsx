import { QueryClient } from '@tanstack/react-query'
import { createRouter as createTanStackRouter } from '@tanstack/react-router'
import { routeTree } from './routeTree.gen'

export function getRouter() {
  // Mặc định 'online': query/mutation bị tạm dừng (không lỗi, không log) khi
  // navigator.onLine === false, dù mutationFn không hề gọi mạng. Dữ liệu tài
  // liệu chỉ nằm trong OPFS/IndexedDB cục bộ nên không cần chờ mạng — nếu
  // không set 'always', các thao tác như xoá tài liệu sẽ treo vô thời hạn khi
  // offline. Xem TASK-17.
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { networkMode: 'always' },
      mutations: { networkMode: 'always' },
    },
  })

  const router = createTanStackRouter({
    routeTree,
    context: { queryClient },
    scrollRestoration: true,
    defaultPreload: 'intent',
    defaultPreloadStaleTime: 0,
  })

  return router
}

declare module '@tanstack/react-router' {
  interface Register {
    router: ReturnType<typeof getRouter>
  }
}
