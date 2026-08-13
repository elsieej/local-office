import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  ArrowLeftIcon,
  DownloadIcon,
  EyeIcon,
  EyeOffIcon,
  PencilIcon,
  Trash2Icon,
} from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '#/components/ui/alert'
import { Button } from '#/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '#/components/ui/card'
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '#/components/ui/empty'
import { Skeleton } from '#/components/ui/skeleton'
import DocumentKindIcon from '#/components/document-kind-icon'
import DocumentStateBadge from '#/components/document-state-badge'
import OnlyofficeEditor from '#/components/onlyoffice-editor'
import PdfViewer from '#/components/pdf-viewer'
import {
  formatDocumentOpenedAt,
  formatDocumentSize,
} from '#/lib/documents/format'
import {
  DOCUMENTS_QUERY_KEY,
  deleteDocument,
  getDocument,
  openDocument,
} from '#/lib/documents/store'

type DocumentDetailSearch = {
  mode: 'view' | 'edit'
}

export const Route = createFileRoute('/documents/$documentId')({
  component: DocumentDetailPage,
  validateSearch: (search: Record<string, unknown>): DocumentDetailSearch => ({
    mode: search.mode === 'edit' ? 'edit' : 'view',
  }),
})

async function downloadDocument(id: string, name: string) {
  const file = await openDocument(id)
  const url = URL.createObjectURL(file)
  const link = document.createElement('a')
  link.href = url
  link.download = name
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}

function BackButton() {
  return (
    <Button render={<Link to="/" />} variant="ghost" className="w-fit">
      <ArrowLeftIcon />
      Quay lại
    </Button>
  )
}

function DocumentDetailPage() {
  const { documentId } = Route.useParams()
  const { mode } = Route.useSearch()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const documentQuery = useQuery({
    queryKey: [...DOCUMENTS_QUERY_KEY, documentId],
    queryFn: () => getDocument(documentId),
  })

  const isPdf = documentQuery.data?.kind === 'pdf'
  const isWord = documentQuery.data?.kind === 'word'
  const fileQuery = useQuery({
    queryKey: [...DOCUMENTS_QUERY_KEY, documentId, 'bytes'],
    queryFn: () => openDocument(documentId),
    enabled: isPdf || isWord,
  })

  const deleteMutation = useMutation({
    mutationFn: () => deleteDocument(documentId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: DOCUMENTS_QUERY_KEY })
      void navigate({ to: '/' })
    },
  })

  if (documentQuery.isPending) {
    return (
      <main className="mx-auto flex w-full max-w-2xl flex-col gap-4 px-4 pt-14 pb-8">
        <BackButton />
        <Skeleton className="h-40 w-full" />
      </main>
    )
  }

  if (documentQuery.isError || !documentQuery.data) {
    return (
      <main className="mx-auto flex w-full max-w-2xl flex-col gap-4 px-4 pt-14 pb-8">
        <BackButton />
        <Alert variant="destructive">
          <AlertTitle>
            {documentQuery.isError
              ? 'Không đọc được tài liệu'
              : 'Không tìm thấy tài liệu'}
          </AlertTitle>
          <AlertDescription>
            {documentQuery.isError
              ? 'Thử tải lại trang.'
              : 'Tài liệu này có thể đã bị xoá hoặc chưa từng tồn tại trên thiết bị này.'}
          </AlertDescription>
        </Alert>
      </main>
    )
  }

  const doc = documentQuery.data

  function handleDelete() {
    if (!window.confirm(`Xoá "${doc.name}"? Không thể hoàn tác.`)) return
    deleteMutation.mutate()
  }

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-4 px-4 pt-14 pb-8">
      <BackButton />
      <Card>
        <CardHeader>
          <DocumentKindIcon
            kind={doc.kind}
            className="text-muted-foreground size-6"
          />
          <CardTitle className="text-xl">{doc.name}</CardTitle>
          <CardDescription>
            {formatDocumentSize(doc.size)} ·{' '}
            {formatDocumentOpenedAt(doc.openedAt)}
          </CardDescription>
          <DocumentStateBadge state={doc.state} />
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          {isWord && mode === 'view' && (
            <Button
              variant="outline"
              render={
                <Link
                  to="/documents/$documentId"
                  params={{ documentId: doc.id }}
                  search={{ mode: 'edit' }}
                />
              }
            >
              <PencilIcon />
              Chuyển sang Sửa
            </Button>
          )}
          {isWord && mode === 'edit' && (
            <Button
              variant="outline"
              render={
                <Link
                  to="/documents/$documentId"
                  params={{ documentId: doc.id }}
                  search={{ mode: 'view' }}
                />
              }
            >
              <EyeIcon />
              Chuyển sang Xem
            </Button>
          )}
          <Button onClick={() => void downloadDocument(doc.id, doc.name)}>
            <DownloadIcon />
            Tải về
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={deleteMutation.isPending}
          >
            <Trash2Icon />
            Xoá
          </Button>
        </CardContent>
      </Card>

      {isPdf && fileQuery.data && <PdfViewer file={fileQuery.data} />}

      {isWord && fileQuery.data && (
        // key={mode}: DocEditor tự chèn/thao tác DOM bên trong container
        // (iframe "frameEditor") ngoài tầm kiểm soát của React — để React
        // "reconcile" lại đúng subtree đó khi đổi mode (thay vì unmount
        // hẳn) gây lỗi "insertBefore... not a child of this node" vì
        // React và DocEditor cùng tranh thay đổi DOM. `key` ép React
        // unmount/mount lại toàn bộ, luôn có DOM sạch cho DocEditor mới.
        <OnlyofficeEditor
          key={mode}
          file={fileQuery.data}
          fileType={doc.extension.slice(1)}
          title={doc.name}
          mode={mode}
        />
      )}

      {(isPdf || isWord) && fileQuery.isPending && (
        <Skeleton className="h-96 w-full" />
      )}
      {(isPdf || isWord) && fileQuery.isError && (
        <Alert variant="destructive">
          <AlertTitle>Không đọc được nội dung tài liệu</AlertTitle>
          <AlertDescription>Thử tải lại trang.</AlertDescription>
        </Alert>
      )}

      {!isPdf && !isWord && (
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <EyeOffIcon />
            </EmptyMedia>
            <EmptyTitle>Chưa hỗ trợ xem định dạng này</EmptyTitle>
            <EmptyDescription>
              Dùng nút "Tải về" ở trên để mở bằng phần mềm khác trên máy bạn.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      )}
    </main>
  )
}
