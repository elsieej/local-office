// Chuyển thể từ baotlake/office-website (utils/editor/socket.ts), AGPL-3.0.
// Nguồn: https://github.com/baotlake/office-website
//
// DocEditor mở một kết nối socket.io tới Document Server để đồng bộ
// (coauthoring). Không có server đó — `MockSocket` giả lập đúng bề mặt API
// của socket.io-client, phát/nhận sự kiện hoàn toàn trong bộ nhớ trình
// duyệt. `io()` (factory) được gắn thay cho `window.io` toàn cục trong
// iframe editor (xem onlyoffice-editor.tsx).
//
// Khác bản gốc: dùng emitter tự viết (dưới đây) thay vì phụ thuộc
// `eventemitter3` — repo chưa có gói này, và bề mặt API cần chỉ có
// on/off/once/emit/removeAllListeners.

// `any[]` (không phải `unknown[]`) có chủ đích — bề mặt callback kiểu
// socket.io-client/eventemitter3. Listener thật (vd
// EditorServer.handleMessage) nhận tham số cụ thể hơn; `unknown[]` sẽ vướng
// kiểm tra contravariant của tham số hàm khi gán listener đó vào đây.
type Listener = (...args: any[]) => void

class Emitter {
  private listeners = new Map<string, Set<Listener>>()

  on(event: string, listener: Listener) {
    let set = this.listeners.get(event)
    if (!set) {
      set = new Set()
      this.listeners.set(event, set)
    }
    set.add(listener)
  }

  off(event: string, listener?: Listener) {
    if (!listener) {
      this.listeners.delete(event)
      return
    }
    this.listeners.get(event)?.delete(listener)
  }

  once(event: string, listener: Listener) {
    const wrapped: Listener = (...args) => {
      this.off(event, wrapped)
      listener(...args)
    }
    this.on(event, wrapped)
  }

  emit(event: string, ...args: Array<unknown>) {
    this.listeners.get(event)?.forEach((listener) => listener(...args))
  }

  removeAllListeners(event?: string) {
    if (event) this.listeners.delete(event)
    else this.listeners.clear()
  }
}

export interface MockSocketOptions {
  debug?: boolean
}

export class MockSocket {
  private static _staticEmitter = new Emitter()
  static on(event: string, listener: Listener) {
    MockSocket._staticEmitter.on(event, listener)
  }
  static off(event: string, listener?: Listener) {
    MockSocket._staticEmitter.off(event, listener)
  }

  public active = true
  public connected = false
  public disconnected = true
  public recovered = false
  public id = ''
  public io = {
    setOpenToken: () => {},
    setSessionToken: () => {},
    on: () => {},
    reconnectionAttempts: () => {},
    reconnectionDelay: () => {},
    reconnectionDelayMax: () => {},
    timeout: () => {},
    transports: () => {},
    upgrade: () => {},
    upgradeTransport: () => {},
    upgradeTimeout: () => {},
  }

  private _clientEmitter = new Emitter()
  private _serverEmitter = new Emitter()
  private _debug: boolean

  constructor(options: MockSocketOptions = {}) {
    this._debug = options.debug ?? false
    this.connect()
  }

  private _log(...args: Array<unknown>): void {
    if (this._debug) console.log('[MockSocket]', ...args)
  }

  open() {
    return this.connect()
  }

  compress() {}

  connect() {
    this.connected = true
    this.disconnected = false
    this.id = Math.random().toString(36).substring(2, 15)
    setTimeout(() => {
      this._trigger('connect')
      MockSocket._staticEmitter.emit('connect', { socket: this })
    }, 0)
    return this
  }

  disconnect() {
    this.connected = false
    this.disconnected = true
    this._trigger('disconnect')
    MockSocket._staticEmitter.emit('disconnect', { socket: this })
    return this
  }

  close(): this {
    return this.disconnect()
  }

  private _trigger(event: string, ...args: Array<unknown>): this {
    this._log(`trigger event: ${event}`, ...args)
    this._clientEmitter.emit(event, ...args)
    return this
  }

  on(event: string, listener: Listener): this {
    this._clientEmitter.on(event, listener)
    return this
  }

  once(event: string, listener: Listener): this {
    this._clientEmitter.once(event, listener)
    return this
  }

  off(event: string, listener?: Listener): this {
    this._clientEmitter.off(event, listener)
    return this
  }

  removeAllListeners(event?: string): this {
    this._clientEmitter.removeAllListeners(event)
    return this
  }

  send(...args: Array<unknown>): this {
    if (!this.connected) return this
    this.emit('message', ...args)
    return this
  }

  emit(event: string, ...args: Array<unknown>): this {
    this._log(`emit: ${event}`, ...args)
    if (!this.connected) return this

    setTimeout(() => {
      this._serverEmitter.emit(event, ...args)
    }, 0)
    return this
  }

  public server = {
    on: (event: string, listener: Listener) => {
      this._serverEmitter.on(event, listener)
    },
    off: (event: string, listener?: Listener) => {
      this._serverEmitter.off(event, listener)
    },
    emit: (event: string, ...args: Array<unknown>) => {
      this._clientEmitter.emit(event, ...args)
    },
  }
}

export function io(_url?: string, options?: MockSocketOptions): MockSocket {
  return new MockSocket(options)
}
