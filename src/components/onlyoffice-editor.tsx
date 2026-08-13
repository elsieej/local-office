import { useEffect, useState } from 'react'
import { Alert, AlertDescription, AlertTitle } from '#/components/ui/alert'
import { Skeleton } from '#/components/ui/skeleton'
import { EditorServer } from '#/lib/onlyoffice/editor-server'
import { createFetchProxy } from '#/lib/onlyoffice/fetch-proxy'
import { io, MockSocket } from '#/lib/onlyoffice/mock-socket'
import type { DocEditorInstance } from '#/lib/onlyoffice/types'
import {
  API_JS,
  APP_ROOT,
  PRELOAD_HTML,
  getDocumentType,
} from '#/lib/onlyoffice/utils'
import { createXHRProxy } from '#/lib/onlyoffice/xhr-proxy'

// Wiring chính (nạp api.js, iframe preload, gắn proxy đúng lúc iframe
// editor "onAppReady") chuyển thể từ baotlake/office-website
// (app/editor/page.tsx), AGPL-3.0. Nguồn: https://github.com/baotlake/office-website
//
// DocEditor tạo một iframe tên "frameEditor" bên trong phần tử placeholder
// khi khởi tạo. Phải chờ đúng sự kiện onAppReady rồi mới ghi đè
// XMLHttpRequest/fetch/Worker/io CỦA IFRAME ĐÓ (không phải window chính) —
// ghi đè sớm hơn thì iframe chưa tồn tại, muộn hơn thì editor đã lỡ dùng
// XHR/WS thật để gọi ra ngoài.

const PLACEHOLDER_ID = 'onlyoffice-editor-placeholder'
const API_JS_URL = APP_ROOT + API_JS
const PRELOAD_URL = APP_ROOT + PRELOAD_HTML

type OnlyofficeEditorProps = {
  file: File
  /** Đuôi file không có dấu chấm, vd "docx" — dùng làm input cho x2t. */
  fileType: string
  title: string
}

export default function OnlyofficeEditor({
  file,
  fileType,
  title,
}: OnlyofficeEditorProps) {
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    let editor: DocEditorInstance | null = null
    const server = new EditorServer()

    function fail(message: string, err?: unknown) {
      if (cancelled) return
      if (err !== undefined) console.error('[OnlyofficeEditor]', message, err)
      setErrorMessage(message)
      setStatus('error')
    }

    MockSocket.on('connect', server.handleConnect)
    MockSocket.on('disconnect', server.handleDisconnect)

    function onAppReady() {
      const iframe = document.querySelector<HTMLIFrameElement>(
        'iframe[name="frameEditor"]',
      )
      // `Window` (kiểu của contentWindow) không khai XMLHttpRequest/Worker
      // như thành viên interface — đó là biến toàn cục ambient
      // (`typeof globalThis`), có thật lúc chạy nhưng cần ép kiểu để dùng.
      const win = iframe?.contentWindow as (Window & typeof globalThis) | null
      if (!iframe?.contentDocument || !win) {
        fail('Không tải được khung soạn thảo tài liệu.')
        return
      }

      const xhr = createXHRProxy(win.XMLHttpRequest)
      const fetchProxy = createFetchProxy(win)
      const BaseWorker = win.Worker

      xhr.use((request) => server.handleRequest(request))
      fetchProxy.use((request) => server.handleRequest(request))

      Object.assign(win, {
        io,
        XMLHttpRequest: xhr,
        fetch: fetchProxy,
        Worker: function (url: string, options?: WorkerOptions) {
          const u = new URL(url, location.origin)
          return new BaseWorker(
            u.href.replace(u.origin, location.origin),
            options,
          )
        },
      })
    }

    function createEditor() {
      if (!window.DocsAPI) {
        fail('Không nạp được engine ONLYOFFICE.')
        return
      }

      const doc = server.getDocument()
      const user = server.getUser()
      const documentType = getDocumentType(doc.fileType)

      server.setClient({ buildVersion: window.DocsAPI.DocEditor.version() })

      editor = new window.DocsAPI.DocEditor(PLACEHOLDER_ID, {
        // Không set thì api.js tự chèn thư mục phiên bản kiểu
        // `/<version-hash>/web-apps/...` vào mọi đường dẫn asset (dành cho
        // Document Server thật, phục vụ cache-busting) — vendor của
        // LocalOffice không có thư mục đó, mọi request sẽ 404. Xem
        // `extendAppPath()` trong web-apps/apps/api/documents/api.js.
        isLocalFile: true,
        document: {
          fileType: doc.fileType,
          key: doc.key,
          title: doc.title,
          url: doc.url,
          permissions: {
            edit: false,
            chat: false,
            rename: false,
            protect: false,
            review: false,
            print: false,
          },
        },
        documentType,
        editorConfig: {
          lang: 'vi',
          coEditing: { mode: 'fast', change: false },
          user: { ...user },
          customization: {
            uiTheme: 'theme-classic-light',
            features: { spellcheck: { change: false } },
          },
        },
        events: {
          onAppReady: () => onAppReady(),
          onDocumentReady: () => {
            if (!cancelled) setStatus('ready')
          },
          onError: (e: unknown) =>
            fail('ONLYOFFICE báo lỗi khi mở tài liệu.', e),
        },
        type: 'desktop',
        width: '100%',
        height: '100%',
      })
    }

    function loadEditor() {
      if (window.DocsAPI?.DocEditor) {
        createEditor()
        return
      }
      let script = document.querySelector<HTMLScriptElement>(
        `script[src="${API_JS_URL}"]`,
      )
      if (!script) {
        script = document.createElement('script')
        script.src = API_JS_URL
        document.head.appendChild(script)
      }
      script.addEventListener('load', () => {
        if (!cancelled) createEditor()
      })
      script.addEventListener('error', () => {
        fail('Không tải được engine ONLYOFFICE — kiểm tra lại pipeline vendor.')
      })
    }

    async function init() {
      try {
        const { loadPromise } = await server.open(file, fileType, title)
        if (cancelled) return
        // EditorServer tự bắt lỗi convert (x2t.wasm) để trả lời đúng giao
        // thức socket cho DocEditor (mở tài liệu rỗng thay vì làm treo
        // handshake) — nhưng vậy thì lỗi thật sẽ bị nuốt, người dùng thấy
        // trang trống mà tưởng file rỗng thật. Theo dõi riêng promise này
        // để hiện đúng lỗi, độc lập với việc script/DocEditor vẫn nạp song
        // song bên dưới.
        loadPromise.catch((err: unknown) => {
          fail('Không mở được tài liệu — file có thể bị hỏng.', err)
        })
        loadEditor()
      } catch (err) {
        fail('Không mở được tài liệu — file có thể bị hỏng.', err)
      }
    }

    void init()

    return () => {
      cancelled = true
      MockSocket.off('connect', server.handleConnect)
      MockSocket.off('disconnect', server.handleDisconnect)
      editor?.destroyEditor()
      server.destroy()
    }
  }, [file, fileType, title])

  if (status === 'error') {
    return (
      <Alert variant="destructive">
        <AlertTitle>Không mở được tài liệu</AlertTitle>
        <AlertDescription>
          {errorMessage || 'File có thể bị hỏng hoặc không đúng định dạng.'}
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="relative h-[75vh] w-full overflow-hidden rounded-lg border">
      {status === 'loading' && (
        <Skeleton className="absolute inset-0 h-full w-full" />
      )}
      <div id={PLACEHOLDER_ID} className="h-full w-full">
        <iframe
          className="hidden h-0 w-0"
          src={PRELOAD_URL}
          title="ONLYOFFICE preload"
          aria-hidden="true"
        />
      </div>
    </div>
  )
}
