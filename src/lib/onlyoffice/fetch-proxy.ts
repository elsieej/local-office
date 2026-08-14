// Chuyển thể từ baotlake/office-website (utils/editor/fetch.ts), AGPL-3.0.
// Nguồn: https://github.com/baotlake/office-website
//
// Bản `fetch` cho cùng cơ chế middleware như xhr-proxy.ts — DocEditor dùng
// cả XHR lẫn fetch tuỳ chỗ.

import type { XHRMiddleware } from '#/lib/onlyoffice/xhr-proxy'

export type FetchProxy = typeof fetch & {
  use: (middleware: XHRMiddleware) => void
  clearMiddlewares: () => void
}

export function createFetchProxy(
  target: Window & typeof globalThis,
): FetchProxy {
  const middlewares: Array<XHRMiddleware> = []
  const baseFetch = target.fetch.bind(target)
  // `Request` toàn cục ở module này là của window CHÍNH (nơi bundle app
  // được nạp), không phải của iframe editor — dùng nó để resolve URL
  // tương đối sẽ tính base URL theo trang LocalOffice (vd
  // `/documents/<id>`) thay vì theo trang thật của iframe
  // (`/onlyoffice/web-apps/...`), làm sai lệch cả path lẫn origin. Phải
  // dùng đúng `Request` của `target` (iframe) để base URL khớp iframe.
  const TargetRequest = target.Request

  const proxy = (async (input: RequestInfo | URL, init?: RequestInit) => {
    let request: Request
    try {
      request = new TargetRequest(input, init)
    } catch {
      return baseFetch(input, init)
    }

    try {
      for (const mw of middlewares) {
        const response = await mw(request.clone())
        if (response) return response
      }
    } catch (err) {
      console.error('ProxyFetch middleware error:', err)
      return baseFetch(request)
    }

    return baseFetch(request)
  }) as FetchProxy

  proxy.use = (middleware: XHRMiddleware) => {
    middlewares.push(middleware)
  }
  proxy.clearMiddlewares = () => {
    middlewares.length = 0
  }

  return proxy
}
