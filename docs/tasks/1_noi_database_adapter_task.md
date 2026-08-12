# TASK-1: Nối database adapter + migration cho Better Auth

**Story:** [US-1](../stories/1_dang_ky_tai_khoan_story.md)
**Issue:** #1 · **Nhánh:** `feat/noi-database-adapter`
**Trạng thái:** 🔵 Chờ review

---

## Mục tiêu

Làm cho Better Auth chạy có trạng thái thật (không còn stateless): nối `database` adapter và tạo bảng `user`/`session`/`account`/`verification` để phiên đăng ký/đăng nhập được lưu bền vững.

## Việc cần làm

- [x] Nối `pg` Pool làm `database` adapter trong `src/lib/auth.ts`, đọc `DATABASE_URL` từ `.env.local` · `src/lib/auth.ts`
- [x] Sinh migration cho bảng `user`/`session`/`account`/`verification` bằng `npx @better-auth/cli migrate` (hoặc generate rồi `npm run db:migrate`) · `drizzle/`
- [x] Cập nhật `docs/TECHSTACK.md` mục "Mảnh còn thiếu" — bỏ dòng nói `auth.ts` chưa nối adapter · `docs/TECHSTACK.md`
- [x] Thêm `docker-compose.yaml` (Postgres cục bộ, cổng host 5433) + `.env.example` + script `db:up`/`db:down` — cần thiết để có DB thật chạy adapter · `docker-compose.yaml`, `.env.example`, `package.json`
- [x] `vite.config.ts`: bật `server.strictPort` — khi cổng 3000 bị chiếm, `npm run dev` báo lỗi ngay thay vì âm thầm đổi cổng rồi gây `403 INVALID_ORIGIN` lúc đăng ký/đăng nhập thật (`BETTER_AUTH_URL` ghi cứng `:3000`) · `vite.config.ts`

## Kiểm thử

- [x] `npm run lint` sạch
- [x] Kiểm thử tay: đăng ký qua `POST /api/auth/sign-up/email` → bảng `user`/`session` trong Postgres (`docker exec ... psql`) có bản ghi tương ứng
- [x] Kiểm thử tay: `GET /api/auth/get-session` với cookie phiên vừa tạo → trả về đúng session/user (phiên đọc được từ DB, không còn stateless)
- [x] Trường hợp biên: `DATABASE_URL` sai/không kết nối được → request trả `500`, server không crash tiến trình
- [x] Kiểm thử qua Playwright MCP (RULE.md §9): mở `/demo/better-auth` trên trình duyệt thật, đăng ký một tài khoản qua form → vào thẳng ứng dụng không cần đăng nhập lại; điều hướng sang `/` → vẫn đăng nhập (xác nhận UI, không chỉ API); đăng xuất → về trạng thái ẩn danh

## Ghi chú

Phải xong trước TASK-2/TASK-3 — không thể kiểm thử thật các trang đăng ký/đăng nhập khi backend vẫn stateless.

Phát hiện qua kiểm thử tay: cổng 3000 bị chiếm khiến Vite tự đổi cổng, `BETTER_AUTH_URL` lệch theo → đăng ký thật báo `403 INVALID_ORIGIN`. Đã sửa bằng `server.strictPort` ở `vite.config.ts`.
