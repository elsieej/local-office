# TASK-15: Mở lại và xoá tài liệu cục bộ

**Story:** [US-6](../stories/6_danh_sach_tai_lieu_story.md)
**Issue:** #29 · **Nhánh:** `feat/mo-lai-xoa-tai-lieu` (stack trên `feat/danh-sach-tai-lieu`, xem Ghi chú)
**Trạng thái:** ✅ Xong

---

## Mục tiêu

Từ danh sách (TASK-14), mở lại một tài liệu ra trang chi tiết (tên/loại/dung lượng/trạng thái, tải về đúng định dạng gốc), và xoá được tài liệu cục bộ — cả bytes lẫn metadata, biến mất khỏi danh sách ngay.

## Việc cần làm

- [x] `getDocument(id)` — đọc metadata một tài liệu, bọc `getDocumentMeta` đã có sẵn từ TASK-12 · `src/lib/documents/store.ts`
- [x] Route `/documents/$documentId`: đọc metadata qua `useQuery`, hiện tên/loại/dung lượng/thời gian mở/trạng thái, nút "Tải về" (dựng lại đúng file gốc từ `openDocument`, không phải bản chuyển đổi) và nút "Xoá", nút quay lại `/` · `src/routes/documents/$documentId.tsx`
- [x] Trang chi tiết: tài liệu không tồn tại (id sai, hoặc vừa bị xoá ở tab khác) → thông báo rõ, không crash · `src/routes/documents/$documentId.tsx`
- [x] `DocumentList`: tên tài liệu là `Link` tới `/documents/$documentId` (chỉ phần tên là link, tránh lồng interactive trong `Item` — bài học từ TASK-13) · `src/components/document-list.tsx`
- [x] `DocumentList`: nút xoá riêng từng dòng (`ItemActions`, icon thùng rác), xác nhận qua `window.confirm` trước khi gọi `deleteDocument`, xong thì `invalidateQueries` · `src/components/document-list.tsx`
- [x] Xoá từ trang chi tiết cũng xác nhận qua `window.confirm`, xong thì `invalidateQueries` + điều hướng về `/` · `src/routes/documents/$documentId.tsx`
- [x] `npm run generate-routes` cập nhật `routeTree.gen.ts`

## Kiểm thử

- [x] `npm run lint` sạch
- [x] Kiểm thử qua Playwright MCP: bấm tên tài liệu trong danh sách → sang `/documents/$documentId`, đúng thông tin
- [x] Kiểm thử qua Playwright MCP: bấm "Tải về" → file tải xuống đúng tên gốc, đúng số byte với file gốc (khứ hồi — không phải bản chuyển đổi)
- [x] Kiểm thử qua Playwright MCP: xoá từ danh sách → biến mất khỏi danh sách ngay, không cần F5; truy vấn lại OPFS/IndexedDB trực tiếp xác nhận không còn bản sao nào
- [x] Kiểm thử qua Playwright MCP: xoá từ trang chi tiết → điều hướng về `/`, tài liệu không còn trong danh sách
- [x] Trường hợp biên: vào thẳng `/documents/<id-không-tồn-tại>` → thông báo rõ, không crash, không lỗi console

## Ghi chú

**Stack trên `feat/danh-sach-tai-lieu` thay vì `main`**: PR #28 (TASK-14) chưa merge lúc bắt đầu task này, nhưng task này sửa trực tiếp `DocumentList` mà TASK-14 vừa tạo — branch từ `main` lúc này sẽ thiếu file đó. PR của task này mở với base là `feat/danh-sach-tai-lieu`; khi #28 merge và nhánh đó bị xoá, GitHub tự trỏ lại base PR này về `main`.

Nút xoá dùng `window.confirm` thay vì dựng `AlertDialog` — shadcn chưa có sẵn component này trong repo (`src/components/ui/` hiện không có `alert-dialog.tsx`), thêm cho một hành động sẽ là over-engineering ở quy mô hiện tại; native confirm vẫn thoả yêu cầu "xác nhận trước khi xoá" mà không cần gói/component mới.

**Lỗi phát hiện qua kiểm thử thật (trường hợp id không tồn tại)**: `getDocument` ban đầu trả `Document | undefined` (bọc thẳng `getDocumentMeta`) — `@tanstack/react-query` không cho phép `queryFn` resolve `undefined` (coi là lỗi runtime của chính react-query, tự log "Query data cannot be undefined..."), nên nhánh "không tìm thấy" không bao giờ chạy tới được, luôn rơi vào nhánh lỗi chung "Không đọc được tài liệu". Sửa bằng đổi `getDocument` trả `Document | null` thay vì `undefined` — `null` là kết quả thành công hợp lệ với react-query. Chỉ phát hiện được nhờ test tay qua Playwright MCP với id giả, không thấy được nếu chỉ đọc code.
