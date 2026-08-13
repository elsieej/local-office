/**
 * Đuôi file được phép mở, khớp bảng định dạng ở CLAUDE.md. `kind` gộp các
 * đuôi tương đương (docx/doc → 'word') để UI chọn icon/hành vi theo nhóm.
 */
export const DOCUMENT_EXTENSION_KIND = {
  '.docx': 'word',
  '.doc': 'word',
  '.xlsx': 'excel',
  '.xls': 'excel',
  '.pptx': 'powerpoint',
  '.ppt': 'powerpoint',
  '.pdf': 'pdf',
  '.txt': 'text',
  '.md': 'markdown',
} as const

export type DocumentExtension = keyof typeof DOCUMENT_EXTENSION_KIND

export type DocumentKind = (typeof DOCUMENT_EXTENSION_KIND)[DocumentExtension]

/** Đuôi hiện xem được trong trình duyệt — xem TASK-16/17, engine Office thật chưa chọn. */
export const VIEWABLE_DOCUMENT_KIND: ReadonlySet<DocumentKind> = new Set([
  'pdf',
])

export const MAX_DOCUMENT_SIZE_BYTES = 200 * 1024 * 1024
