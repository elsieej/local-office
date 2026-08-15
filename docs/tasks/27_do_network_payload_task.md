# TASK-27: Đo network payload/egress thật lúc mở/sửa/lưu `.docx`

**Story:** [US-9](../stories/9_xem_sua_docx_onlyoffice_story.md)
**Issue:** #60 · **Nhánh:** `docs/do-network-payload-onlyoffice`
**Trạng thái:** 🔵 Chờ review

---

## Mục tiêu

Trả lời 2 câu hỏi mở kế thừa từ [US-8](../stories/8_do_kich_thuoc_pipeline_asset_story.md)
(không đo được lúc đó vì cần editor chạy thật): dung lượng trình duyệt
thật sự tải ở lần mở editor đầu tiên so với kỳ vọng "vài giây" của
`CLAUDE.md`, và có request nào rời khỏi domain LocalOffice trong suốt
luồng xem/sửa/lưu hay không. Đây là task đo đạc (giống TASK-18 của US-8),
không có code thay đổi.

## Việc cần làm

- [x] Build production (`npm run build && npm run preview`) — đo trên dev
      server (`npm run dev`) cho số bi quan sai lệch nhiều (Vite chưa
      minify/tree-shake, transform on-the-fly), không phản ánh đúng trải
      nghiệm người dùng thật
- [x] Đo thời gian từ lúc điều hướng tới URL tài liệu tới khi `DocEditor`
      thật sự sẵn sàng (`Skeleton` biến mất), cache trình duyệt đã xoá
      sạch trước đó (`Network.clearBrowserCache` qua CDP) để mô phỏng
      đúng "lần đầu"
- [x] Đo tổng dung lượng đã tải qua Resource Timing API
      (`performance.getEntriesByType('resource')`, cộng `transferSize`) —
      cả ở window chính lẫn bên trong iframe `frameEditor` (asset
      ONLYOFFICE tải trong iframe có Performance Timeline riêng, không
      nằm trong `performance` của window chính, dễ bỏ sót)
- [x] Audit domain: so từng URL với `location.origin`, xuyên suốt cả luồng
      Xem → chuyển sang Sửa → gõ chữ → Lưu (Ctrl+S), không chỉ lúc mở

## Kiểm thử

- [x] Không áp dụng `npm run lint`/`tsc` — task này không sửa code
- [x] `npm run format` sạch (chỉ sửa file `.md`)

## Ghi chú

**Phương pháp đo**: `npm run build` rồi `npm run preview -- --port 3001`
(khác cổng với dev server `3000` đang chạy song song — khác cổng = khác
origin, OPFS không dùng chung, phải tải lại tài liệu test lên origin
`3001`). Xoá cache bằng CDP `Network.clearBrowserCache` trước mỗi lần đo
để đảm bảo mô phỏng đúng "lần đầu", không ăn cache từ lần đo trước. Đo
thời gian bằng `performance.now()` sau khi `page.waitForFunction` xác
nhận `Skeleton` đã biến mất VÀ `#id_main` đã tồn tại trong iframe — đúng
thời điểm `onDocumentReady` bắn (xem `onlyoffice-editor.tsx`), không phải
lúc UI khung sườn hiện ra.

**Kết quả đo được** (1 lần đo, máy dev — không phải benchmark đa thiết
bị, chỉ đủ trả lời câu hỏi "đạt hay không đạt kỳ vọng bậc độ lớn"):

| Chỉ số                                                  | Dev server (`npm run dev`) | Production (`build` + `preview`) |
| ------------------------------------------------------- | -------------------------- | -------------------------------- |
| Thời gian tới khi editor sẵn sàng                       | ~24,5 giây                 | **~8,2 giây**                    |
| Dung lượng tải (window chính)                           | —                          | ~236 KB                          |
| Dung lượng tải (iframe `frameEditor`, asset ONLYOFFICE) | —                          | ~11,1 MB                         |
| **Tổng**                                                | —                          | **~11,9 MB**                     |

**Kết luận về "vài giây" — không đạt**: ~8,2 giây (bản production, cache
lạnh, chạy trên `localhost` không có độ trễ mạng thật — đây gần như
"best case") vượt xa cách hiểu thông thường của "vài giây" (2–5 giây).
Nguyên nhân chính là dung lượng: ~11,9 MB cho lần mở đầu tiên — gồm toàn
bộ `sdkjs` (word engine) + `web-apps` (UI documenteditor) + fonts hệ
thống (cho hiển thị đúng font tài liệu) + `x2t.wasm`. Đây là chi phí cố
định của kiến trúc "toàn bộ ONLYOFFICE chạy client-side, không Document
Server" đã chọn từ Feature 3 — các lần mở tài liệu **sau đó cùng phiên
trình duyệt** dùng lại HTTP cache của trình duyệt (không tải lại 11,9 MB),
chỉ lần đầu tiên trong toàn bộ vòng đời cài đặt mới chịu chi phí này.
`CLAUDE.md` mục "Giới hạn cần biết" nên sửa lại kỳ vọng cho khớp thực tế
đo được — đề xuất "vài chục giây tuỳ mạng và máy" thay vì "vài giây" (để
lại quyết định sửa câu chữ `CLAUDE.md` cho người dùng, task này chỉ đo và
báo cáo trung thực, không tự sửa tài liệu gốc dự án).

**Kết luận về "không có request ra ngoài domain" — gần đạt, có 1 ngoại
lệ đã biết**: xuyên suốt Xem → Sửa → Lưu, chỉ có đúng **1 request
cross-origin duy nhất**: `fonts.googleapis.com` (CSS khai báo font
Manrope/Fraunces, ~1,1 KB) — không đổi dù chuyển mode hay lưu bao nhiêu
lần. Đây **không phải** lỗi phát sinh từ US-9/ONLYOFFICE — toàn bộ site
LocalOffice (mọi trang, không riêng trang tài liệu) đã dùng Google Fonts
CDN từ trước (`__root.tsx` hoặc `styles.css`, ngoài phạm vi đo của task
này). Quan trọng: request này **không chứa nội dung tài liệu** — chỉ tải
font UI, khác hẳn về mức độ nghiêm trọng so với việc rò rỉ nội dung
riêng tư. Toàn bộ asset ONLYOFFICE bên trong iframe (`sdkjs`/`web-apps`/
fonts hệ thống/`x2t.wasm`) xác nhận **0 request cross-origin** — đúng
cam kết "toàn bộ engine tự host, không gọi ra domain ONLYOFFICE nào" của
Feature 3 mục 6.

Vẫn nên tách một task riêng sau này (ngoài phạm vi US-9) để tự host
Google Fonts thay vì gọi CDN — khớp đúng tinh thần "riêng tư là mặc định"
và "hoạt động ngoại tuyến" của `CLAUDE.md` cho toàn site, không chỉ trang
tài liệu.

## Cập nhật US-9

Tick 2 ô "Mong muốn" kế thừa từ US-8 với kết luận **không đạt hoàn toàn**
(đúng yêu cầu "ghi kết luận rõ ràng dù đạt hay không đạt" của chính 2 ô
đó) — xem story để biết chi tiết dẫn chiếu về đây.
