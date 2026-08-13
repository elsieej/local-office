import { createFileRoute } from '@tanstack/react-router'
import { Card, CardContent, CardHeader, CardTitle } from '#/components/ui/card'
import DocumentList from '#/components/document-list'
import UploadDropzone from '#/components/upload-dropzone'

export const Route = createFileRoute('/')({ component: App })

function App() {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 pt-14 pb-8">
      <Card>
        <CardHeader>
          <CardTitle className="font-display text-3xl">
            Mở tài liệu của bạn
          </CardTitle>
        </CardHeader>
        <CardContent>
          <UploadDropzone />
        </CardContent>
      </Card>

      <DocumentList />
    </main>
  )
}
