import {
  DOCUMENT_EXTENSION_KIND,
  MAX_DOCUMENT_SIZE_BYTES,
} from '#/constants/document'
import type { DocumentExtension } from '#/constants/document'
import {
  DocumentNotFoundError,
  DocumentTooLargeError,
  UnsupportedDocumentTypeError,
} from '#/lib/documents/errors'
import {
  deleteDocumentBytes,
  readDocumentBytes,
  writeDocumentBytes,
} from '#/lib/documents/opfs-store'
import {
  deleteDocumentMeta,
  getDocumentMeta,
  listDocumentMeta,
  putDocumentMeta,
} from '#/lib/documents/metadata-store'
import type { Document } from '#/lib/documents/types'

export const DOCUMENTS_QUERY_KEY = ['documents'] as const

function getExtension(fileName: string): DocumentExtension | undefined {
  const dot = fileName.lastIndexOf('.')
  if (dot === -1) return undefined
  const extension = fileName.slice(dot).toLowerCase()
  return extension in DOCUMENT_EXTENSION_KIND
    ? (extension as DocumentExtension)
    : undefined
}

export async function saveDocument(file: File): Promise<Document> {
  const extension = getExtension(file.name)
  if (!extension) throw new UnsupportedDocumentTypeError(file.name)
  if (file.size > MAX_DOCUMENT_SIZE_BYTES) {
    throw new DocumentTooLargeError(file.name, MAX_DOCUMENT_SIZE_BYTES)
  }

  const document: Document = {
    id: crypto.randomUUID(),
    name: file.name,
    extension,
    kind: DOCUMENT_EXTENSION_KIND[extension],
    size: file.size,
    openedAt: Date.now(),
    state: 'local',
  }

  await writeDocumentBytes(document.id, file)
  try {
    await putDocumentMeta(document)
  } catch (error) {
    await deleteDocumentBytes(document.id)
    throw error
  }

  return document
}

export function listDocuments(): Promise<Array<Document>> {
  return listDocumentMeta()
}

export async function getDocument(id: string): Promise<Document | null> {
  // react-query's queryFn không cho phép resolve `undefined` (coi là lỗi) —
  // trả `null` để "không tìm thấy" là một kết quả thành công bình thường.
  const document = await getDocumentMeta(id)
  return document ?? null
}

export function openDocument(id: string): Promise<File> {
  return readDocumentBytes(id)
}

// Dùng khi editor tự lưu đè lên tài liệu đang mở (không phải upload file
// mới) — ghi bytes mới vào đúng slot OPFS đã có, cập nhật lại `size` trong
// metadata (mọi trường khác giữ nguyên, kể cả `openedAt` — đây là lưu, không
// phải mở lại).
export async function updateDocumentBytes(
  id: string,
  file: File,
): Promise<Document> {
  const existing = await getDocumentMeta(id)
  if (!existing) throw new DocumentNotFoundError(id)

  await writeDocumentBytes(id, file)
  const updated: Document = { ...existing, size: file.size }
  await putDocumentMeta(updated)
  return updated
}

export async function deleteDocument(id: string): Promise<void> {
  // Xoá bytes trước rồi mới xoá metadata: nếu crash giữa chừng, metadata mồ côi
  // trỏ tới bytes đã mất (phát hiện được khi mở lại) — an toàn hơn chiều ngược
  // lại, để lại bytes mồ côi trong OPFS mà không còn cách nào tìm ra.
  await deleteDocumentBytes(id)
  await deleteDocumentMeta(id)
}
