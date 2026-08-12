# TASK-2: Trang đăng ký ở route chính thức

**Story:** [US-1](../stories/1_dang_ky_tai_khoan_story.md)
**Issue:** #2 · **Nhánh:** `feat/trang-dang-ky`
**Trạng thái:** ⬜ Chưa làm

---

## Mục tiêu

Chuyển form đăng ký từ route demo sang route chính thức của ứng dụng, với thông báo lỗi cho email trùng và validate phía client.

## Việc cần làm

- [ ] Tạo route `/dang-nhap` (hoặc `/login`) dùng lại logic form từ `src/routes/demo/better-auth.tsx`, bỏ nhãn "BETTER-AUTH" ở footer · `src/routes/`
- [ ] Validate client bằng `zod` trước khi gọi `authClient.signUp.email` — chặn submit khi email sai định dạng hoặc mật khẩu < 8 ký tự · route mới
- [ ] Xử lý lỗi email đã tồn tại trả về từ server, hiển thị trong `Alert` kèm gợi ý chuyển sang đăng nhập · route mới
- [ ] Xoá `src/routes/demo/better-auth.tsx` sau khi route mới thay thế hoàn toàn (hoặc để lại nếu còn route demo khác dùng chung — xác nhận trước khi xoá) · `src/routes/demo/`

## Kiểm thử

- [ ] `npm run lint` sạch
- [ ] Kiểm thử tay: đăng ký với email/mật khẩu hợp lệ → vào ứng dụng ngay, không cần đăng nhập lại
- [ ] Kiểm thử tay: đăng ký lại bằng email vừa dùng → thấy lỗi rõ ràng, không tạo bản ghi mới trong DB
- [ ] Trường hợp biên: mật khẩu 7 ký tự / email không có `@` → lỗi hiện ngay tại form, không có request nào gửi lên server

## Ghi chú

Phụ thuộc TASK-1 đã nối database adapter để kiểm thử thật (không phải chỉ kiểm thử UI).
