import {
  FileCodeIcon,
  FileIcon,
  FileSpreadsheetIcon,
  FileTextIcon,
  PresentationIcon,
} from 'lucide-react'
import type { DocumentKind } from '#/constants/document'

const DOCUMENT_KIND_ICON: Record<DocumentKind, typeof FileIcon> = {
  word: FileTextIcon,
  excel: FileSpreadsheetIcon,
  powerpoint: PresentationIcon,
  pdf: FileIcon,
  text: FileTextIcon,
  markdown: FileCodeIcon,
}

type DocumentKindIconProps = {
  kind: DocumentKind
  className?: string
}

export default function DocumentKindIcon({
  kind,
  className,
}: DocumentKindIconProps) {
  const Icon = DOCUMENT_KIND_ICON[kind]
  return <Icon className={className} />
}
