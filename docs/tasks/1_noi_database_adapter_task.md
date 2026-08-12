# TASK-1: Nối database adapter + migration cho Better Auth

**Story:** [US-1](../stories/1_dang_ky_tai_khoan_story.md)
**Issue:** #1 · **Nhánh:** `feat/noi-database-adapter`
**Trạng thái:** ⬜ Chưa làm

---

## Mục tiêu

Làm cho Better Auth chạy có trạng thái thật (không còn stateless): nối `database` adapter và tạo bảng `user`/`session`/`account`/`verification` để phiên đăng ký/đăng nhập được lưu bền vững.

## Việc cần làm

- [ ] Nối `pg` Pool làm `database` adapter trong `src/lib/auth.ts`, đọc `DATABASE_URL` từ `.env.local` · `src/lib/auth.ts`
- [ ] Sinh migration cho bảng `user`/`session`/`account`/`verification` bằng `npx @better-auth/cli migrate` (hoặc generate rồi `npm run db:migrate`) · `drizzle/`
- [ ] Cập nhật `docs/TECHSTACK.md` mục "Mảnh còn thiếu" — bỏ dòng nói `auth.ts` chưa nối adapter · `docs/TECHSTACK.md`

## Kiểm thử

- [ ] `npm run lint` sạch
- [ ] Kiểm thử tay: đăng ký tài khoản mới ở `/demo/better-auth` → mở `npm run db:studio`, kiểm tra bảng `user` có bản ghi tương ứng
- [ ] Kiểm thử tay: đăng nhập, tải lại trang → vẫn đăng nhập (phiên đọc được từ DB, không còn stateless)
- [ ] Trường hợp biên: `DATABASE_URL` sai/không kết nối được → server báo lỗi rõ ràng khi khởi động, không crash âm thầm

## Ghi chú

Phải xong trước TASK-2/TASK-3 — không thể kiểm thử thật các trang đăng ký/đăng nhập khi backend vẫn stateless.
