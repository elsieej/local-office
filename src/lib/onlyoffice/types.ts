// Chuyển thể từ baotlake/office-website (utils/editor/types.ts), AGPL-3.0.
// Nguồn: https://github.com/baotlake/office-website
//
// Kiểu dữ liệu của giao thức nội bộ ONLYOFFICE Document Server (HTTP +
// WebSocket coauthoring) mà lớp giả lập ở thư mục này phải nói đúng ngôn
// ngữ. Không tự suy đoán được — port nguyên từ nguồn để giữ đúng giá trị.

export type User = {
  id: string
  name: string
}

export type Participant = {
  connectionId: string
  encrypted: boolean
  id: string
  idOriginal: string
  indexUser: number
  isCloseCoAuthoring: boolean
  isLiveViewer: boolean
  username: string
  view: boolean
}

// `as const` object thay vì `const enum` — esbuild (Vite dùng để transpile)
// không hỗ trợ tốt `const enum` xuyên file.
export const AscSaveTypes = {
  PartStart: 0,
  Part: 1,
  Complete: 2,
  CompleteAll: 3,
} as const

export const DocumentType = {
  Word: 'word',
  Cell: 'cell',
  Slide: 'slide',
  Draw: 'draw',
  Pdf: 'pdf',
} as const
export type DocumentType = (typeof DocumentType)[keyof typeof DocumentType]

// Mã định dạng file nội bộ của x2t (core ONLYOFFICE) — chỉ giữ các nhóm còn
// dùng tới (Document, Crossplatform cho PDF) trong LocalOffice.
export const AvsFileType = {
  AVS_FILE_UNKNOWN: 0x0000,

  AVS_FILE_DOCUMENT: 0x0040,
  AVS_FILE_DOCUMENT_DOCX: 0x0040 + 0x0001,
  AVS_FILE_DOCUMENT_DOC: 0x0040 + 0x0002,
  AVS_FILE_DOCUMENT_ODT: 0x0040 + 0x0003,
  AVS_FILE_DOCUMENT_RTF: 0x0040 + 0x0004,
  AVS_FILE_DOCUMENT_TXT: 0x0040 + 0x0005,
  AVS_FILE_DOCUMENT_HTML: 0x0040 + 0x0006,
  AVS_FILE_DOCUMENT_DOCM: 0x0040 + 0x000b,
  AVS_FILE_DOCUMENT_DOTX: 0x0040 + 0x000c,
  AVS_FILE_DOCUMENT_DOTM: 0x0040 + 0x000d,

  AVS_FILE_CROSSPLATFORM: 0x0200,
  AVS_FILE_CROSSPLATFORM_PDF: 0x0200 + 0x0001,
  AVS_FILE_CROSSPLATFORM_PDFA: 0x0200 + 0x0009,
} as const
export type AvsFileType = (typeof AvsFileType)[keyof typeof AvsFileType]

export interface X2tConvertParams {
  data: ArrayBuffer | null
  fileFrom: string
  fileTo: string
  formatFrom?: number
  formatTo?: number
  media?: { [key: string]: Uint8Array }
}

export interface X2tConvertResult {
  output: Uint8Array<ArrayBuffer> | null
  media: { [key: string]: Uint8Array<ArrayBuffer> }
}

export interface ServerOptions {
  fileType?: string
}

// Bề mặt tối thiểu của instance `DocEditor` mà component cần gọi (chỉ
// destroyEditor để dọn dẹp khi unmount) — không port toàn bộ API bề mặt của
// office-website vì TASK-21 chưa dùng tới các API còn lại.
export interface DocEditorInstance {
  destroyEditor: (cmd?: string) => void
}

// `web-apps/apps/api/documents/api.js` (vendor TASK-19) gắn `DocsAPI` là
// global trên window sau khi nạp bằng thẻ <script>.
declare global {
  interface Window {
    DocsAPI?: {
      DocEditor: {
        new (
          placeholderId: string,
          config: Record<string, unknown>,
        ): DocEditorInstance
        version: () => string
      }
    }
  }
}
