# US-6: Danh sách tài liệu đã mở

**Feature:** [Mở và xem tài liệu cục bộ](../features/2_mo_va_xem_tai_lieu_cuc_bo_feature.md)
**Trạng thái:** ⬜ Nháp
**Dữ liệu rời máy:** Không

---

## Câu chuyện

> **Là** người dùng đã mở vài tài liệu, **tôi muốn** thấy danh sách chúng kèm trạng thái, **để** mở lại đúng file cần dùng và dọn bớt file không cần nữa.

## Mong muốn

- [ ] Danh sách hiển thị tên, loại, dung lượng, thời gian mở, trạng thái (🔒 Cục bộ) cho mọi tài liệu đã lưu
- [ ] Danh sách đọc từ IndexedDB, không phụ thuộc state trong bộ nhớ tab — tải lại trang hay mở tab mới vẫn thấy đủ
- [ ] Bấm vào một tài liệu → mở lại đúng file đó (điều hướng tới trang xem tương ứng)
- [ ] Xoá một tài liệu → xoá cả bytes trong OPFS lẫn metadata trong IndexedDB, không còn bản sao nào, biến mất khỏi danh sách ngay
- [ ] Danh sách rỗng → hiện gợi ý mở file thay vì khoảng trắng
- [ ] Đang tải danh sách → hiện skeleton, không giật layout khi dữ liệu về

## Task

- [ ] [TASK-14: Trang danh sách tài liệu](../tasks/14_danh_sach_tai_lieu_task.md) · #TBD
- [ ] [TASK-15: Mở lại và xoá tài liệu cục bộ](../tasks/15_mo_lai_xoa_tai_lieu_task.md) · #TBD

## Xong khi

Mọi ô ở **Mong muốn** và **Task** đều tick → đổi **Trạng thái** thành ✅ Xong, rồi tick dòng tương ứng trong file feature.
