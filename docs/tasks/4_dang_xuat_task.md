# TASK-4: Nút đăng xuất tích hợp trong header

**Story:** [US-2](../stories/2_dang_nhap_dang_xuat_story.md)
**Issue:** #4 · **Nhánh:** `feat/dang-xuat-header`
**Trạng thái:** 🔵 Chờ review

---

## Mục tiêu

Đảm bảo đăng xuất từ header huỷ phiên ngay lập tức và đưa người dùng về trạng thái ẩn danh mà không cần tải lại trang thủ công.

## Việc cần làm

- [x] Sau `authClient.signOut()`, xác nhận `useSession()` cập nhật ngay không cần refresh thủ công (đã đúng sẵn nhờ store phản ứng của Better Auth, không cần sửa) · `src/integrations/better-auth/header-user.tsx`
- [x] Thêm trạng thái loading ngắn cho nút đăng xuất (tránh double-click gửi hai request) · `src/integrations/better-auth/header-user.tsx`

## Kiểm thử

- [x] `npm run lint` sạch
- [x] Kiểm thử qua Playwright MCP: đăng nhập → bấm đăng xuất → header đổi về nút "Sign in" ngay, không cần F5
- [x] Kiểm thử qua Playwright MCP + truy vấn Postgres trực tiếp: sau đăng xuất, hàng trong bảng `session` của user đã bị xoá thật (không chỉ xoá state client); tải lại trang → vẫn ở trạng thái chưa đăng nhập, không lỗi console
- [x] Trường hợp biên: bấm đăng xuất hai lần liên tiếp trong cùng một tick (mô phỏng double-click bằng `btn.click(); btn.click()` đồng bộ) → xác nhận qua `browser_network_requests` chỉ có **một** request `POST /api/auth/sign-out` được gửi

## Ghi chú

Phụ thuộc TASK-1 để kiểm chứng phiên bị huỷ thật trong DB, không chỉ xoá cookie phía client — đã kiểm chứng bằng cách query bảng `session` trực tiếp qua `docker exec ... psql` sau khi đăng xuất.

Không dùng riêng `useState` để chặn double-click: hai lần click trong cùng một tick đồng bộ (đúng như dblclick thật của chuột) dùng chung một closure `onClick` từ lần render trước đó — state `isSigningOut` cập nhật bất đồng bộ (React batch) nên lần click thứ hai vẫn đọc được giá trị `false` cũ, không bị chặn. Xác nhận bằng thực nghiệm: bản chỉ dùng `useState` để hai request `sign-out` lọt qua. Sửa bằng thêm `useRef` (`signOutInFlight`) — đọc/ghi đồng bộ, không phụ thuộc re-render — dùng `useState` song song chỉ để điều khiển UI (`disabled`, không phải logic chặn).

Không có route riêng tư nào ở thời điểm này (xem [TASK-7](7_ra_soat_route_cuc_bo_task.md)) nên phần "điều hướng về trang chủ nếu đang ở route riêng tư" chưa áp dụng — để lại cho khi nào có route đám mây thật.
