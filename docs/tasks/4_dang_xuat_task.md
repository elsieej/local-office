# TASK-4: Nút đăng xuất tích hợp trong header

**Story:** [US-2](../stories/2_dang_nhap_dang_xuat_story.md)
**Issue:** #4 · **Nhánh:** `feat/dang-xuat-header`
**Trạng thái:** ⬜ Chưa làm

---

## Mục tiêu

Đảm bảo đăng xuất từ header huỷ phiên ngay lập tức và đưa người dùng về trạng thái ẩn danh mà không cần tải lại trang thủ công.

## Việc cần làm

- [ ] Sau `authClient.signOut()`, xác nhận `useSession()` cập nhật ngay không cần refresh thủ công; thêm điều hướng về trang chủ nếu đang ở route riêng tư sau này · `src/integrations/better-auth/header-user.tsx`
- [ ] Thêm trạng thái loading ngắn cho nút đăng xuất (tránh double-click gửi hai request) · `src/integrations/better-auth/header-user.tsx`

## Kiểm thử

- [ ] `npm run lint` sạch
- [ ] Kiểm thử tay: đăng nhập → bấm đăng xuất → header đổi về nút "Đăng nhập" ngay, không cần F5
- [ ] Kiểm thử tay: sau đăng xuất, tải lại trang → vẫn ở trạng thái chưa đăng nhập (phiên đã huỷ thật ở server, không chỉ xoá state client)
- [ ] Trường hợp biên: bấm đăng xuất hai lần liên tiếp nhanh → không lỗi console, không gửi trùng request

## Ghi chú

Phụ thuộc TASK-1 để kiểm chứng phiên bị huỷ thật trong DB, không chỉ xoá cookie phía client.
