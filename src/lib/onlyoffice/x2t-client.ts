// Chuyển thể từ baotlake/office-website (utils/editor/x2t.ts), AGPL-3.0.
// Nguồn: https://github.com/baotlake/office-website
//
// Proxy luồng chính nói chuyện với x2t-worker.ts qua postMessage, để
// conversion (CPU nặng) không chặn UI thread.

import type { X2tConvertParams, X2tConvertResult } from '#/lib/onlyoffice/types'

interface PendingMessage {
  resolve: (value: X2tConvertResult) => void
  reject: (error: Error) => void
}

interface WorkerResponse {
  id: number
  type: string
  payload?: X2tConvertResult
  error?: string
}

export class X2tConverter {
  private worker: Worker | null = null
  private initPromise: Promise<void> | null = null
  private messageId = 0
  private pendingMessages = new Map<number, PendingMessage>()

  private getNextId(): number {
    return ++this.messageId
  }

  private sendMessage(
    type: string,
    payload?: X2tConvertParams,
  ): Promise<X2tConvertResult> {
    return new Promise((resolve, reject) => {
      if (!this.worker) {
        reject(new Error('Worker not initialized'))
        return
      }

      const id = this.getNextId()
      this.pendingMessages.set(id, { resolve, reject })

      if (type === 'convert' && payload?.data instanceof ArrayBuffer) {
        this.worker.postMessage({ id, type, payload }, [payload.data])
      } else {
        this.worker.postMessage({ id, type, payload })
      }
    })
  }

  private handleWorkerMessage = (event: MessageEvent<WorkerResponse>) => {
    const { id, type, payload, error } = event.data
    if (type === 'ready') return

    const pending = this.pendingMessages.get(id)
    if (!pending) return
    this.pendingMessages.delete(id)

    if (type === 'error') {
      pending.reject(new Error(error || 'Unknown worker error'))
    } else if (payload) {
      pending.resolve(payload)
    }
  }

  private handleWorkerError = (error: ErrorEvent) => {
    console.error('[X2tConverter] Worker error:', error)
    for (const [id, pending] of this.pendingMessages) {
      pending.reject(new Error(`Worker error: ${error.message}`))
      this.pendingMessages.delete(id)
    }
  }

  init(): Promise<void> {
    if (this.initPromise) return this.initPromise

    this.initPromise = new Promise<void>((resolve, reject) => {
      try {
        // `type: 'module'` bắt buộc — Vite dev server luôn phục vụ file
        // worker dạng ESM (native module) bất kể có set hay không, worker
        // cổ điển sẽ lỗi "Cannot use import statement outside a module"
        // ngay khi Vite tiêm client HMR vào. x2t-worker.ts nạp glue script
        // Emscripten (không phải ESM) bằng fetch + eval thay vì
        // `importScripts()` (API chỉ có ở worker cổ điển) — xem ghi chú ở
        // đó.
        this.worker = new Worker(new URL('./x2t-worker.ts', import.meta.url), {
          type: 'module',
        })
        this.worker.onmessage = this.handleWorkerMessage
        this.worker.onerror = this.handleWorkerError
        resolve()
      } catch (err) {
        this.initPromise = null
        reject(err)
      }
    })

    return this.initPromise
  }

  async convert({
    data,
    fileFrom,
    fileTo,
    media,
  }: X2tConvertParams): Promise<X2tConvertResult> {
    await this.init()

    const cloneMap = (map?: { [key: string]: Uint8Array }) => {
      if (!map) return undefined
      return Object.fromEntries(
        Object.entries(map).map(([key, value]) => [key, value.slice(0)]),
      )
    }

    const dataClone = data ? data.slice(0) : null

    return this.sendMessage('convert', {
      data: dataClone,
      fileFrom,
      fileTo,
      media: cloneMap(media),
    })
  }

  terminate(): void {
    if (!this.worker) return
    for (const [id, pending] of this.pendingMessages) {
      pending.reject(new Error('Worker terminated'))
      this.pendingMessages.delete(id)
    }
    this.worker.terminate()
    this.worker = null
    this.initPromise = null
  }
}
