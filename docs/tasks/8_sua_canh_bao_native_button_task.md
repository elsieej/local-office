# TASK-8: Sửa cảnh báo Base UI `nativeButton` khi `Button` render qua `Link`/`a`

**Story:** Không thuộc user story nào — hotfix phát hiện khi kiểm thử [TASK-1](1_noi_database_adapter_task.md) qua Playwright MCP, ảnh hưởng chung mọi nơi dùng `Button` với prop `render`.
**Issue:** #8 · **Nhánh:** `fix/base-ui-native-button-warning`
**Trạng thái:** ✅ Xong

---

## Mục tiêu

Loại bỏ cảnh báo console `Base UI: A component that acts as a button expected a native <button>...` xuất hiện ở mọi nơi `Button` được dùng với prop `render` trỏ tới `Link`/`a` (Header, Footer, trang chủ, nút "Sign in").

## Việc cần làm

- [x] `Button` mặc định `nativeButton={false}` khi có `render` (trừ khi caller tự truyền `nativeButton` tường minh) — sửa một chỗ ở component dùng chung thay vì sửa từng nơi gọi · `src/components/ui/button.tsx`

## Kiểm thử

- [x] `npm run lint` sạch
- [x] Kiểm thử qua Playwright MCP (RULE.md §9): mở `/`, `/about`, `/demo/better-auth` trên trình duyệt thật → console không còn cảnh báo `nativeButton` (trước khi sửa: lỗi xuất hiện ở trang chủ, Header, trang đăng nhập; sau khi sửa: hết hoàn toàn, chỉ còn 404 favicon không liên quan)

## Ghi chú

Sửa tại component dùng chung (`src/components/ui/button.tsx`) thay vì thêm `nativeButton={false}` thủ công ở từng lời gọi (`index.tsx`, `header.tsx`, `footer.tsx`, `header-user.tsx`) — tránh phải nhớ lặp lại quy tắc này mỗi lần thêm `Button` mới có `render`. File này do `shadcn` sinh ra, `npx shadcn@latest add --overwrite` sẽ ghi đè — cần merge tay lại đoạn này nếu nâng cấp sau này (xem `RULE.md` mục 4).
