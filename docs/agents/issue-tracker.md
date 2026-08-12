# Issue tracker: GitHub REST API

Issue và spec của repo này nằm ở GitHub Issues của `elsieej/local-office`.

Mọi thao tác đi thẳng qua GitHub REST API, xác thực bằng `GH_TOKEN` đọc từ `.env.local`.

## Chuẩn bị

`.env.local` (đã nằm trong `.gitignore` qua `*.local`) chứa `GH_TOKEN=...`. Nạp token vào shell trước khi gọi API:

```bash
export GH_TOKEN=$(grep -E '^GH_TOKEN=' .env.local | cut -d= -f2- | tr -d "\"'\r")
export GH_REPO=elsieej/local-office
```

Tương đương trong PowerShell:

```powershell
$env:GH_TOKEN = ((Get-Content .env.local | Select-String '^GH_TOKEN=') -split '=', 2)[1].Trim('"', "'")
$env:GH_REPO  = 'elsieej/local-office'
```

Mọi lệnh dưới đây dùng chung ba header:

```bash
-H "Authorization: Bearer $GH_TOKEN"
-H "Accept: application/vnd.github+json"
-H "X-GitHub-Api-Version: 2022-11-28"
```

Không bao giờ in `GH_TOKEN` ra output, không đưa nó vào issue body, comment, hay commit.

## Quy ước

- **Tạo issue**:

  ```bash
  curl -sX POST "https://api.github.com/repos/$GH_REPO/issues" \
    -H "Authorization: Bearer $GH_TOKEN" -H "Accept: application/vnd.github+json" \
    -d @- <<'JSON'
  { "title": "...", "body": "...", "labels": ["needs-triage"] }
  JSON
  ```

  Body nhiều dòng: dựng JSON bằng `jq -n --arg body "$BODY" '{title:$t, body:$body}'` để escape đúng, đừng nối chuỗi tay.

- **Đọc issue** (issue + comment là hai lời gọi riêng):

  ```bash
  curl -s ".../repos/$GH_REPO/issues/<number>"           # title, body, labels, state, assignees
  curl -s ".../repos/$GH_REPO/issues/<number>/comments"  # comment
  ```

- **Liệt kê issue**:

  ```bash
  curl -s ".../repos/$GH_REPO/issues?state=open&per_page=100&labels=needs-triage" \
    | jq '[.[] | select(.pull_request == null) | {number, title, body, labels: [.labels[].name]}]'
  ```

  ⚠️ Endpoint `/issues` **trả về cả pull request**. Luôn lọc `select(.pull_request == null)` khi chỉ muốn issue — đây là khác biệt lớn nhất so với `gh issue list`.

- **Bình luận**: `POST /repos/$GH_REPO/issues/<number>/comments` với `{"body": "..."}`
- **Gắn nhãn**: `POST /repos/$GH_REPO/issues/<number>/labels` với `{"labels": ["ready-for-agent"]}`
- **Gỡ nhãn**: `DELETE /repos/$GH_REPO/issues/<number>/labels/<tên-nhãn>` (URL-encode tên nhãn nếu có ký tự đặc biệt)
- **Đóng issue**: bình luận trước (nếu cần lời giải thích), rồi `PATCH /repos/$GH_REPO/issues/<number>` với `{"state": "closed"}`. REST không có tham số `--comment` gộp như `gh issue close`.

Phân trang: mặc định 30 mục/trang. Dùng `per_page=100` và đi tiếp theo header `Link: <...>; rel="next"` khi danh sách dài.

## Pull request như một mặt tiếp nhận yêu cầu

**PRs as a request surface: no.** _(Đổi thành `yes` nếu repo này coi PR từ bên ngoài là yêu cầu tính năng; `/triage` đọc cờ này. Giữ nguyên dòng cờ tiếng Anh ở trên — skill dò đúng chuỗi đó.)_

Khi đặt `yes`, PR chạy qua đúng bộ nhãn và trạng thái như issue:

- **Đọc PR**: `GET /repos/$GH_REPO/pulls/<number>`; lấy diff bằng cùng URL với header `Accept: application/vnd.github.v3.diff`.
- **Liệt kê PR bên ngoài để triage**: `GET /repos/$GH_REPO/pulls?state=open&per_page=100`, rồi chỉ giữ `author_association` là `CONTRIBUTOR`, `FIRST_TIME_CONTRIBUTOR`, hoặc `NONE` (bỏ `OWNER`/`MEMBER`/`COLLABORATOR`).
- **Bình luận / gắn nhãn / đóng**: PR cũng là issue ở tầng REST — dùng chính các endpoint `/issues/<number>/comments` và `/issues/<number>/labels`; đóng bằng `PATCH /repos/$GH_REPO/pulls/<number>` với `{"state":"closed"}`.

GitHub dùng chung một không gian số cho issue và PR, nên `#42` trần có thể là một trong hai — xác định bằng `GET /pulls/42`, trả 404 thì đó là issue.

## Khi một skill nói "publish to the issue tracker"

Tạo issue bằng `POST /repos/$GH_REPO/issues`.

## Khi một skill nói "fetch the relevant ticket"

Gọi `GET /repos/$GH_REPO/issues/<number>` kèm `GET .../issues/<number>/comments`.

## Thao tác wayfinding

Dùng bởi `/wayfinder`. **Bản đồ** (map) là một issue duy nhất, các ticket là issue **con** của nó.

- **Map**: một issue gắn nhãn `wayfinder:map`, chứa phần Notes / Decisions-so-far / Fog trong body. Tạo bằng `POST /issues` với `"labels": ["wayfinder:map"]`.
- **Ticket con**: liên kết vào map dưới dạng sub-issue: `POST /repos/$GH_REPO/issues/<map>/sub_issues` với `{"sub_issue_id": <database-id-của-con>}`. Nếu sub-issue chưa bật, thêm issue con vào task list trong body của map và đặt `Part of #<map>` ở đầu body issue con. Nhãn: `wayfinder:<type>` (`research`/`prototype`/`grilling`/`task`).
- **Chặn (blocking)**: dùng issue dependencies gốc của GitHub — `POST /repos/$GH_REPO/issues/<child>/dependencies/blocked_by` với `{"issue_id": <blocker-db-id>}`. `<blocker-db-id>` là **database id** dạng số (`GET /repos/$GH_REPO/issues/<n> | jq .id`), _không phải_ `#number` hay `node_id`. GitHub trả về `issue_dependencies_summary.blocked_by` (chỉ đếm blocker còn mở — đây là cổng chặn thực tế). Nếu không dùng được, lùi về dòng `Blocked by: #<n>, #<n>` ở đầu body issue con. Ticket được mở chặn khi mọi blocker đã đóng.
- **Truy vấn frontier**: liệt kê issue con còn mở của map (`GET /issues?state=open`, giới hạn trong sub-issue / task list của map), bỏ những cái còn blocker mở (`issue_dependencies_summary.blocked_by > 0`, hoặc còn issue mở trong dòng `Blocked by`) hoặc đã có assignee; cái đứng trước trong map thắng.
- **Nhận việc (claim)**: `POST /repos/$GH_REPO/issues/<n>/assignees` với `{"assignees": ["<login>"]}` — thao tác ghi đầu tiên của phiên. REST **không có `@me`**; lấy login trước bằng `GET https://api.github.com/user | jq -r .login` (với token hiện tại là `elsieej`).
- **Chốt (resolve)**: `POST /issues/<n>/comments` với câu trả lời, rồi `PATCH /issues/<n>` `{"state":"closed"}`, rồi thêm con trỏ ngữ cảnh (gist + link) vào phần Decisions-so-far của map.
