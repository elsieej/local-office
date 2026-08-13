import { Badge } from '#/components/ui/badge'
import type { DocumentState } from '#/lib/documents/types'

const DOCUMENT_STATE_LABEL: Record<DocumentState, string> = {
  local: '🔒 Cục bộ',
}

type DocumentStateBadgeProps = {
  state: DocumentState
}

export default function DocumentStateBadge({ state }: DocumentStateBadgeProps) {
  return <Badge variant="outline">{DOCUMENT_STATE_LABEL[state]}</Badge>
}
