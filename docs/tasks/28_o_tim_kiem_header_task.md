# TASK-28: Ô tìm kiếm trên header, highlight trực tiếp trong tài liệu

**Story:** [US-9](../stories/9_xem_sua_docx_onlyoffice_story.md)
**Issue:** #56 · **Nhánh:** `feat/o-tim-kiem-header`
**Trạng thái:** 🔵 Chờ review

---

## Mục tiêu

Thêm một ô tìm kiếm thuộc giao diện LocalOffice (trên header trang chi
tiết `$documentId.tsx`) — gõ vào là nội dung khớp được highlight trực
tiếp trong tài liệu `.docx` đang mở, không cần người dùng tự bấm Ctrl+F
vào panel nổi của `DocEditor` (kết luận "không cần code thêm" của
[TASK-26's Ghi chú](26_luu_khu_hoi_opfs_task.md) chỉ đúng cho panel gốc
của ONLYOFFICE, không phải yêu cầu này).

## Việc cần làm

- [x] `OnlyofficeEditor` đổi sang `forwardRef` + `useImperativeHandle`,
      lộ ra `search(query: string)` cho component cha gọi · `onSave`/
      `onReady` giữ nguyên qua ref (mẫu `onSaveRef` đã có), thêm
      `onReadyRef` tương tự cho `onReady` (báo cha khi tài liệu hiện xong,
      trước đó gọi `search` vô tác dụng) · `src/components/onlyoffice-editor.tsx`
- [x] `doSearch(query)`: dùng lại panel "Tìm kiếm" nội bộ của `DocEditor`
      làm engine — ghi giá trị vào `#search-bar-text` (id ổn định, không
      minify) qua native setter + dispatch `input`; panel chưa mở lần nào
      thì mở bằng `KeyboardEvent` Ctrl+F giả lập rồi poll tới khi DOM xuất
      hiện · cùng file
- [x] Ẩn panel "Tìm kiếm" nổi bằng CSS (`.search-bar { display: none }`)
      chèn vào `<head>` của iframe ngay trong `onAppReady` — chỉ dùng lại
      "engine" của nó, không hiện UI trùng lặp với ô tìm kiếm mới · cùng
      file
- [x] `$documentId.tsx`: thêm ô `Input` trên `TopBar` (chỉ hiện khi
      `isWord && fileQuery.data`), debounce 300ms trước khi gọi
      `editorRef.current.search(query)`; disable ô input tới khi
      `onReady` báo tài liệu đã hiện xong; reset query + trạng thái ready
      khi `mode` đổi (khớp `key={mode}` đã ép remount editor) ·
      `src/routes/documents/$documentId.tsx`

## Kiểm thử

- [x] `npm run format && npm run lint` sạch
- [x] `npx tsc --noEmit` sạch (trừ 1 lỗi `drizzle.config.ts` có từ trước,
      không liên quan)
- [x] Playwright MCP thật: mở `.docx` mode Sửa, gõ từ khoá có trong tài
      liệu vào ô tìm kiếm trên header → highlight vàng xuất hiện ngay
      trong tài liệu, **không** có panel nổi nào của ONLYOFFICE hiện lên
      (đã bị ẩn), giá trị ô input khớp đúng chữ vừa gõ
- [x] Playwright MCP thật: xoá hết chữ trong ô tìm kiếm → highlight vàng
      biến mất (chỉ còn vùng chọn văn bản bình thường tại vị trí kết quả
      cuối — hành vi gốc của editor, không phải lỗi)
- [x] Playwright MCP thật: chuyển mode Sửa → Xem → ô tìm kiếm reset về
      rỗng, không bị khoá (`onReady` bắn lại đúng cho lần mount mới), gõ
      lại vẫn highlight đúng — xác nhận không đụng lại lỗi `insertBefore`
      đã vá ở `key={mode}` (TASK-22)
- [x] Console không phát sinh lỗi mới so với baseline đã biết (404
      sdk cell/slide/visio, service worker 404 — ngoài phạm vi `.docx`)

## Ghi chú

**Không có API tìm kiếm chính thức nào lộ ra ngoài**: `DocsAPI.DocEditor`
(object công khai, dùng để khởi tạo editor) chỉ có `downloadAs`,
`requestClose`,... không có `search`. Object nội bộ `window.editor` (bên
trong iframe) có `asc_findText`/`asc_CFindOptions` thật, nhưng property
minified (`aqd`, `Zb`,...), constructor cần tham số đúng thứ tự không rõ
ràng — rủi ro vỡ giữa các bản build `sdkjs` khác nhau. Chọn tái dùng DOM
của panel "Tìm kiếm" có sẵn (`#search-bar-text`) thay vì gọi thẳng API nội
bộ — id đó là id HTML thật (không bị minify), là bề mặt ổn định hơn nhiều,
same-origin nên truy cập trực tiếp được (không qua `postMessage`).

**Mở panel lần đầu bằng phím giả lập**: `#search-bar-text` chỉ được tạo
sau khi panel "Tìm kiếm" mở ít nhất 1 lần (không có sẵn trong DOM lúc
editor vừa `onDocumentReady`). Xác nhận bằng thực nghiệm: `KeyboardEvent`
dựng tay (`new win.KeyboardEvent('keydown', { key: 'f', ctrlKey: true,
bubbles: true })`, `isTrusted: false`) dispatch vào `#id_main` của iframe
vẫn kích được listener nội bộ mở panel — không cần phím thật qua CDP/OS.

**Đánh đổi đã biết**: ẩn panel gốc đồng nghĩa mất luôn bộ đếm "x/y" và 2
nút điều hướng next/prev của nó — phạm vi task này chỉ cần
highlight-khi-gõ, không làm lại UI đếm/điều hướng riêng. Nếu sau này cần,
có thể đọc `#search-bar-results` (cũng là id ổn định, dạng text "x/y")
và gọi `.click()` lên `#search-bar-next`/`#search-bar-back` — chưa làm ở
đây vì ngoài phạm vi yêu cầu ban đầu.

**Vì sao không gọi `search` ngay khi `OnlyofficeEditor` mount xong mà cần
`onReady`**: tài liệu tải bất đồng bộ (script `api.js`, `x2t.wasm` convert,
`onDocumentReady` mới bắn khi nội dung đã render) — gọi `search` sớm hơn
có thể rơi vào lúc `#id_main` (target nhận phím giả lập) chưa tồn tại
hoặc DocEditor chưa sẵn sàng nhận sự kiện, im lặng không có tác dụng. Ô
tìm kiếm trên header bị khoá (đặt `disabled`) tới khi `onReady` bắn.
