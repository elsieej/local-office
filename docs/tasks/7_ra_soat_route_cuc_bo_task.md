# TASK-7: Rà soát route xác nhận ranh giới cục bộ/đám mây không bị đăng nhập chặn nhầm

**Story:** [US-4](../stories/4_dung_duoc_khi_chua_dang_nhap_story.md)
**Issue:** #7 · **Nhánh:** `docs/ra-soat-route-cuc-bo`
**Trạng thái:** ✅ Xong

---

## Mục tiêu

Xác nhận (và giữ nguyên) rằng không route/luồng cục bộ nào trong ứng dụng bị ép đăng nhập, khớp với bất biến "Cục bộ là trạng thái mặc định của mọi tài liệu vừa mở, kể cả khi người dùng đã đăng nhập" ở `docs/ARCHITECTURE.md`.

## Việc cần làm

- [x] Liệt kê toàn bộ route hiện có trong `src/routes/` và đánh dấu route nào cần đăng nhập · `src/routes/`
- [x] Xác nhận không route nào dùng `beforeLoad` hay guard nào redirect người dùng chưa đăng nhập ra khỏi luồng mở/xem/sửa/tải về cục bộ — `grep -rn "beforeLoad|redirect|requireAuth|useSession" src/routes` chỉ khớp một chỗ duy nhất (`login.tsx`, xem Ghi chú) · `src/routes/`
- [x] Ghi kết quả rà soát vào phần Ghi chú bên dưới

## Kiểm thử

- [x] `npm run lint` sạch
- [x] Kiểm thử qua `curl` không cookie (ẩn danh) trên mọi route hiện có → không route nào redirect/chặn (xem ngoại lệ không-liên-quan-đến-auth ở Ghi chú)
- [x] Trường hợp biên: chưa có tính năng tài liệu cục bộ nào (mở/xem/sửa) trong codebase hiện tại nên không có luồng cục bộ thật để kiểm thử gián đoạn — ghi nhận là chưa áp dụng được, không phải đã kiểm thử

## Ghi chú

Route hiện có trong `src/routes/` (rà soát ngày 2026-08-13):

| Route         | File            | Cần đăng nhập?                                                                             |
| ------------- | --------------- | ------------------------------------------------------------------------------------------ |
| `/`           | `index.tsx`     | Không                                                                                      |
| `/about`      | `about.tsx`     | Không                                                                                      |
| `/login`      | `login.tsx`     | Không (route công khai — chính là nơi để đăng nhập)                                        |
| `/api/auth/*` | `api/auth/$.ts` | Không phải trang — handler API của Better Auth, tự xử lý xác thực nội bộ theo từng request |
| root shell    | `__root.tsx`    | Không — chỉ render `Header`/`Footer` bao ngoài, không có `beforeLoad`                      |

Không route nào dùng `beforeLoad`, `redirect`, hay bất kỳ guard nào chặn người dùng chưa đăng nhập. Duy nhất `login.tsx` gọi `authClient.useSession()` — nhưng chỉ để hiển thị thông báo "You're signed in as …" khi đã đăng nhập (UX phụ, không redirect, không ẩn form), không phải guard chặn truy cập.

**Phát hiện thêm trong lúc rà soát:** `/demo/drizzle` trả `500` khi kiểm thử `curl`, kể cả có/không có cookie — **không phải do guard đăng nhập** (không redirect, không `401`/`403`, đúng là lỗi server `500`). Nguyên nhân: bảng `todos` không tồn tại trong Postgres (`\dt` chỉ thấy `account`, `session`, `user`, `verification` — 4 bảng của Better Auth, chưa từng chạy migration/push cho schema `todos` gốc của starter). Không liên quan gì đến login/auth, nhưng do route hỏng và không còn giá trị demo (chưa từng migrate DB thật cho nó) nên đã **xoá hẳn** `src/routes/demo/drizzle.tsx` và mục "Demos" (chỉ có đúng một mục trỏ tới route này) khỏi `header.tsx` theo yêu cầu — xác nhận qua Playwright MCP: `/demo/drizzle` giờ trả `404` (trang not-found tuỳ chỉnh), header không còn dropdown "Demos", không lỗi console.

Còn sót lại (không xoá trong task này, ngoài phạm vi rà soát route): `src/db/index.ts`, `src/db/schema.ts` (định nghĩa bảng `todos`), `drizzle.config.ts`, và các script `db:generate`/`db:migrate`/`db:studio` trong `package.json` giờ không còn nơi nào dùng tới — mồ côi hoàn toàn sau khi xoá route. Để lại quyết định xoá toàn bộ scaffolding Drizzle này cho một task riêng, vì đây là quyết định lớn hơn phạm vi "rà soát route" (có thể vẫn muốn giữ Drizzle cho nhu cầu ORM thật sau này).

**Tiêu chí tham chiếu cho feature sau này** (đám mây, tài liệu): route/luồng cục bộ (mở, xem, sửa, tải về tài liệu trên máy) **không bao giờ** được thêm `beforeLoad` redirect sang `/login` hay điều kiện dựa trên `useSession` để ẩn/chặn nội dung — chỉ hành động chủ động "tải lên đám mây"/"chia sẻ" mới được yêu cầu đăng nhập, đúng bất biến ở `docs/ARCHITECTURE.md` và `CLAUDE.md` ("riêng tư là mặc định, chia sẻ là lựa chọn"). Khi feature tài liệu cục bộ ra đời, chạy lại rà soát này (cùng tiêu chí bảng trên) trước khi thêm bất kỳ route đám mây có guard thật.
