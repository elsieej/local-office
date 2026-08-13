// Chuyển thể từ baotlake/office-website (utils/editor/x2t.worker.ts), AGPL-3.0.
// Nguồn: https://github.com/baotlake/office-website
//
// Chạy x2t.wasm (core chuyển đổi định dạng của ONLYOFFICE, vendor ở
// TASK-19) trong Web Worker để không chặn UI. `docx` (hay bất kỳ định
// dạng nào) được ghi vào filesystem ảo của Emscripten rồi gọi `main1` —
// đúng cách CLI `x2t` thật hoạt động, chỉ khác là chạy trong WASM.
//
// Không dùng lib "webworker" trong tsconfig (dự án chỉ có "DOM", dùng
// chung cho code React) — gõ kiểu tối thiểu qua ép kiểu ở biên thay vì
// phụ thuộc global `self`/`postMessage` của lib đó, tránh xung đột kiểu
// giữa "DOM" và "webworker" trong cùng một chương trình TypeScript.

import type { X2tConvertParams, X2tConvertResult } from '#/lib/onlyoffice/types'
import { AvsFileType } from '#/lib/onlyoffice/types'
import { X2T_BASE_URL } from '#/lib/onlyoffice/utils'

interface EmscriptenFS {
  mkdir: (path: string) => void
  writeFile: (path: string, data: Uint8Array | string) => void
  readFile: (
    path: string,
    opts?: { encoding: 'binary' },
  ) => Uint8Array<ArrayBuffer>
  readdir: (path: string) => Array<string>
  unlink: (path: string) => void
  analyzePath: (path: string) => { exists: boolean }
}

interface X2tModule {
  onRuntimeInitialized: () => void
  FS: EmscriptenFS
  ccall: (
    name: string,
    returnType: Array<string>,
    argTypes: Array<string>,
    args: Array<unknown>,
  ) => void
}

interface WorkerScope {
  location: { origin: string }
  postMessage: (message: unknown, transfer?: Array<Transferable>) => void
  onmessage: ((event: MessageEvent) => void) | null
  Module?: X2tModule
  __filename?: string
}

const ctx = self as unknown as WorkerScope
const BASE_URL = ctx.location.origin + X2T_BASE_URL

let x2t: X2tModule | null = null
let initPromise: Promise<void> | null = null

// `importScripts()` (worker cổ điển) không dùng được: Vite dev server luôn
// phục vụ file worker dạng module ESM bất kể `build.worker.format` cấu hình
// gì (giới hạn của Vite, không phải lựa chọn của LocalOffice), nên worker
// này BẮT BUỘC tạo với `{ type: 'module' }` — xem x2t-client.ts. Module
// worker không có `importScripts`. x2t.js là glue script Emscripten dạng
// cổ điển (gán `var Module = {}` ra global, không phải ES module) — nạp
// bằng fetch + eval gián tiếp thay vì import: eval gián tiếp chạy ở global
// scope nên `var Module` gán đúng ra `self.Module` như importScripts làm.
async function initX2t(): Promise<void> {
  if (x2t) return

  const scriptUrl = BASE_URL + 'x2t.js'
  ctx.__filename = BASE_URL
  const source = await fetch(scriptUrl).then((res) => res.text())
  ;(0, eval)(source)

  const module = ctx.Module
  if (!module) throw new Error('x2t.js không định nghĩa Module')
  x2t = module

  await new Promise<void>((resolve) => {
    x2t!.onRuntimeInitialized = () => resolve()
  })

  try {
    x2t.FS.mkdir('/working')
    x2t.FS.mkdir('/working/media')
    x2t.FS.mkdir('/working/fonts')
    x2t.FS.mkdir('/working/themes')
  } catch (err) {
    console.error('[x2t-worker] mkdir error:', err)
  }
}

async function ensureInit(): Promise<void> {
  initPromise ??= initX2t()
  return initPromise
}

function cleanMedia() {
  if (!x2t) return
  try {
    const mediaFiles = x2t.FS.readdir('/working/media/')
    for (const file of mediaFiles) {
      if (file !== '.' && file !== '..') {
        x2t.FS.unlink('/working/media/' + file)
      }
    }
  } catch (err) {
    console.error(err)
  }
}

function cleanupFiles(files: Array<string>): void {
  if (!x2t) return
  for (const file of files) {
    try {
      x2t.FS.unlink(file)
    } catch (err) {
      console.error(err)
    }
  }
  cleanMedia()
}

function readMedia(): { [key: string]: Uint8Array<ArrayBuffer> } {
  if (!x2t) return {}
  const media: { [key: string]: Uint8Array<ArrayBuffer> } = {}
  try {
    const files = x2t.FS.readdir('/working/media/')
    for (const file of files) {
      if (file !== '.' && file !== '..') {
        media[file] = x2t.FS.readFile('/working/media/' + file, {
          encoding: 'binary',
        })
      }
    }
  } catch (err) {
    console.error(err)
  }
  return media
}

const xmlPath = '/working/params.xml'

function writeInputs({
  fileFrom,
  fileTo,
  formatFrom,
  formatTo,
  data,
  media,
}: X2tConvertParams) {
  if (!x2t) return

  const params: Record<string, string | number | boolean> = {
    m_sFileFrom: fileFrom,
    m_sThemeDir: '/working/themes',
    m_sFileTo: fileTo,
    m_nFormatFrom: formatFrom ?? '',
    m_nFormatTo: formatTo ?? '',
    m_bIsPDFA: formatTo === AvsFileType.AVS_FILE_CROSSPLATFORM_PDFA,
    m_bIsNoBase64: false,
    m_sFontDir: '/working/fonts/',
  }

  const content = Object.entries(params)
    .filter(([, v]) => v !== '' && v !== false)
    .reduce((acc, [k, v]) => acc + `<${k}>${String(v)}</${k}>\n`, '')

  const xml = `<?xml version="1.0" encoding="utf-8"?>
<TaskQueueDataConvert
  xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
  xmlns:xsd="http://www.w3.org/2001/XMLSchema"
>
${content}
</TaskQueueDataConvert>`

  x2t.FS.writeFile(xmlPath, xml)
  if (data) {
    x2t.FS.writeFile(fileFrom, new Uint8Array(data))
  }

  if (media) {
    cleanMedia()
    for (const [key, value] of Object.entries(media)) {
      try {
        x2t.FS.writeFile('/working/' + key, value)
      } catch (err) {
        console.error(key, err)
      }
    }
  }
}

async function convert({
  data,
  fileFrom,
  fileTo,
  formatFrom,
  formatTo,
  media,
}: X2tConvertParams): Promise<X2tConvertResult> {
  if (!x2t) throw new Error('x2t chưa sẵn sàng')

  const fromPath = '/working/' + fileFrom
  const toPath = '/working/' + fileTo
  const files = [fromPath, toPath, xmlPath]

  writeInputs({
    fileFrom: fromPath,
    fileTo: toPath,
    formatFrom,
    formatTo,
    data,
    media,
  })

  // .doc (binary cũ) không chuyển thẳng sang định dạng nội bộ ONLYOFFICE
  // được — phải qua bước trung gian .docx trước, đúng cách x2t CLI thật
  // xử lý .doc.
  if (
    fileFrom.endsWith('.doc') ||
    formatFrom === AvsFileType.AVS_FILE_DOCUMENT_DOC
  ) {
    const viaPath = fromPath + '.docx'
    writeInputs({ fileFrom: fromPath, fileTo: viaPath, data: null })
    x2t.ccall('main1', ['number'], ['string'], [xmlPath])
    writeInputs({ fileFrom: viaPath, fileTo: toPath, data: null })
    files.push(viaPath)
  }

  try {
    const pathInfo = x2t.FS.analyzePath(toPath)
    if (pathInfo.exists) x2t.FS.unlink(toPath)
  } catch {
    // chưa tồn tại — bỏ qua
  }

  try {
    x2t.ccall('main1', ['number'], ['string'], [xmlPath])
  } catch (err) {
    console.error('ccall', err)
  }

  let output: Uint8Array<ArrayBuffer> | null = null
  try {
    output = x2t.FS.readFile(toPath)
  } catch (err) {
    console.error(err)
  }

  const outputMedia = readMedia()

  setTimeout(() => {
    cleanupFiles(files)
  })

  return { output, media: outputMedia }
}

interface WorkerMessage {
  id?: number
  type: string
  payload?: X2tConvertParams
}

ctx.onmessage = (event: MessageEvent<WorkerMessage>) => {
  const { id, type, payload } = event.data

  void (async () => {
    try {
      switch (type) {
        case 'convert': {
          await ensureInit()
          if (!payload) throw new Error('Thiếu payload convert')
          const result = await convert(payload)

          const transferables: Array<Transferable> = []
          if (result.output) transferables.push(result.output.buffer)
          Object.values(result.media).forEach((m) =>
            transferables.push(m.buffer),
          )

          ctx.postMessage(
            { id, type: 'convert:done', payload: result },
            transferables,
          )
          break
        }
        default:
          ctx.postMessage({
            id,
            type: 'error',
            error: `Unknown message type: ${String(type)}`,
          })
      }
    } catch (err) {
      ctx.postMessage({
        id,
        type: 'error',
        error: err instanceof Error ? err.message : String(err),
      })
    }
  })()
}

ensureInit().catch((err: unknown) => {
  console.error('[x2t-worker] Auto-init failed:', err)
})

ctx.postMessage({ type: 'ready' })
