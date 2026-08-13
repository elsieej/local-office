# TASK-9: Thêm `notFoundComponent` cho root route

**Story:** Không thuộc user story nào — hotfix phát hiện khi kiểm thử [TASK-3](3_trang_dang_nhap_task.md) qua Playwright MCP.
**Issue:** #12 · **Nhánh:** `fix/root-not-found-component`
**Trạng thái:** ✅ Xong

---

## Mục tiêu

Cấu hình `notFoundComponent` cho root route để loại bỏ cảnh báo dev-only lặp lại liên tục trong console ("A notFoundError was encountered on the route with ID \"**root**\", but a notFoundComponent option was not configured"), đồng thời cho người dùng thật một trang 404 tử tế thay vì `<p>Not Found</p>` mặc định của TanStack Router.

## Việc cần làm

- [x] Thêm `notFoundComponent` vào `createRootRoute` trong `src/routes/__root.tsx`, dùng component `Empty` có sẵn từ shadcn kèm nút quay về trang chủ · `src/routes/__root.tsx`

## Kiểm thử

- [x] `npm run lint` sạch
- [x] `npm run generate-routes` không lỗi
- [x] Kiểm thử qua `curl` một route không tồn tại → HTML trả về chứa "Page not found" (component tuỳ chỉnh), không còn `<p>Not Found</p>` mặc định
- [x] Log dev server không còn xuất hiện cảnh báo "notFoundError... route **root**" khi khởi động lại sạch (đã xác nhận qua nhiều lần restart trong lúc debug)

## Ghi chú

Phát hiện trong lúc kiểm thử TASK-3 bằng Playwright MCP: cảnh báo dev-only này (do TanStack Router Devtools panel liên tục dò match route nội bộ khi chưa cấu hình `notFoundComponent`) bị cơ chế console-piping của `@tanstack/devtools-vite` khuếch đại thành một dòng log khổng lồ (~47MB) sau vài phút mở trang, nhiều khả năng làm trình duyệt Playwright quá tải và khiến MCP rớt kết nối liên tục. Không xác nhận được 100% đây là nguyên nhân duy nhất gây rớt MCP (không tái hiện lại được sau khi sửa do MCP tự rớt trước cả khi kịp test), nhưng cảnh báo gốc đã biến mất sau fix này — coi là giải quyết cho tới khi có bằng chứng ngược lại.

Chưa kiểm thử được bằng Playwright MCP (mất kết nối liên tục trong phiên làm việc) — dùng `curl` xác nhận nội dung HTML thay thế.
