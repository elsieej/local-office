export class OpfsUnsupportedError extends Error {
  constructor() {
    super(
      'OPFS (Origin Private File System) không được trình duyệt này hỗ trợ.',
    )
    this.name = 'OpfsUnsupportedError'
  }
}

export class DocumentNotFoundError extends Error {
  constructor(id: string) {
    super(`Không tìm thấy tài liệu với id "${id}".`)
    this.name = 'DocumentNotFoundError'
  }
}

export class UnsupportedDocumentTypeError extends Error {
  constructor(fileName: string) {
    super(`Định dạng file "${fileName}" không được hỗ trợ.`)
    this.name = 'UnsupportedDocumentTypeError'
  }
}

export class DocumentTooLargeError extends Error {
  constructor(fileName: string, maxBytes: number) {
    super(`File "${fileName}" vượt quá dung lượng tối đa ${maxBytes} byte.`)
    this.name = 'DocumentTooLargeError'
  }
}
