import { useRef, useState } from 'react'
import type { ChangeEvent, DragEvent } from 'react'
import { FileIcon, UploadIcon } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '#/components/ui/alert'
import { Button } from '#/components/ui/button'
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemMedia,
  ItemTitle,
} from '#/components/ui/item'
import DocumentStateBadge from '#/components/document-state-badge'
import { DOCUMENT_EXTENSION_KIND } from '#/constants/document'
import { saveDocument } from '#/lib/documents/store'
import { cn } from '#/lib/utils'
import type { Document } from '#/lib/documents/types'

const SUPPORTED_EXTENSIONS = Object.keys(DOCUMENT_EXTENSION_KIND)
const ACCEPT = SUPPORTED_EXTENSIONS.join(',')

type SaveError = { fileName: string; message: string }

function getErrorMessage(error: unknown): string {
  return error instanceof Error
    ? error.message
    : 'Không lưu được file, thử lại.'
}

export default function UploadDropzone() {
  const inputRef = useRef<HTMLInputElement>(null)
  const [isDraggingOver, setIsDraggingOver] = useState(false)
  const [savedDocuments, setSavedDocuments] = useState<Array<Document>>([])
  const [errors, setErrors] = useState<Array<SaveError>>([])

  async function saveFiles(files: Iterable<File>) {
    const fileList = Array.from(files)
    const results = await Promise.allSettled(
      fileList.map((file) => saveDocument(file)),
    )

    const newDocuments: Array<Document> = []
    const newErrors: Array<SaveError> = []
    results.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        newDocuments.push(result.value)
      } else {
        newErrors.push({
          fileName: fileList[index].name,
          message: getErrorMessage(result.reason),
        })
      }
    })

    if (newDocuments.length > 0) {
      setSavedDocuments((current) => [...newDocuments, ...current])
    }
    setErrors(newErrors)
  }

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault()
    setIsDraggingOver(false)
    if (event.dataTransfer.files.length > 0)
      void saveFiles(event.dataTransfer.files)
  }

  function handleInputChange(event: ChangeEvent<HTMLInputElement>) {
    if (event.target.files && event.target.files.length > 0) {
      void saveFiles(event.target.files)
    }
    event.target.value = ''
  }

  return (
    <div className="flex flex-col gap-4">
      <div
        onDragOver={(event) => {
          event.preventDefault()
          setIsDraggingOver(true)
        }}
        onDragLeave={() => setIsDraggingOver(false)}
        onDrop={handleDrop}
        className={cn(
          'flex flex-col items-center gap-3 rounded-lg border-2 border-dashed px-6 py-12 text-center transition-colors',
          isDraggingOver ? 'border-primary bg-primary/5' : 'border-border',
        )}
      >
        <UploadIcon className="text-muted-foreground size-8" />
        <div>
          <p className="font-medium">Kéo–thả tài liệu vào đây</p>
          <p className="text-muted-foreground text-sm">
            hoặc chọn file từ máy — {SUPPORTED_EXTENSIONS.join(' ')}
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          onClick={() => inputRef.current?.click()}
        >
          Chọn file
        </Button>
        <input
          ref={inputRef}
          type="file"
          multiple
          accept={ACCEPT}
          onChange={handleInputChange}
          className="sr-only"
          tabIndex={-1}
          aria-hidden="true"
        />
      </div>

      {errors.length > 0 && (
        <Alert variant="destructive">
          <AlertTitle>Không mở được {errors.length} file</AlertTitle>
          <AlertDescription>
            <ul className="list-disc pl-4">
              {errors.map((error) => (
                <li key={error.fileName}>
                  <strong>{error.fileName}</strong>: {error.message}
                </li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {savedDocuments.length > 0 && (
        <ItemGroup>
          {savedDocuments.map((document) => (
            <Item key={document.id} variant="outline">
              <ItemMedia variant="icon">
                <FileIcon />
              </ItemMedia>
              <ItemContent>
                <ItemTitle>{document.name}</ItemTitle>
                <ItemDescription>
                  {(document.size / 1024).toFixed(0)} KB
                </ItemDescription>
              </ItemContent>
              <DocumentStateBadge state={document.state} />
            </Item>
          ))}
        </ItemGroup>
      )}
    </div>
  )
}
