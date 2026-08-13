# TASK-17: Placeholder định dạng chưa hỗ trợ + kiểm thử ngoại tuyến

**Story:** [US-7](../stories/7_xem_pdf_cuc_bo_story.md)
**Issue:** #33 · **Nhánh:** `feat/placeholder-ngoai-tuyen` (stack trên `feat/pdf-viewer`, xem Ghi chú)
**Trạng thái:** ✅ Xong

---

## Mục tiêu

Tài liệu không phải `.pdf` (`.docx` `.xlsx` `.pptx` `.doc` `.xls` `.ppt` `.txt` `.md`) mở ra trang chi tiết hiện thông báo rõ "chưa hỗ trợ xem", không trang trắng/lỗi. Xác nhận toàn bộ feature 2 (mở → lưu → danh sách → xem PDF → tải về → xoá) hoạt động khi mất mạng.

## Việc cần làm

- [x] `/documents/$documentId`: khi `doc.kind !== 'pdf'`, hiện `Empty` với thông báo "Chưa hỗ trợ xem định dạng này" + gợi ý dùng nút "Tải về" ở trên · `src/routes/documents/$documentId.tsx`
- [x] Kiểm thử ngoại tuyến toàn luồng qua Playwright MCP (`page.context().setOffline(true)`): mở file, xem danh sách, mở PDF, tải về, xoá — tất cả không request mạng nào, không lỗi console

## Kiểm thử

- [x] `npm run lint` sạch
- [x] Kiểm thử qua Playwright MCP: mở tài liệu `.docx`/`.xlsx`/`.pptx`/`.txt`/`.md` từ danh sách → hiện "Chưa hỗ trợ xem định dạng này", không trang trắng, không lỗi console
- [x] Kiểm thử qua Playwright MCP: bật `setOffline(true)` sau khi đã tải app lần đầu → mở file mới (đã có sẵn cục bộ từ trước lúc mất mạng), xem PDF, tải về, xoá — toàn bộ hoạt động bình thường
- [x] Trường hợp biên: bật offline rồi mới tải trang lần đầu (chưa cache) → ghi nhận hành vi thực tế (khác với luồng cục bộ đã cache — không phải lỗi của feature này)

## Ghi chú

Kiểm thử ngoại tuyến thật (không chỉ mock) qua Playwright MCP phát hiện 3 lỗi, cả 3 đều đã sửa trong task này:

1. **PDFWorker bị huỷ theo từng lần đóng tài liệu** (lỗi có sẵn từ TASK-16, không phải phát sinh mới) — `loadingTask.destroy()` gọi trong cleanup của `useEffect` huỷ luôn `PDFWorker` dùng chung. Mở lại đúng PDF đó lúc mất mạng cần tạo worker mới → fetch lại `pdf.worker.min.mjs` → lỗi vì không có mạng, dù trước đó đã xem được PDF này trong cùng phiên. Sửa: `src/components/pdf-viewer.tsx` giữ một `PDFWorker` dùng chung ở module scope cho cả phiên, không huỷ khi unmount.
2. **Crash SSR khi tải thẳng trang xem PDF** (lỗi có sẵn từ TASK-16) — `import * as pdfjsLib from 'pdfjs-dist'` ở đầu file kéo theo tham chiếu `DOMMatrix` (chỉ có ở trình duyệt) khi TanStack Start render phía server, console báo "Switched to client rendering because the server rendering errored: DOMMatrix is not defined". Sửa: chuyển sang `import()` động, chỉ chạy trong `useEffect` (client-only).
3. **Xoá tài liệu khi mất mạng bị treo vô thời hạn, không lỗi console** (lỗi mới, do lớp react-query) — mặc định `networkMode: 'online'` của TanStack Query tạm dừng mọi `useMutation`/`useQuery` khi `navigator.onLine === false`, kể cả khi `mutationFn`/`queryFn` không hề gọi mạng (toàn bộ thao tác tài liệu chỉ đọc/ghi OPFS + IndexedDB cục bộ). `page.context().setOffline(true)` của Playwright kích hoạt đúng điều kiện này. Sửa: `src/router.tsx` set `networkMode: 'always'` cho `defaultOptions.queries`/`mutations` của `QueryClient`.

Giới hạn còn lại (không phải lỗi, ghi nhận theo Trường hợp biên): tải lại cứng (hard reload) trang khi đang mất mạng thất bại — dev server chưa có service worker để phục vụ shell ứng dụng offline. Lời hứa "hoạt động ngoại tuyến" đúng với điều hướng trong phiên đã mở, chưa đúng với việc reload toàn trang lúc mất mạng. Đã ghi chú giới hạn này vào [feature doc](../features/2_mo_va_xem_tai_lieu_cuc_bo_feature.md).
