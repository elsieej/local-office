# LocalOffice

> Tài liệu của bạn, mặc định chỉ ở máy bạn.

**LocalOffice** (`local-office`) là ứng dụng web cho phép mở, xem và chỉnh sửa tài liệu văn phòng ngay trên trình duyệt — không cần cài Microsoft Office.

Điểm khác biệt của dự án nằm ở **thứ tự ưu tiên**: tài liệu được xử lý cục bộ trước, đưa lên mây sau — và chỉ khi người dùng chủ động yêu cầu. Bạn mở một file, xem nó, sửa nó, tất cả diễn ra trên máy bạn. Chỉ khi bạn muốn chia sẻ hoặc truy cập từ thiết bị khác, file mới rời máy — và ứng dụng nói rõ cho bạn biết.

Triết lý: **riêng tư là mặc định, chia sẻ là lựa chọn.**

---

## Hai khái niệm nền

### Trạng thái tài liệu

Khái niệm trung tâm của LocalOffice: mỗi tài liệu luôn mang một trong hai trạng thái, hiển thị rõ trên giao diện. Mọi tính năng đồng bộ và chia sẻ đều phụ thuộc vào nó.

| Trạng thái        | Ý nghĩa                 | Ai xem được                          |
| ----------------- | ----------------------- | ------------------------------------ |
| 🔒 **Cục bộ**     | Chỉ nằm trên máy bạn    | Chỉ mình bạn, trên đúng thiết bị này |
| ☁️ **Đã tải lên** | Đã lưu trên kho lưu trữ | Bạn, trên mọi thiết bị đã đăng nhập  |

Tài liệu mặc định luôn ở trạng thái **Cục bộ**. Chuyển sang **Đã tải lên** là thao tác có chủ đích của người dùng, kèm xác nhận rõ ràng — không bao giờ diễn ra ngầm. Người dùng gỡ tài liệu khỏi đám mây bất cứ lúc nào để đưa nó về cục bộ.

### Bản gốc và bản hiển thị

Ứng dụng luôn giữ file gốc nguyên vẹn. Thứ hiện trên màn hình là bản dựng lại để xem; khi tải về, người dùng nhận lại file đúng định dạng ban đầu — không phải bản chuyển đổi một chiều.

Ràng buộc này quyết định cách chọn engine tài liệu: phải **khứ hồi** — parse rồi serialize lại _cùng_ một tài liệu, phần nào bộ đọc bỏ qua sẽ mất khi ghi lại. Xem [`docs/TECHSTACK.md`](docs/TECHSTACK.md) — mục "Mảnh còn thiếu".

---

## Các tính năng chính

### 📤 Mở file (Upload)

Kéo–thả, chọn từ máy, hoặc mở nhiều file cùng lúc. Ở bước này **chưa có gì được gửi đi đâu cả** — file chỉ nạp vào trình duyệt để hiển thị.

| Loại tài liệu    | Định dạng       | Xem | Sửa |
| ---------------- | --------------- | :-: | :-: |
| Văn bản          | `.docx`, `.doc` |  ✓  |  ✓  |
| Bảng tính        | `.xlsx`, `.xls` |  ✓  |  ✓  |
| Trình chiếu      | `.pptx`, `.ppt` |  ✓  |  ✓  |
| Tài liệu cố định | `.pdf`          |  ✓  |  —  |
| Văn bản thuần    | `.txt`, `.md`   |  ✓  |  ✓  |

### 👁️ Xem tài liệu (View)

Giữ nguyên định dạng chữ, bảng biểu, hình ảnh. Điều hướng theo trang / sheet / slide tuỳ loại tài liệu, phóng to thu nhỏ, toàn màn hình, tìm kiếm nội dung. Hoạt động hoàn toàn ngoại tuyến.

### ✏️ Chỉnh sửa tài liệu (Edit)

- **Văn bản**: sửa chữ, định dạng, chèn bảng, chèn ảnh
- **Bảng tính**: nhập liệu, dùng công thức, định dạng ô
- **Trình chiếu**: sửa nội dung slide, thay đổi bố cục

Tài liệu sau khi sửa tải về đúng định dạng gốc, dùng tiếp được với Microsoft Office hay bất kỳ phần mềm nào khác.

### 👤 Tài khoản người dùng

Đăng nhập là **tuỳ chọn**. Chưa đăng nhập: dùng đầy đủ tính năng mở, xem, sửa, tải về ở chế độ cục bộ. Đã đăng nhập: thêm tải lên đám mây, đồng bộ giữa các thiết bị, và chia sẻ. Tài khoản mở khoá phần đám mây, không phải điều kiện để dùng ứng dụng.

### 🔗 Chia sẻ qua liên kết

Với tài liệu **đã tải lên**, người dùng tạo được liên kết chia sẻ:

- **Có thời hạn**: tự hết hiệu lực sau khoảng thời gian đã chọn (5 phút, 1 giờ, 1 ngày…)
- **Chỉ xem hoặc cho phép sửa**: tuỳ người tạo quyết định
- **Thu hồi bất cứ lúc nào**, ngay cả khi chưa hết hạn
- **Người nhận không cần tài khoản**: chỉ cần mở liên kết

### 🗑️ Quản lý và xoá tài liệu

Khu vực quản lý liệt kê tài liệu kèm tên, loại, dung lượng, thời gian mở và trạng thái; lọc theo trạng thái để biết file nào đang nằm trên mây; mở lại nhanh, đổi tên, xoá từng file hoặc xoá tất cả.

Thao tác xoá phụ thuộc trạng thái:

- Tài liệu **cục bộ**: xoá thật khỏi thiết bị, không còn bản sao ở đâu
- Tài liệu **đã tải lên**: xoá cả bản trên máy lẫn bản trên kho lưu trữ, đồng thời vô hiệu mọi liên kết chia sẻ đang tồn tại

### 🔒 Riêng tư theo thiết kế

- Mở, xem và sửa tài liệu không cần đăng nhập
- Không tự động tải file lên — luôn cần người dùng xác nhận
- Trạng thái tài liệu hiển thị rõ, không có vùng xám
- Liên kết chia sẻ có thời hạn, không tồn tại vĩnh viễn
- Hoạt động được khi mất mạng, ở chế độ cục bộ

---

## Đối tượng sử dụng

- Người cần mở nhanh tài liệu trên máy không cài Office
- Người làm việc với tài liệu nhạy cảm, muốn kiểm soát thời điểm dữ liệu rời khỏi máy
- Nhóm cần chia sẻ tài liệu nhanh mà không muốn để lại đường dẫn tồn tại mãi
- Doanh nghiệp muốn tự vận hành kho lưu trữ của riêng mình thay vì dùng dịch vụ bên thứ ba
- Người dùng trên máy tính công cộng hoặc thiết bị mượn

---

## Giới hạn cần biết

- Bố cục hiển thị có thể sai khác nhẹ so với Microsoft Office — giới hạn chung của mọi công cụ xem Office ngoài Microsoft, rõ nhất ở tài liệu phức tạp hoặc dùng phông chữ đặc biệt
- Lần tải đầu tiên cần vài giây để chuẩn bị bộ máy xử lý
- Tài liệu quá lớn có thể chậm, do phụ thuộc cấu hình máy người dùng
- Không hỗ trợ cộng tác chỉnh sửa đồng thời theo thời gian thực
- Tính năng đám mây và chia sẻ yêu cầu đăng nhập và có kết nối mạng
- Yêu cầu trình duyệt đời mới

---

## Tài liệu

- [Kiến trúc](docs/ARCHITECTURE.md) — sơ đồ vòng đời trạng thái tài liệu, ranh giới tin cậy giữa trình duyệt và máy chủ, các bất biến kèm theo
- [Ngăn xếp công nghệ](docs/TECHSTACK.md) — các gói và phiên bản, file cấu hình, cấu trúc thư mục, lệnh, và những mảnh còn chưa chọn
- [Quy tắc viết mã](docs/RULE.md) — đặt tên component, hook, file; quy ước TypeScript; style giao diện; ranh giới client/server
- [Mẫu tài liệu](docs/templates/) — [feature](docs/templates/FEATURE_TEMPLATE.md) → [user story](docs/templates/USER_STORY_TEMPLATE.md) → [task](docs/templates/TASK_TEMPLATE.md); quy trình từ task tới issue GitHub và cách đóng ngược lên nằm trong mẫu task

---

## Agent skills

### Issue tracker

Issue được theo dõi bằng GitHub Issues của `elsieej/local-office`, thao tác qua GitHub REST API với `GH_TOKEN` từ `.env.local`. Xem `docs/agents/issue-tracker.md`.

### Triage labels

Dùng nguyên năm nhãn chuẩn: `needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`. Xem `docs/agents/triage-labels.md`.

### Domain docs

Bố cục đơn ngữ cảnh — `CONTEXT.md` và `docs/adr/` ở gốc repo. Xem `docs/agents/domain.md`.

### Git workflow

Một issue = một nhánh = một PR. Quy ước đặt tên nhánh, tạo nhánh từ `main`, rebase, mở PR, squash-merge và dọn nhánh sau merge. Xem `docs/agents/git-workflow.md`.
