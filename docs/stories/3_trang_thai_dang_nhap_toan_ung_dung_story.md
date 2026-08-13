# US-3: Trạng thái đăng nhập nhất quán trên toàn ứng dụng

**Feature:** [Đăng nhập & tài khoản người dùng](../features/1_dang_nhap_va_tai_khoan_nguoi_dung_feature.md)
**Trạng thái:** ✅ Xong
**Dữ liệu rời máy:** Không

---

## Câu chuyện

> **Là** người dùng đã đăng nhập, **tôi muốn** thấy trạng thái đăng nhập của mình trên mọi trang và giữ nguyên sau khi tải lại trang, **để** không phải đăng nhập lại liên tục hay đoán xem mình đã đăng nhập chưa.

## Mong muốn

- [x] Header hiển thị avatar/tên khi đã đăng nhập, nút "Đăng nhập" khi chưa — trên mọi route của app, không riêng trang demo
- [x] Tải lại trang khi đang đăng nhập → vẫn đăng nhập, không bị đẩy về trạng thái ẩn danh
- [x] Trong lúc đang xác định trạng thái phiên lúc tải trang, header hiển thị skeleton thay vì nhấp nháy giữa hai trạng thái
- [x] Phiên hết hạn → header tự chuyển về trạng thái chưa đăng nhập ở lần tải trang kế tiếp, không báo lỗi (kiểm chứng qua proxy: cookie phiên rác/không hợp lệ → `get-session` trả `null`, header về "Sign in", không lỗi — cùng đường xử lý server-side mà phiên hết hạn thật sẽ đi qua; xem TASK-6, chưa đợi đủ 7 ngày để test hết hạn thật)

## Task

- [x] [TASK-5: Tích hợp header-user vào layout chính cho mọi route](../tasks/5_hien_thi_trang_thai_header_task.md) · #5
- [x] [TASK-6: Kiểm chứng phiên tồn tại qua reload sau khi nối database adapter](../tasks/6_ghi_nho_phien_dang_nhap_task.md) · #6

## Xong khi

Mọi ô ở **Mong muốn** và **Task** đều tick → đổi **Trạng thái** thành ✅ Xong, rồi tick dòng tương ứng trong file feature.
