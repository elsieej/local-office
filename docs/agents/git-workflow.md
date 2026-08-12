# Nhánh Git để giải quyết issue

Quy trình chuẩn khi một agent (hoặc người) nhận một issue và cần code hoá nó thành PR. Nguyên tắc: **một issue = một nhánh = một PR** (đã nêu trong [`docs/templates/TASK_TEMPLATE.md`](../templates/TASK_TEMPLATE.md)). File này khai triển chi tiết phần Git.

## Đặt tên nhánh

```
<type>/<mô-tả-ngắn>
```

- `<type>` lấy nguyên từ bảng Conventional Commits ở [`docs/RULE.md`](../RULE.md#8-commit): `feat`, `fix`, `docs`, `refactor`, `perf`, `test`, `build`, `ci`, `chore`. Chọn type khớp với commit chính của nhánh — nhánh sửa lỗi dùng `fix/…`, không phải `feat/…`.
- `<mô-tả-ngắn>` viết thường, nối bằng `-`, 2–4 từ, không lặp lại tên type. Ưu tiên bám sát tiêu đề issue thay vì diễn giải lại.
- Có issue number thì thêm vào cuối, tách bằng `-`: `feat/vung-keo-tha-42`. Không bắt buộc nhưng giúp tra cứu nhanh khi có nhiều nhánh mở song song.

```
feat/vung-keo-tha
fix/trang-trang-docx-rong
docs/quy-uoc-dat-ten
refactor/tach-hook-upload
```

Tránh: `patch-1`, `my-branch`, `fix-bug`, tên chứa hoa/thường lẫn lộn, hoặc tên không nói lên nội dung.

## Tạo nhánh

Luôn xuất phát từ `main` đã cập nhật, không xuất phát từ nhánh làm dở khác trừ khi cố ý rebase chồng:

```bash
git switch main
git pull --ff-only
git switch -c feat/<mô-tả-ngắn>
```

`--ff-only` khi pull `main` để phát hiện sớm nếu local `main` đã trôi khỏi remote thay vì tự tạo merge commit không mong muốn.

## Trong lúc làm

- Mỗi ô trong phần **Việc cần làm** của task ứng với một commit đọc hiểu được — xem [TASK_TEMPLATE.md](../templates/TASK_TEMPLATE.md). Đừng gộp nhiều ô không liên quan vào một commit.
- Thông điệp commit theo đúng Conventional Commits ([RULE.md §8](../RULE.md#8-commit)); hook `commit-msg` chặn commit sai chuẩn nên sai là biết ngay.
- Nhánh sống lâu (issue lớn, nhiều ngày) thì đồng bộ định kỳ với `main` bằng rebase, không merge `main` vào nhánh:

  ```bash
  git fetch origin
  git rebase origin/main
  ```

  Giữ lịch sử nhánh thẳng, PR review dễ đọc diff hơn. Đã push nhánh cho người khác cùng làm thì hỏi trước khi rebase — rebase viết lại lịch sử, cần `push --force-with-lease` sau đó.

## Mở PR

```bash
gh pr create --fill --base main
```

- Body PR phải có `Closes #<số-issue>` (hoặc `Fixes #<số>`) để issue tự đóng khi PR merge — xem quy ước ở [`issue-tracker.md`](issue-tracker.md) nếu tạo/đóng issue qua REST API thay vì `gh`.
- Chạy `npm run format && npm run lint` sạch **trước khi** mở PR, không dựa vào CI để phát hiện lỗi format/lint.
- PR nhỏ, phạm vi khớp đúng một issue. Phát sinh việc ngoài phạm vi issue → mở issue mới, đừng nhét vào PR đang có.

## Sau khi merge

- Merge bằng **squash**: lịch sử `main` giữ một commit gọn cho mỗi issue, khớp thông điệp PR (đã theo Conventional Commits).
- Xoá nhánh remote lẫn local sau merge:

  ```bash
  git switch main && git pull --ff-only
  git branch -d feat/<mô-tả-ngắn>
  ```

  (`gh pr merge --delete-branch` làm luôn bước xoá remote nếu merge qua `gh`.)

- Cập nhật trạng thái task/story/feature theo bậc thang mô tả ở bước 6–7 của [TASK_TEMPLATE.md](../templates/TASK_TEMPLATE.md).

## Xung đột merge

Đụng conflict khi rebase hoặc merge: dùng skill `resolving-merge-conflicts` thay vì tự giải quyết tay không có checklist. Không bao giờ dùng `git checkout --theirs`/`--ours` hàng loạt mà không đọc từng đoạn conflict — dễ xoá nhầm thay đổi hợp lệ của phía kia.
