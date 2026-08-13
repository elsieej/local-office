# TASK-18: Đo kích thước asset ONLYOFFICE (spike)

**Story:** [US-8](../stories/8_do_kich_thuoc_pipeline_asset_story.md)
**Issue:** #36 · **Nhánh:** `docs/do-kich-thuoc-asset-onlyoffice`
**Trạng thái:** 🟡 Đang làm

---

## Mục tiêu

Đo dung lượng thật của asset ONLYOFFICE (`sdkjs`/`web-apps`/`fonts`/`x2t`) cần vendor cho việc xem/sửa Office thật, trả lời phần "chưa đo được" ở mục 8 (Rủi ro) của [Feature 3](../features/3_xem_sua_tai_lieu_office_that_feature.md).

## Việc cần làm

- [x] Kéo image `onlyoffice/documentserver:latest` (Docker), xác nhận dung lượng qua `docker manifest inspect` (~1.3 GB nén) và `docker images` (~4.86 GB trên đĩa)
- [x] Chạy container tạm, thực thi `documentserver-generate-allfonts.sh false` để sinh `AllFonts.js`/`themes.js` — đúng bước image gốc của `office-website` chạy lúc build
- [x] Đo `du -sh` từng thư mục asset mà `Dockerfile` của `office-website` copy ra: `fonts`, `sdkjs`, `web-apps`, `sdkjs-plugins`
- [x] Tìm và kiểm tra file `x2t` trong image chính thức — xác định đây là binary ELF native (~45 MB), không phải WebAssembly
- [ ] Đo dung lượng thật trình duyệt phải tải khi mở editor lần đầu (network payload thật) — **bỏ dở, xem Ghi chú**
- [ ] Rà request ra ngoài domain ONLYOFFICE (dictionary/help/translate...) — chưa làm, phụ thuộc việc có editor chạy thật ở trên

## Kiểm thử

- [x] `npm run format` sạch (chỉ sửa file `.md`, không đụng code/route)
- Không áp dụng: task này là đo đạc/nghiên cứu, không có UI/route nào để kiểm thử qua Playwright MCP

## Ghi chú

**Số đo được** (container tạm, sau khi sinh font, `du -sh` trên `/var/www/onlyoffice/documentserver/`):

| Thư mục         | Dung lượng  |
| --------------- | ----------- |
| `fonts`         | 162 MB      |
| `sdkjs`         | 418 MB      |
| `web-apps`      | 783 MB      |
| `sdkjs-plugins` | 37 MB       |
| **Tổng**        | **~1.4 GB** |

Đây là **cận trên trên đĩa server**, không phải dung lượng trình duyệt thật sự tải — bao gồm mọi loại editor (document/spreadsheet/presentation/pdf/visio), mọi ngôn ngữ trợ giúp, không lọc theo nhu cầu thật của LocalOffice (chỉ cần document+spreadsheet+presentation editor, một ngôn ngữ).

**Phát hiện quan trọng nhất**: `x2t` trong image `onlyoffice/documentserver` chính thức là **binary ELF gốc cho Linux (~45 MB)**, không phải WebAssembly. Nghĩa là `x2t.wasm` (~9.2 MB) trong repo tham khảo `office-website` **không lấy được trực tiếp từ image này** — họ (hoặc một dự án khác họ dựa vào) đã tự build lại `x2t` sang WASM bằng Emscripten từ mã nguồn C++ riêng. Vendor pipeline cho LocalOffice vì vậy **không đơn giản là "copy từ Docker image"** như mục 6 của Feature 3 từng ghi — cần: (a) tự build `x2t` sang WASM (công sức đáng kể, cần toolchain Emscripten + mã nguồn C++ của ONLYOFFICE), hoặc (b) vendor thẳng file `x2t.wasm` đã build sẵn từ `office-website` hoặc dự án nguồn của họ (cần xác minh xuất xứ/tính toàn vẹn trước khi tin dùng).

**Việc đo network payload thật bị bỏ dở có chủ đích**: hướng đo đầu tiên (chạy nguyên Document Server sống làm nền qua `docker run -d`, mở editor trỏ vào server đó) đo **sai kiến trúc mục tiêu** — đó là kiểu triển khai ONLYOFFICE server-based truyền thống, không phải kiểu "toàn bộ chạy client, chặn `XMLHttpRequest`/`fetch`" mà `office-website` thực sự dùng khi chạy cho người dùng cuối. Đo đúng cần dựng lại được kỹ thuật chặn request của họ (`createXHRProxy`/`createFetchProxy` + `x2t.wasm` + asset tĩnh) — việc này lớn hơn hẳn phạm vi một spike đo đạc, để lại cho story sau khi quyết định có tiếp tục Feature 3 hay không. Rà soát request ra ngoài domain ONLYOFFICE cũng phụ thuộc bước này, chưa làm được.

**Docker image đã kéo (`onlyoffice/documentserver:latest`, ~4.86 GB trên đĩa)**: giữ lại trên máy dev để tránh tải lại (~1.3 GB) nếu US-8 tiếp tục — xoá bằng `docker rmi onlyoffice/documentserver:latest` khi không cần nữa.
