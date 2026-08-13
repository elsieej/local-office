import type { DocumentExtension, DocumentKind } from '#/constants/document'

export type DocumentState = 'local'

export type Document = {
  id: string
  name: string
  extension: DocumentExtension
  kind: DocumentKind
  size: number
  openedAt: number
  state: DocumentState
}
