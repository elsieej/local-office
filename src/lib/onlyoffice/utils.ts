// Chuyển thể từ baotlake/office-website (utils/editor/utils.ts), AGPL-3.0.
// Nguồn: https://github.com/baotlake/office-website
//
// Đường dẫn asset trỏ vào `public/onlyoffice/` do
// `scripts/vendor-onlyoffice.mjs` sinh ra (TASK-19) — không phải
// `NEXT_PUBLIC_APP_ROOT` như bản gốc (LocalOffice không dùng Next.js).

import { DocumentType } from '#/lib/onlyoffice/types'

export const APP_ROOT = '/onlyoffice'
export const PRELOAD_HTML = '/web-apps/apps/api/documents/preload.html'
export const API_JS = '/web-apps/apps/api/documents/api.js'
export const X2T_BASE_URL = '/onlyoffice/x2t/'

/**
 * Đuôi file (không dấu chấm) → loại tài liệu ONLYOFFICE. `VIEWABLE_DOCUMENT_KIND`
 * (src/constants/document.ts) chỉ cho phép mở kind 'word' qua engine này —
 * TASK-21 chỉ làm `.docx`/`.doc`, chưa tới bảng tính/trình chiếu — nên luôn
 * là `word`. Bản gốc office-website có bảng map đủ mọi định dạng vì hỗ trợ
 * cả spreadsheet/presentation.
 */
export function getDocumentType(_extension: string): DocumentType {
  return DocumentType.Word
}
