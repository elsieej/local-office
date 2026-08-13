import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import { EyeIcon, FolderOpenIcon, PencilIcon, Trash2Icon } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '#/components/ui/alert'
import { Button } from '#/components/ui/button'
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '#/components/ui/empty'
import {
  Item,
  ItemActions,
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
import {
  DOCUMENTS_QUERY_KEY,
  deleteDocument,
  listDocuments,
} from '#/lib/documents/store'

export default function DocumentList() {
  const queryClient = useQueryClient()

  const {
    data: documents,
    isPending,
    isError,
  } = useQuery({
    queryKey: DOCUMENTS_QUERY_KEY,
    queryFn: listDocuments,
  })

  const deleteMutation = useMutation({
    mutationFn: deleteDocument,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: DOCUMENTS_QUERY_KEY }),
  })

  function handleDelete(id: string, name: string) {
    if (!window.confirm(`Xoá "${name}"? Không thể hoàn tác.`)) return
    deleteMutation.mutate(id)
  }

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
      {documents.map((doc) => {
        const isWord = doc.kind === 'word'

        return (
          <Item key={doc.id} variant="outline">
            <ItemMedia variant="icon">
              <DocumentKindIcon kind={doc.kind} />
            </ItemMedia>
            <ItemContent>
              <ItemTitle>
                {isWord ? (
                  doc.name
                ) : (
                  <Link
                    to="/documents/$documentId"
                    params={{ documentId: doc.id }}
                    search={{ mode: 'view' }}
                    className="hover:underline"
                  >
                    {doc.name}
                  </Link>
                )}
              </ItemTitle>
              <ItemDescription>
                {formatDocumentSize(doc.size)} ·{' '}
                {formatDocumentOpenedAt(doc.openedAt)}
              </ItemDescription>
            </ItemContent>
            <DocumentStateBadge state={doc.state} />
            <ItemActions>
              {isWord && (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    render={
                      <Link
                        to="/documents/$documentId"
                        params={{ documentId: doc.id }}
                        search={{ mode: 'view' }}
                      />
                    }
                  >
                    <EyeIcon />
                    Xem
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    render={
                      <Link
                        to="/documents/$documentId"
                        params={{ documentId: doc.id }}
                        search={{ mode: 'edit' }}
                      />
                    }
                  >
                    <PencilIcon />
                    Sửa
                  </Button>
                </>
              )}
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label={`Xoá ${doc.name}`}
                disabled={deleteMutation.isPending}
                onClick={() => handleDelete(doc.id, doc.name)}
              >
                <Trash2Icon />
              </Button>
            </ItemActions>
          </Item>
        )
      })}
    </ItemGroup>
  )
}
