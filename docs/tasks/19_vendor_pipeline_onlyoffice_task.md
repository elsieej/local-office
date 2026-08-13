# TASK-19: Vendor pipeline asset ONLYOFFICE + `x2t.wasm`

**Story:** [US-9](../stories/9_xem_sua_docx_onlyoffice_story.md)
**Issue:** #38 · **Nhánh:** `build/vendor-onlyoffice-assets`
**Trạng thái:** ✅ Xong

---

## Mục tiêu

Dựng build pipeline lấy asset ONLYOFFICE (`sdkjs`, `web-apps`, fonts) từ image `onlyoffice/documentserver` + `x2t.wasm` từ `cryptpad/onlyoffice-x2t-wasm`, đưa vào chỗ Vite phục vụ được — không chỉ đo thử như TASK-18, mà dựng pipeline chạy được thật.

## Việc cần làm

- [x] Script build (`scripts/vendor-onlyoffice.mjs`, Node + Docker CLI) kéo `sdkjs` (chỉ `common`+`word`), `web-apps` (chỉ `apps/api`+`apps/common`+`apps/documenteditor/main`+`vendor` trừ `monaco`), `fonts` từ image `onlyoffice/documentserver:9.3.0.1` (ghim, không dùng `latest`) — **không vendor `sdkjs-plugins`** (marketing/plugin, ngoài phạm vi, quyết định khác với dự tính ban đầu ở Mục tiêu)
- [x] Tải `x2t.wasm` từ release `v9.3.0+0` của `cryptpad/onlyoffice-x2t-wasm`, xác minh checksum sha512 (ghim cứng trong script) — script throw lỗi dừng ngay nếu checksum không khớp
- [x] Asset phục vụ được qua Vite dev server tại `/onlyoffice/...` — xác nhận `api.js`, `x2t.wasm`, `VENDORED.json` đều 200 OK
- [x] Ghi lại vào `docs/TECHSTACK.md`: mục 1 hiện trạng, mục 2 (`scripts/vendor-onlyoffice.mjs`), mục 3 (cấu trúc thư mục), mục 4 (lệnh `vendor:onlyoffice`), mục 5 (engine đã chọn)
- [x] Đo lại dung lượng thật sau khi lọc: **267.1 MB** (so với ~1.4 GB cận trên chưa lọc của TASK-18) — xem bảng ở Ghi chú

## Kiểm thử

- [x] `npm run lint` sạch (thêm `public/onlyoffice/**` vào `ignores` của `eslint.config.js` — asset bên thứ ba, không phải code repo; tương tự `.prettierignore`)
- [x] Chạy thử script từ đầu (`npm run vendor:onlyoffice`) → thoát mã 0, asset xuất hiện đúng vị trí (`public/onlyoffice/{sdkjs,web-apps,fonts,x2t}` + `VENDORED.json`)
- [x] Xác minh checksum `x2t.wasm`: script tự so sánh sha512 lúc chạy, khớp — `e82fbf2...cd207c`
- [x] Đo dung lượng thư mục asset sau khi lọc, ghi số thật vào Ghi chú

## Ghi chú

**Dung lượng sau khi lọc** (`public/onlyoffice/`, đo bằng `npm run vendor:onlyoffice` thật):

| Thư mục    | Dung lượng   | Trước khi lọc (TASK-18)                                                                                |
| ---------- | ------------ | ------------------------------------------------------------------------------------------------------ |
| `fonts`    | 160.6 MB     | 162 MB (không lọc — xem dưới)                                                                          |
| `sdkjs`    | 56.1 MB      | 418 MB (chỉ giữ `common`+`word`, bỏ `cell`/`slide`/`pdf`/`visio`)                                      |
| `web-apps` | 9.4 MB       | 783 MB + 30 MB vendor (chỉ giữ `documenteditor/main` đã cắt, bỏ 4 editor khác + `monaco`)              |
| `x2t`      | 41.0 MB      | ~9.2 MB (số của `office-website`; bản giải nén từ `cryptpad` lớn hơn — có kèm `.js`/`.wasm`/bản `.br`) |
| **Tổng**   | **267.1 MB** | **~1.4 GB**                                                                                            |

Giảm từ ~1.4 GB xuống 267 MB (~81%) nhờ lọc theo nhu cầu thật của US-9 thay vì giữ nguyên mọi loại editor/ngôn ngữ.

**Đã cắt khỏi `web-apps/apps/documenteditor/main`** (không chỉ bỏ nguyên app khác):

- `resources/help/` (~76 MB) — tài liệu trợ giúp đa ngôn ngữ, ngoài phạm vi US-9. **Hệ quả**: nút Trợ giúp trong editor sẽ lỗi/404 nếu bấm — chưa xử lý, ghi nhận là giới hạn biết trước, không phải bug ẩn
- `ie/` (~4 MB) — bản build riêng cho Internet Explorer, không cần
- `locale/*.json(.gz)` ngoài `vi`/`en` (~16.4 MB) — chỉ giữ 2 ngôn ngữ
- mọi file `.gz` cấp `main/` (~0.7 MB) — trùng lặp với bản không nén, Vite dev không phục vụ theo Content-Encoding đặc biệt nên giữ lại không có lợi

**`fonts` chưa lọc** — 160.6 MB gần như nguyên vẹn từ image gốc. Không rõ font nào thật sự cần cho việc hiển thị `.docx` tiếng Việt/tiếng Anh cơ bản mà không kiểm thử kỹ, nên giữ nguyên để tránh vỡ font lúc render — có thể tối ưu thêm sau nếu TASK-22 (đo network payload) cho thấy đây là phần nặng nhất cản tốc độ tải.

**Version ghim**: `onlyoffice/documentserver:9.3.0.1` (khớp dòng 9.3.x với `x2t` release) + `cryptpad/onlyoffice-x2t-wasm@v9.3.0+0`. Ghi trong `public/onlyoffice/VENDORED.json` mỗi lần chạy script (kèm timestamp) để biết bản đang chạy trên máy dev là bản nào.

`public/onlyoffice/` **không commit vào Git** (thêm vào `.gitignore`) — mỗi máy dev/CI tự chạy `npm run vendor:onlyoffice` (cần Docker + `unzip`). Đây là thay đổi so với dự tính "chỉ cần Node/npm" — đã ghi vào `docs/TECHSTACK.md`.
