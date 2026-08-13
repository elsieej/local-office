import { useQuery } from '@tanstack/react-query'
import { FolderOpenIcon } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '#/components/ui/alert'
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '#/components/ui/empty'
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemMedia,
  ItemTitle,
} from '#/components/ui/item'
import { Skeleton } from '#/components/ui/skeleton'
import DocumentKindIcon from '#/components/document-kind-icon'
import DocumentStateBadge from '#/components/document-state-badge'
import {
  formatDocumentOpenedAt,
  formatDocumentSize,
} from '#/lib/documents/format'
import { DOCUMENTS_QUERY_KEY, listDocuments } from '#/lib/documents/store'

export default function DocumentList() {
  const {
    data: documents,
    isPending,
    isError,
  } = useQuery({
    queryKey: DOCUMENTS_QUERY_KEY,
    queryFn: listDocuments,
  })

  if (isPending) {
    return (
      <div
        className="flex flex-col gap-2"
        aria-busy="true"
        aria-label="Đang tải danh sách tài liệu"
      >
        <Skeleton className="h-14 w-full" />
        <Skeleton className="h-14 w-full" />
      </div>
    )
  }

  if (isError) {
    return (
      <Alert variant="destructive">
        <AlertTitle>Không đọc được danh sách tài liệu</AlertTitle>
        <AlertDescription>Thử tải lại trang.</AlertDescription>
      </Alert>
    )
  }

  if (documents.length === 0) {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <FolderOpenIcon />
          </EmptyMedia>
          <EmptyTitle>Chưa có tài liệu nào</EmptyTitle>
          <EmptyDescription>
            Kéo–thả hoặc chọn file ở trên để bắt đầu.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    )
  }

  return (
    <ItemGroup>
      {documents.map((document) => (
        <Item key={document.id} variant="outline">
          <ItemMedia variant="icon">
            <DocumentKindIcon kind={document.kind} />
          </ItemMedia>
          <ItemContent>
            <ItemTitle>{document.name}</ItemTitle>
            <ItemDescription>
              {formatDocumentSize(document.size)} ·{' '}
              {formatDocumentOpenedAt(document.openedAt)}
            </ItemDescription>
          </ItemContent>
          <DocumentStateBadge state={document.state} />
        </Item>
      ))}
    </ItemGroup>
  )
}
