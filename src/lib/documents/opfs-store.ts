import {
  DocumentNotFoundError,
  OpfsUnsupportedError,
} from '#/lib/documents/errors'

const DOCUMENTS_DIR = 'documents'

async function getDocumentsDirectory(): Promise<FileSystemDirectoryHandle> {
  // Tra bằng `in` thay vì gọi thẳng: kiểu DOM coi getDirectory luôn tồn tại,
  // nhưng trình duyệt cũ thật sự không có — cần tra runtime, không phải kiểu.
  if (!('getDirectory' in navigator.storage)) throw new OpfsUnsupportedError()
  const root = await navigator.storage.getDirectory()
  return root.getDirectoryHandle(DOCUMENTS_DIR, { create: true })
}

export async function writeDocumentBytes(
  id: string,
  file: File,
): Promise<void> {
  const dir = await getDocumentsDirectory()
  const handle = await dir.getFileHandle(id, { create: true })
  const writable = await handle.createWritable()
  await writable.write(file)
  await writable.close()
}

export async function readDocumentBytes(id: string): Promise<File> {
  const dir = await getDocumentsDirectory()
  try {
    const handle = await dir.getFileHandle(id)
    return await handle.getFile()
  } catch (error) {
    if (error instanceof DOMException && error.name === 'NotFoundError') {
      throw new DocumentNotFoundError(id)
    }
    throw error
  }
}

export async function deleteDocumentBytes(id: string): Promise<void> {
  const dir = await getDocumentsDirectory()
  try {
    await dir.removeEntry(id)
  } catch (error) {
    if (error instanceof DOMException && error.name === 'NotFoundError') return
    throw error
  }
}
