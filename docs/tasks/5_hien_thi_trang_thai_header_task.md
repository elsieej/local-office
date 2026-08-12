# TASK-5: Tích hợp header-user vào layout chính cho mọi route

**Story:** [US-3](../stories/3_trang_thai_dang_nhap_toan_ung_dung_story.md)
**Issue:** #5 · **Nhánh:** `feat/header-user-layout-chinh`
**Trạng thái:** ⬜ Chưa làm

---

## Mục tiêu

Đảm bảo `BetterAuthHeader` hiển thị trên mọi trang của ứng dụng qua `src/components/header.tsx`/`__root.tsx`, không chỉ ở trang demo.

## Việc cần làm

- [ ] Kiểm tra `src/components/header.tsx` đã render `BetterAuthHeader` — nếu chưa, thêm vào · `src/components/header.tsx`
- [ ] Xác nhận `header.tsx` được dùng trong `__root.tsx` bao mọi route (không riêng route demo) · `src/routes/__root.tsx`
- [ ] Trạng thái `isPending` hiển thị `Skeleton` thay vì layout nhảy giật khi vừa tải trang · `src/integrations/better-auth/header-user.tsx`

## Kiểm thử

- [ ] `npm run lint` sạch
- [ ] Kiểm thử tay: mở `/`, `/about`, và các route khác khi đã đăng nhập → header hiển thị avatar giống nhau ở mọi trang
- [ ] Kiểm thử tay: tải trang lần đầu (cold load) khi đã đăng nhập → thấy skeleton rất ngắn rồi mới ra avatar, không nhấp nháy sang nút "Đăng nhập" trước
- [ ] Trường hợp biên: chưa đăng nhập, mở bất kỳ route nào → luôn thấy nút "Đăng nhập" nhất quán

## Ghi chú

Không phụ thuộc TASK-1 để làm UI, nhưng cần TASK-1 để kiểm thử "đăng nhập thật giữ nguyên qua mọi trang".
