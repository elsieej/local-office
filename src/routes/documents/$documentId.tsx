import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ArrowLeftIcon, DownloadIcon, Trash2Icon } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '#/components/ui/alert'
import { Button } from '#/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '#/components/ui/card'
import { Skeleton } from '#/components/ui/skeleton'
import DocumentKindIcon from '#/components/document-kind-icon'
import DocumentStateBadge from '#/components/document-state-badge'
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

export const Route = createFileRoute('/documents/$documentId')({
  component: DocumentDetailPage,
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
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const documentQuery = useQuery({
    queryKey: [...DOCUMENTS_QUERY_KEY, documentId],
    queryFn: () => getDocument(documentId),
  })

  const isPdf = documentQuery.data?.kind === 'pdf'
  const fileQuery = useQuery({
    queryKey: [...DOCUMENTS_QUERY_KEY, documentId, 'bytes'],
    queryFn: () => openDocument(documentId),
    enabled: isPdf,
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
      {isPdf && fileQuery.isPending && <Skeleton className="h-96 w-full" />}
      {isPdf && fileQuery.isError && (
        <Alert variant="destructive">
          <AlertTitle>Không đọc được nội dung PDF</AlertTitle>
          <AlertDescription>Thử tải lại trang.</AlertDescription>
        </Alert>
      )}
    </main>
  )
}
