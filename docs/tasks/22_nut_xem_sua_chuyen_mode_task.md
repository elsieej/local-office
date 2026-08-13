# TASK-22: 2 nút Xem/Sửa, chuyển mode, xác nhận thay đổi chưa lưu

**Story:** [US-9](../stories/9_xem_sua_docx_onlyoffice_story.md)
**Issue:** #45 · **Nhánh:** `feat/onlyoffice-xem-sua-buttons`
**Trạng thái:** ✅ Xong

---

## Mục tiêu

Xây UI xoay quanh cơ chế mode Xem đã chạy được ở TASK-21: 2 hành động tách
biệt "Xem"/"Sửa" trên danh sách tài liệu, nút đổi mode ngay trên trang chi
tiết, và xác nhận trước khi rời trang nếu đang sửa dở. Thuần UI — không có
rủi ro kỹ thuật mới (lớp giả lập Document Server + x2t đã chạy ổn ở
TASK-21). Chưa làm lưu thật vào OPFS (để TASK-23).

## Việc cần làm

- [x] Route `/documents/$documentId`: thêm `validateSearch` cho tham số
      `mode: 'view' | 'edit'` (mặc định `'view'` nếu thiếu/sai) ·
      `src/routes/documents/$documentId.tsx`
- [x] `OnlyofficeEditor` nhận prop `mode`, set
      `document.permissions.edit = mode === 'edit'`, thêm `mode` vào dep
      array của effect (đổi mode → huỷ editor cũ, tạo lại đúng như mở tài
      liệu mới) · `src/components/onlyoffice-editor.tsx`
- [x] Theo dõi thay đổi chưa lưu: lắng nghe `onDocumentStateChange` (đặt cờ
      dirty khi `e.data` true), reset cờ khi editor mới mount hoặc khi
      `onSaveDocument`/`onSave`/`writeFile` bắn (đã có sẵn đường lưu tạm qua
      "Tải tệp" trong toolbar, dùng `handleRequest` `/downloadas/` đã port
      từ TASK-21) · `src/components/onlyoffice-editor.tsx`
- [x] Chặn rời trang khi đang mode Sửa + có thay đổi chưa lưu bằng
      `useBlocker` của TanStack Router (`shouldBlockFn` gọi
      `window.confirm`, giống mẫu confirm đã dùng ở nút Xoá) — chặn cả điều
      hướng trong app (Quay lại, back trình duyệt, đổi mode) lẫn đóng
      tab/reload (`enableBeforeUnload`) · `src/components/onlyoffice-editor.tsx`
- [x] Trang chi tiết: nút "Chuyển sang Sửa" khi đang mode Xem, nút "Chuyển
      sang Xem" khi đang mode Sửa (điều hướng đổi `search.mode`, việc chặn
      khi có thay đổi chưa lưu đã xử lý ở trên) ·
      `src/routes/documents/$documentId.tsx`
- [x] Danh sách tài liệu: file kind `word` hiện 2 nút "Xem"/"Sửa" trong
      `ItemActions` thay vì tiêu đề là link đơn — kind khác giữ nguyên hành
      vi cũ (tiêu đề là link) · `src/components/document-list.tsx`
- [x] (Phát sinh khi kiểm thử) `key={mode}` trên `OnlyofficeEditor` ở trang
      chi tiết — đổi mode mà không ép remount toàn bộ thì React cố
      reconcile lại subtree DOM mà DocEditor đã tự thao tác, crash
      "insertBefore... not a child of this node" · `src/routes/documents/$documentId.tsx`

## Kiểm thử

- [x] `npm run lint` sạch
- [x] Playwright MCP thật: từ danh sách, bấm "Xem" một file `.docx` → mở
      đúng mode view (toolbar khoá sửa, giống TASK-21)
- [x] Playwright MCP thật: từ danh sách, bấm "Sửa" → mở đúng mode edit
      (toolbar đầy đủ công cụ sửa, gõ được chữ)
- [x] Playwright MCP thật: đang mode Xem, bấm "Chuyển sang Sửa" → editor
      huỷ và tạo lại ở mode edit, không cần quay lại danh sách
- [x] Playwright MCP thật: mode Sửa, gõ thêm chữ (chưa lưu), bấm "Quay lại"
      → `window.confirm` hiện đúng, Huỷ (Cancel) thì ở lại trang, Đồng ý
      thì về danh sách
- [x] Playwright MCP thật: mode Sửa, KHÔNG gõ gì (không dirty), bấm "Quay
      lại" → về danh sách ngay, không hiện confirm
- [x] Trường hợp biên: file kind khác `word` (pdf, chưa hỗ trợ) → danh sách
      vẫn hiện tiêu đề dạng link như cũ, không có 2 nút Xem/Sửa

## Ghi chú

Kiểm bằng Playwright MCP thật (file `test-sawaco.docx` từ TASK-21) qua đủ 6
luồng: Xem, Sửa, Xem→Sửa qua nút "Chuyển sang Sửa", gõ chữ rồi rời trang
(confirm hiện đúng, Huỷ giữ nguyên trang, Đồng ý mới rời), rời trang khi
không có thay đổi (không hiện confirm), và file kind khác `word` (`.txt`)
vẫn giữ hành vi tiêu đề-là-link cũ, không có nút Xem/Sửa.

**1 lỗi thật phát hiện qua kiểm thử trực tiếp**: đổi mode lần đầu (từ Xem
sang Sửa) làm crash toàn trang — `Uncaught Error: Failed to execute
'insertBefore' on 'Node': The node before which the new node is to be
inserted is not a child of this node.` Nguyên nhân: `DocEditor` tự chèn
iframe `frameEditor` vào container ngoài tầm React; đổi `mode` làm effect
chạy lại (đúng như thiết kế) nhưng component KHÔNG unmount (cùng vị trí
trong cây JSX) nên React vẫn giữ và cố "reconcile" lại chính subtree DOM đó
— đụng độ với thay đổi DOM trực tiếp của DocEditor. Fix: thêm `key={mode}`
ở nơi render `<OnlyofficeEditor>` — ép React unmount/mount lại toàn bộ mỗi
lần đổi mode thay vì reconcile, luôn đưa DocEditor mới vào DOM sạch.

**Không liên quan trực tiếp task này nhưng tìm ra trong lúc kiểm thử**:
tính năng "consolePiping" của `@tanstack/devtools-vite` (mirror console
server→client, dev only) lặp lại toàn bộ lịch sử log mỗi lần kết nối SSE
lại, tích luỹ thành các dòng console khổng lồ (hàng trăm nghìn ký tự) —
làm Playwright MCP mất kết nối nhiều lần khi kiểm thử cả TASK-21 lẫn
TASK-22. Đã tắt qua `devtools({ consolePiping: { enabled: false } })` ở
`vite.config.ts`. Không ảnh hưởng production (tính năng này chỉ chạy ở
`config.mode === 'development'`).

**Giới hạn đã biết, không chặn task này**: thanh trạng thái của DocEditor ở
mode Sửa hiện chữ "Đã lưu mọi thay đổi" — đây là autosave nội bộ của
DocEditor (undo/redo trong bộ nhớ), không phải đã lưu vào OPFS của
LocalOffice (chưa làm, để TASK-23). Có thể gây hiểu lầm cho người dùng —
cân nhắc ở TASK-23 khi lưu thật đã chạy được, không sửa ở đây vì ngoài
phạm vi UI thuần của TASK-22.
