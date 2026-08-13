import { useEffect } from 'react'
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

// Route này tự vẽ thanh trên riêng (không dùng Header của site — xem
// __root.tsx) để chừa gần hết viewport cho nội dung tài liệu, nhất là
// editor ONLYOFFICE (đo chiều cao còn lại bằng JS, xem onlyoffice-editor.tsx).
function TopBar({ children }: { children?: React.ReactNode }) {
  return (
    <header className="bg-background sticky top-0 z-10 flex flex-wrap items-center gap-2 border-b px-4 py-2">
      <Button
        render={<Link to="/" />}
        variant="ghost"
        size="icon"
        aria-label="Quay lại danh sách tài liệu"
      >
        <ArrowLeftIcon />
      </Button>
      {children}
    </header>
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

  // Trang này không dùng <Header/> của site (xem __root.tsx) nên tên file
  // trong tab trình duyệt là nơi duy nhất còn lại để nhận ra tài liệu đang
  // mở — khôi phục lại title mặc định khi rời trang.
  const documentName = documentQuery.data?.name
  useEffect(() => {
    if (!documentName) return
    const previousTitle = document.title
    document.title = documentName
    return () => {
      document.title = previousTitle
    }
  }, [documentName])

  if (documentQuery.isPending) {
    return (
      <div className="flex min-h-svh flex-col">
        <TopBar />
        <main className="flex-1 px-4 py-3">
          <Skeleton className="h-40 w-full" />
        </main>
      </div>
    )
  }

  if (documentQuery.isError || !documentQuery.data) {
    return (
      <div className="flex min-h-svh flex-col">
        <TopBar />
        <main className="flex-1 px-4 py-3">
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
      </div>
    )
  }

  const doc = documentQuery.data

  function handleDelete() {
    if (!window.confirm(`Xoá "${doc.name}"? Không thể hoàn tác.`)) return
    deleteMutation.mutate()
  }

  return (
    <div className="flex min-h-svh flex-col">
      <TopBar>
        <DocumentKindIcon
          kind={doc.kind}
          className="text-muted-foreground size-5 shrink-0"
        />
        <h1 className="truncate text-base font-medium">{doc.name}</h1>
        <DocumentStateBadge state={doc.state} />
        <div className="ml-auto flex flex-wrap gap-2">
          {isWord && mode === 'view' && (
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
              Chuyển sang Sửa
            </Button>
          )}
          {isWord && mode === 'edit' && (
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
              Chuyển sang Xem
            </Button>
          )}
          <Button
            size="sm"
            onClick={() => void downloadDocument(doc.id, doc.name)}
          >
            <DownloadIcon />
            Tải về
          </Button>
          <Button
            size="sm"
            variant="destructive"
            onClick={handleDelete}
            disabled={deleteMutation.isPending}
          >
            <Trash2Icon />
            Xoá
          </Button>
        </div>
      </TopBar>

      <main className="flex min-h-0 flex-1 flex-col">
        {isPdf && fileQuery.data && (
          <div className="px-4 py-3">
            <PdfViewer file={fileQuery.data} />
          </div>
        )}

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
          <div className="px-4 py-3">
            <Skeleton className="h-96 w-full" />
          </div>
        )}
        {(isPdf || isWord) && fileQuery.isError && (
          <div className="px-4 py-3">
            <Alert variant="destructive">
              <AlertTitle>Không đọc được nội dung tài liệu</AlertTitle>
              <AlertDescription>Thử tải lại trang.</AlertDescription>
            </Alert>
          </div>
        )}

        {!isPdf && !isWord && (
          <div className="flex flex-1 items-center justify-center px-4 py-3">
            <Empty>
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <EyeOffIcon />
                </EmptyMedia>
                <EmptyTitle>Chưa hỗ trợ xem định dạng này</EmptyTitle>
                <EmptyDescription>
                  Dùng nút "Tải về" ở trên để mở bằng phần mềm khác trên máy
                  bạn.
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          </div>
        )}
      </main>
    </div>
  )
}
