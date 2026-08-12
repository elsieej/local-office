# TASK-6: Kiểm chứng phiên tồn tại qua reload sau khi nối database adapter

**Story:** [US-3](../stories/3_trang_thai_dang_nhap_toan_ung_dung_story.md)
**Issue:** #6 · **Nhánh:** `feat/kiem-chung-phien-dang-nhap`
**Trạng thái:** ⬜ Chưa làm

---

## Mục tiêu

Xác nhận bằng kiểm thử tay + ghi chú lại rằng phiên đăng nhập (cookie do `tanstackStartCookies()` set) sống sót qua reload và hết hạn đúng như cấu hình mặc định của Better Auth, sau khi TASK-1 nối database adapter.

## Việc cần làm

- [ ] Kiểm tra cấu hình thời hạn session mặc định của `better-auth` trong `src/lib/auth.ts`, quyết định có cần chỉnh `session.expiresIn`/`updateAge` hay giữ mặc định — ghi quyết định vào Ghi chú bên dưới · `src/lib/auth.ts`
- [ ] Viết lại kết quả kiểm thử tay (reload, đóng mở tab, hết hạn) vào phần Ghi chú của task này để làm bằng chứng cho US-3

## Kiểm thử

- [ ] `npm run lint` sạch
- [ ] Kiểm thử tay: đăng nhập → đóng tab → mở lại `localhost:3000` → vẫn đăng nhập
- [ ] Kiểm thử tay: đăng nhập → xoá cookie phiên bằng DevTools → tải lại trang → về trạng thái chưa đăng nhập, không lỗi console
- [ ] Trường hợp biên: sửa tay cookie session thành giá trị rác → app không crash, xử lý như phiên không hợp lệ

## Ghi chú

Phụ thuộc chặt vào TASK-1 (không có database adapter thì không có gì để kiểm chứng — session hiện là stateless).
