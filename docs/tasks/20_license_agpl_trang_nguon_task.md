# TASK-20: LICENSE AGPL-3.0 + trang "Tải mã nguồn"

**Story:** [US-9](../stories/9_xem_sua_docx_onlyoffice_story.md)
**Issue:** #41 · **Nhánh:** `docs/agpl-license-source-page`
**Trạng thái:** ✅ Xong

---

## Mục tiêu

Chính thức chuyển license repo sang AGPL-3.0 (quyết định đã chốt với người có thẩm quyền, xem `docs/features/3_xem_sua_tai_lieu_office_that_feature.md` mục 6) và dựng cơ chế "Tải mã nguồn" đáp ứng nghĩa vụ AGPL §13 — làm trước TASK-21 (tích hợp `DocEditor`) đúng như đã cam kết: license đi cùng PR đầu tiên đưa code ONLYOFFICE vào.

## Việc cần làm

- [x] Thêm `LICENSE` (toàn văn AGPL-3.0, bản chính thức từ gnu.org) vào gốc repo · `LICENSE`
- [x] Khai `"license": "AGPL-3.0-or-later"` trong `package.json`
- [x] Ghi commit SHA lúc build vào bundle (Vite `define`, đọc qua `git rev-parse HEAD`, fallback rõ ràng nếu không có `.git`) — dùng để trang "Tải mã nguồn" trỏ đúng bản đang chạy · `vite.config.ts`, `src/vite-env.d.ts`, `src/constants/build-info.ts`
- [x] Route `/source`: giải thích ngắn gọn AGPL-3.0, link tới repo GitHub tại đúng commit đang chạy, hướng dẫn tự build lại (`npm run vendor:onlyoffice` cần Docker) · `src/routes/source.tsx`
- [x] Footer: sửa "© {year} Your name here. All rights reserved." (placeholder từ scaffold, giờ sai sự thật — AGPL không phải "all rights reserved") + thêm link "Tải mã nguồn" trỏ `/source` · `src/components/footer.tsx`

## Kiểm thử

- [x] `npm run lint` sạch
- [x] Kiểm thử qua Playwright MCP: vào `/source` → hiện đúng commit SHA hiện tại (`4beccb82...`, khớp `git rev-parse HEAD` cục bộ lúc test), link GitHub đúng định dạng `https://github.com/elsieej/local-office/tree/<sha>`, 0 lỗi console
- [x] Kiểm thử qua Playwright MCP: link "Tải mã nguồn" ở footer trang chủ, bấm vào tới đúng `/source`
- [x] Trường hợp biên: build không có `.git` — xác nhận qua đọc code (`try/catch` quanh `execFileSync('git', ...)`, nhánh UI riêng khi `GIT_COMMIT_SHA` là `null`), không thử bằng cách xoá `.git` thật của repo đang dùng vì rủi ro không cần thiết

## Ghi chú

Repo trước task này **không có LICENSE nào** — đây là lần đầu chính thức khai báo giấy phép, đúng như đã ghi ở `docs/features/3_xem_sua_tai_lieu_office_that_feature.md` mục 6.

Trang `/source` đọc commit SHA từ hằng số ghi cứng lúc build (`__GIT_COMMIT_SHA__`), không đọc runtime — đúng tinh thần "mã nguồn của **bản đang chạy**" mà AGPL §13 yêu cầu, không phải commit mới nhất trên GitHub. Deploy production cần đảm bảo build chạy trong checkout Git thật (không phải tarball đã strip `.git`), nếu không trang sẽ hiện "không xác định" — chấp nhận được vì đúng sự thật, còn hơn hiện sai.
