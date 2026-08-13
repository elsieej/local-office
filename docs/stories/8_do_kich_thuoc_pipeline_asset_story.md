# US-8: Đo kích thước thật + dựng pipeline vendor asset ONLYOFFICE (spike)

**Feature:** [Xem và sửa tài liệu Office thật (ONLYOFFICE)](../features/3_xem_sua_tai_lieu_office_that_feature.md)
**Trạng thái:** ✅ Xong
**Dữ liệu rời máy:** Không

---

## Câu chuyện

> **Là** người phát triển LocalOffice, **tôi muốn** đo kích thước thật của asset ONLYOFFICE (`sdkjs`/`web-apps`/fonts/`x2t.wasm`) và dựng thử pipeline vendor asset đó vào build, **để** biết feature xem/sửa Office thật có khả thi đúng lời hứa hiệu năng/offline của `CLAUDE.md` trước khi cam kết thiết kế task chi tiết.

## Mong muốn

- [x] Kéo image `onlyoffice/documentserver` (hoặc tương đương) về máy dev, đo dung lượng thật của `sdkjs` + `web-apps` + fonts (`AllFonts.js`/`themes.js`) sau khi sinh — con số cụ thể theo MB, không ước lượng
- [x] ~~Dựng thử một pipeline (Docker hoặc cách khác) copy các asset đó ra khỏi image, đo thời gian build tăng thêm~~ → chuyển thành TASK-19 của US-9 (dựng pipeline thật, không chỉ thử)
- [x] ~~Phục vụ thử asset đó qua Vite dev server, đo bằng tay (Network tab hoặc Playwright MCP `browser_network_requests`) tổng dung lượng trình duyệt phải tải ở lần mở editor đầu tiên~~ → chuyển thành điều kiện Mong muốn của [US-9](9_xem_sua_docx_onlyoffice_story.md), xem Ghi chú
- [x] ~~So sánh con số đo được với kỳ vọng "vài giây" ở `CLAUDE.md` mục "Giới hạn cần biết"~~ → chuyển sang US-9
- [x] ~~Rà nhanh xem `web-apps`/`sdkjs` có gọi mặc định ra domain ONLYOFFICE nào không~~ → chuyển sang US-9
- [x] Kết luận bằng văn bản trong Ghi chú của task: pipeline này có nên tiếp tục hay không, kèm lý do

## Task

- [x] [TASK-18: Đo kích thước asset ONLYOFFICE (spike)](../tasks/18_do_kich_thuoc_asset_onlyoffice_task.md) · #36

## Xong khi

Mọi ô ở **Mong muốn** và **Task** đều tick → đổi **Trạng thái** thành ✅ Xong, rồi tick dòng tương ứng trong file feature.

## Ghi chú

Hai mục chưa làm được ở đây (đo network payload thật lúc mở editor, rà request ra ngoài domain ONLYOFFICE) cần một editor chạy thật để đo — không đo được qua spike thuần đo thư mục. Đã chuyển hai mục này thành điều kiện "Mong muốn" của [US-9](9_xem_sua_docx_onlyoffice_story.md), không bị bỏ rơi. US-8 dừng ở 🟡 Đang làm cho tới khi US-9 trả lời được hai câu hỏi đó.
