# US-7: Xem tài liệu PDF cục bộ

**Feature:** [Mở và xem tài liệu cục bộ](../features/2_mo_va_xem_tai_lieu_cuc_bo_feature.md)
**Trạng thái:** ⬜ Nháp
**Dữ liệu rời máy:** Không

---

## Câu chuyện

> **Là** người dùng đã mở một file `.pdf`, **tôi muốn** xem nội dung ngay trong trình duyệt, **để** không cần cài phần mềm đọc PDF nào khác.

## Mong muốn

- [ ] Mở tài liệu `.pdf` từ danh sách → nội dung trang đầu hiện ra, điều hướng qua lại giữa các trang được
- [ ] Phóng to / thu nhỏ trang xem được
- [ ] Tìm kiếm nội dung trong tài liệu, nhảy tới kết quả khớp
- [ ] Toàn bộ luồng xem hoạt động khi tắt mạng (đã mở file trước đó) — không request nào ra ngoài
- [ ] Mở tài liệu `.docx`/`.xlsx`/`.pptx`/`.doc`/`.xls`/`.ppt` từ danh sách → thông báo rõ "chưa hỗ trợ xem định dạng này", không trang trắng, không lỗi console
- [ ] PDF hỏng/không đọc được → báo lỗi rõ ràng, không làm treo trang

## Task

- [ ] [TASK-16: Tích hợp pdf.js — trang xem PDF](../tasks/16_pdf_viewer_task.md) · #TBD
- [ ] [TASK-17: Placeholder định dạng chưa hỗ trợ + kiểm thử ngoại tuyến](../tasks/17_placeholder_ngoai_tuyen_task.md) · #TBD

## Xong khi

Mọi ô ở **Mong muốn** và **Task** đều tick → đổi **Trạng thái** thành ✅ Xong, rồi tick dòng tương ứng trong file feature.
