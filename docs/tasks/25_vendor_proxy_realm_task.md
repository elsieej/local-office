# TASK-25: Vá lỗi `fetch`/`XHR` proxy resolve URL tương đối sai (window chính, không phải iframe editor)

**Story:** [US-9](../stories/9_xem_sua_docx_onlyoffice_story.md)
**Issue:** #51 · **Nhánh:** `feat/onlyoffice-fetch-realm-fix`
**Trạng thái:** ✅ Xong

---

## Mục tiêu

Vá nguyên nhân thật của lỗi console `TypeError: child.setAttribute is not
a function` (ghi nhận từ TASK-21, nghi sai là "chung nguyên nhân với theme
tối" ở TASK-23, đã đính chính ở TASK-24) và các lỗi 404/500 tải sai đường
dẫn asset đi kèm (icon HiDPI `@2.5x.svg`, `alphabetletters`/
`qwertyletters.json`, `themes.json`, `plugins.json`) — tất cả cùng một
nguyên nhân gốc: lớp proxy `fetch`/`XHR` (`src/lib/onlyoffice/fetch-proxy.ts`,
`xhr-proxy.ts`) tạo đối tượng `Request` bằng constructor toàn cục của
**window chính** (nơi bundle LocalOffice được nạp) thay vì của **iframe
editor** — mọi URL tương đối mà code trong iframe tự gọi `fetch()`/mở XHR
bị tính base URL theo trang LocalOffice (`/documents/<id>`) thay vì theo
trang thật của iframe (`/onlyoffice/web-apps/...`), sai cả path lẫn khiến
một số request 404 rồi kéo theo lỗi DOM injection ở phía ONLYOFFICE.

## Việc cần làm

- [x] `fetch-proxy.ts`: dùng `target.Request` (constructor của đúng
      window truyền vào — iframe editor) thay vì `Request` toàn cục của
      module để tạo đối tượng `Request` bên trong proxy ·
      `src/lib/onlyoffice/fetch-proxy.ts`
- [x] `xhr-proxy.ts`: nhận thêm tham số `TargetRequest` (constructor
      `Request` của iframe), dùng thay `Request` toàn cục khi dựng object
      để khớp middleware · `src/lib/onlyoffice/xhr-proxy.ts`
- [x] Truyền `win.Request` vào `createXHRProxy` tại nơi gọi ·
      `src/components/onlyoffice-editor.tsx`
- [x] (Phát sinh khi kiểm thử) Sau khi URL resolve đúng, request
      `themes.json`/`plugins.json` đổi sang đúng gốc iframe
      (`/onlyoffice/themes.json`, `/onlyoffice/plugins.json`) — không còn
      khớp cách giả lập cũ (so khớp tuyệt đối `/plugins.json`, và file tĩnh
      `public/themes.json` "vá" đúng chỗ sai cũ từ TASK-23). Đổi
      `EditorServer.handleRequest` sang so khớp `.endsWith(...)`, thêm case
      `themes.json`, bỏ file tĩnh `public/themes.json` không cần nữa ·
      `src/lib/onlyoffice/editor-server.ts`, xoá `public/themes.json`

## Kiểm thử

- [x] `npm run lint` sạch
- [x] `npx tsc --noEmit` sạch (trừ 1 lỗi `drizzle.config.ts` có từ trước)
- [x] Playwright MCP thật: mở `.docx` ở mode Xem, xem console —
      **trước khi sửa**: 3 lỗi `child.setAttribute is not a function`, 404
      `iconssmall/iconsbig/iconshuge@2.5x.svg`, 500
      `alphabetletters.json`/`qwertyletters.json`, 500 `/onlyoffice/themes.json`
      (sau khi bỏ file tĩnh) — **sau khi sửa**: toàn bộ các lỗi trên biến
      mất, `themes.json`/`plugins.json` trả 200 qua mock
- [x] Playwright MCP thật: chuyển sang mode Sửa → vẫn tải đúng, không phát
      sinh lỗi mới (chỉ lặp lại lỗi ServiceWorker cũ, không liên quan, ghi
      ở Ghi chú)
- [x] Playwright MCP thật: gõ chữ ở mode Sửa, bấm "Lưu (Ctrl+S)" trong
      editor → tải về đúng file `.docx`, không lỗi mới trong console — xác
      nhận route mock `/downloadas/` (khớp qua `.endsWith`, không đổi cách
      so khớp) vẫn hoạt động đúng sau khi URL resolve đổi
- [x] Kiểm tra ảnh chụp: giao diện editor không đổi (logo, toolbar, icon)
      so với trước khi sửa — không có hồi quy hiển thị

## Ghi chú

**Cách tìm ra nguyên nhân**: đọc code đã vendor
(`public/onlyoffice/web-apps/apps/documenteditor/main/index.html`, hàm
`Common.Utils.injectSvgIcons`) thấy: `fetch(url).then(r => r.ok ?
r.text() : undefined /* nhánh else rỗng, không return gì */)` — khi
`fetch` 404, `.then` sau nhận `text = undefined`,
`template.innerHTML = undefined` bị ép thành chuỗi `"undefined"`, parse ra
**Text node** (không phải Element) — gọi `.setAttribute` trên Text node
chính là lỗi `child.setAttribute is not a function`. Vậy lỗi này là **hệ
quả** của fetch 404, không phải nguyên nhân độc lập.

Đối chiếu qua `browser_network_requests` (Playwright MCP) thấy các request
icon `@2.5x.svg` bị TanStack Router redirect 307 rồi 404 ở
`/documents/resources/img/iconssmall@2.5x.svg?mode=view` — đúng route
`/documents/$documentId` của LocalOffice (tham số `resources` bị hiểu nhầm
là `documentId`), không phải gốc `/onlyoffice/...` của iframe. Xác nhận
bằng thực nghiệm trực tiếp trong Playwright:
`new Request('resources/img/x.svg').url` gọi từ window chính ra đúng
`http://localhost:3000/documents/resources/img/x.svg` — khớp y hệt request
lỗi thấy trong console.

Nguyên nhân: `createFetchProxy`/`createXHRProxy` chuyển thể từ
baotlake/office-website dùng thẳng `Request` toàn cục của module (chạy
trong bundle window chính) để dựng object `Request` bên trong proxy, dù
proxy được GẮN vào `window` của iframe (`Object.assign(win, {fetch:
fetchProxy, ...})` trong `onlyoffice-editor.tsx`). Khi code trong iframe
gọi `fetch(url)` với `url` tương đối, JS engine resolve theo "realm" nơi
hàm `Request`/`fetch` ĐƯỢC ĐỊNH NGHĨA (window chính), không phải nơi nó
ĐƯỢC GỌI (iframe) — a URL tương đối vì vậy bị tính base theo
`location.href` của window chính. Bản gốc `office-website` không gặp lỗi
này có thể vì cấu trúc route khác (không có param động dài kiểu
`/documents/$documentId` để URL tương đối "ăn nhầm" vào path, hoặc chưa
từng test theme tối/icon HiDPI để lộ ra).

**`themes.json`/`plugins.json` đổi cách vá**: trước khi vá lỗi realm, 2
request này bị tính sai base tình cờ rơi đúng gốc site LocalOffice
(`/plugins.json`, `/themes.json`) — TASK-23 từng "vá" bằng 1 file tĩnh
`public/themes.json` khớp đúng chỗ sai đó. Sau khi vá đúng base, chúng
resolve đúng theo gốc iframe (`/onlyoffice/plugins.json`,
`/onlyoffice/themes.json`) — vẫn không phải đường dẫn thật trong bản đã
vendor (`web-apps/apps/common/main/resources/themes/themes.json`, xác
nhận bằng cách kiểm tra trực tiếp trong image Docker
`onlyoffice/documentserver:9.3.0.1` — themes.json thật của Document Server
cũng chỉ là `{"themes": []}` rỗng, không phải nguồn dữ liệu theme built-in
như từng nghi ngờ). Chuyển hẳn 2 case này vào `EditorServer.handleRequest`
(đúng vai "giả lập Document Server") thay vì tiếp tục đoán path tĩnh — ổn
định hơn, không phụ thuộc việc URL resolve ra path chính xác nào.

**Vẫn còn 404 sau khi vá (không thuộc phạm vi task này)**: `sdk-all.js` +
CSS của `cell`/`slide`/`visio` (spreadsheet/presentation/visio editor),
`document_editor_service_worker.js`. Đều là giới hạn đã biết từ TASK-19
(chỉ vendor phần cần cho `.docx`, xem
`docs/tasks/19_vendor_pipeline_onlyoffice_task.md`) hoặc lỗi thiếu file
service worker không do proxy gây ra (gọi qua `navigator.serviceWorker`,
không đi qua `fetch`/`XHR` bị proxy) — không chặn US-9, không sửa ở đây.
