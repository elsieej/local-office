# TASK-<số>: <Tên việc>

> Copy thành `docs/tasks/<số>_<ten>_task.md` (ví dụ `1_vung_keo_tha_task.md`) rồi điền. Xoá các dòng `<!-- -->`.
> Một task = một issue GitHub = một nhánh = một PR.

**Story:** [US-<số>](../stories/<số>_<tên>_story.md)
**Issue:** #<số> · **Nhánh:** `feat/<tên-ngắn>`
**Trạng thái:** ⬜ Chưa làm · 🟡 Đang làm · 🔵 Chờ review · ✅ Xong

---

## Mục tiêu

<!-- Một câu: task này làm cho phần nào của story chạy được. -->

## Việc cần làm

<!-- Chia nhỏ tới mức mỗi ô là một commit đọc hiểu được. Ô nào cần hơn nửa ngày
     thì chia tiếp. Ghi kèm file dự kiến đụng tới. -->

- [ ] … · `src/…`
- [ ] … · `src/…`
- [ ] …

## Kiểm thử

<!-- Cách kiểm chứng cụ thể, không phải "test kỹ". Ghi rõ lệnh chạy hoặc
     thao tác trên giao diện và kết quả mong đợi. Task đụng tới UI thì
     "thao tác trên giao diện" nghĩa là dùng Playwright MCP trên trình
     duyệt thật — xem RULE.md §9, không phải suy đoán từ code. -->

- [ ] `npm run lint` sạch
- [ ] Kiểm thử tay: <thao tác> → <kết quả mong đợi>
- [ ] Trường hợp biên: <đầu vào bất thường> → <xử lý mong đợi>

## Ghi chú

<!-- Tuỳ chọn: ràng buộc đã biết, quyết định phát sinh trong lúc làm, việc để lại sau. -->

---

## Quy trình

Chuỗi trạng thái: **Task → User Story → Feature**. Mỗi cấp chỉ đóng khi cấp dưới đã đóng hết.

### 1. Viết task

Điền **Việc cần làm** và **Kiểm thử** trước khi mở issue. Task chưa chia nhỏ được là dấu hiệu story còn mơ hồ — quay lại story trước.

### 2. Tạo issue GitHub

```bash
gh issue create \
  --title "TASK-<số>: <tên việc>" \
  --body-file docs/tasks/<số>_<tên>_task.md \
  --label task
```

Điền số issue trả về vào phần đầu file này và vào bảng **Task** của story.

### 3. Làm

```bash
git switch -c feat/<tên-ngắn>
```

Tick từng ô **Việc cần làm** khi xong. Tuân thủ [`../RULE.md`](../RULE.md).

### 4. Kiểm thử

```bash
npm run format && npm run lint
```

Tick từng ô **Kiểm thử**. Ô nào không tick được thì task chưa xong — đừng mở PR.

### 5. PR và đóng issue

```bash
gh pr create --fill --base main
```

Ghi `Closes #<số>` trong mô tả PR để issue tự đóng khi merge. Merge xong → **Trạng thái** task thành ✅ Xong.

### 6. Đóng story

Mọi task của story đã ✅ **và** mọi ô **Mong muốn** trong story đã tick → đổi trạng thái story thành ✅ Xong, rồi tick dòng story đó trong file feature.

### 7. Đóng feature

Mọi story trong bảng **User story** của feature đã tick → chạy nốt checklist cuối file feature → đổi trạng thái feature thành ✅ Xong.

---

## Trước khi dùng quy trình này

Repo hiện **chưa có remote GitHub, chưa có commit nào**, và **`gh` chưa được cài**. Cần làm một lần:

```bash
git add -A && git commit -m "chore: initial commit"
winget install --id GitHub.cli     # hoặc tải từ cli.github.com
gh auth login
gh repo create local-office --private --source=. --push
```

Nhánh hiện tại là `master`; các lệnh trên dùng `main` làm nhánh đích — đổi cho khớp trước khi chạy.
