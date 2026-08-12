# TASK-3: Trang đăng nhập + xử lý lỗi sai thông tin

**Story:** [US-2](../stories/2_dang_nhap_dang_xuat_story.md)
**Issue:** #3 · **Nhánh:** `feat/trang-dang-nhap`
**Trạng thái:** ⬜ Chưa làm

---

## Mục tiêu

Hoàn thiện chế độ đăng nhập của route dùng chung (từ TASK-2) với thông báo lỗi chung chung khi sai email/mật khẩu, không tiết lộ email nào tồn tại.

## Việc cần làm

- [ ] Xử lý lỗi từ `authClient.signIn.email` thành một thông điệp chung ("email hoặc mật khẩu không đúng") bất kể lỗi gốc là email không tồn tại hay sai mật khẩu · route `/dang-nhap`
- [ ] Sau đăng nhập thành công, điều hướng về trang trước đó hoặc trang chủ thay vì ở lại form · route `/dang-nhap`
- [ ] Cập nhật liên kết "Đăng nhập" ở `header-user.tsx` trỏ đúng route mới thay vì `/demo/better-auth` · `src/integrations/better-auth/header-user.tsx`

## Kiểm thử

- [ ] `npm run lint` sạch
- [ ] Kiểm thử tay: đăng nhập đúng email/mật khẩu → vào ứng dụng
- [ ] Kiểm thử tay: sai mật khẩu và email không tồn tại → cả hai đều hiện đúng một thông điệp lỗi giống nhau
- [ ] Trường hợp biên: submit form khi mất mạng → báo lỗi kết nối, không treo nút submit vô thời hạn

## Ghi chú

Dùng chung route với TASK-2 (cùng file, hai chế độ đăng nhập/đăng ký) — làm sau hoặc song song, tránh hai người sửa cùng file nếu chạy song song.
