# TASK-3: Trang đăng nhập + xử lý lỗi sai thông tin

**Story:** [US-2](../stories/2_dang_nhap_dang_xuat_story.md)
**Issue:** #3 · **Nhánh:** `feat/trang-dang-nhap`
**Trạng thái:** 🔵 Chờ review

---

## Mục tiêu

Hoàn thiện chế độ đăng nhập của route dùng chung (từ TASK-2) với thông báo lỗi chung chung khi sai email/mật khẩu, không tiết lộ email nào tồn tại.

## Việc cần làm

- [x] Xử lý lỗi từ `authClient.signIn.email` thành một thông điệp chung ("Invalid email or password.") dựa trên `error.code === INVALID_EMAIL_OR_PASSWORD` — Better Auth đã tự gộp sẵn "user not found" và "wrong password" thành cùng một code · `src/routes/login.tsx`, `src/constants/error-response.ts`
- [x] Sau đăng nhập thành công, điều hướng về trang chủ (`/`) thay vì ở lại form (đăng ký vẫn ở lại form hiện "Welcome back" như TASK-2, không đổi) · `src/routes/login.tsx`
- [x] Cập nhật liên kết "Đăng nhập" ở `header-user.tsx` trỏ đúng route `/login`, xoá `src/routes/demo/better-auth.tsx` và mục "Better Auth" trong dropdown Demos ở `header.tsx` (route mới đã thay thế hoàn toàn) · `src/integrations/better-auth/header-user.tsx`, `src/components/header.tsx`, `src/routes/demo/better-auth.tsx`

## Kiểm thử

- [x] `npm run lint` sạch
- [x] Kiểm thử qua `curl` (Origin khớp `BETTER_AUTH_URL`): đăng nhập đúng email/mật khẩu → 200
- [x] Kiểm thử qua `curl`: sai mật khẩu và email không tồn tại → cả hai đều trả `code: INVALID_EMAIL_OR_PASSWORD`, `message: "Invalid email or password"` giống hệt nhau
- [x] Trường hợp biên: `submitAuthForm` bọc `try/catch` quanh lời gọi `authClient` — lỗi mạng (fetch reject) rơi vào nhánh `catch`, trả về lỗi chung "An unexpected error occurred" qua `useMutation`, nút submit tự hết trạng thái loading nhờ `authMutation.isPending` (React Query tự quản lý, không còn `finally` thủ công)

## Ghi chú

Dùng chung route với TASK-2 (cùng file, hai chế độ đăng nhập/đăng ký) — làm sau hoặc song song, tránh hai người sửa cùng file nếu chạy song song.

Refactor sang `useMutation` (TanStack Query) theo yêu cầu bổ sung giữa chừng — xem [TASK-10](10_to_chuc_schemas_va_constants_task.md) cho phần tách `schemas/`/`constants/`. Cả hai gộp chung một PR vì cùng đụng `login.tsx` chưa từng tồn tại trên `main`.

Playwright MCP rớt kết nối liên tục trong lúc làm task này (xem [TASK-9](9_them_not_found_component_task.md)) — phần lớn kiểm thử ở đây dùng `curl` thay thế. Nên chạy lại kiểm thử UI đầy đủ qua Playwright MCP khi có điều kiện, trước khi coi task này chốt hoàn toàn.
