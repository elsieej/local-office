# TASK-24: Đồng bộ theme sáng/tối của editor ONLYOFFICE với LocalOffice

**Story:** [US-9](../stories/9_xem_sua_docx_onlyoffice_story.md)
**Issue:** #49 · **Nhánh:** `feat/onlyoffice-theme-sync`
**Trạng thái:** ✅ Xong

---

## Mục tiêu

TASK-23 tách theme sáng/tối ra khỏi phạm vi vì lúc đó kết luận "config đúng
nhưng CSS theme tối không lên hình", nghi do lỗi hiển thị sâu trong
ONLYOFFICE. Điều tra lại ở task này cho kết quả **khác hẳn**: theme tối
**có** lên hình đúng (đã xác nhận bằng ảnh chụp so sánh sáng/tối, toolbar +
sidebar + status bar đổi màu đúng, trang tài liệu vẫn nền trắng — đúng hành
vi Word/ONLYOFFICE thật, không phải lỗi). Chuyện xảy ra ở TASK-23 là
**lỗi/hên-xui khi kiểm thử**: ONLYOFFICE tự cache theme UI đã chọn vào
`localStorage['ui-theme-id']` (cùng origin với LocalOffice) và **đọc cache
này trước `customization.uiTheme` truyền vào** — một khi editor từng mở ở
theme nào (kể cả từ phiên kiểm thử trước), mọi lần mở sau bị "kẹt" đúng
theme đó bất kể LocalOffice đang sáng hay tối, trừ khi cache bị xoá/ghi đè.
Xem Ghi chú để biết cách xác minh lại.

Việc thật cần làm: buộc `customization.uiTheme` luôn thắng cache cũ của
ONLYOFFICE, để theme editor luôn khớp đúng theme LocalOffice tại thời điểm
mở, không phụ thuộc lịch sử mở trước đó.

## Việc cần làm

- [x] Ghi `localStorage['ui-theme-id']` khớp với theme vừa tính
      (`getResolvedUiTheme()`) ngay trước khi tạo `DocEditor` — iframe đọc
      cache này lúc bootstrap, đồng bộ vì cùng origin, nên cache không bao
      giờ lệch với LocalOffice · `src/components/onlyoffice-editor.tsx`
- [x] Bọc `try/catch` quanh việc ghi (localStorage có thể bị chặn ở chế độ
      riêng tư nghiêm ngặt) — không chặn luồng mở tài liệu nếu ghi lỗi ·
      `src/components/onlyoffice-editor.tsx`
- [x] Đính chính `docs/tasks/23_tinh_chinh_giao_dien_editor_task.md`: kết
      luận "theme tối không lên hình" là chẩn đoán sai (do cache, không
      phải lỗi hiển thị ONLYOFFICE), rút lại giả thuyết "chung nguyên nhân
      `child.setAttribute is not a function`" — hai việc không liên quan
      nhau (xem Ghi chú)
- [x] Cập nhật `docs/stories/9_xem_sua_docx_onlyoffice_story.md`: dòng
      TASK-24 mô tả đúng lại theo phát hiện mới

## Kiểm thử

- [x] `npm run lint` sạch
- [x] `npx tsc --noEmit` sạch (trừ 1 lỗi `drizzle.config.ts` có từ trước)
- [x] Playwright MCP thật: xoá sạch `ui-theme-id`/`ui-theme`/`content-theme`
      khỏi `localStorage`, đặt LocalOffice theme = tối (qua nút chuyển theme
      thật, không chỉnh `classList` tay), mở `.docx` → toolbar/sidebar/status
      bar editor tối đúng
- [x] Playwright MCP thật (trường hợp biên quan trọng nhất): ghi tay
      `localStorage['ui-theme-id'] = 'theme-classic-light'`, LocalOffice
      vẫn đang theme tối, mở lại `.docx` → **trước khi sửa: editor hiện
      sáng (tái hiện đúng lỗi TASK-23)**; **sau khi sửa: editor hiện tối
      đúng theo LocalOffice** — ảnh chụp so sánh 2 lần
- [x] Playwright MCP thật (chiều ngược lại): ghi tay
      `localStorage['ui-theme-id'] = 'theme-dark'`, LocalOffice đang theme
      sáng, mở lại `.docx` → editor hiện sáng đúng theo LocalOffice, không
      bị cache tối kéo lại
- [x] Kiểm tra console không phát sinh lỗi mới do thay đổi này (so với
      trước khi sửa) — các lỗi còn lại (`child.setAttribute`,
      `alphabetletters.json` 500, icon `@2.5x.svg` 404) đều có từ trước,
      không liên quan tới theme, để lại cho task khác (xem Ghi chú)

## Ghi chú

**Cách phát hiện lại nguyên nhân thật**: đọc code đã vendor
(`public/onlyoffice/web-apps/apps/documenteditor/main/index.html`, đoạn
script bootstrap của iframe editor) thấy thứ tự xử lý theme lúc mount:

```
!window.uitheme.id && window.uitheme.set_id(localstorage.getItem("ui-theme-id"));
...
if (!window.uitheme.id && !!params.uitheme) { window.uitheme.id = params.uitheme; ... }
```

`params.uitheme` (giá trị `customization.uiTheme` mà LocalOffice truyền
vào qua query string của iframe) **chỉ được dùng khi `ui-theme-id` chưa có
cache**. `localStorage` của iframe dùng chung origin với LocalOffice
(`http://localhost:3000`), nên cache này tồn tại xuyên suốt nhiều lần mở
tài liệu, nhiều phiên kiểm thử — kể cả sau khi đóng tab. Đây chính là lý do
kết quả kiểm thử TASK-23 không nhất quán: tuỳ trạng thái cache còn sót lại
từ lần mở trước, theme mới truyền vào có thể bị bỏ qua hoàn toàn.

Xác nhận bằng thực nghiệm trước khi sửa (Playwright MCP thật, ảnh chụp so
sánh): xoá cache → theme tối lên đúng (toolbar/sidebar/status bar đổi màu
rõ ràng, KHÔNG như TASK-23 mô tả) → ghi tay cache về `theme-classic-light`
trong khi LocalOffice vẫn tối → tái hiện đúng lỗi "editor sáng dù LocalOffice
tối". Sau khi thêm `syncOnlyofficeThemeCache()` (ghi cache khớp theme ngay
trước khi tạo `DocEditor`), test lại y hệt hai chiều (cache tối/LocalOffice
sáng và ngược lại) đều cho kết quả đúng theo LocalOffice, không phụ thuộc
cache cũ nữa.

**Rút lại giả thuyết "chung nguyên nhân `child.setAttribute is not a
function`" đã ghi ở TASK-23**: lỗi đó không liên quan gì tới theme. Trace
lại đúng dòng gây lỗi trong
`Common.Utils.injectSvgIcons` (index.html đã vendor):
`fetch(url).then(r => r.ok ? r.text() : undefined /* nhánh else rỗng */)`
— khi `fetch` 404 (icon HiDPI `@2.5x.svg`, không liên quan theme), nhánh
`else{}` không return gì, `text` ở `.then` sau nhận `undefined`,
`template.innerHTML = undefined` bị ép thành chuỗi `"undefined"`, parse ra
**Text node** (không phải Element) — gọi `.setAttribute` trên Text node ném
đúng lỗi này. Vậy đây là hệ quả của việc các fetch icon 404 (do proxy
`fetch`/`XHR` của LocalOffice tạo `Request`/`URL` bằng constructor của
**window chính** thay vì của **iframe editor**, khiến URL tương đối bị
tính sai gốc — path `/documents/resources/img/iconssmall@2.5x.svg` thấy
trong console chính là gốc route `/documents/$documentId` của LocalOffice,
không phải gốc `/onlyoffice/...`), không liên quan gì tới cache theme ở
trên. Đây là lỗi thật, độc lập, để lại cho task sau
(`src/lib/onlyoffice/fetch-proxy.ts`, `xhr-proxy.ts`) — không sửa trong
task này theo đúng góp ý: giữ 2 phát hiện tách task riêng, không gộp.

**Vì sao trang tài liệu (canvas) luôn nền trắng kể cả ở theme tối**: đây là
hành vi đúng, không phải thiếu style — Word/ONLYOFFICE thật cũng vậy (giấy
tài liệu giữ trắng, chỉ khung UI đổi tối). `app.css` đã vendor có sẵn
`:root .theme-dark, :root .theme-type-dark {...}` định nghĩa lại các biến
CSS màu nền/chữ của khung UI — khớp đúng khi class `theme-dark` được gắn
vào `<body>` của iframe (đã xác nhận từ TASK-23), không cần sửa gì thêm ở
CSS.
