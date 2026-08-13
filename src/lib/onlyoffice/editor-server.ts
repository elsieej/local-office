// Chuyển thể (rút gọn) từ baotlake/office-website (utils/editor/server.ts),
// AGPL-3.0. Nguồn: https://github.com/baotlake/office-website
//
// "Bộ não" giả lập Document Server: trả lời đúng giao thức HTTP +
// WebSocket (coauthoring) mà DocEditor mong đợi, dùng x2t.wasm để chuyển
// đổi định dạng thật. Toàn bộ trạng thái nằm trong bộ nhớ trình duyệt —
// không có request nào rời máy.
//
// Khác bản gốc: bỏ `openNew`/`openUrl` (LocalOffice không có tính năng
// "tạo tài liệu mới" hay "mở từ URL" ở luồng này — luôn mở file đã có
// trong OPFS) và bỏ plugin thật (`sdkjs-plugins` không được vendor ở
// TASK-19, `/plugins.json` luôn trả rỗng).

import { X2tConverter } from '#/lib/onlyoffice/x2t-client'
import type { MockSocket } from '#/lib/onlyoffice/mock-socket'
import type { Participant, User } from '#/lib/onlyoffice/types'
import { AscSaveTypes } from '#/lib/onlyoffice/types'
import { getDocumentType } from '#/lib/onlyoffice/utils'

function mergeBuffers(buffers: Array<Uint8Array>) {
  const totalLength = buffers.reduce((acc, buffer) => acc + buffer.length, 0)
  const merged = new Uint8Array(totalLength)
  let offset = 0
  for (const buffer of buffers) {
    merged.set(buffer, offset)
    offset += buffer.length
  }
  return merged
}

function randomId() {
  return Math.random().toString(36).substring(2, 9)
}

function getUrl(data: Uint8Array, type?: string) {
  const blob = new Blob([data as Uint8Array<ArrayBuffer>], {
    type: type || 'application/octet-stream',
  })
  return URL.createObjectURL(blob)
}

// x2t.wasm không báo lỗi cho input hỏng — bytes rác vẫn "chuyển đổi thành
// công" thành một Editor.bin rỗng thay vì throw/trả null (xác nhận qua
// kiểm thử tay: xem docs/tasks/21_mo_docx_mode_xem_task.md). Kiểm magic
// bytes của container trước khi đưa vào x2t để bắt được đúng trường hợp
// này — .docx/.xlsx/.pptx là ZIP (OOXML), .doc/.xls/.ppt cũ là OLE2.
const ZIP_MAGIC = [0x50, 0x4b, 0x03, 0x04]
const OLE2_MAGIC = [0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1]
const LEGACY_EXTENSIONS = new Set(['doc', 'xls', 'ppt'])

function hasMagicBytes(buffer: ArrayBuffer, magic: Array<number>): boolean {
  if (buffer.byteLength < magic.length) return false
  const view = new Uint8Array(buffer, 0, magic.length)
  return magic.every((byte, i) => view[i] === byte)
}

function isValidContainer(buffer: ArrayBuffer, fileType: string): boolean {
  const magic = LEGACY_EXTENSIONS.has(fileType.toLowerCase())
    ? OLE2_MAGIC
    : ZIP_MAGIC
  return hasMagicBytes(buffer, magic)
}

interface DownloadCmd {
  title: string
  outputformat?: number
  format?: string
  savetype: (typeof AscSaveTypes)[keyof typeof AscSaveTypes]
}

export class EditorServer {
  private id = ''
  private socket: MockSocket | null = null
  private sessionId = 'session-id'
  private user: User = { id: 'uid', name: 'Tôi' }
  private client = { buildVersion: '9.3.0', buildNumber: 8 }
  private participants: Array<Participant> = []
  private syncChangesIndex = 0
  private loadPromise: Promise<void> | null = null

  private fileType = 'docx'
  private title = ''
  private urlsMap = new Map<string, string>()

  private downloadParts: Array<Uint8Array> = []

  private converter = new X2tConverter()

  constructor() {
    this.send = this.send.bind(this)
    this.handleConnect = this.handleConnect.bind(this)
    this.handleDisconnect = this.handleDisconnect.bind(this)
    this.handleMessage = this.handleMessage.bind(this)
  }

  async open(file: File, fileType: string, fileName?: string) {
    const title = fileName || file.name
    this.fileType = fileType
    const documentType = getDocumentType(fileType)
    this.id = randomId()
    this.title = title
    const buffer = await file.arrayBuffer()
    this.loadPromise = this.loadDocument(buffer, fileType)

    // `loadPromise` không được await ở đây có chủ đích — để component gọi
    // song song với việc nạp api.js/DocEditor (script + convert cùng lúc,
    // không nối tiếp). handleMessage() bên dưới cũng await promise này
    // (để trả lời đúng giao thức socket "documentOpen" cho DocEditor), có
    // try/catch riêng — nhưng đó KHÔNG đủ để component biết convert lỗi
    // (chỉ âm thầm mở tài liệu rỗng). Trả promise ra đây để component tự
    // theo dõi và hiện lỗi thật khi convert thất bại.
    return { id: this.id, documentType, loadPromise: this.loadPromise }
  }

  getDocument() {
    if (!this.id) {
      throw new Error('EditorServer chưa mở tài liệu nào (gọi open() trước)')
    }
    return {
      fileType: this.fileType,
      key: this.id,
      title: this.title,
      url: '/' + this.id,
    }
  }

  getUser() {
    return this.user
  }

  private async loadDocument(buffer: ArrayBuffer, fileType: string) {
    if (!isValidContainer(buffer, fileType)) {
      throw new Error(
        `File không đúng cấu trúc ${fileType.toUpperCase()} — có thể đã hỏng`,
      )
    }

    const result = await this.converter.convert({
      data: buffer,
      fileFrom: 'doc.' + fileType,
      fileTo: 'Editor.bin',
    })

    if (!result.output) {
      throw new Error(
        'Không chuyển đổi được tài liệu (x2t không trả về dữ liệu)',
      )
    }

    if (this.urlsMap.size > 0) {
      this.urlsMap.forEach((url) => URL.revokeObjectURL(url))
      this.urlsMap.clear()
    }
    this.urlsMap.set('Editor.bin', getUrl(result.output))
    for (const name in result.media) {
      this.addMedia(name, result.media[name])
    }
  }

  private addMedia(name: string, data: Uint8Array) {
    const pathname = 'media/' + name
    const url = getUrl(data)
    this.urlsMap.set(pathname, url)
    return url
  }

  setClient(info: Partial<typeof this.client>) {
    this.client = { ...this.client, ...info }
  }

  handleConnect({ socket }: { socket: MockSocket }) {
    this.socket = socket
    const { send, sessionId, client } = this

    this.participants = [
      {
        connectionId: this.sessionId,
        encrypted: false,
        id: this.user.id,
        idOriginal: this.user.id,
        indexUser: 1,
        isCloseCoAuthoring: false,
        isLiveViewer: false,
        username: this.user.name,
        view: false,
      },
    ]

    socket.server.on('message', this.handleMessage)

    send({
      maxPayload: 100000000,
      pingInterval: 25000,
      pingTimeout: 20000,
      sid: sessionId,
      upgrades: [],
    })

    send({
      type: 'license',
      license: {
        type: 3,
        buildNumber: client.buildNumber,
        buildVersion: client.buildVersion,
        light: false,
        mode: 0,
        rights: 1,
        protectionSupport: true,
        isAnonymousSupport: true,
        liveViewerSupport: true,
        branding: false,
        customization: true,
        advancedApi: false,
      },
    })
  }

  handleDisconnect() {
    this.socket = null
  }

  send(...msg: Array<unknown>) {
    if (!this.socket) {
      console.error('[EditorServer] socket chưa kết nối')
      return
    }
    this.socket.server.emit('message', ...msg)
  }

  async handleMessage(msg: Record<string, string>) {
    const { send, sessionId, participants, user, client } = this
    const type = 'type' in msg ? msg.type : null

    switch (type) {
      case 'auth': {
        send({ type: 'authChanges', changes: [] })
        send({
          type: 'auth',
          result: 1,
          sessionId: sessionId,
          participants: participants,
          locks: [],
          indexUser: 1,
          buildVersion: client.buildVersion || '9.3.0',
          buildNumber: client.buildNumber || 9,
          licenseType: 3,
          editorType: 2,
          mode: 'edit',
          permissions: {
            comment: true,
            chat: true,
            download: true,
            edit: true,
            fillForms: false,
            modifyFilter: true,
            protect: true,
            print: true,
            review: false,
            copy: true,
          },
        })

        try {
          if (this.loadPromise) await this.loadPromise
          send({
            type: 'documentOpen',
            data: {
              type: 'open',
              status: 'ok',
              data: { ...Object.fromEntries(this.urlsMap) },
            },
          })
        } catch (err) {
          console.error(err)
          send({
            type: 'documentOpen',
            data: { type: 'open', status: 'ok', data: { 'Editor.bin': '' } },
          })
        }
        break
      }
      case 'isSaveLock':
        send({ type: 'saveLock', saveLock: false })
        break
      case 'saveChanges':
        send({
          type: 'unSaveLock',
          index: -1,
          syncChangesIndex: ++this.syncChangesIndex,
          time: +new Date(),
        })
        break
      case 'getLock':
        send({
          type: 'getLock',
          locks: {
            [msg.block]: { time: +new Date(), user: user.id, block: msg.block },
          },
        })
        send({
          type: 'releaseLock',
          locks: {
            [msg.block]: { time: +new Date(), user: user.id, block: msg.block },
          },
        })
        break
    }
  }

  async handleRequest(req: Request): Promise<Response | null> {
    const u = new URL(req.url)
    const { id: key, send } = this

    if (u.pathname.endsWith('/downloadas/' + key)) {
      const cmd = JSON.parse(u.searchParams.get('cmd') || '{}') as DownloadCmd
      const buffer = await req.arrayBuffer()

      const fileTo = 'doc.' + cmd.title.split('.').pop()
      let formatTo = cmd.outputformat
      if (!formatTo && fileTo.endsWith('.pdf')) formatTo = 513

      const download = async () => {
        const input = mergeBuffers(this.downloadParts)
        const fileFrom = cmd.format === 'pdf' ? 'from.pdf' : 'from.bin'

        let { output } = await this.converter.convert({
          data: input.buffer,
          fileFrom,
          fileTo,
          formatTo,
        })
        if (!output && cmd.format === 'pdf') output = input
        if (!output) {
          console.error('[EditorServer] Conversion failed')
          return { status: 'error' }
        }

        const blob = new Blob([new Uint8Array(output)])
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = cmd.title || 'document'
        a.click()
        URL.revokeObjectURL(url)

        return { status: 'ok' }
      }

      let result = { status: 'ok' }

      switch (cmd.savetype) {
        case AscSaveTypes.PartStart:
          this.downloadParts = [new Uint8Array(buffer)]
          break
        case AscSaveTypes.Part:
          this.downloadParts.push(new Uint8Array(buffer))
          break
        case AscSaveTypes.Complete:
          this.downloadParts.push(new Uint8Array(buffer))
          result = await download()
          this.downloadParts = []
          break
        case AscSaveTypes.CompleteAll:
          this.downloadParts = [new Uint8Array(buffer)]
          result = await download()
          this.downloadParts = []
          break
      }

      setTimeout(() => {
        send({
          type: 'documentOpen',
          data: {
            type: 'save',
            status: result.status,
            data: 'data:,',
            filetype: 'docx',
          },
        })
      }, 100)

      return Response.json({ status: result.status, type: 'save', data: '' })
    }

    if (u.pathname.endsWith('/upload/' + key)) {
      const buffer = await req.arrayBuffer()
      const data = new Uint8Array(buffer)
      const filename = Date.now() + '.png'
      const pathname = 'media/' + filename
      const url = this.addMedia(filename, data)
      return Response.json({ [pathname]: url })
    }

    if (u.pathname === '/plugins.json') {
      return Response.json({ url: '', pluginsData: [], autostart: [] })
    }

    return null
  }

  destroy() {
    this.converter.terminate()
    this.urlsMap.forEach((url) => URL.revokeObjectURL(url))
    this.urlsMap.clear()
  }
}
