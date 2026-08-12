# US-4: Dùng đầy đủ tính năng cục bộ khi chưa đăng nhập

**Feature:** [Đăng nhập & tài khoản người dùng](../features/1_dang_nhap_va_tai_khoan_nguoi_dung_feature.md)
**Trạng thái:** 🟡 Đang làm
**Dữ liệu rời máy:** Không

---

## Câu chuyện

> **Là** người dùng chưa đăng nhập, **tôi muốn** mở, xem, sửa và tải về tài liệu bình thường, **để** không bị ép tạo tài khoản chỉ vì muốn dùng ứng dụng ở chế độ cục bộ.

## Mong muốn

- [ ] Không route nào trong luồng mở/xem/sửa/tải về cục bộ redirect người dùng chưa đăng nhập sang trang đăng nhập
- [ ] Không có banner/modal nào ép đăng nhập khi chỉ dùng tính năng cục bộ
- [ ] Rà soát toàn bộ route hiện có xác nhận không route cục bộ nào bị chặn bởi guard đăng nhập

## Task

- [ ] [TASK-7: Rà soát route xác nhận ranh giới cục bộ/đám mây không bị đăng nhập chặn nhầm](../tasks/7_ra_soat_route_cuc_bo_task.md) · #7

## Xong khi

Mọi ô ở **Mong muốn** và **Task** đều tick → đổi **Trạng thái** thành ✅ Xong, rồi tick dòng tương ứng trong file feature.
