# US-2: Đăng nhập & đăng xuất bằng email/mật khẩu

**Feature:** [Đăng nhập & tài khoản người dùng](../features/1_dang_nhap_va_tai_khoan_nguoi_dung_feature.md)
**Trạng thái:** ✅ Xong
**Dữ liệu rời máy:** Có → người dùng xác nhận tại bước bấm "Đăng nhập" / "Đăng xuất"

---

## Câu chuyện

> **Là** người dùng đã có tài khoản, **tôi muốn** đăng nhập bằng email/mật khẩu và đăng xuất khi xong, **để** kiểm soát khi nào ứng dụng biết danh tính của tôi.

## Mong muốn

- [x] Nhập đúng email/mật khẩu → vào ứng dụng, phiên được tạo
- [x] Nhập sai email hoặc mật khẩu → báo lỗi chung chung ("email hoặc mật khẩu không đúng"), không tiết lộ email nào đã tồn tại
- [x] Bấm đăng xuất → phiên bị huỷ ngay lập tức
- [x] Trang đăng nhập/đăng ký dùng chung một route rõ ràng của ứng dụng (không còn là `/demo/better-auth`)

## Task

- [x] [TASK-3: Trang đăng nhập + xử lý lỗi sai thông tin](../tasks/3_trang_dang_nhap_task.md) · #3
- [x] [TASK-4: Nút đăng xuất tích hợp trong header](../tasks/4_dang_xuat_task.md) · #4

## Xong khi

Mọi ô ở **Mong muốn** và **Task** đều tick → đổi **Trạng thái** thành ✅ Xong, rồi tick dòng tương ứng trong file feature.
