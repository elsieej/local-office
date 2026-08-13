# TASK-21: Mở `.docx` ở mode Xem qua `DocEditor` (lớp giả lập Document Server + x2t)

**Story:** [US-9](../stories/9_xem_sua_docx_onlyoffice_story.md)
**Issue:** #43 · **Nhánh:** `feat/onlyoffice-view-docx`
**Trạng thái:** ✅ Xong

---

## Mục tiêu

Mở được một file `.docx` thật (lấy từ OPFS) trong `DocEditor` của ONLYOFFICE ở
`editorConfig.mode: 'view'`, chạy hoàn toàn phía client, 0 request ra ngoài
máy. Đây là phần rủi ro kỹ thuật lớn nhất của US-9 — chỉ 1 mode, không sửa,
không đổi mode, không lưu. Xem `docs/stories/9_xem_sua_docx_onlyoffice_story.md`
mục Ghi chú để biết lý do tách nhỏ khỏi phần UI (TASK-22) và phần lưu/đo
lường (TASK-23).

`DocEditor` tự nói chuyện với một Document Server thật qua HTTP + WebSocket
(coauthoring). Không có server đó — cần chặn `XMLHttpRequest`/`fetch`/
`Worker`/`io` của đúng iframe editor (không phải window chính) và trả lời
bằng dữ liệu trong bộ nhớ, dùng `x2t.wasm` (đã vendor ở TASK-19) để chuyển
đổi `.docx` ↔ định dạng nội bộ ONLYOFFICE (`Editor.bin`).

## Việc cần làm

- [x] Chuyển thể lớp giả lập giao thức HTTP (`XMLHttpRequest`/`fetch` proxy có
      middleware) từ `baotlake/office-website` (`utils/editor/xhr.ts`,
      `fetch.ts`), ghi rõ nguồn + AGPL-3.0 ở đầu file ·
      `src/lib/onlyoffice/xhr-proxy.ts`, `src/lib/onlyoffice/fetch-proxy.ts`
- [x] Chuyển thể `MockSocket` giả lập giao thức WebSocket (coauthoring) từ
      `utils/editor/socket.ts` — bỏ phụ thuộc `eventemitter3` (chưa có trong
      repo), thay bằng emitter nhỏ tự viết · `src/lib/onlyoffice/mock-socket.ts`
- [x] Chuyển thể converter `x2t.wasm` (client luồng chính + Web Worker) từ
      `utils/editor/x2t.ts`, `x2t.worker.ts`, trỏ đúng đường dẫn vendor của
      LocalOffice (`/onlyoffice/x2t/x2t.js`) ·
      `src/lib/onlyoffice/x2t-client.ts`, `src/lib/onlyoffice/x2t-worker.ts`
- [x] Chuyển thể `EditorServer` từ `utils/editor/server.ts` — rút gọn: bỏ
      `openNew`/`openUrl`/tài liệu trống (không cần "tạo mới" ở app này), bỏ
      plugin thật (`/plugins.json` luôn trả rỗng, `sdkjs-plugins` không được
      vendor), giữ `open(file)`, `getDocument()`, `handleConnect`/
      `handleMessage` (auth/isSaveLock/saveChanges/getLock),
      `handleRequest` (downloadas/upload) · `src/lib/onlyoffice/editor-server.ts`
- [x] Type + hằng số dùng chung (đường dẫn asset, map đuôi file → loại tài
      liệu ONLYOFFICE) · `src/lib/onlyoffice/types.ts`, `src/lib/onlyoffice/utils.ts`
- [x] Component `OnlyofficeEditor`: nạp `api.js` bằng thẻ `<script>`, iframe
      preload ẩn, chờ sự kiện `onAppReady` rồi mới gắn proxy vào đúng
      `iframe[name="frameEditor"]`, khởi tạo `DocEditor` ở `mode: 'view'` ·
      `src/components/onlyoffice-editor.tsx`
- [x] Thêm `'word'` vào `VIEWABLE_DOCUMENT_KIND` · `src/constants/document.ts`
- [x] Gắn vào trang chi tiết: file `.docx`/`.doc` hiện `OnlyofficeEditor` thay
      khối "Chưa hỗ trợ xem định dạng này" · `src/routes/documents/$documentId.tsx`
- [x] File hỏng phải báo lỗi thật lên UI (phát hiện qua kiểm thử tay —
      `x2t.wasm` không throw cho input hỏng, xem Ghi chú): kiểm magic bytes
      container (ZIP cho OOXML, OLE2 cho định dạng cũ) trước khi đưa vào
      `x2t`, và để component theo dõi riêng `loadPromise` thay vì chỉ dựa
      vào giao thức socket (vốn nuốt lỗi để trả lời DocEditor cho êm) ·
      `src/lib/onlyoffice/editor-server.ts`, `src/components/onlyoffice-editor.tsx`

## Kiểm thử

- [x] `npm run lint` sạch
- [x] Playwright MCP thật: mở một file `.docx` thật đã lưu cục bộ → nội dung
      hiện đúng như mở bằng Word (chữ, bảng, ảnh nếu có), toolbar sửa bị
      khoá (mode view)
- [x] `browser_network_requests` trong suốt quá trình mở: không có request
      nào ra ngoài origin của app (chỉ `/onlyoffice/...` cùng origin)
- [x] Trường hợp biên: file `.docx` hỏng (2 KB bytes ngẫu nhiên đặt tên
      `.docx`) → hiện đúng Alert "Không mở được tài liệu — file có thể bị
      hỏng.", không mount editor, không treo trang, file gốc trong OPFS
      không bị đụng tới (vẫn tải về được nguyên vẹn)

## Ghi chú

**Kiến trúc thật, đã chạy được với file `.docx` thật** (ảnh chụp màn hình đã
kiểm bằng Playwright MCP thật, không phải suy đoán từ code): nội dung chữ,
bảng, ảnh nhúng hiện đúng, toolbar chỉ có tab "Tệp"/"Xem" (khoá sửa đúng như
mong đợi mode view). `browser_network_requests` xác nhận **0 request** ra
ngoài origin của app khi mở tài liệu — mọi asset ONLYOFFICE/x2t đều tới
`localhost` (chỉ có Google Fonts của chính LocalOffice, không liên quan tài
liệu, vẫn gọi ra ngoài như từ trước tới giờ).

**Không dùng `editorConfig.mode: 'view'`** như phác thảo ban đầu ở Mục tiêu
— bản gốc `office-website` cũng không set field này, chỉ dùng
`document.permissions.edit: false` (+ rename/protect/review/print: false) để
khoá sửa. Theo đúng bản gốc đã chạy thật thay vì tự suy đoán field nào đúng.

**4 lỗi thật phát hiện qua kiểm thử trực tiếp (không đoán được nếu chỉ đọc
code)**:

1. Worker `x2t.wasm` phải tạo với `{ type: 'module' }` — Vite dev server
   luôn phục vụ file worker dạng ESM native bất kể cấu hình, worker cổ điển
   lỗi "Cannot use import statement outside a module" ngay khi Vite tiêm
   client HMR vào. Nhưng module worker lại không có `importScripts()` (cần
   để nạp glue script Emscripten của x2t, không phải ES module) → nạp bằng
   `fetch` + `eval` gián tiếp thay thế. Xem chú thích ở
   `src/lib/onlyoffice/x2t-worker.ts`.
2. Thiếu `isLocalFile: true` (field top-level của config `DocEditor`, không
   phải dưới `document`) → `api.js` tự chèn thư mục phiên bản kiểu
   `/<hash>/web-apps/...` vào mọi đường dẫn asset (cơ chế cache-busting cho
   Document Server thật), 404 toàn bộ vì vendor của LocalOffice không có
   thư mục đó. Tìm ra bằng cách đọc thẳng `extendAppPath()` trong
   `web-apps/apps/api/documents/api.js` đã vendor, không có tài liệu chính
   thức nào ghi field này rõ ràng cho việc dùng client-only.
3. `MockSocket`/`EditorServer` cần kiểu `Listener = (...args: any[]) => void`
   (không phải `unknown[]`) để gán được các handler tham số cụ thể hơn
   (`handleMessage`, `handleConnect`) — đúng như bản gốc office-website đã
   dùng `any`, ban đầu tôi đổi sang `unknown` cho "an toàn hơn" nhưng gây
   lỗi kiểu contravariant, phải trả lại `any`.
4. **`x2t.wasm` không báo lỗi cho input hỏng** — chuyển bytes ngẫu nhiên
   thành một `Editor.bin` "hợp lệ" (rỗng) thay vì throw/trả null. Ban đầu
   tưởng chỉ cần cho component theo dõi `loadPromise` của
   `EditorServer.open()` (nó chỉ được await nội bộ trong `handleMessage` để
   trả lời giao thức socket, lỗi bị nuốt ở đó) là đủ — kiểm thử lại thì
   `loadPromise` **vẫn resolve bình thường**, không reject, đúng như trên.
   Fix thật: kiểm magic bytes container (`PK\x03\x04` cho ZIP/OOXML,
   `D0 CF 11 E0...` cho OLE2 cũ) trước khi đưa buffer vào `x2t`, throw ngay
   nếu sai — lúc đó `loadPromise` mới reject thật và component hiện đúng
   Alert. Đã kiểm lại bằng Playwright MCP thật sau khi sửa: Alert "Không mở
   được tài liệu — file có thể bị hỏng." hiện đúng, không mount editor.

**Giới hạn còn lại, không chặn task này** (cosmetic, cùng origin, không rò
rỉ dữ liệu):

- 3-4 request tới đường dẫn sai (`/common/main/resources/alphabetletters/*.json`,
  `/documents/resources/img/*.svg`, `/themes.json`) — thiếu tiền tố
  `/onlyoffice`, dùng cơ chế resolve path khác `extendAppPath()` mà chưa tìm
  ra. Ảnh hưởng: icon HiDPI, dữ liệu spellcheck alphabet, danh sách theme —
  không ảnh hưởng nội dung tài liệu hiện đúng. Kèm vài lỗi
  `child.setAttribute is not a function` liên quan (icon sprite load lỗi).
  Nếu cần UI hoàn thiện 100% thì để task riêng, không cần cho US-9.
- Vài request bị `net::ERR_ABORTED` rồi load lại thành công ngay sau đó khi
  mở trang lần đầu (2 lần gọi `new Worker` cho `x2t.wasm` mỗi lần mở trang)
  — xác nhận do `<StrictMode>` (bật mặc định trong client entry của
  `@tanstack/react-start`, không phải cấu hình của repo này) chạy effect 2
  lần ở dev. Chỉ xảy ra ở dev, không xảy ra ở production build — không sửa.
- `x2t.wasm` chỉ được kiểm cấu trúc container (ZIP/OLE2), không validate
  sâu bên trong (một ZIP hợp lệ nhưng không phải OOXML thật vẫn có thể lọt
  qua và cho kết quả không đoán trước được từ `x2t`) — chấp nhận được cho
  US-9, không phải luồng chính.

**Chưa dùng `editorConfig.mode: 'view'`** như phác thảo ban đầu ở Mục tiêu —
bản gốc `office-website` cũng không set field này, chỉ dùng
`document.permissions.edit: false` (+ rename/protect/review/print: false) để
khoá sửa. Theo đúng bản gốc đã chạy thật thay vì tự suy đoán field nào đúng.

Toàn bộ lớp giả lập (`src/lib/onlyoffice/`) chuyển thể từ
[baotlake/office-website](https://github.com/baotlake/office-website)
(AGPL-3.0) — mỗi file port đều ghi nguồn ở đầu file.
