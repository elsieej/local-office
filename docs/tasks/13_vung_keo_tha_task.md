# TASK-13: Vùng kéo–thả / chọn file

**Story:** [US-5](../stories/5_mo_tai_lieu_story.md)
**Issue:** #25 · **Nhánh:** `feat/vung-keo-tha`
**Trạng thái:** ✅ Xong

---

## Mục tiêu

Dựng vùng kéo–thả (kèm nút chọn file) trên trang chủ, gọi lớp lưu trữ từ TASK-12 để mở/lưu tài liệu, cho người dùng thấy ngay kết quả (thành công kèm nhãn 🔒 Cục bộ, hoặc lỗi rõ ràng).

## Việc cần làm

- [x] Component `UploadDropzone`: vùng kéo–thả bằng `onDragOver`/`onDrop` gốc + input file ẩn (`multiple`, `accept` theo `DOCUMENT_EXTENSION_KIND`), nút "Chọn file" gọi `inputRef.current.click()` · `src/components/upload-dropzone.tsx`
- [x] Xử lý nhiều file thả cùng lúc độc lập (`Promise.allSettled`, một file lỗi không chặn file khác), gọi `saveDocument` từ `#/lib/documents/store` cho từng file · `src/components/upload-dropzone.tsx`
- [x] Sau khi lưu thành công: hiện danh sách "vừa mở" trong phiên này (`Item`/`ItemTitle`/`ItemDescription` + `DocumentStateBadge`) — sẽ được thay bằng danh sách thật đọc từ IndexedDB ở TASK-14 · `src/components/upload-dropzone.tsx`
- [x] Component dùng chung `DocumentStateBadge` (map `DocumentState` → nhãn, hiện chỉ có `local` → "🔒 Cục bộ") — TASK-14/15 dùng lại · `src/components/document-state-badge.tsx`
- [x] Lỗi từng file hiện qua `Alert variant="destructive"`, dùng thẳng `error.message` (các lớp lỗi ở TASK-12 đã có message tiếng Việt sẵn), phân biệt theo tên file gây lỗi · `src/components/upload-dropzone.tsx`
- [x] Gắn `UploadDropzone` vào trang chủ, thay nội dung scaffold · `src/routes/index.tsx`
- [x] Nút "Chọn file" có tên hiển thị làm accessible name; input file thật đặt `aria-hidden` + `tabIndex={-1}` (chỉ là trigger chương trình, không phải điểm dừng riêng cho screen reader — tránh trùng lặp vì `input[type=file]` tự mang role "button") · `src/components/upload-dropzone.tsx`

## Kiểm thử

- [x] `npm run lint` sạch
- [x] Kiểm thử qua Playwright MCP: `browser_file_upload` chọn đồng thời 1 file `.pdf` hợp lệ + 1 file định dạng không hỗ trợ (`.rtf`) → `.pdf` xuất hiện trong danh sách "vừa mở" với nhãn 🔒 Cục bộ, `.rtf` báo lỗi rõ ràng ("Định dạng file ... không được hỗ trợ") trong `Alert`, không lỗi console
- [x] Kiểm thử qua Playwright MCP: chọn file `.md` → lưu và hiện trong danh sách "vừa mở" với nhãn 🔒 Cục bộ, không lỗi console
- [x] Kiểm thử qua Playwright MCP (`browser_run_code_unsafe`, dispatch `DragEvent` thật với `DataTransfer` chứa file `.docx`): kéo–thả lưu được, hiện đúng tên file trong danh sách
- [x] Kiểm thử qua Playwright MCP: `browser_network_requests` sau khi chọn/thả file → chỉ có request phiên đăng nhập thường lệ và console-pipe của devtools, không request nào chứa nội dung file
- [x] Trường hợp biên: dispatch `drop` với `DataTransfer` rỗng (giả lập thả thư mục — trình duyệt không tạo `File` nào) → `dataTransfer.files.length === 0` nên bỏ qua có kiểm soát, không crash, không lỗi console

## Ghi chú

Danh sách "vừa mở" trong task này chỉ là state tạm trong component (không đọc lại được sau reload) — TASK-14 thay bằng danh sách thật đọc từ IndexedDB, lúc đó phần state tạm này bị xoá đi. Task này chỉ cần thoả AC "tài liệu vừa mở mang nhãn 🔒 Cục bộ" của US-5, chưa cần thoả toàn bộ US-6.

Bản đầu dùng `Button render={<label />}` bọc quanh `<input type="file">` để bấm "Chọn file" tự mở hộp thoại qua hành vi label→input gốc — nhưng `input[type=file]` tự mang role ARIA "button", nên lồng nó trong `Button` (cũng render ra phần tử có role button) tạo ra interactive-lồng-interactive, thấy rõ qua `browser_snapshot` (hai "button" lồng nhau). Đổi sang mẫu chuẩn hơn: `input` nằm ngoài, ẩn bằng `sr-only` + `aria-hidden` + `tabIndex={-1}`, nút "Chọn file" gọi `inputRef.current.click()` — không còn lồng interactive, cây accessibility sạch.

Theo yêu cầu bổ sung: thêm `.txt` (`text`) và `.md` (`markdown`) vào `DOCUMENT_EXTENSION_KIND` — mở/lưu/liệt kê được như mọi định dạng khác, không vướng ràng buộc khứ hồi (văn bản thuần không cần engine). Đã cập nhật `CLAUDE.md` (bảng định dạng) và `docs/features/2_...` cho khớp. Chưa dựng viewer cho hai định dạng này — rơi vào cùng placeholder "chưa hỗ trợ xem" như nhóm Office ở TASK-17; xem `src/components/upload-dropzone.tsx` lấy danh sách đuôi trực tiếp từ `DOCUMENT_EXTENSION_KIND` (không hardcode) để tránh lệch khi đổi danh sách định dạng sau này.
