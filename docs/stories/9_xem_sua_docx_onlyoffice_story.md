# US-9: Xem và sửa tài liệu `.docx` thật qua ONLYOFFICE

**Feature:** [Xem và sửa tài liệu Office thật (ONLYOFFICE)](../features/3_xem_sua_tai_lieu_office_that_feature.md)
**Trạng thái:** ⬜ Nháp
**Dữ liệu rời máy:** Không

---

## Câu chuyện

> **Là** người dùng đã lưu một file `.docx` cục bộ (từ [Feature 2](../features/2_mo_va_xem_tai_lieu_cuc_bo_feature.md)), **tôi muốn** bấm "Xem" hoặc "Sửa" để thấy/chỉnh nội dung thật ngay trong trình duyệt, **để** không cần cài Microsoft Office.

**Phạm vi hẹp hơn Feature 3**: story này chỉ làm `.docx` (ONLYOFFICE `documenteditor`). `.xlsx`/`.pptx` (spreadsheet/presentation editor) để lại cho story sau — xem mục 7 của feature doc.

## Mong muốn

- [ ] Danh sách tài liệu: file `.docx` có 2 hành động riêng "Xem" và "Sửa" (không còn dùng chung một nút mở)
- [ ] Bấm "Xem" → trang chi tiết khởi tạo `DocEditor` ở `editorConfig.mode: 'view'`, nội dung hiện đúng như mở bằng Word, không sửa được
- [ ] Bấm "Sửa" → trang chi tiết khởi tạo `DocEditor` ở `mode: 'edit'`, gõ/sửa được nội dung
- [ ] Đang ở mode Xem, có nút "Chuyển sang Sửa" ngay trên trang chi tiết → huỷ editor cũ, khởi tạo lại ở mode edit, không cần quay lại danh sách
- [ ] Đang ở mode Sửa có thay đổi chưa lưu, người dùng rời trang (quay lại danh sách, chuyển sang mode Xem, đóng tab) → xác nhận qua `window.confirm` trước khi huỷ, giống mẫu đã dùng ở nút Xoá
- [ ] Sửa xong, bấm lưu → file cập nhật lại trong OPFS (vẫn 🔒 Cục bộ), không có request nào gửi nội dung ra ngoài máy
- [ ] Tải về sau khi sửa → file `.docx` mở được bằng Microsoft Office, giữ đúng nội dung đã sửa (khứ hồi thật, không mất định dạng)
- [ ] `browser_network_requests` trong suốt luồng xem/sửa/lưu: không có request nào ra ngoài domain LocalOffice (kế thừa câu hỏi mở từ US-8 — đo được thật lần đầu ở story này vì cần editor chạy thật)
- [ ] Đo dung lượng thật trình duyệt tải ở lần mở editor đầu tiên, so với kỳ vọng "vài giây" của `CLAUDE.md` — ghi kết luận rõ ràng dù đạt hay không đạt (kế thừa từ US-8)
- [ ] File `.docx` hỏng/không parse được → `x2t` báo lỗi rõ, không treo trang, không mất file gốc trong OPFS
- [ ] Trang "Tải mã nguồn" (nghĩa vụ AGPL §13) có link thật trỏ đúng bản đang chạy, hiển thị được từ giao diện chính

## Task

- [x] [TASK-19: Vendor pipeline asset ONLYOFFICE + `x2t.wasm`](../tasks/19_vendor_pipeline_onlyoffice_task.md) · #38
- [ ] TASK-20: Thêm `LICENSE` AGPL-3.0 + trang "Tải mã nguồn" — chưa viết task doc, mở sau khi TASK-19 xong
- [ ] TASK-21: Tích hợp `DocEditor` vào `/documents/$documentId`, 2 nút Xem/Sửa — chưa viết task doc
- [ ] TASK-22: Lưu khứ hồi + đo network payload/egress thật — chưa viết task doc

## Xong khi

Mọi ô ở **Mong muốn** và **Task** đều tick → đổi **Trạng thái** thành ✅ Xong, rồi tick dòng tương ứng trong file feature.
