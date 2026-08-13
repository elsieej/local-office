# TASK-11: Chuẩn hoá line ending LF qua `.gitattributes`

**Story:** Không thuộc user story nào — dọn dẹp hạ tầng, phát hiện xuyên suốt các task trước: gần như mọi lần `git switch`/`git checkout` đều để lại một loạt file "M" giả trong `git status` (nội dung thật không đổi — `git diff` luôn rỗng), phải xác nhận thủ công nhiều lần trước khi commit, gây nhiễu và tốn thời gian.
**Issue:** #TBD · **Nhánh:** `fix/normalize-line-endings`
**Trạng thái:** 🟡 Đang làm

---

## Mục tiêu

Loại bỏ nhiễu "modified nhưng diff rỗng" do `core.autocrlf=true` trên máy dev ghi CRLF ra đĩa lúc checkout dù blob trong git đã là LF, mà không đụng tới git config của người dùng (chỉ sửa được qua file version-controlled).

## Nguyên nhân

`core.autocrlf=true` là cấu hình cục bộ của máy (`git config --get core.autocrlf` → `true`), không đặt trong repo. Khi không có `.gitattributes` ép quy tắc, git tự ý:

- Lúc **checkout**: chuyển LF (lưu trong blob) → CRLF (ghi ra đĩa).
- Lúc **git status**: so sánh file CRLF trên đĩa với blob LF trong index → báo `M`, dù nội dung thật giống hệt.
- `git diff`/`git diff --stat` normalize line ending nên luôn ra rỗng — chính là dấu hiệu để phân biệt "nhiễu" với thay đổi thật, đã dùng suốt các task trước để lọc trước khi `git add`.

## Việc cần làm

- [x] Thêm `.gitattributes` ở gốc repo: `* text=auto eol=lf` — ép mọi file text checkout ra LF bất kể `core.autocrlf` của người dùng · `.gitattributes`
- [x] `git add --renormalize .` để xác nhận không có file nào cần viết lại (blob trong git đã là LF sẵn, vấn đề chỉ nằm ở bước checkout) · toàn repo

## Kiểm thử

- [x] Sau khi commit `.gitattributes`, `git switch main` rồi `git switch` quay lại nhánh này → `git status --porcelain` sạch, không còn cảnh báo "LF will be replaced by CRLF" và không còn file "M" giả

## Ghi chú

Không sửa `core.autocrlf` bằng `git config` (chỉ sửa được qua file trong repo — global git config là của người dùng, không phải chuyện của agent). `.gitattributes` là cách chuẩn, không phụ thuộc cấu hình máy từng người, hoạt động giống nhau trên mọi máy dev sau khi pull.
