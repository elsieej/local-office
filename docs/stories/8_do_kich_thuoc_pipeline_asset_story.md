# US-8: Đo kích thước thật + dựng pipeline vendor asset ONLYOFFICE (spike)

**Feature:** [Xem và sửa tài liệu Office thật (ONLYOFFICE)](../features/3_xem_sua_tai_lieu_office_that_feature.md)
**Trạng thái:** 🟡 Đang làm
**Dữ liệu rời máy:** Không

---

## Câu chuyện

> **Là** người phát triển LocalOffice, **tôi muốn** đo kích thước thật của asset ONLYOFFICE (`sdkjs`/`web-apps`/fonts/`x2t.wasm`) và dựng thử pipeline vendor asset đó vào build, **để** biết feature xem/sửa Office thật có khả thi đúng lời hứa hiệu năng/offline của `CLAUDE.md` trước khi cam kết thiết kế task chi tiết.

## Mong muốn

- [x] Kéo image `onlyoffice/documentserver` (hoặc tương đương) về máy dev, đo dung lượng thật của `sdkjs` + `web-apps` + fonts (`AllFonts.js`/`themes.js`) sau khi sinh — con số cụ thể theo MB, không ước lượng
- [ ] Dựng thử một pipeline (Docker hoặc cách khác) copy các asset đó ra khỏi image, đo thời gian build tăng thêm
- [ ] Phục vụ thử asset đó qua Vite dev server, đo bằng tay (Network tab hoặc Playwright MCP `browser_network_requests`) tổng dung lượng trình duyệt phải tải ở lần mở editor đầu tiên
- [ ] So sánh con số đo được với kỳ vọng "vài giây" ở `CLAUDE.md` mục "Giới hạn cần biết" — kết luận rõ đạt được không, nếu không thì chênh bao nhiêu
- [ ] Rà nhanh xem `web-apps`/`sdkjs` có gọi mặc định ra domain ONLYOFFICE nào không (dictionary, help, translate…) — liệt kê cụ thể nếu có, để story sau biết cần chặn gì
- [ ] Kết luận bằng văn bản trong Ghi chú của task: pipeline này có nên tiếp tục hay không, kèm lý do

## Task

- [ ] [TASK-18: Đo kích thước asset ONLYOFFICE (spike)](../tasks/18_do_kich_thuoc_asset_onlyoffice_task.md) · #36

## Xong khi

Mọi ô ở **Mong muốn** và **Task** đều tick → đổi **Trạng thái** thành ✅ Xong, rồi tick dòng tương ứng trong file feature.
