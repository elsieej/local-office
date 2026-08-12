# Quy tắc viết mã

> Quy ước đặt tên và style cho LocalOffice.
> Xem [`TECHSTACK.md`](TECHSTACK.md) để biết dự án dùng công nghệ gì.

Prettier và ESLint đã lo phần định dạng cơ khí (dấu chấm phẩy, nháy, xuống dòng). Tài liệu này chỉ nói những thứ công cụ không kiểm được.

---

## 1. Component

### Mỗi file một component

Một file `.tsx` export ra **đúng một** component.

```
src/components/document-card.tsx   →  export default function DocumentCard()
```

Ngoại lệ duy nhất: component phụ trợ **không export**, chỉ dùng trong chính file đó, và đủ nhỏ (dưới ~30 dòng). Khi nó cần dùng ở nơi thứ hai, tách ra file riêng ngay.

### Tên file — kebab-case cho mọi thứ

**Tên file luôn `kebab-case`, tên component bên trong vẫn `PascalCase`.**

| Loại                              | File                   | Định danh bên trong              |
| --------------------------------- | ---------------------- | -------------------------------- |
| Component                         | `document-card.tsx`    | `DocumentCard`                   |
| Hook                              | `use-document-list.ts` | `useDocumentList`                |
| Module thường (lib, util, helper) | `auth-client.ts`       | —                                |
| Route                             | theo TanStack          | `__root.tsx` · `$documentId.tsx` |

Ba lý do chọn kebab-case thay vì PascalCase cho file component:

- **shadcn/ui sinh ra file kebab-case** (`alert-dialog.tsx`, `dropdown-menu.tsx`) và không đổi tên được nếu còn muốn nâng cấp qua CLI. Dùng PascalCase cho code của mình sẽ tạo hai quy ước trong cùng một thư mục.
- **Filesystem Windows không phân biệt hoa thường.** `import './Button'` khi file tên `button.tsx` chạy được ở máy local rồi vỡ trên CI Linux. Kebab-case toàn bộ thì không có chỗ cho lỗi đó phát sinh.
- Một quy tắc cho mọi loại file, không phải nhớ ngoại lệ.

Ba file scaffold `Header.tsx` · `Footer.tsx` · `ThemeToggle.tsx` đã đổi thành `header.tsx` · `footer.tsx` · `theme-toggle.tsx`. Trên filesystem case-insensitive, đổi hoa–thường phải đi qua tên trung gian (`Header.tsx` → `tmp.tsx` → `header.tsx`), nếu không lệnh đổi tên sẽ im lặng không làm gì.

### Props

Type props tên là **`<TênComponent>Props`**, đặt ngay trên component, không export trừ khi nơi khác thật sự cần.

```tsx
type DocumentCardProps = {
  document: Document
  isSelected: boolean
  onSelect: (id: string) => void
}

export default function DocumentCard({
  document,
  isSelected,
  onSelect,
}: DocumentCardProps) {
  // ...
}
```

Quy tắc đặt tên từng prop:

| Loại prop        | Tiền tố          | Ví dụ                             |
| ---------------- | ---------------- | --------------------------------- |
| Boolean          | `is` `has` `can` | `isSelected` `hasError` `canEdit` |
| Callback         | `on`             | `onSelect` `onUploadComplete`     |
| Hàm xử lý nội bộ | `handle`         | `handleSelect` gắn vào `onClick`  |

Destructure props ngay ở tham số. Quá 5–6 prop là dấu hiệu component đang ôm quá nhiều việc — tách nó ra.

### Bên trong component

Thứ tự trong file: `import` → `type` → hằng số module → hàm helper → component.

Dùng **early return** cho các nhánh phụ thay vì lồng ternary nhiều tầng:

```tsx
// ✅
if (isPending) return <Skeleton />
if (!document) return <EmptyState />
return <DocumentView document={document} />
```

---

## 2. TypeScript

### `type` thay vì `interface`

Mặc định luôn dùng `type`. Nó làm được mọi thứ `interface` làm, cộng thêm union, intersection, mapped type — và không có declaration merging, thứ khiến một type bị mở rộng ngầm từ file khác.

```ts
// ✅
type Document = {
  id: string
  name: string
}

// ❌
interface Document {
  id: string
  name: string
}
```

Chỉ dùng `interface` khi bắt buộc phải merge vào khai báo của thư viện — trường hợp duy nhất trong repo là `declare module '@tanstack/react-router'` ở `src/router.tsx`.

### Union literal thay vì `enum`

```ts
// ✅  — đúng cách src/components/theme-toggle.tsx đang làm
type DocumentState = 'local' | 'uploaded'

// ❌
enum DocumentState {
  Local,
  Uploaded,
}
```

`enum` sinh ra mã runtime nên không tree-shake được, còn `const enum` thì không dùng được khi transpile theo từng file như Vite đang làm. Union literal không có cả hai vấn đề.

### `import type` cho import chỉ dùng type

`tsconfig.json` bật `verbatimModuleSyntax`, nên import không có `type` sẽ được giữ nguyên trong output — import một type mà quên `type` là lỗi biên dịch:

```ts
import type { Document } from '#/lib/documents'
import { loadDocument } from '#/lib/documents'
```

### Không `any`, không `!`

Dùng `unknown` rồi thu hẹp, hoặc khai báo type cho đúng. Non-null assertion (`!`) che mất một lỗi thật, không sửa được nó — `src/db/index.ts` hiện đang dùng `process.env.DATABASE_URL!` và nên đổi thành kiểm tra tường minh khi đụng tới.

### Để TypeScript tự suy luận

TanStack Router suy ra type từ cây route. Annotate tay giá trị đã infer được sẽ làm mất độ chính xác. Chỉ khai báo type ở **ranh giới**: tham số hàm, props, dữ liệu vào từ ngoài.

---

## 3. Import

- **Import nội bộ dùng `#/`**: `import { auth } from '#/lib/auth'`. Không dùng `../../..`, cũng không dùng `@/` (có trong `tsconfig.json` nhưng không code nào dùng).
- Thứ tự import: ESLint đã tắt `import/order`, nên không có luật cứng. Giữ nhóm tự nhiên: thư viện ngoài → nội bộ → type.

---

## 4. Style giao diện

Giao diện dựng bằng **shadcn/ui trên nền Base UI**. Component sinh ra nằm ở `src/components/ui/`.

- **Tìm component có sẵn trước khi tự viết markup.** `npx shadcn@latest add <tên>`. Một `div` bo góc tự chế thường đã có sẵn tên: `Card`, `Alert`, `Badge`, `Empty`, `Skeleton`, `Separator`.
- **Màu lấy từ token ngữ nghĩa**: `bg-background`, `text-muted-foreground`, `border-border`, `bg-primary`. Không hardcode hex, cũng không dùng màu Tailwind thô kiểu `bg-blue-500` — token đã tự đổi theo sáng/tối.
- **`className` để bố cục, không để tô lại màu** cho component shadcn. Cần khác đi thì dùng `variant` / `size` có sẵn.
- **Base UI dùng prop `render`, không phải `asChild`**: `<Button render={<Link to="/" />}>`.
- **Khoảng cách dùng `gap-*`** trong flex/grid, không `space-x-*` / `space-y-*`. Rộng bằng cao thì dùng `size-*`.
- **Form dùng `FieldGroup` + `Field` + `FieldLabel`**, không phải `div` + `label` tự ghép.
- **Class điều kiện đi qua `cn()`** (`#/lib/utils`), không nối chuỗi bằng template literal.
- **Không `style={{}}`** trừ khi giá trị tính động lúc chạy.
- Mỗi component tương tác phải có nhãn cho screen reader (`aria-label` hoặc text nhìn thấy được).

**Chế độ tối** chạy bằng class `.dark` trên `<html>`, do script chặn FOUC trong `__root.tsx` và `theme-toggle.tsx` cùng đặt. Token tối nằm ở khối `.dark` trong `src/styles.css` — không viết `dark:` để chỉnh màu tay.

Sửa file trong `src/components/ui/` thì được, nhưng `npx shadcn@latest add --overwrite` sẽ ghi đè. Trước khi nâng cấp một component đã sửa, xem `--diff` rồi trộn tay.

---

## 5. Ranh giới client / server

- Code chỉ chạy trên server nằm trong `createServerFn` hoặc file `.server.ts`. Import nhầm secret vào bundle client là **lỗi im lặng** — không có thông báo nào.
- **Server function phải validate input thật.** Dùng `.validator(SCHEMA_ZOD)`, không phải `.inputValidator((data) => data)` — hàm passthrough đó không validate gì cả. Mẫu đúng nằm ở `createTodo` trong `src/routes/demo/drizzle.tsx`.
- Chỉ biến môi trường có tiền tố `VITE_` mới ra tới client. Mọi biến khác chỉ tồn tại phía server.

---

## 6. Đặt tên chung

Bảng này nói về **định danh trong code**; tên file luôn `kebab-case` — xem mục 1.

| Đối tượng            | Quy tắc                     | Ví dụ                                     |
| -------------------- | --------------------------- | ----------------------------------------- |
| Component            | `PascalCase`, danh từ       | `DocumentCard` `UploadDialog`             |
| Hook                 | `use` + `camelCase`         | `useDocumentList`                         |
| Server function      | động từ + danh từ           | `getDocuments` `createShareLink`          |
| Biến / hàm thường    | `camelCase`                 | `applyThemeMode` `selectedDocument`       |
| Hằng số module-level | `SCREAMING_SNAKE_CASE`      | `THEME_INIT_SCRIPT` `MAX_FILE_SIZE`       |
| Type / Union literal | `PascalCase` / chuỗi thường | `DocumentState` = `'local' \| 'uploaded'` |

Đặt tên theo **cái nó là**, không theo cái nó làm bằng gì: `DocumentCard` chứ không `DocumentDiv`, `useDocumentList` chứ không `useFetchHook`.

Thuật ngữ nghiệp vụ giữ đúng một từ xuyên suốt code: `document` (không `file`/`doc` lẫn lộn), `local`/`uploaded` cho trạng thái, `shareLink` cho liên kết chia sẻ.

---

## 7. Tài liệu dự án

### Luôn bắt đầu từ template

Feature, user story, task — và mọi loại tài liệu quy trình khác — **phải copy từ `docs/templates/`**, không viết từ đầu. Template giữ cho các mục bắt buộc (phạm vi, tiêu chí chấp nhận, ảnh hưởng quyền riêng tư) không bị bỏ sót vì quên.

| Loại       | Template                                                               | Đặt tại          |
| ---------- | ---------------------------------------------------------------------- | ---------------- |
| Feature    | [`templates/FEATURE_TEMPLATE.md`](templates/FEATURE_TEMPLATE.md)       | `docs/features/` |
| User story | [`templates/USER_STORY_TEMPLATE.md`](templates/USER_STORY_TEMPLATE.md) | `docs/stories/`  |
| Task       | [`templates/TASK_TEMPLATE.md`](templates/TASK_TEMPLATE.md)             | `docs/tasks/`    |

Cần một loại tài liệu chưa có template? Tạo template trước, rồi mới viết tài liệu đầu tiên từ nó.

### Tên file: `<số thứ tự>_<tên>.md`

Ba chữ số, gạch dưới, rồi tên mô tả bằng `snake_case`:

```
docs/features/001_mo_va_xem_tai_lieu.md
docs/stories/001_keo_tha_mo_docx_story.md
docs/tasks/001_vung_keo_tha_task.md
```

- **Ba chữ số** — `001`, không phải `1`. Để thư mục tự sắp đúng thứ tự khi tới file thứ 10.
- **Số tăng dần trong từng thư mục**, không dùng chung giữa `features/`, `stories/`, `tasks/`. Số đã cấp thì không tái sử dụng, kể cả khi tài liệu bị bỏ.
- **Hậu tố `_story` / `_task` / `_feature`** giúp nhận ra loại tài liệu khi mở nhiều tab cùng lúc — tuỳ chọn, nhưng đã dùng thì dùng nhất quán.

Quy ước này chỉ áp dụng cho **tài liệu trong `docs/`**. Mã nguồn trong `src/` vẫn theo `kebab-case` không đánh số — xem mục 1.

Tài liệu gốc ở gốc `docs/` (`ARCHITECTURE.md`, `TECHSTACK.md`, `RULE.md`) và các template không đánh số: chúng là tài liệu thường trực, không phải hạng mục công việc xếp theo thứ tự.

---

## 8. Commit

### Hook tự chạy

Husky đã cài sẵn hai hook, không cần nhớ chạy tay:

| Hook         | Chạy gì       | Tác dụng                                                  |
| ------------ | ------------- | --------------------------------------------------------- |
| `pre-commit` | `lint-staged` | Prettier + ESLint `--fix` **chỉ trên file đã stage**      |
| `commit-msg` | `commitlint`  | Chặn commit nếu thông điệp sai chuẩn Conventional Commits |

Hook không chạy được thì `npm install` lại — script `prepare` sẽ cài lại husky.

### Thông điệp commit

Theo [Conventional Commits](https://www.conventionalcommits.org/): `<type>(<scope>): <mô tả>`.

```
feat(upload): thêm vùng kéo–thả cho tài liệu
fix(viewer): sửa lỗi trắng trang khi mở docx rỗng
docs: bổ sung quy ước đặt tên tài liệu
```

| Type       | Dùng khi                                 |
| ---------- | ---------------------------------------- |
| `feat`     | Thêm tính năng người dùng nhìn thấy      |
| `fix`      | Sửa lỗi                                  |
| `docs`     | Chỉ đụng tài liệu                        |
| `refactor` | Đổi cấu trúc mã, hành vi giữ nguyên      |
| `perf`     | Cải thiện hiệu năng                      |
| `test`     | Thêm hoặc sửa kiểm thử                   |
| `build`    | Đụng bundler, dependency, cấu hình build |
| `ci`       | Đụng pipeline CI                         |
| `chore`    | Việc lặt vặt không thuộc các nhóm trên   |
| `revert`   | Hoàn tác một commit trước đó             |

- **Scope tuỳ chọn**, đặt theo vùng chức năng: `upload`, `viewer`, `share`, `auth`, `db`.
- **Mô tả viết thường, không chấm cuối câu**, dùng thể mệnh lệnh: "thêm…", "sửa…", không phải "đã thêm…".
- **Breaking change**: thêm `!` sau type (`feat(api)!: …`) hoặc dòng `BREAKING CHANGE:` trong body.
- Body và footer cách phần mô tả một dòng trống, mỗi dòng tối đa 100 ký tự.

Cấu hình nằm ở `commitlint.config.js` — đó mới là nguồn sự thật, bảng trên chỉ để tra nhanh.

### Còn lại

1. `npm run format` — Prettier + ESLint tự sửa. **Đừng canh chỉnh tay** rồi để công cụ sửa lại.
2. `npm run lint` — không còn cảnh báo.
3. `// eslint-disable` chỉ chấp nhận khi kèm lý do trên cùng dòng.
4. `src/routeTree.gen.ts` do máy sinh — không sửa tay, chạy `npm run generate-routes`.
