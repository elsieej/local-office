# Feature: Xem và sửa tài liệu Office thật (ONLYOFFICE)

**Trạng thái:** ⬜ Nháp
**Chủ trì:** elsie
**Cập nhật:** 2026-08-13

---

## 1. Tóm tắt

Người dùng mở file `.docx`/`.xlsx`/`.pptx` (đã lưu cục bộ từ [Feature 2](2_mo_va_xem_tai_lieu_cuc_bo_feature.md)) và thấy nội dung thật ngay trong trình duyệt — không phải placeholder — sửa được, tải về đúng định dạng gốc dùng tiếp với Microsoft Office. Engine đứng sau là ONLYOFFICE (sdkjs/web-apps + bộ chuyển đổi `x2t` build WebAssembly), nhúng và chạy hoàn toàn trong trình duyệt, không có Document Server nào ở xa.

## 2. Vấn đề

Sau Feature 2, `.docx`/`.xlsx`/`.pptx` mở/lưu/liệt kê được nhưng bấm "xem" chỉ hiện "Chưa hỗ trợ xem định dạng này" — đúng như phạm vi đã chốt lúc đó, chờ quyết định engine. Quyết định license đã có (xem mục 6), nhưng người dùng vẫn không sửa được file Word/Excel/PowerPoint thật mà không rời khỏi LocalOffice.

**Đối tượng ảnh hưởng:** người dùng cần sửa nhanh một file Office mà không cài Microsoft Office hoặc không muốn tài liệu rời máy qua dịch vụ đám mây thứ ba (Google Docs, Office Online…).

## 3. Phạm vi

**Trong phạm vi**

- Xem và sửa nội dung `.docx`/`.xlsx`/`.pptx`: gõ chữ, định dạng cơ bản, công thức (bảng tính), nội dung slide — mức tương đương ONLYOFFICE Community Edition
- Lưu lại đúng khứ hồi (OOXML) — file tải về mở lại được bằng Microsoft Office, không mất phần ONLYOFFICE không hiểu
- Toàn bộ engine (sdkjs, web-apps, fonts, `x2t.wasm`) tự host trong bundle LocalOffice — không gọi Document Server hay bất kỳ máy chủ ONLYOFFICE nào ở xa
- Build pipeline lấy asset engine từ image Docker chính thức `onlyoffice/documentserver` (theo mô hình tham khảo [baotlake/office-website](https://github.com/baotlake/office-website)) — xem mục 6, đây là thay đổi hạ tầng build, không phải một gói npm
- Cơ chế "Tải mã nguồn" hiển thị trên giao diện, đáp ứng nghĩa vụ AGPL §13 (xem mục 6)
- Thêm `LICENSE` AGPL-3.0 cho toàn repo + khai `"license"` trong `package.json` — làm cùng lúc với PR đưa code ONLYOFFICE đầu tiên vào, không làm trước

**Ngoài phạm vi**

- `.doc`/`.xls`/`.ppt` (định dạng nhị phân OLE2 cũ) — `x2t` có convert được nhưng chưa xác nhận khứ hồi đúng mức chấp nhận được; để riêng, xác nhận bằng thử nghiệm trước khi mở rộng
- Cộng tác sửa đồng thời nhiều người/thời gian thực — `CLAUDE.md` đã nêu rõ không hỗ trợ
- Tải lên đám mây / chia sẻ liên kết cho file đã sửa — phụ thuộc feature object storage riêng, chưa chọn
- Chạy ONLYOFFICE Document Server thật (server-side, nhiều người dùng chung một phiên) — đi ngược triết lý "cục bộ trước" của LocalOffice, không cân nhắc
- Plugin/marketing ONLYOFFICE (spell-check nâng cao, mẫu template online…) — chỉ giữ phần lõi editor cần cho khứ hồi

## 4. Trải nghiệm người dùng

### Luồng chính

1. Người dùng bấm vào một tài liệu `.docx` trong danh sách (đã lưu từ Feature 2)
2. Thay vì placeholder, trang xem hiện editor ONLYOFFICE nhúng, nội dung file hiện đúng như mở bằng Word
3. Sửa nội dung → bấm lưu → file cập nhật lại trong OPFS (vẫn 🔒 Cục bộ), không có bước nào gửi ra ngoài máy
4. Tải về → file `.docx` mở được bằng Microsoft Office, giữ đúng định dạng đã sửa

### Luồng phụ

- **Mở `.xlsx`/`.pptx`**: cùng luồng, đổi loại editor (spreadsheet/presentation) theo `sdkjs`
- **File hỏng/không parse được**: `x2t` báo lỗi rõ, không làm treo trang, không mất file gốc trong OPFS
- **Trình duyệt chặn WASM hoặc thiếu bộ nhớ** (file rất lớn): báo lỗi rõ, gợi ý dùng nút "Tải về" mở bằng phần mềm khác thay vì treo vô thời hạn
- **Lần đầu mở editor**: tải engine (sdkjs/web-apps/`x2t.wasm`) lần đầu cần thời gian — hiện tiến trình rõ ràng, không phải màn hình trắng im lặng

### Trạng thái giao diện

| Trạng thái  | Hiển thị gì                                                                                           |
| ----------- | ----------------------------------------------------------------------------------------------------- |
| Rỗng        | Không áp dụng riêng cho feature này — dùng chung danh sách tài liệu của Feature 2                     |
| Đang tải    | Tiến trình tải engine lần đầu (có thể vài giây tới vài chục giây tuỳ kích thước, xem mục 8)           |
| Lỗi         | File hỏng, WASM không chạy được, hoặc hết bộ nhớ — thông báo rõ, không mất file gốc                   |
| Ngoại tuyến | Chỉ hoạt động nếu engine đã tải/cache trong phiên trước — xem giới hạn hard-reload đã ghi ở Feature 2 |

## 5. Ảnh hưởng tới quyền riêng tư

| Câu hỏi                                                                        | Trả lời                                                                                                                                                                                                                                                      |
| ------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Có dữ liệu nào rời khỏi máy người dùng không?                                  | Không — mọi convert/sửa chạy qua `x2t.wasm` + `sdkjs` local. **Cần kiểm chứng bằng `browser_network_requests`**: bản ONLYOFFICE gốc có thể gọi mặc định tới các domain của họ (dictionary, help center, translate) — phải rà và tắt hết trước khi coi là đạt |
| Nếu có, người dùng xác nhận ở bước nào và thấy thông tin gì?                   | Không áp dụng nếu rà soát ở trên xác nhận không có request nào ra ngoài                                                                                                                                                                                      |
| Feature này đọc/ghi trạng thái tài liệu (🔒 / ☁️) ra sao?                      | Sửa lưu lại đè lên OPFS, tài liệu giữ nguyên 🔒 Cục bộ — feature này không có đường nào set ☁️ Đã tải lên                                                                                                                                                    |
| Có hoạt động được khi mất mạng không?                                          | Trong phiên đã tải engine — có. Lần đầu tải engine cần mạng (asset nặng). Hard reload khi mất mạng: chưa hoạt động (giới hạn đã ghi ở Feature 2)                                                                                                             |
| Có yêu cầu đăng nhập không? Nếu có, phần nào vẫn dùng được khi chưa đăng nhập? | Không yêu cầu đăng nhập — khớp `CLAUDE.md`, xem/sửa Office cục bộ không phụ thuộc tài khoản                                                                                                                                                                  |

## 6. Ràng buộc kỹ thuật

- **Xử lý ở đâu:** hoàn toàn client — không server function/route mới nào để convert/sửa tài liệu
- **Thư viện/asset mới cần thêm:**
  - `sdkjs` (418 MB) + `web-apps` (783 MB) + `sdkjs-plugins` (37 MB) (ONLYOFFICE editor core, JS/CSS/HTML — đã đo thật ở [TASK-18](../tasks/18_do_kich_thuoc_asset_onlyoffice_task.md)) — không phải gói npm, vendor từ image `onlyoffice/documentserver` qua build pipeline riêng (Docker), theo mô hình `Dockerfile` của `office-website`. Số đo là cận trên trên đĩa server (mọi loại editor, mọi ngôn ngữ trợ giúp), chưa lọc theo nhu cầu thật của LocalOffice
  - `x2t` build WebAssembly (bộ chuyển đổi định dạng, ~9.2 MB, đúng bộ dùng để khứ hồi OOXML). **Không lấy được từ image `onlyoffice/documentserver`** (image chính thức chỉ có binary ELF native ~45 MB) — vendor từ [`cryptpad/onlyoffice-x2t-wasm`](https://github.com/cryptpad/onlyoffice-x2t-wasm) (fork `git subtree` từ `ONLYOFFICE/core`, có GitHub Release kèm checksum sha512), một release tag cụ thể, không lấy binary đã build sẵn của `office-website`
  - Fonts hệ thống ONLYOFFICE dùng để render đúng (`AllFonts.js`/`themes.js`, sinh lúc container khởi động trong bản gốc) — đã đo thật: 162 MB
- **Build pipeline:** cần Docker để lấy asset từ `onlyoffice/documentserver` image — thay đổi hạ tầng build của repo, ảnh hưởng tới cách deploy (không còn chỉ `npm run build`)
- **License:** toàn repo chuyển AGPL-3.0 — đã được người có thẩm quyền xác nhận (2026-08-13) — thêm `LICENSE` + khai `package.json` cùng PR đầu tiên đưa code ONLYOFFICE vào
- **Đụng tới schema CSDL:** Không
- **Ảnh hưởng kích thước bundle:** lớn — `sdkjs`+`web-apps`+`sdkjs-plugins`+`fonts` ~1.4 GB trên đĩa server (cận trên, chưa lọc theo nhu cầu thật, xem [TASK-18](../tasks/18_do_kich_thuoc_asset_onlyoffice_task.md)), `x2t.wasm` ~9.2 MB (nguồn: [`cryptpad/onlyoffice-x2t-wasm`](https://github.com/cryptpad/onlyoffice-x2t-wasm)). Dung lượng trình duyệt thật sự tải lần đầu vẫn chưa đo được — đo ở [US-9](../stories/9_xem_sua_docx_onlyoffice_story.md), cần editor chạy thật

## 7. User story

- [x] [US-8: Đo kích thước thật + dựng pipeline vendor asset ONLYOFFICE (spike)](../stories/8_do_kich_thuoc_pipeline_asset_story.md)
- [ ] [US-9: Xem và sửa tài liệu `.docx` thật qua ONLYOFFICE](../stories/9_xem_sua_docx_onlyoffice_story.md)

US-9 chỉ làm `.docx`. `.xlsx`/`.pptx` (spreadsheet/presentation editor của `sdkjs`) để lại cho một US sau, chưa viết — mở khi US-9 xong và còn muốn tiếp tục feature này.

Feature chỉ đóng khi mọi ô ở đây đã tick **và** checklist mục 10 đã chạy hết.

## 8. Rủi ro và câu hỏi mở

| Rủi ro / câu hỏi                                                                                                                                                                                                                                                                                                    | Ảnh hưởng                                                                                                                                            | Cách xử lý hoặc ai quyết                                                                                                            |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| Dung lượng server-side đã đo (~1.4 GB: `sdkjs` 418 MB + `web-apps` 783 MB + `sdkjs-plugins` 37 MB + `fonts` 162 MB, xem [TASK-18](../tasks/18_do_kich_thuoc_asset_onlyoffice_task.md)), nhưng **dung lượng trình duyệt thật sự tải lần đầu vẫn chưa đo được**                                                       | Số trên đĩa là cận trên (mọi editor/ngôn ngữ), không phải payload thật; chưa biết có giữ được lời hứa "tải lần đầu vài giây" (`CLAUDE.md`) hay không | Đo ở TASK-22 của [US-9](../stories/9_xem_sua_docx_onlyoffice_story.md), khi editor `.docx` chạy thật qua `browser_network_requests` |
| ~~`x2t` bản WASM không lấy được trực tiếp từ image `onlyoffice/documentserver`~~ — **đã giải quyết**: nguồn là [`cryptpad/onlyoffice-x2t-wasm`](https://github.com/cryptpad/onlyoffice-x2t-wasm), fork `git subtree` từ `ONLYOFFICE/core`, build Docker/Emscripten công khai, có GitHub Release kèm checksum sha512 | Không còn là rủi ro cung ứng mù — có nguồn kiểm chứng được                                                                                           | TASK-19 vendor từ một release tag cụ thể + xác minh checksum, không lấy binary đã build sẵn của `office-website`                    |
| Cần Docker để build — repo hiện tại chỉ cần Node/npm                                                                                                                                                                                                                                                                | Đổi quy trình deploy/CI, có thể chặn một số môi trường build nhẹ                                                                                     | Xác nhận cùng người vận hành hạ tầng trước khi khoá pipeline; ghi lại ở `docs/TECHSTACK.md` khi quyết                               |
| ONLYOFFICE bản gốc có thể gọi ra ngoài (dictionary, help, translate CDN) mặc định                                                                                                                                                                                                                                   | Vi phạm bất biến "riêng tư là mặc định" nếu không rà soát/tắt hết                                                                                    | Đo ở TASK-22 của US-9 cùng lúc với payload — bắt buộc kiểm chứng bằng `browser_network_requests` trước khi coi feature đạt yêu cầu  |
| `.doc`/`.xls`/`.ppt` (OLE2 cũ) có khứ hồi đúng qua `x2t` không                                                                                                                                                                                                                                                      | Nếu không, nhóm định dạng cũ phải giữ nguyên placeholder "chưa hỗ trợ" thay vì mở luôn cho cả nhóm                                                   | Thử nghiệm riêng với file thật, không giả định giống OOXML                                                                          |
| Nghĩa vụ AGPL §13 ("Tải mã nguồn") cần cơ chế thật trên UI, không chỉ file `LICENSE` tĩnh trong repo                                                                                                                                                                                                                | Thiếu thì vi phạm điều khoản license đã chọn                                                                                                         | Thiết kế cụ thể ở story tích hợp editor — có thể là trang `/source` trỏ tới bản tag Git tương ứng đang chạy                         |

## 9. Đo lường thành công

- Mở được file `.docx`/`.xlsx`/`.pptx` thật, sửa nội dung, tải về, mở lại bằng Microsoft Office không mất định dạng — xác nhận tay bằng file thật, không chỉ nhìn qua trình duyệt
- Không có request mạng nào ra ngoài domain LocalOffice trong suốt luồng xem/sửa — xác nhận qua `browser_network_requests`
- Thời gian tải engine lần đầu đo được cụ thể, so sánh với kỳ vọng "vài giây" của `CLAUDE.md`, ghi rõ nếu vượt

## 10. Checklist trước khi đóng

- [ ] Mọi user story đã xong
- [ ] Trạng thái rỗng / đang tải / lỗi / ngoại tuyến đều đã làm
- [ ] Bảng ảnh hưởng quyền riêng tư khớp với hành vi thực tế đã code
- [ ] Không có dữ liệu nào rời máy mà thiếu bước xác nhận
- [ ] Tuân thủ [`../RULE.md`](../RULE.md)
- [ ] [`../TECHSTACK.md`](../TECHSTACK.md) cập nhật nếu có gói mới hoặc thư mục mới
- [ ] `npm run lint` và `npm run format` sạch
