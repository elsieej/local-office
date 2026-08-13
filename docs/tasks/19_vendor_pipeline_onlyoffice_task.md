# TASK-19: Vendor pipeline asset ONLYOFFICE + `x2t.wasm`

**Story:** [US-9](../stories/9_xem_sua_docx_onlyoffice_story.md)
**Issue:** #38 · **Nhánh:** `build/vendor-onlyoffice-assets`
**Trạng thái:** ⬜ Chưa làm

---

## Mục tiêu

Dựng build pipeline lấy asset ONLYOFFICE (`sdkjs`, `web-apps`, fonts) từ image `onlyoffice/documentserver` + `x2t.wasm` từ `cryptpad/onlyoffice-x2t-wasm`, đưa vào chỗ Vite phục vụ được — không chỉ đo thử như TASK-18, mà dựng pipeline chạy được thật.

## Việc cần làm

- [ ] Script/Dockerfile build kéo `sdkjs`, `web-apps`, `sdkjs-plugins`, fonts từ image `onlyoffice/documentserver` (ghim version cụ thể, không dùng `latest`) — chỉ giữ `documenteditor` (bỏ spreadsheet/presentation/pdf/visio editor, ngoài phạm vi US-9) và một ngôn ngữ (`vi` hoặc `en`) để giảm dung lượng so với cận trên ~1.4 GB đã đo · thư mục build mới, chưa quyết định vị trí cụ thể
- [ ] Tải `x2t.wasm` từ một release tag cụ thể của `cryptpad/onlyoffice-x2t-wasm`, xác minh checksum sha512 công bố kèm release — ghi rõ tag + checksum trong script, không tải `latest`/`main` không ghim
- [ ] Asset build ra phục vụ được qua Vite dev server (đường dẫn ổn định, không đổi mỗi lần build lại)
- [ ] Ghi lại bước build vào `docs/TECHSTACK.md` (gói/công cụ mới, thư mục mới) — không còn đúng "chỉ cần Node/npm" nữa
- [ ] Đo lại dung lượng thật sau khi đã lọc theo nhu cầu (chỉ documenteditor + 1 ngôn ngữ), so với ~1.4 GB cận trên của TASK-18

## Kiểm thử

- [ ] `npm run lint` sạch
- [ ] Chạy thử script/Dockerfile build từ đầu trên máy sạch (hoặc container sạch) → asset xuất hiện đúng vị trí mong đợi, không lỗi
- [ ] Xác minh checksum `x2t.wasm` khớp với công bố trên GitHub Release của `cryptpad/onlyoffice-x2t-wasm`
- [ ] Đo dung lượng thư mục asset sau khi lọc, ghi số thật vào Ghi chú

## Ghi chú
