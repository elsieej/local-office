# TASK-12: Lớp lưu trữ OPFS + IndexedDB

**Story:** [US-5](../stories/5_mo_tai_lieu_story.md)
**Issue:** #23 · **Nhánh:** `feat/luu-tru-opfs-indexeddb`
**Trạng thái:** ✅ Xong

---

## Mục tiêu

Dựng lớp lưu trữ tài liệu cục bộ dùng chung cho mọi task sau: ghi/đọc/xoá bytes qua OPFS, ghi/đọc/xoá metadata qua IndexedDB, không có UI.

## Việc cần làm

- [x] Thêm `idb` vào `dependencies` · `package.json`
- [x] Định nghĩa type `Document` (`id`, `name`, `extension`, `kind`, `size`, `openedAt`, `state: 'local'`) · `src/lib/documents/types.ts`
- [x] Module IndexedDB: mở DB `local-office`, object store `documents` (keyPath `id`), hàm `putDocumentMeta` / `getDocumentMeta` / `listDocumentMeta` / `deleteDocumentMeta` dùng `idb` · `src/lib/documents/metadata-store.ts`
- [x] Module OPFS: `navigator.storage.getDirectory()` → thư mục con `documents/`, hàm `writeDocumentBytes(id, file)` / `readDocumentBytes(id)` / `deleteDocumentBytes(id)`, phát hiện OPFS không tồn tại và throw `OpfsUnsupportedError` để UI bắt được · `src/lib/documents/opfs-store.ts`
- [x] Hàm cấp cao gộp cả hai: `saveDocument(file)` (validate định dạng + dung lượng, ghi bytes + metadata, trả về `Document`), `deleteDocument(id)` (xoá cả hai, đúng thứ tự để không mồ côi nếu một bước lỗi giữa chừng), `openDocument(id)`, `listDocuments()` · `src/lib/documents/store.ts`
- [x] Danh sách định dạng hỗ trợ (đuôi → kind) + hằng số dung lượng tối đa dùng chung · `src/constants/document.ts`
- [x] Lỗi có type riêng (`OpfsUnsupportedError`, `DocumentNotFoundError`, `UnsupportedDocumentTypeError`, `DocumentTooLargeError`) để UI bắt theo `instanceof`/`error.name` · `src/lib/documents/errors.ts`

## Kiểm thử

- [x] `npm run lint` sạch
- [x] Kiểm thử tay qua `browser_run_code_unsafe` (dynamic import module thật từ Vite dev server): `saveDocument` file 5 byte → `listDocuments` trả 1 mục, `openDocument` đọc lại đúng 5 byte, `deleteDocument` → danh sách rỗng, `openDocument` lại → throw `DocumentNotFoundError`
- [x] Trường hợp biên: thay `navigator.storage` bằng object rỗng (giả lập trình duyệt không hỗ trợ OPFS) → `saveDocument` throw đúng `OpfsUnsupportedError`, không crash, 0 lỗi console

## Ghi chú

Task nền tảng — TASK-13/14/15/16 đều import từ `src/lib/documents/`. Không có route/UI nào trong task này; kiểm thử làm bằng `import()` module thật ngay trong console trình duyệt qua Playwright MCP, không cần trang test tạm.

`@typescript-eslint/no-unnecessary-condition` chặn kiểu tra runtime thường gặp cho feature detection (`navigator.storage?.getDirectory`) vì kiểu DOM hiện tại coi `getDirectory` luôn tồn tại — trình duyệt cũ thật sự không có. Dùng `'getDirectory' in navigator.storage` để lint không báo lỗi mà vẫn tra đúng lúc chạy.

`deleteDocument` xoá bytes (OPFS) trước rồi mới xoá metadata (IndexedDB) — nếu crash giữa chừng, còn lại metadata mồ côi trỏ tới bytes đã mất (phát hiện được ngay khi mở lại, ra `DocumentNotFoundError`), an toàn hơn chiều ngược lại vốn để lại bytes mồ côi trong OPFS chiếm dung lượng vĩnh viễn mà không có metadata nào trỏ tới để dọn.
