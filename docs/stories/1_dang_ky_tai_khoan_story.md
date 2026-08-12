# US-1: Đăng ký tài khoản mới

**Feature:** [Đăng nhập & tài khoản người dùng](../features/1_dang_nhap_va_tai_khoan_nguoi_dung_feature.md)
**Trạng thái:** 🟡 Đang làm
**Dữ liệu rời máy:** Có → người dùng xác nhận tại bước bấm "Tạo tài khoản"

---

## Câu chuyện

> **Là** người dùng chưa có tài khoản, **tôi muốn** đăng ký bằng email và mật khẩu, **để** có một danh tính dùng được cho tính năng đám mây sau này.

## Mong muốn

- [ ] Nhập email hợp lệ + mật khẩu ≥ 8 ký tự + tên → bấm "Tạo tài khoản" → tài khoản được tạo và tôi được đăng nhập ngay, không phải đăng nhập lại lần nữa
- [ ] Đăng ký bằng email đã tồn tại → báo lỗi rõ ràng, không tạo tài khoản trùng
- [ ] Mật khẩu dưới 8 ký tự hoặc email sai định dạng → báo lỗi ngay tại form, không gọi server
- [ ] Tài khoản mới thật sự được lưu lại — tải lại trang hoặc mở trình duyệt khác vẫn đăng nhập được bằng tài khoản vừa tạo (xác nhận database adapter đã nối đúng)

## Task

- [ ] [TASK-1: Nối database adapter + migration cho Better Auth](../tasks/1_noi_database_adapter_task.md) · #1
- [ ] [TASK-2: Trang đăng ký ở route chính thức](../tasks/2_trang_dang_ky_task.md) · #2

## Xong khi

Mọi ô ở **Mong muốn** và **Task** đều tick → đổi **Trạng thái** thành ✅ Xong, rồi tick dòng tương ứng trong file feature.
