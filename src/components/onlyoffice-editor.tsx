import { useEffect, useRef, useState } from 'react'
import { useBlocker } from '@tanstack/react-router'
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
const LOGO_LIGHT_URL = '/logo-name_black.svg'
const LOGO_DARK_URL = '/logo-name_white.svg'

// `theme-toggle.tsx` ghi thẳng vào documentElement.classList (không có
// store/hook riêng để dùng lại) — đọc lại đúng cách đó, tại thời điểm mount
// editor. Không phản ứng real-time nếu người dùng đổi theme hệ điều hành
// trong lúc editor đang mở (đổi mode đã ép remount toàn bộ — xem
// $documentId.tsx — nên đổi theme khi quay lại vẫn khớp đúng lần mount sau).
function getResolvedUiTheme(): 'theme-classic-light' | 'theme-dark' {
  return document.documentElement.classList.contains('dark')
    ? 'theme-dark'
    : 'theme-classic-light'
}

// ONLYOFFICE tự cache theme UI đã chọn vào `localStorage['ui-theme-id']`
// (cùng origin, dùng chung với LocalOffice) và ĐỌC CACHE NÀY TRƯỚC — chỉ
// dùng `customization.uiTheme` truyền vào nếu chưa có cache (xem
// `window.uitheme.set_id(localstorage.getItem('ui-theme-id'))` chạy trước
// nhánh đọc `params.uitheme` trong index.html đã vendor). Một khi editor
// mở lần đầu ở theme nào, mọi lần mở sau bị "kẹt" ở đúng theme đó bất kể
// LocalOffice đang sáng hay tối — đây là nguyên nhân thật của việc theme
// tối "không lên hình" ở TASK-23 (nhầm là lỗi hiển thị sâu trong
// ONLYOFFICE, thực ra là cache theme cũ đè lên param mới). Ghi đè cache
// này khớp với theme vừa tính TRƯỚC khi tạo DocEditor (iframe đọc
// localStorage lúc bootstrap, đồng bộ vì cùng origin) để cache không bao
// giờ lệch với LocalOffice.
function syncOnlyofficeThemeCache(theme: 'theme-classic-light' | 'theme-dark') {
  try {
    window.localStorage.setItem('ui-theme-id', theme)
  } catch {
    // localStorage có thể bị chặn (chế độ riêng tư nghiêm ngặt) — bỏ qua,
    // ONLYOFFICE tự rơi về `params.uitheme` như bình thường khi không đọc
    // được cache.
  }
}

type OnlyofficeEditorProps = {
  file: File
  /** Đuôi file không có dấu chấm, vd "docx" — dùng làm input cho x2t. */
  fileType: string
  title: string
  mode: 'view' | 'edit'
}

export default function OnlyofficeEditor({
  file,
  fileType,
  title,
  mode,
}: OnlyofficeEditorProps) {
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const isDirtyRef = useRef(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const [containerHeight, setContainerHeight] = useState<number | null>(null)

  // Lấp phần viewport còn lại thay vì cố định chiều cao — đo bằng JS (thay
  // vì CSS thuần) vì chiều cao header/card phía trên nằm ở component khác,
  // không có cách CSS nào biết trước để trừ ra mà không phải sửa layout gốc
  // của cả app.
  useEffect(() => {
    function updateHeight() {
      const el = containerRef.current
      if (!el) return
      const top = el.getBoundingClientRect().top
      setContainerHeight(Math.max(400, window.innerHeight - top - 16))
    }
    updateHeight()
    window.addEventListener('resize', updateHeight)
    return () => window.removeEventListener('resize', updateHeight)
  }, [])

  useBlocker({
    shouldBlockFn: () => {
      if (!isDirtyRef.current) return false
      return !window.confirm(
        'Tài liệu có thay đổi chưa lưu. Rời trang và bỏ các thay đổi này?',
      )
    },
    // Mặc định `enableBeforeUnload` là `true` (không điều kiện) — nghĩa là
    // đóng tab/reload luôn hiện cảnh báo của trình duyệt bất kể có thay đổi
    // chưa lưu hay không, kể cả ở mode Xem không bao giờ dirty. Phải truyền
    // hàm để chỉ bật đúng lúc đang dirty thật (phát hiện lúc kiểm thử
    // TASK-23, lỗi có từ TASK-22).
    enableBeforeUnload: () => isDirtyRef.current,
  })

  useEffect(() => {
    let cancelled = false
    let editor: DocEditorInstance | null = null
    const server = new EditorServer()
    isDirtyRef.current = false
    setStatus('loading')
    setErrorMessage(null)

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
      const uiTheme = getResolvedUiTheme()

      server.setClient({ buildVersion: window.DocsAPI.DocEditor.version() })
      syncOnlyofficeThemeCache(uiTheme)

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
            edit: mode === 'edit',
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
            uiTheme,
            features: { spellcheck: { change: false } },
            logo: {
              image: LOGO_LIGHT_URL,
              imageDark: LOGO_DARK_URL,
              url: '/',
            },
          },
        },
        events: {
          onAppReady: () => onAppReady(),
          onDocumentReady: () => {
            if (!cancelled) setStatus('ready')
          },
          onError: (e: unknown) =>
            fail('ONLYOFFICE báo lỗi khi mở tài liệu.', e),
          onDocumentStateChange: (e: { data: boolean }) => {
            if (e.data) isDirtyRef.current = true
          },
          onSaveDocument: () => {
            isDirtyRef.current = false
          },
          onSave: () => {
            isDirtyRef.current = false
          },
          writeFile: () => {
            isDirtyRef.current = false
          },
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
  }, [file, fileType, title, mode])

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
    <div
      ref={containerRef}
      className="relative h-[75vh] w-full overflow-hidden rounded-lg border"
      style={containerHeight ? { height: containerHeight } : undefined}
    >
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
