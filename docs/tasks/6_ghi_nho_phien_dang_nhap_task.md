# TASK-6: Kiểm chứng phiên tồn tại qua reload sau khi nối database adapter

**Story:** [US-3](../stories/3_trang_thai_dang_nhap_toan_ung_dung_story.md)
**Issue:** #6 · **Nhánh:** `feat/kiem-chung-phien-dang-nhap`
**Trạng thái:** 🔵 Chờ review

---

## Mục tiêu

Xác nhận bằng kiểm thử tay + ghi chú lại rằng phiên đăng nhập (cookie do `tanstackStartCookies()` set) sống sót qua reload và hết hạn đúng như cấu hình mặc định của Better Auth, sau khi TASK-1 nối database adapter.

## Việc cần làm

- [x] Kiểm tra cấu hình thời hạn session mặc định của `better-auth` trong `src/lib/auth.ts` — `src/lib/auth.ts` không set `session.expiresIn`/`session.updateAge`, giữ nguyên mặc định của Better Auth (7 ngày, rolling refresh 1 ngày). **Quyết định: giữ mặc định**, không override — phù hợp quy mô hiện tại của LocalOffice, chưa có yêu cầu nghiệp vụ nào đòi hỏi thời hạn khác · `src/lib/auth.ts`
- [x] Viết lại kết quả kiểm thử tay vào phần Ghi chú bên dưới

## Kiểm thử

- [x] `npm run lint` sạch
- [x] Kiểm thử qua Playwright MCP: đăng nhập → đóng tab (`browser_tabs` action `close`) → mở tab mới, vào lại `localhost:3000` → vẫn đăng nhập (avatar hiển thị ngay)
- [x] Kiểm thử qua Playwright MCP (`browser_run_code_unsafe` gọi `page.context().clearCookies()`, vì cookie phiên là httpOnly nên không xoá được qua `document.cookie`): xoá cookie `better-auth.session_token` → reload trong trình duyệt thật → về trạng thái "Sign in" ngay, `browser_console_messages` xác nhận 0 lỗi
- [x] Trường hợp biên: `curl -H "Cookie: better-auth.session_token=garbage-not-a-real-token"` tới cả trang chủ và `/api/auth/get-session` → cả hai đều `200`, `get-session` trả về `null` — không crash, xử lý như phiên không hợp lệ

## Ghi chú

Phụ thuộc chặt vào TASK-1 (không có database adapter thì không có gì để kiểm chứng — session hiện là stateless). Đã kiểm chứng bằng user thật: query trực tiếp bảng `session` cho thấy `expiresAt - createdAt` đúng bằng 7 ngày (mặc định Better Auth, không có override nào trong `auth.ts`), khớp với quyết định giữ mặc định ở trên.

**Đóng tab / mở lại**: dùng `browser_tabs({action: 'close'})` rồi mở tab mới trỏ lại `localhost:3000` — vẫn đăng nhập ngay (avatar hiển thị không có state trung gian), xác nhận phiên không nằm trong bộ nhớ tab mà thật sự lưu ở cookie (httpOnly) + DB.

Trường hợp "cookie rác" xác nhận thêm qua `curl -H "Cookie: better-auth.session_token=garbage-not-a-real-token"` tới cả trang chủ và `/api/auth/get-session` — nhất quán với kết quả trong trình duyệt.
