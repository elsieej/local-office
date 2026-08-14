// Chuyển thể từ baotlake/office-website (utils/editor/xhr.ts), AGPL-3.0.
// Nguồn: https://github.com/baotlake/office-website
//
// DocEditor gọi Document Server bằng XMLHttpRequest thật. Không có server
// đó — lớp proxy này thay thế class XMLHttpRequest của đúng iframe editor
// (xem onlyoffice-editor.tsx), chặn mọi request qua middleware; middleware
// trả `Response` thì coi là "đã xử lý xong cục bộ", không thì rơi về XHR
// gốc (dùng cho các asset tĩnh cùng origin như .js/.css/font).

export interface XHRMiddleware {
  (request: Request): Response | null | Promise<Response | null>
}

export function createXHRProxy(
  BaseXHR: typeof XMLHttpRequest,
  // `Request` của đúng iframe editor — xem giải thích trong
  // fetch-proxy.ts. Cần truyền riêng vì `Request` toàn cục ở module này
  // là của window chính, resolve URL tương đối sai base nếu dùng thẳng.
  TargetRequest: typeof Request,
) {
  return class ProxyXMLHttpRequest extends BaseXHR {
    private static _middlewares: Array<XHRMiddleware> = []

    private _isMocked = false
    private _requestMethod = 'GET'
    private _requestUrl = ''
    private _requestHeaders: Headers = new Headers()
    private _requestBody: XMLHttpRequestBodyInit | Document | null | undefined =
      null

    static use(middleware: XHRMiddleware) {
      this._middlewares.push(middleware)
    }

    static clearMiddlewares() {
      this._middlewares = []
    }

    open(
      method: string,
      url: string | URL,
      async: boolean = true,
      username?: string | null,
      password?: string | null,
    ): void {
      this._requestMethod = method
      this._requestUrl = url.toString()
      this._requestHeaders = new Headers()
      this._isMocked = false

      super.open(
        method,
        url,
        async,
        username ?? undefined,
        password ?? undefined,
      )
    }

    setRequestHeader(name: string, value: string): void {
      this._requestHeaders.append(name, value)
      if (!this._isMocked) {
        super.setRequestHeader(name, value)
      }
    }

    send(body?: Document | XMLHttpRequestBodyInit | null): void {
      this._requestBody = body

      this._tryMiddlewares()
        .then((handled) => {
          if (!handled) super.send(body)
        })
        .catch((err: unknown) => {
          console.error('ProxyXMLHttpRequest middleware error:', err)
          super.send(body)
        })
    }

    private async _tryMiddlewares(): Promise<boolean> {
      let request: Request
      try {
        const reqInit: RequestInit = {
          method: this._requestMethod,
          headers: this._requestHeaders,
          body: this._requestBody as BodyInit,
          mode: 'cors',
        }
        if (this.withCredentials) {
          reqInit.credentials = 'include'
        }
        request = new TargetRequest(this._requestUrl, reqInit)
      } catch {
        return false
      }

      for (const mw of ProxyXMLHttpRequest._middlewares) {
        const response = await mw(request.clone())
        if (response) {
          this._isMocked = true
          await this._handleMockResponse(response)
          return true
        }
      }

      return false
    }

    private async _handleMockResponse(response: Response) {
      this.dispatchEvent(new ProgressEvent('loadstart'))

      Object.defineProperty(this, 'readyState', {
        value: 2,
        writable: false,
        configurable: true,
      })
      this.dispatchEvent(new Event('readystatechange'))

      Object.defineProperty(this, 'readyState', {
        value: 3,
        writable: false,
        configurable: true,
      })
      this.dispatchEvent(new Event('readystatechange'))

      try {
        let responseData: unknown
        if (this.responseType === 'json') {
          responseData = await response.json()
        } else if (this.responseType === 'arraybuffer') {
          responseData = await response.arrayBuffer()
        } else if (this.responseType === 'blob') {
          responseData = await response.blob()
        } else if (this.responseType === 'document') {
          const text = await response.text()
          responseData = new DOMParser().parseFromString(text, 'text/xml')
        } else {
          responseData = await response.text()
        }

        Object.defineProperty(this, 'status', {
          value: response.status,
          writable: false,
          configurable: true,
        })
        Object.defineProperty(this, 'statusText', {
          value: response.statusText,
          writable: false,
          configurable: true,
        })
        Object.defineProperty(this, 'response', {
          value: responseData,
          writable: false,
          configurable: true,
        })
        Object.defineProperty(this, 'responseText', {
          value:
            typeof responseData === 'string'
              ? responseData
              : JSON.stringify(responseData),
          writable: false,
          configurable: true,
        })
        Object.defineProperty(this, 'responseURL', {
          value: response.url,
          writable: false,
          configurable: true,
        })

        this.dispatchEvent(
          new ProgressEvent('progress', {
            lengthComputable: true,
            loaded: 100,
            total: 100,
          }),
        )

        Object.defineProperty(this, 'readyState', {
          value: 4,
          writable: false,
          configurable: true,
        })
        this.dispatchEvent(new Event('readystatechange'))
        this.dispatchEvent(new ProgressEvent('load'))
        this.dispatchEvent(new ProgressEvent('loadend'))
      } catch (err) {
        console.error('ProxyXHR: error handling response', err)

        Object.defineProperty(this, 'readyState', {
          value: 4,
          writable: false,
          configurable: true,
        })
        this.dispatchEvent(new Event('readystatechange'))
        this.dispatchEvent(new ProgressEvent('error'))
        this.dispatchEvent(new ProgressEvent('loadend'))
      }
    }
  }
}
