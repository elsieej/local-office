# TASK-14: Trang danh sách tài liệu

**Story:** [US-6](../stories/6_danh_sach_tai_lieu_story.md)
**Issue:** #27 · **Nhánh:** `feat/danh-sach-tai-lieu`
**Trạng thái:** ✅ Xong

---

## Mục tiêu

Hiện danh sách tài liệu đã lưu cục bộ (đọc từ IndexedDB qua TASK-12) trên trang chủ — tên, loại, dung lượng, thời gian mở, trạng thái — thay cho danh sách tạm trong `UploadDropzone` của TASK-13. Chưa có mở lại/xoá — để TASK-15.

## Việc cần làm

- [x] Component `DocumentList`: `useQuery` (`@tanstack/react-query`) gọi `listDocuments`, hiện skeleton lúc đang tải, `Empty` kèm gợi ý khi rỗng, `Alert destructive` khi lỗi · `src/components/document-list.tsx`
- [x] Hàng trong danh sách dùng `Item`/`ItemMedia`/`ItemContent`/`ItemTitle`/`ItemDescription`: icon theo loại tài liệu, tên, dung lượng + thời gian mở, `DocumentStateBadge` · `src/components/document-list.tsx`
- [x] Component `DocumentKindIcon` map `DocumentKind` → icon `lucide-react` (word/excel/powerpoint/pdf/text/markdown) · `src/components/document-kind-icon.tsx`
- [x] Hàm định dạng dùng chung: `formatDocumentSize` (B/KB/MB), `formatDocumentOpenedAt` (`Intl.DateTimeFormat('vi-VN')`) · `src/lib/documents/format.ts`
- [x] Hằng số `DOCUMENTS_QUERY_KEY` dùng chung giữa `DocumentList` và nơi ghi (để invalidate cache) · `src/lib/documents/store.ts`
- [x] `UploadDropzone` sau khi lưu thành công gọi `queryClient.invalidateQueries({ queryKey: DOCUMENTS_QUERY_KEY })` thay vì tự quản danh sách "vừa mở" tạm thời — xoá state `savedDocuments` và phần render tương ứng · `src/components/upload-dropzone.tsx`
- [x] Gắn `DocumentList` vào trang chủ, dưới `UploadDropzone` · `src/routes/index.tsx`

## Kiểm thử

- [x] `npm run lint` sạch
- [x] Kiểm thử qua Playwright MCP: danh sách rỗng lúc chưa mở file nào → hiện gợi ý mở file, không phải khoảng trắng
- [x] Kiểm thử qua Playwright MCP: mở file qua `UploadDropzone` → xuất hiện ngay trong `DocumentList` (không cần F5, `invalidateQueries` kích hoạt refetch), đúng tên/dung lượng/thời gian/trạng thái 🔒 Cục bộ
- [x] Kiểm thử qua Playwright MCP: tải lại trang (`browser_navigate` lại `/`) → danh sách vẫn còn đủ, đọc từ IndexedDB chứ không phải state trong tab
- [x] Trường hợp biên: mở tab mới (không phải reload) trỏ `localhost:3000` → danh sách đồng bộ đúng dữ liệu đã lưu trước đó

## Ghi chú

Danh sách "vừa mở" tạm trong `UploadDropzone` (TASK-13) bị xoá trong task này — thay bằng vòng đời chuẩn qua `@tanstack/react-query`: ghi xong thì invalidate, danh sách tự fetch lại. Tách quyết định UI này khỏi state cục bộ trong component để TASK-15 (xoá tài liệu) cũng invalidate cùng key mà không cần biết `UploadDropzone` tồn tại.
