# TASK-10: Tổ chức `src/schemas/` (zod) và `src/constants/error-response.ts`

**Story:** Không thuộc user story nào — refactor phát sinh khi làm [TASK-3](3_trang_dang_nhap_task.md): schema `zod` và mã lỗi Better Auth hiện đang khai báo thẳng trong `src/routes/login.tsx`, cần tách ra chỗ dùng chung trước khi các route khác cũng cần validate/xử lý lỗi tương tự.
**Issue:** #14 · **Nhánh:** `feat/trang-dang-nhap` (làm chung với TASK-3, vì code cần tách chưa tồn tại trên `main`)
**Trạng thái:** 🔵 Chờ review

---

## Mục tiêu

Lập quy ước thư mục cho hai loại thứ dùng chung xuyên route: schema `zod` (`src/schemas/`) và mã lỗi kèm thông điệp hiển thị (`src/constants/error-response.ts`). Áp dụng ngay cho `SIGN_IN_SCHEMA`/`SIGN_UP_SCHEMA` và các mã lỗi Better Auth đang nằm trong `login.tsx`.

## Việc cần làm

- [x] Tạo `src/schemas/auth.ts`, chuyển `SIGN_IN_SCHEMA`/`SIGN_UP_SCHEMA` từ `login.tsx` sang đây, export ra dùng lại · `src/schemas/auth.ts`
- [x] Tạo `src/constants/error-response.ts`: `AUTH_ERROR_CODE` (map tên gợi nhớ → code thật của Better Auth) và `AUTH_ERROR_MESSAGE` (map code → thông điệp hiển thị) · `src/constants/error-response.ts`
- [x] Cập nhật `src/routes/login.tsx` dùng lại hai chỗ trên thay vì hằng số khai báo tại chỗ — tiện thể bỏ luôn điều kiện `!isSignUp` thừa khi tra `AUTH_ERROR_MESSAGE` (code `INVALID_EMAIL_OR_PASSWORD` vốn chỉ Better Auth trả về lúc đăng nhập) · `src/routes/login.tsx`
- [x] Cập nhật `docs/RULE.md` mục 3 (Import) ghi quy ước: schema zod dùng chung đặt ở `src/schemas/<domain>.ts`, mã lỗi + thông điệp đặt ở `src/constants/error-response.ts`; cập nhật `docs/TECHSTACK.md` mục cấu trúc thư mục và bảng gói (thêm `@tanstack/react-query`) · `docs/RULE.md`, `docs/TECHSTACK.md`

## Kiểm thử

- [x] `npm run lint` sạch, `npx tsc --noEmit` không lỗi mới (chỉ còn lỗi cũ ở `drizzle.config.ts`, không liên quan)
- [x] `npm run format` không đổi gì thêm sau khi tách file
- [x] Kiểm thử qua `curl`: đăng ký, đăng ký trùng, sai mật khẩu, email không tồn tại, đăng nhập đúng → cả 5 case trả đúng code/message như trước khi tách (refactor thuần, không đổi hành vi)

## Ghi chú

Làm cùng nhánh với TASK-3 vì `login.tsx` (nơi cần tách code ra) chưa tồn tại trên `main` — tách task riêng chỉ để ghi lại quyết định thiết kế và audit trail, PR sẽ gộp chung với TASK-3 (`Closes #3, Closes #<số issue task này>`).

Quy ước `src/schemas/` và `src/constants/error-response.ts` áp dụng cho toàn dự án từ đây trở đi, không riêng auth — feature đám mây/tài liệu sau này validate input cũng nên theo đúng hai chỗ này thay vì khai báo rải rác trong route.
