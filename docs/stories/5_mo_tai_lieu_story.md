# US-5: Mở tài liệu bằng kéo–thả hoặc chọn file

**Feature:** [Mở và xem tài liệu cục bộ](../features/2_mo_va_xem_tai_lieu_cuc_bo_feature.md)
**Trạng thái:** ⬜ Nháp
**Dữ liệu rời máy:** Không

---

## Câu chuyện

> **Là** người dùng chưa đăng nhập, **tôi muốn** kéo–thả hoặc chọn một hay nhiều file tài liệu từ máy, **để** mở chúng ra dùng ngay mà không cần tải lên đâu cả.

## Mong muốn

- [ ] Kéo file vào vùng thả (hoặc bấm chọn từ hộp thoại hệ điều hành) → file được đọc và lưu lại cục bộ (OPFS + metadata IndexedDB), xuất hiện ngay trong danh sách tài liệu
- [ ] Thả nhiều file cùng lúc → mỗi file xử lý độc lập, một file lỗi không chặn các file còn lại
- [ ] Tài liệu vừa mở mang nhãn 🔒 Cục bộ
- [ ] File đúng định dạng hỗ trợ (`.docx` `.doc` `.xlsx` `.xls` `.pptx` `.ppt` `.pdf` `.txt` `.md`) nhưng không phải PDF vẫn lưu và liệt kê được — chỉ chưa xem được (xem [US-7](7_xem_pdf_cuc_bo_story.md))
- [ ] Tab Network của DevTools không có request nào chứa nội dung file trong suốt luồng chọn → lưu
- [ ] File sai định dạng (không thuộc danh sách hỗ trợ) → báo lỗi rõ ràng ngay tại vùng thả, không thêm vào danh sách, không làm sập trang
- [ ] Trình duyệt không hỗ trợ OPFS → báo rõ "trình duyệt không tương thích" thay vì âm thầm mất dữ liệu hoặc lỗi khó hiểu

## Task

- [x] [TASK-12: Lớp lưu trữ OPFS + IndexedDB](../tasks/12_luu_tru_opfs_indexeddb_task.md) · #23
- [ ] [TASK-13: Vùng kéo–thả / chọn file](../tasks/13_vung_keo_tha_task.md) · #25

## Xong khi

Mọi ô ở **Mong muốn** và **Task** đều tick → đổi **Trạng thái** thành ✅ Xong, rồi tick dòng tương ứng trong file feature.
