# TASK-5: Tích hợp header-user vào layout chính cho mọi route

**Story:** [US-3](../stories/3_trang_thai_dang_nhap_toan_ung_dung_story.md)
**Issue:** #5 · **Nhánh:** `feat/header-user-layout-chinh`
**Trạng thái:** 🔵 Chờ review

---

## Mục tiêu

Đảm bảo `BetterAuthHeader` hiển thị trên mọi trang của ứng dụng qua `src/components/header.tsx`/`__root.tsx`, không chỉ ở trang demo.

## Việc cần làm

- [x] Kiểm tra `src/components/header.tsx` đã render `BetterAuthHeader` — đã có sẵn, không cần thêm · `src/components/header.tsx`
- [x] Xác nhận `header.tsx` được dùng trong `__root.tsx` bao mọi route (không riêng route demo) — `RootDocument` (`shellComponent` của root route) render `<Header/>` bao ngoài `{children}`, áp dụng cho mọi route con · `src/routes/__root.tsx`
- [x] Trạng thái `isPending` hiển thị `Skeleton` thay vì layout nhảy giật khi vừa tải trang — đã có sẵn, không cần thêm · `src/integrations/better-auth/header-user.tsx`

## Kiểm thử

- [x] `npm run lint` sạch
- [x] Kiểm thử qua Playwright MCP: đăng nhập → mở `/`, `/about`, `/login` → header hiển thị avatar giống nhau ở mọi trang
- [x] Kiểm thử qua Playwright MCP: cold navigate thẳng vào `/about` khi đã đăng nhập → snapshot ngay sau khi trang load đã thấy avatar, không có state "Sign in" thoáng qua trước đó
- [x] Trường hợp biên: chưa đăng nhập, mở `/`, `/about`, `/login` → luôn thấy nút "Sign in" nhất quán

## Ghi chú

Task này không cần sửa code — cả ba việc cần làm đã được TASK-2/TASK-3 làm đúng sẵn khi dựng `header.tsx`/`header-user.tsx`. Task chỉ xác nhận lại bằng kiểm thử thật qua Playwright MCP và đóng issue tương ứng.

Không phụ thuộc TASK-1 để làm UI, nhưng cần TASK-1 để kiểm thử "đăng nhập thật giữ nguyên qua mọi trang" — đã kiểm thử với user thật (đăng ký `task5tester@example.com` qua UI, xoá lại sau khi test xong).
