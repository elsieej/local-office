# TASK-2: Trang đăng ký ở route chính thức

**Story:** [US-1](../stories/1_dang_ky_tai_khoan_story.md)
**Issue:** #2 · **Nhánh:** `feat/trang-dang-ky`
**Trạng thái:** ✅ Xong

---

## Mục tiêu

Chuyển form đăng ký từ route demo sang route chính thức của ứng dụng, với thông báo lỗi cho email trùng và validate phía client.

## Việc cần làm

- [x] Tạo route `/login` dùng lại logic form từ `src/routes/demo/better-auth.tsx`, bỏ nhãn "BETTER-AUTH" ở footer · `src/routes/login.tsx`
- [x] Validate client bằng `zod` trước khi gọi `authClient.signUp.email` — chặn submit khi email sai định dạng hoặc mật khẩu < 8 ký tự · `src/routes/login.tsx`
- [x] Xử lý lỗi email đã tồn tại trả về từ server (`error.code === 'USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL'`), hiển thị trong `Alert` kèm nút "Sign in instead" chuyển sang chế độ đăng nhập · `src/routes/login.tsx`
- [x] **Không xoá** `src/routes/demo/better-auth.tsx` — `header-user.tsx` vẫn trỏ "Sign in" tới đó, xoá ngay sẽ 404; việc cập nhật liên kết và xoá thuộc TASK-3 · ghi chú bên dưới

## Kiểm thử

- [x] `npm run lint` sạch
- [x] Kiểm thử qua Playwright MCP (RULE.md §9): đăng ký với email/mật khẩu hợp lệ tại `/login` → vào ứng dụng ngay, không cần đăng nhập lại
- [x] Kiểm thử qua Playwright MCP: đăng xuất, đăng ký lại bằng email vừa dùng → thấy "User already exists. Use another email." kèm nút "Sign in instead"; bấm nút đó → chuyển đúng sang chế độ đăng nhập, còn giữ email đã nhập; đăng nhập lại bằng tài khoản đó → thành công (xác nhận không tạo bản ghi trùng)
- [x] Trường hợp biên: mật khẩu 5 ký tự → HTML5 `minLength` chặn submit trước khi tới JS, xác nhận qua `browser_network_requests` không có request `sign-in`/`sign-up` nào được gửi

## Ghi chú

Phụ thuộc TASK-1 đã nối database adapter để kiểm thử thật (không phải chỉ kiểm thử UI).

Route đặt tên `/login` (không phải `/dang-nhap`) — khớp với phần còn lại của UI hiện đang toàn tiếng Anh (Header, Footer, form gốc từ demo). Đổi sang tiếng Việt toàn UI là quyết định ngoài phạm vi task này.

`demo/better-auth.tsx` vẫn còn tồn tại song song với `/login` cho tới khi TASK-3 cập nhật xong liên kết header và xoá nó.
