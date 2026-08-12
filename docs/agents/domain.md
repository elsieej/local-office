# Tài liệu miền (domain docs)

Cách các engineering skill đọc tài liệu miền của repo này khi khám phá codebase.

## Đọc những file này trước khi khám phá

- **`CONTEXT.md`** ở gốc repo, hoặc
- **`CONTEXT-MAP.md`** ở gốc repo nếu có — file này trỏ tới một `CONTEXT.md` cho mỗi ngữ cảnh. Đọc từng file liên quan tới chủ đề đang làm.
- **`docs/adr/`** — đọc các ADR chạm tới khu vực sắp làm. Ở repo nhiều ngữ cảnh, xem thêm `src/<context>/docs/adr/` cho các quyết định phạm vi ngữ cảnh.

Nếu những file này chưa tồn tại, **cứ đi tiếp, im lặng**. Đừng nêu chuyện chúng thiếu; đừng đề xuất tạo trước. Skill `/domain-modeling` (đi vào qua `/grill-with-docs` và `/improve-codebase-architecture`) sẽ tạo chúng khi thực sự có thuật ngữ hoặc quyết định cần chốt.

## Cấu trúc file

Repo đơn ngữ cảnh (phần lớn repo, gồm cả repo này):

```
/
├── CONTEXT.md
├── docs/adr/
│   ├── 0001-event-sourced-orders.md
│   └── 0002-postgres-for-write-model.md
└── src/
```

Repo đa ngữ cảnh (nhận biết qua `CONTEXT-MAP.md` ở gốc):

```
/
├── CONTEXT-MAP.md
├── docs/adr/                          ← quyết định phạm vi toàn hệ thống
└── src/
    ├── ordering/
    │   ├── CONTEXT.md
    │   └── docs/adr/                  ← quyết định riêng của ngữ cảnh
    └── billing/
        ├── CONTEXT.md
        └── docs/adr/
```

## Dùng đúng từ vựng trong bảng thuật ngữ

Khi kết quả bạn viết ra có gọi tên một khái niệm miền (trong tiêu đề issue, đề xuất refactor, giả thuyết, tên test), dùng đúng thuật ngữ như `CONTEXT.md` định nghĩa. Đừng trôi sang từ đồng nghĩa mà bảng thuật ngữ đã cố tình tránh.

Nếu khái niệm bạn cần chưa có trong bảng thuật ngữ, đó là một tín hiệu — hoặc bạn đang tự đặt ra ngôn ngữ mà dự án không dùng (cân nhắc lại), hoặc đúng là đang có khoảng trống (ghi lại cho `/domain-modeling`).

## Nêu rõ khi mâu thuẫn với ADR

Nếu kết quả của bạn đi ngược một ADR đang có, nói thẳng ra thay vì âm thầm ghi đè:

> _Trái với ADR-0007 (event-sourced orders) — nhưng đáng mở lại vì…_
