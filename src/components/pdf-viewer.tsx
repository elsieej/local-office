import { useEffect, useRef, useState } from 'react'
import type { FormEvent } from 'react'
import type * as PdfjsLib from 'pdfjs-dist'
import type { PDFDocumentProxy, PDFWorker } from 'pdfjs-dist'
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  SearchIcon,
  ZoomInIcon,
  ZoomOutIcon,
} from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '#/components/ui/alert'
import { Button } from '#/components/ui/button'
import { Input } from '#/components/ui/input'
import { Skeleton } from '#/components/ui/skeleton'

const MIN_SCALE = 0.5
const MAX_SCALE = 3
const SCALE_STEP = 0.25

// pdf.js (qua canvas.js) dùng `DOMMatrix` ở top-level module — chỉ tồn tại
// trong trình duyệt. Import tĩnh sẽ kéo theo lỗi khi route này render phía
// server (SSR). Import động, chỉ chạy trong effect (client-only), giữ
// nguyên một worker dùng chung cho cả phiên — không destroy theo từng lần
// mở/đóng tài liệu vì pdf.js fetch lại script worker mỗi khi tạo worker
// mới, nên tạo mới cho từng PDF sẽ đòi mạng lại lúc mất mạng dù trước đó đã
// xem được. Xem TASK-17.
let pdfjsLibPromise: Promise<typeof PdfjsLib> | undefined
let sharedWorker: PDFWorker | undefined

async function getPdfjsLib(): Promise<typeof PdfjsLib> {
  pdfjsLibPromise ??= import('pdfjs-dist').then((lib) => {
    lib.GlobalWorkerOptions.workerSrc = new URL(
      'pdfjs-dist/build/pdf.worker.min.mjs',
      import.meta.url,
    ).href
    return lib
  })
  return pdfjsLibPromise
}

function getSharedWorker(pdfjsLib: typeof PdfjsLib): PDFWorker {
  sharedWorker ??= new pdfjsLib.PDFWorker()
  return sharedWorker
}

type PdfViewerProps = {
  file: File
}

export default function PdfViewer({ file }: PdfViewerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const pdfRef = useRef<PDFDocumentProxy | null>(null)

  const [pageCount, setPageCount] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [scale, setScale] = useState(1)
  const [loadError, setLoadError] = useState<string | null>(null)

  const [searchQuery, setSearchQuery] = useState('')
  const [matchingPages, setMatchingPages] = useState<Array<number> | null>(null)
  const [matchIndex, setMatchIndex] = useState(0)

  useEffect(() => {
    let cancelled = false
    setLoadError(null)
    setMatchingPages(null)

    async function load() {
      try {
        const [bytes, pdfjsLib] = await Promise.all([
          file.arrayBuffer(),
          getPdfjsLib(),
        ])
        const pdf = await pdfjsLib.getDocument({
          data: bytes,
          worker: getSharedWorker(pdfjsLib),
        }).promise
        if (cancelled) return
        pdfRef.current = pdf
        setPageCount(pdf.numPages)
        setCurrentPage(1)
      } catch {
        if (!cancelled)
          setLoadError('Không đọc được nội dung PDF — file có thể bị hỏng.')
      }
    }

    void load()
    return () => {
      cancelled = true
      pdfRef.current = null
    }
  }, [file])

  useEffect(() => {
    const pdf = pdfRef.current
    const canvas = canvasRef.current
    if (!pdf || !canvas || pageCount === 0) return

    let cancelled = false

    async function render(
      pdfDocument: PDFDocumentProxy,
      canvasElement: HTMLCanvasElement,
    ) {
      const page = await pdfDocument.getPage(currentPage)
      if (cancelled) return
      const viewport = page.getViewport({ scale })
      canvasElement.height = viewport.height
      canvasElement.width = viewport.width
      await page.render({ canvas: canvasElement, viewport }).promise
    }

    void render(pdf, canvas).catch(() => {
      if (!cancelled) setLoadError('Không hiện được trang PDF này.')
    })

    return () => {
      cancelled = true
    }
  }, [currentPage, scale, pageCount])

  async function handleSearch(event: FormEvent) {
    event.preventDefault()
    const pdf = pdfRef.current
    if (!pdf || !searchQuery.trim()) {
      setMatchingPages(null)
      return
    }

    const query = searchQuery.trim().toLowerCase()
    const pages: Array<number> = []
    for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber++) {
      const page = await pdf.getPage(pageNumber)
      const content = await page.getTextContent()
      const text = content.items
        .map((item) => ('str' in item ? item.str : ''))
        .join(' ')
        .toLowerCase()
      if (text.includes(query)) pages.push(pageNumber)
    }

    setMatchingPages(pages)
    setMatchIndex(0)
    if (pages.length > 0) setCurrentPage(pages[0])
  }

  function jumpToMatch(direction: 1 | -1) {
    if (!matchingPages || matchingPages.length === 0) return
    const nextIndex =
      (matchIndex + direction + matchingPages.length) % matchingPages.length
    setMatchIndex(nextIndex)
    setCurrentPage(matchingPages[nextIndex])
  }

  if (loadError) {
    return (
      <Alert variant="destructive">
        <AlertTitle>Không xem được PDF</AlertTitle>
        <AlertDescription>{loadError}</AlertDescription>
      </Alert>
    )
  }

  if (pageCount === 0) {
    return <Skeleton className="h-96 w-full" />
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <Button
          variant="outline"
          size="icon-sm"
          aria-label="Trang trước"
          disabled={currentPage <= 1}
          onClick={() => setCurrentPage((page) => page - 1)}
        >
          <ChevronLeftIcon />
        </Button>
        <span className="text-sm">
          Trang {currentPage} / {pageCount}
        </span>
        <Button
          variant="outline"
          size="icon-sm"
          aria-label="Trang sau"
          disabled={currentPage >= pageCount}
          onClick={() => setCurrentPage((page) => page + 1)}
        >
          <ChevronRightIcon />
        </Button>

        <Button
          variant="outline"
          size="icon-sm"
          aria-label="Thu nhỏ"
          disabled={scale <= MIN_SCALE}
          onClick={() => setScale((s) => Math.max(MIN_SCALE, s - SCALE_STEP))}
        >
          <ZoomOutIcon />
        </Button>
        <span className="text-sm">{Math.round(scale * 100)}%</span>
        <Button
          variant="outline"
          size="icon-sm"
          aria-label="Phóng to"
          disabled={scale >= MAX_SCALE}
          onClick={() => setScale((s) => Math.min(MAX_SCALE, s + SCALE_STEP))}
        >
          <ZoomInIcon />
        </Button>

        <form
          onSubmit={(event) => void handleSearch(event)}
          className="ml-auto flex items-center gap-2"
        >
          <Input
            type="search"
            placeholder="Tìm trong tài liệu"
            aria-label="Tìm trong tài liệu"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            className="h-8 w-40"
          />
          <Button
            type="submit"
            variant="outline"
            size="icon-sm"
            aria-label="Tìm"
          >
            <SearchIcon />
          </Button>
        </form>
      </div>

      {matchingPages && (
        <p className="text-muted-foreground text-sm" role="status">
          {matchingPages.length === 0 ? (
            'Không tìm thấy kết quả.'
          ) : (
            <>
              {matchIndex + 1}/{matchingPages.length} kết quả — trang{' '}
              {matchingPages[matchIndex]}{' '}
              <Button variant="link" size="sm" onClick={() => jumpToMatch(-1)}>
                Trước
              </Button>
              <Button variant="link" size="sm" onClick={() => jumpToMatch(1)}>
                Tiếp
              </Button>
            </>
          )}
        </p>
      )}

      <div className="overflow-auto rounded-lg border">
        <canvas ref={canvasRef} className="mx-auto block" />
      </div>
    </div>
  )
}
