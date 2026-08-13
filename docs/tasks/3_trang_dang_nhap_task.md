# TASK-3: Trang đăng nhập + xử lý lỗi sai thông tin

**Story:** [US-2](../stories/2_dang_nhap_dang_xuat_story.md)
**Issue:** #3 · **Nhánh:** `feat/trang-dang-nhap`
**Trạng thái:** ✅ Xong

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
- [x] Kiểm thử qua Playwright MCP (RULE.md §9, trình duyệt thật): đăng ký ở `/login` → vào ngay; đăng xuất → đăng nhập lại đúng → **redirect về `/`**, header hiển thị avatar trên mọi trang; đăng xuất → nhập sai mật khẩu → Alert hiện đúng "Invalid email or password.", form giữ nguyên giá trị đã nhập, nút hết loading

## Ghi chú

Dùng chung route với TASK-2 (cùng file, hai chế độ đăng nhập/đăng ký) — làm sau hoặc song song, tránh hai người sửa cùng file nếu chạy song song.

Refactor sang `useMutation` (TanStack Query) theo yêu cầu bổ sung giữa chừng — xem [TASK-10](10_to_chuc_schemas_va_constants_task.md) cho phần tách `schemas/`/`constants/`. Cả hai gộp chung một PR vì cùng đụng `login.tsx` chưa từng tồn tại trên `main`.

Playwright MCP rớt kết nối liên tục lúc mới làm task này (xem [TASK-9](9_them_not_found_component_task.md)) nên ban đầu phải dùng `curl` thay thế; sau khi kết nối lại đã chạy đủ kiểm thử UI thật, kết quả khớp hoàn toàn với những gì `curl` đã xác nhận trước đó.

Phát hiện thêm (ngoài phạm vi task này, không sửa ở đây): bug khuếch đại console-piping của `@tanstack/devtools-vite` (đã ghi ở TASK-9) không chỉ xảy ra với cảnh báo "notFoundError" mà với **bất kỳ** `console.warn`/`error` nào phía server — ví dụ Better Auth tự log "Invalid password" mỗi lần đăng nhập sai cũng bị khuếch đại. `notFoundComponent` ở TASK-9 chỉ chặn được một nguồn cụ thể, chưa phải sửa gốc. Không ảnh hưởng người dùng thật (chỉ lộ trong console dev), nhưng đáng cân nhắc báo lên upstream `@tanstack/devtools-vite` nếu tiếp tục gây phiền khi kiểm thử.

**Rebase lên `main` sau khi TASK-9 (#12) và TASK-11 (#16) merge** phát sinh conflict thật ở `src/routes/__root.tsx` — cả hai bên cùng sửa phần import/khai báo `Route` (TASK-9 thêm `notFoundComponent`, PR này đổi `createRootRoute` → `createRootRouteWithContext` cho `QueryClient`). Đã gộp cả hai import, giữ nguyên hành vi cả hai bên. Trong lúc rebase phát hiện thêm: `src/routes/demo/better-auth.tsx` **chưa từng thực sự bị xoá** dù mục "Việc cần làm" đã tick — file vẫn nằm trong git suốt các commit trước, chỉ có `header.tsx`/`header-user.tsx` được cập nhật đúng. Đã `git rm` thật trong lúc resolve conflict, xác nhận lại bằng `curl` (`/demo/better-auth` → 404 qua trang not-found tuỳ chỉnh của TASK-9).
