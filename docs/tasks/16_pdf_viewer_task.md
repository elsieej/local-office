# TASK-16: Tích hợp pdf.js — trang xem PDF

**Story:** [US-7](../stories/7_xem_pdf_cuc_bo_story.md)
**Issue:** #31 · **Nhánh:** `feat/pdf-viewer` (stack trên `feat/mo-lai-xoa-tai-lieu`, xem Ghi chú)
**Trạng thái:** ✅ Xong

---

## Mục tiêu

Khi tài liệu là `.pdf`, trang `/documents/$documentId` (TASK-15) hiện nội dung PDF ngay trong trình duyệt: điều hướng trang, phóng to/thu nhỏ, tìm kiếm nội dung — tất cả chạy client, không request mạng.

## Việc cần làm

- [x] Thêm `pdfjs-dist` vào `dependencies` · `package.json`
- [x] Component `PdfViewer`: nhận `File`/bytes PDF, dựng `pdfjsLib.getDocument`, cấu hình `GlobalWorkerOptions.workerSrc` trỏ tới worker qua `new URL(..., import.meta.url)` (Vite bundling đúng cách, không tải worker qua CDN) · `src/components/pdf-viewer.tsx`
- [x] Render trang hiện tại ra `<canvas>` qua `page.render()`, nút trang trước/sau (hiện "Trang X / Y"), disable nút khi ở trang đầu/cuối · `src/components/pdf-viewer.tsx`
- [x] Phóng to/thu nhỏ: nút +/- đổi `scale` (giới hạn 0.5–3), render lại trang hiện tại · `src/components/pdf-viewer.tsx`
- [x] Tìm kiếm: trích text từng trang qua `page.getTextContent()`, tìm chuỗi khớp (không phân biệt hoa/thường) trên mọi trang đã tải, hiện số kết quả + nhảy tới trang đầu tiên khớp/kết quả tiếp theo · `src/components/pdf-viewer.tsx`
- [x] PDF hỏng/không đọc được (`getDocument` reject) → thông báo lỗi rõ, không treo trang · `src/components/pdf-viewer.tsx`
- [x] Gắn `PdfViewer` vào `/documents/$documentId` khi `doc.kind === 'pdf'`, đọc bytes qua `openDocument` (đã có từ TASK-15) · `src/routes/documents/$documentId.tsx`

## Kiểm thử

- [x] `npm run lint` sạch
- [x] Kiểm thử qua Playwright MCP: mở tài liệu PDF nhiều trang → trang đầu hiện đúng, bấm "trang sau" → sang trang 2, nội dung khác trang 1
- [x] Kiểm thử qua Playwright MCP: bấm phóng to → canvas lớn hơn (so kích thước trước/sau); thu nhỏ về lại bình thường
- [x] Kiểm thử qua Playwright MCP: dựng file PDF thật 2 trang có chữ khác nhau ("Hello page one" / "Hello page two zebra"); từ trang 1 tìm "zebra" → "1/1 kết quả — trang 2", tự nhảy sang trang 2; tìm "unicorn" (không có) → "Không tìm thấy kết quả.", không lỗi console
- [x] Kiểm thử qua Playwright MCP: `browser_network_requests` trong lúc xem → chỉ có request phiên đăng nhập thường lệ; `pdf.worker.min.mjs` nạp từ `/node_modules/pdfjs-dist/...` cục bộ, không CDN
- [x] Trường hợp biên: file `.pdf` giả (chuỗi bytes bất kỳ, không đúng cấu trúc PDF thật) → hiện đúng "Không xem được PDF — Không đọc được nội dung PDF — file có thể bị hỏng.", không crash trang, 0 lỗi console (pdf.js tự log vài warning khi rơi vào chế độ recovery — không phải lỗi)

## Ghi chú

**Stack trên `feat/mo-lai-xoa-tai-lieu` (PR #30)**: task này sửa trực tiếp `src/routes/documents/$documentId.tsx` mà TASK-15 vừa tạo. Thứ tự merge: #28 (TASK-14) → #30 (TASK-15) → PR của task này.

`PDFDocumentProxy` (kiểu trả về của `loadingTask.promise`) không có method `destroy()` — phải giữ riêng tham chiếu tới `PDFDocumentLoadingTask` (trả về từ `pdfjsLib.getDocument()`, trước khi `await .promise`) để gọi `destroy()` khi unmount/đổi file, tránh rò rỉ worker.

Tìm kiếm hiện tại là tìm theo **trang** (trích `getTextContent()` từng trang, khớp chuỗi con không phân biệt hoa/thường), nhảy tới trang chứa kết quả — chưa highlight vị trí chính xác trong trang. Đủ thoả AC "tìm kiếm nội dung, nhảy tới kết quả khớp" của US-7; highlight pixel-level để lại cho sau nếu cần.

**Cập nhật sau khi kiểm thử ngoại tuyến thật ở TASK-17**: 2 lỗi có sẵn trong code của task này bị phát hiện — (1) `loadingTask.destroy()` gọi mỗi lần unmount huỷ luôn worker dùng chung, khiến mở lại cùng PDF lúc mất mạng cần fetch lại worker script và lỗi; (2) `import * as pdfjsLib from 'pdfjs-dist'` tĩnh ở đầu file tham chiếu `DOMMatrix` (chỉ có ở trình duyệt), khiến SSR crash khi tải thẳng trang xem PDF. Cả hai đã sửa trong nhánh `feat/placeholder-ngoai-tuyen` (con của nhánh này) — xem Ghi chú của [TASK-17](17_placeholder_ngoai_tuyen_task.md). Nhánh/PR của task này **chưa** chứa bản sửa; PR con phải merge nối tiếp ngay sau, không được merge PR này một mình rồi để lâu.
