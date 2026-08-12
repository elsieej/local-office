# US-<số>: <Tên ngắn gọn>

> Copy thành `docs/stories/<số>_<ten>_story.md` (ví dụ `001_keo_tha_mo_docx_story.md`) rồi điền. Xoá các dòng `<!-- -->`.

**Feature:** [<tên>](../features/<số>_<tên>_feature.md)
**Trạng thái:** ⬜ Nháp · 🟡 Đang làm · ✅ Xong
**Dữ liệu rời máy:** Không · Có → người dùng xác nhận tại `<bước nào>`

---

## Câu chuyện

> **Là** <vai trò cụ thể>, **tôi muốn** <hành động>, **để** <giá trị>.

<!-- Vai trò phải cụ thể: "người dùng chưa đăng nhập", "chủ tài liệu đã tải lên",
     "người nhận liên kết chia sẻ" — không phải "người dùng" chung chung. -->

## Mong muốn

<!-- Mỗi dòng là một điều kiện kiểm chứng được — đọc xong biết chính xác
     lúc nào coi là đạt. Tick khi đã đạt và đã kiểm thử. -->

- [ ] …
- [ ] …
- [ ] …

## Task

<!-- Mỗi task một file theo TASK_TEMPLATE.md, kèm số issue GitHub. -->

- [ ] [TASK-<số>: <tên>](../tasks/<số>_<tên>_task.md) · #<issue>
- [ ] …

## Xong khi

Mọi ô ở **Mong muốn** và **Task** đều tick → đổi **Trạng thái** thành ✅ Xong, rồi tick dòng tương ứng trong file feature.

---

<details>
<summary>Ví dụ đã điền</summary>

**Câu chuyện**

> **Là** người dùng chưa đăng nhập, **tôi muốn** mở file `.docx` bằng kéo–thả, **để** xem nội dung ngay mà không cần cài Office hay tạo tài khoản.

**Mong muốn**

- [x] Kéo file `.docx` vào vùng thả → nội dung hiển thị trong dưới 3 giây với file 1 MB
- [x] File vừa mở mang nhãn 🔒 Cục bộ
- [ ] Tab Network của DevTools không có request nào chứa nội dung file
- [ ] File sai định dạng → báo lỗi rõ ràng, không làm sập trang

**Task**

- [x] [TASK-001: Vùng kéo–thả và đọc file](../tasks/001_vung_keo_tha_task.md) · #12
- [ ] [TASK-002: Parse và render docx trong worker](../tasks/002_docx_worker_task.md) · #13

</details>
