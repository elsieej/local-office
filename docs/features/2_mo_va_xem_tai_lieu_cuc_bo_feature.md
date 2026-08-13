# Feature: Mở và xem tài liệu cục bộ

**Trạng thái:** 🟡 Đang làm
**Chủ trì:** elsie
**Cập nhật:** 2026-08-13

---

## 1. Tóm tắt

Người dùng kéo–thả hoặc chọn file Office/PDF từ máy, file được lưu lại trên chính trình duyệt (không rời máy), hiện trong một danh sách tài liệu kèm trạng thái 🔒 Cục bộ, mở lại được bất cứ lúc nào kể cả khi mất mạng. Với file PDF, xem được ngay trong trình duyệt (điều hướng trang, phóng to thu nhỏ, tìm kiếm).

## 2. Vấn đề

Người dùng cần mở nhanh một tài liệu trên máy không cài Office, hoặc tài liệu nhạy cảm không muốn tải lên đâu cả — hiện chưa có cách nào làm việc đó trong LocalOffice; `src/` mới dừng ở scaffold, chưa có dòng code nào liên quan tới tài liệu.

**Đối tượng ảnh hưởng:** mọi người dùng LocalOffice, kể cả chưa đăng nhập — đây là tính năng nền cho mọi thứ khác.

## 3. Phạm vi

**Trong phạm vi**

- Mở file bằng kéo–thả hoặc hộp thoại chọn file, nhiều file cùng lúc
- Lưu bytes tài liệu cục bộ (OPFS) + metadata (tên, loại, dung lượng, thời gian mở) trong IndexedDB — đúng theo `TECHSTACK.md` §5
- Danh sách tài liệu đã mở, hiển thị trạng thái 🔒 Cục bộ, mở lại, xoá cục bộ
- Xem tài liệu `.pdf` ngay trong trình duyệt: điều hướng trang, phóng to/thu nhỏ, tìm kiếm nội dung, hoạt động ngoại tuyến
- Chấp nhận chọn/thả mọi định dạng liệt kê ở `CLAUDE.md` (`.docx` `.doc` `.xlsx` `.xls` `.pptx` `.ppt` `.pdf` `.txt` `.md`) — validate đuôi file, lưu được, hiện trong danh sách

**Ngoài phạm vi**

- Xem/sửa `.docx` `.xlsx` `.pptx` `.doc` `.xls` `.ppt` `.txt` `.md` — cần chọn engine tài liệu khứ hồi trước cho nhóm Office (xem `TECHSTACK.md` §5); `.txt`/`.md` không vướng ràng buộc khứ hồi nhưng viewer chưa dựng trong feature này. Cả nhóm mở/lưu/liệt kê được nhưng nhấn "xem" sẽ báo rõ "chưa hỗ trợ xem định dạng này", không giả vờ hiển thị nội dung
- Tải lên đám mây, đăng nhập, chia sẻ liên kết — feature riêng, phụ thuộc object storage chưa chọn
- Đổi tên tài liệu, lọc theo trạng thái, "xoá tất cả" — mở rộng của khu vực quản lý, để lại cho feature quản lý tài liệu đầy đủ
- Chỉnh sửa PDF (PDF theo `CLAUDE.md` chỉ Xem, không Sửa)

## 4. Trải nghiệm người dùng

### Luồng chính

1. Người dùng vào trang chủ, thấy vùng kéo–thả tài liệu (hoặc nút "Chọn file")
2. Thả/chọn một file `.pdf` → file được đọc, lưu vào OPFS + IndexedDB, xuất hiện ngay trong danh sách tài liệu với nhãn 🔒 Cục bộ
3. Bấm vào tài liệu trong danh sách → mở trang xem, nội dung PDF hiện ra, điều hướng trang/zoom/tìm kiếm được
4. Đóng tab, mở lại `localhost:3000` sau → tài liệu vẫn còn trong danh sách, mở lại xem được, kể cả khi tắt mạng

### Luồng phụ

- **Thả nhiều file cùng lúc**: mỗi file xử lý độc lập, file lỗi không chặn các file còn lại
- **Thả/chọn file `.docx`/`.xlsx`/`.pptx`**: lưu và liệt kê bình thường, nhưng bấm mở hiện thông báo "chưa hỗ trợ xem định dạng này" thay vì trang trắng hay lỗi
- **File sai định dạng** (không thuộc danh sách hỗ trợ) hoặc **quá dung lượng cho phép**: báo lỗi rõ ràng ngay tại vùng thả, không thêm vào danh sách, không crash
- **Xoá tài liệu cục bộ**: xoá cả bytes trong OPFS lẫn metadata trong IndexedDB, không còn bản sao nào — đúng bất biến `ARCHITECTURE.md` §1
- **Trình duyệt không hỗ trợ OPFS**: báo rõ trình duyệt không tương thích thay vì âm thầm mất dữ liệu

### Trạng thái giao diện

| Trạng thái  | Hiển thị gì                                                                                                                                                                                                                                            |
| ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Rỗng        | Vùng kéo–thả với hướng dẫn, danh sách tài liệu trống kèm gợi ý mở file                                                                                                                                                                                 |
| Đang tải    | Skeleton cho danh sách; spinner/progress khi đang ghi file lớn vào OPFS                                                                                                                                                                                |
| Lỗi         | Thông báo rõ tại vùng thả (sai định dạng, quá dung lượng, ghi OPFS lỗi)                                                                                                                                                                                |
| Ngoại tuyến | Mở/xem tài liệu đã lưu hoạt động bình thường trong phiên đã tải app — toàn bộ luồng không gọi mạng. **Giới hạn:** tải lại cứng (hard reload) trang khi đang mất mạng chưa hoạt động — dev server chưa có service worker phục vụ shell ứng dụng offline |

## 5. Ảnh hưởng tới quyền riêng tư

| Câu hỏi                                                                        | Trả lời                                                                                                                                                                  |
| ------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Có dữ liệu nào rời khỏi máy người dùng không?                                  | Không — toàn bộ luồng (đọc file, lưu OPFS/IndexedDB, xem PDF) chạy trong trình duyệt                                                                                     |
| Nếu có, người dùng xác nhận ở bước nào và thấy thông tin gì?                   | Không áp dụng — feature này không có bước nào gửi dữ liệu lên server                                                                                                     |
| Feature này đọc/ghi trạng thái tài liệu (🔒 / ☁️) ra sao?                      | Mọi tài liệu tạo mới ở đây luôn 🔒 Cục bộ; feature không có đường nào set ☁️ Đã tải lên                                                                                  |
| Có hoạt động được khi mất mạng không?                                          | Có — trong phiên đã tải app, mở/xem tài liệu đã lưu trước đó không gọi mạng. Chưa hoạt động khi tải lại cứng trang lúc mất mạng (chưa có service worker cache app shell) |
| Có yêu cầu đăng nhập không? Nếu có, phần nào vẫn dùng được khi chưa đăng nhập? | Không yêu cầu đăng nhập — toàn bộ feature dùng được ở trạng thái ẩn danh, khớp `CLAUDE.md`                                                                               |

## 6. Ràng buộc kỹ thuật

- **Xử lý ở đâu:** hoàn toàn client — không server function/route mới nào cho luồng mở/lưu/xem
- **Thư viện mới cần thêm:**
  - `pdfjs-dist` — render PDF trong trình duyệt; view-only đúng bản chất định dạng PDF (`CLAUDE.md` không yêu cầu sửa PDF) nên không vướng ràng buộc khứ hồi
  - `idb` (~1kB, wrapper Promise cho IndexedDB của Jake Archibald) — chỉ bọc API trình duyệt đã quyết định dùng ở `TECHSTACK.md` §5, không phải lựa chọn engine tài liệu
  - Không thêm thư viện đọc/ghi Office nào (docx-preview, SheetJS…) trong feature này — tránh đúng cái bẫy "ghép bộ đọc rời không cho khứ hồi" mà `TECHSTACK.md` §5 đã cảnh báo; xem/sửa Office thật để dành cho feature chọn engine riêng
- **Đụng tới schema CSDL:** Không — không bảng Postgres nào liên quan, toàn bộ metadata nằm trong IndexedDB của trình duyệt
- **Ảnh hưởng kích thước bundle:** `pdfjs-dist` là thư viện có kích thước đáng kể (worker riêng, load lazy khi mở PDF, không nằm trong bundle chính); `idb` không đáng kể

## 7. User story

- [x] [US-5: Mở tài liệu bằng kéo–thả hoặc chọn file](../stories/5_mo_tai_lieu_story.md)
- [x] [US-6: Danh sách tài liệu đã mở](../stories/6_danh_sach_tai_lieu_story.md)
- [x] [US-7: Xem tài liệu PDF cục bộ](../stories/7_xem_pdf_cuc_bo_story.md)

Feature chỉ đóng khi mọi ô ở đây đã tick **và** checklist mục 10 đã chạy hết.

## 8. Rủi ro và câu hỏi mở

| Rủi ro / câu hỏi                                                                                              | Ảnh hưởng                                             | Cách xử lý hoặc ai quyết                                                              |
| ------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------- | ------------------------------------------------------------------------------------- |
| Engine tài liệu Office (docx/xlsx/pptx) chưa chọn, có ràng buộc license (AGPL nếu theo hướng ONLYOFFICE/WASM) | Chặn việc xem/sửa Office thật, chỉ PDF dùng được ngay | Quyết định riêng, cần người có thẩm quyền chấp nhận điều khoản license trước khi chọn |
| Dung lượng OPFS có giới hạn theo trình duyệt/thiết bị                                                         | File lớn hoặc nhiều file có thể bị từ chối ghi        | Task viết lớp lưu trữ phải bắt lỗi quota và báo rõ, không âm thầm mất dữ liệu         |
| Trình duyệt cũ không hỗ trợ OPFS (`navigator.storage.getDirectory`)                                           | Không lưu được tài liệu cục bộ                        | Phát hiện sớm, báo "trình duyệt không tương thích" thay vì lỗi khó hiểu               |

## 9. Đo lường thành công

- Mở được file `.pdf` bằng kéo–thả hoặc chọn file, xem lại được sau khi tải lại trang, kể cả ngoại tuyến — xác nhận bằng kiểm thử tay qua Playwright MCP (tắt mạng bằng `browser_network_requests`/route offline) theo từng task
- Không có request mạng nào phát sinh trong toàn bộ luồng mở → lưu → xem — xác nhận qua tab Network

## 10. Checklist trước khi đóng

- [ ] Mọi user story đã xong
- [ ] Trạng thái rỗng / đang tải / lỗi / ngoại tuyến đều đã làm
- [ ] Bảng ảnh hưởng quyền riêng tư khớp với hành vi thực tế đã code
- [ ] Không có dữ liệu nào rời máy mà thiếu bước xác nhận
- [ ] Tuân thủ [`../RULE.md`](../RULE.md)
- [ ] [`../TECHSTACK.md`](../TECHSTACK.md) cập nhật nếu có gói mới hoặc thư mục mới
- [ ] `npm run lint` và `npm run format` sạch
