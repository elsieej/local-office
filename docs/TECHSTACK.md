# Ngăn xếp công nghệ

> Dự án được xây bằng gì, mỗi mảnh nối dây ở đâu.
> Xem [`../CLAUDE.md`](../CLAUDE.md) để biết sản phẩm này _là gì_, [`ARCHITECTURE.md`](ARCHITECTURE.md) để biết tài liệu đi qua những trạng thái và ranh giới nào.

**Hiện trạng:** `src/` là scaffold `create-tsrouter-app` (32 file, ba route demo, một bảng `todos`) đã chuyển giao diện sang shadcn/ui. Chưa có code nào liên quan tới tài liệu Office.

---

## 1. Các gói

Phiên bản là **range khai báo** trong `package.json`.

| Hạng mục         | Gói npm                                                | Phiên bản                      | Vai trò                                              |
| ---------------- | ------------------------------------------------------ | ------------------------------ | ---------------------------------------------------- |
| Meta-framework   | `@tanstack/react-start`                                | `latest`                       | SSR, server function, server route                   |
| Routing          | `@tanstack/react-router`                               | `latest`                       | Định tuyến theo file, type-safe                      |
| Sinh route       | `@tanstack/router-cli`                                 | `^1.132.0`                     | `tsr generate` → `src/routeTree.gen.ts`              |
| UI               | `react` · `react-dom`                                  | `^19.2.0`                      | Thư viện giao diện                                   |
| Build            | `vite`                                                 | `^8.0.0`                       | Dev server, bundler                                  |
| Build (plugin)   | `@vitejs/plugin-react`                                 | `^6.0.1`                       | Fast Refresh, JSX transform                          |
| CSS              | `tailwindcss` `@tailwindcss/vite`                      | `^4.1.18`                      | Utility CSS, design token trong `src/styles.css`     |
| CSS (typography) | `@tailwindcss/typography`                              | `^0.5.16`                      | Style cho nội dung dạng văn bản                      |
| CSS (animation)  | `tw-animate-css`                                       | `^1.4.0`                       | Keyframe cho component shadcn                        |
| Component UI     | `shadcn` (CLI)                                         | `^4.17.0`                      | Sinh mã vào `src/components/ui/`, không phải runtime |
| Primitive        | `@base-ui/react`                                       | `^1.7.0`                       | Nền không style của shadcn — dùng prop `render`      |
| Icon             | `lucide-react`                                         | `^1.31.0`                      | Bộ icon mặc định của preset                          |
| Class helper     | `clsx` · `tailwind-merge` · `class-variance-authority` | `^2.1.1` · `^3.6.0` · `^0.7.1` | `cn()` trong `src/lib/utils.ts`, variant component   |
| Kiểm tra dữ liệu | `zod`                                                  | `^4.4.3`                       | Schema cho search param, server function, form       |
| Auth             | `better-auth`                                          | `^1.5.3`                       | Email/password, session cookie                       |
| ORM              | `drizzle-orm`                                          | `^0.45.1`                      | Truy vấn có kiểu                                     |
| Migration        | `drizzle-kit`                                          | `^0.31.9`                      | `db:generate` · `db:migrate` · `db:studio`           |
| CSDL             | PostgreSQL qua `pg`                                    | `^8.16.3`                      | Metadata, bảng auth                                  |
| Ngôn ngữ         | `typescript`                                           | `^6.0.2`                       | `strict`, `moduleResolution: bundler`                |
| Lint             | `eslint`                                               | `^9.20.0`                      | Kiểm tra mã                                          |
| Lint (cấu hình)  | `@tanstack/eslint-config`                              | `latest`                       | Bộ rule nền                                          |
| Định dạng mã     | `prettier`                                             | `^3.8.1`                       | `semi: false`, `singleQuote`, `trailingComma: all`   |
| Devtools         | `@tanstack/react-devtools`                             | `latest`                       | Panel debug trong `__root.tsx`                       |
| Devtools (build) | `@tanstack/devtools-vite`                              | `latest`                       | Source inspection, console piping                    |
| Env              | `dotenv` · `tsx`                                       | `^17.3.1`                      | Nạp `.env` cho script Drizzle                        |
| Git hook         | `husky`                                                | `^9.1.7`                       | Cài hook `pre-commit` · `commit-msg` vào `.husky/`   |
| Lint khi commit  | `lint-staged`                                          | `^17.3.0`                      | Prettier + ESLint chỉ trên file đã stage             |
| Lint commit msg  | `@commitlint/cli` · `config-conventional`              | `^21.2.1` · `^21.2.0`          | Ép chuẩn Conventional Commits                        |

**Package manager:** npm (`package-lock.json`, `.cta.json → packageManager: npm`). Khối `"pnpm"` còn sót trong `package.json` là tàn dư của scaffold.

**Sáu gói ghim `"latest"`** — `react-start`, `react-router`, `react-router-devtools`, `react-devtools`, `devtools-vite`, `eslint-config`. Phiên bản thực tế do `package-lock.json` quyết định; thiếu lockfile thì `npm install` hai lần cho ra hai kết quả khác nhau. Mốc đang khoá: `1.168.44` · `1.170.27` · `1.167.1` · `0.10.10` · `0.8.3` · `0.4.0`.

**Chưa có framework test nào** trong repo.

---

## 2. Cấu hình — mỗi mảnh nối dây ở đâu

| File                   | Nội dung đáng nhớ                                                                                               |
| ---------------------- | --------------------------------------------------------------------------------------------------------------- |
| `vite.config.ts`       | Thứ tự plugin `devtools() → tailwindcss() → tanstackStart() → viteReact()`; `devtools()` **bắt buộc đứng đầu**  |
| `tsconfig.json`        | `strict`, `verbatimModuleSyntax`, `noUnusedLocals/Parameters`, `moduleResolution: bundler`, `jsx: react-jsx`    |
| `tsr.config.json`      | `{ "target": "react" }` — cấu hình sinh route                                                                   |
| `drizzle.config.ts`    | dialect `postgresql`, schema `./src/db/schema.ts`, migration ra `./drizzle`, đọc env từ `.env.local` rồi `.env` |
| `eslint.config.js`     | Kế thừa `@tanstack/eslint-config`, tắt `import/order`, `sort-imports`, `require-await`, vài rule khác           |
| `prettier.config.js`   | `semi: false`, `singleQuote: true`, `trailingComma: 'all'` — quản cả markdown trong `docs/`                     |
| `.env.local`           | `DATABASE_URL`, `BETTER_AUTH_URL`, `BETTER_AUTH_SECRET` (gitignore qua `*.local`)                               |
| `components.json`      | Cấu hình shadcn: `style: base-nova` (tiền tố `base-` chính là thứ chọn Base UI thay vì Radix), alias theo `#/`  |
| `commitlint.config.js` | `extends: ['@commitlint/config-conventional']` — luật cho thông điệp commit                                     |
| `.husky/`              | `pre-commit` → `lint-staged`; `commit-msg` → `commitlint --edit "$1"`. Cài lại bằng `npm install`               |
| `package.json`         | Khoá `lint-staged`: `*.{ts,tsx,js,jsx}` → Prettier + ESLint `--fix`; `*.{json,md,css,yml,yaml}` → Prettier      |

**Alias import:** `package.json → imports: { "#/*": "./src/*" }`. `tsconfig.json` khai báo thêm `@/*` nhưng không code nào dùng — giữ `#/` cho nhất quán.

---

## 3. Cấu trúc thư mục

```
src/
├── components/          header · footer · theme-toggle
│   └── ui/              shadcn sinh ra — sửa được, nhưng CLI sẽ ghi đè khi nâng cấp
├── db/                  index.ts (drizzle client) · schema.ts
├── integrations/
│   └── better-auth/     header-user.tsx
├── lib/                 auth.ts (server) · auth-client.ts (client) · utils.ts (`cn`)
├── routes/              định tuyến theo file
│   ├── __root.tsx           shell HTML + devtools + script chặn FOUC
│   ├── index.tsx            trang chủ (còn nội dung scaffold)
│   ├── about.tsx
│   ├── api/auth/$.ts        splat route → auth.handler
│   └── demo/                ví dụ scaffold, xoá được an toàn
├── router.tsx           getRouter() + type registration
├── routeTree.gen.ts     SINH TỰ ĐỘNG — không sửa tay
└── styles.css           token shadcn (`:root` / `.dark`) + font Manrope · Fraunces
```

**Không có file entry** (`main.tsx`, `client.tsx`, `server.tsx`, `start.ts`) — plugin `tanstackStart()` tự sinh. Bề mặt entry chỉ gồm `src/router.tsx` và `src/routes/__root.tsx`.

**Quy ước đặt tên khi mở rộng:** `$param` (path param), `_layout` (layout route), `.server.ts` (chỉ chạy trên server), `.functions.ts` (server function dùng chung).

---

## 4. Lệnh

| Lệnh                                                | Việc                                    |
| --------------------------------------------------- | --------------------------------------- |
| `npm run dev`                                       | Dev server tại `http://localhost:3000`  |
| `npm run build` · `npm run preview`                 | Build production và xem thử             |
| `npm run generate-routes`                           | Sinh lại `src/routeTree.gen.ts`         |
| `npm run lint` · `npm run format` · `npm run check` | Lint · format+fix · kiểm tra định dạng  |
| `npm run db:generate` · `db:migrate` · `db:push`    | Migration Drizzle                       |
| `npm run db:studio`                                 | Trình duyệt CSDL                        |
| `npx shadcn@latest add <tên>`                       | Thêm component vào `src/components/ui/` |

Không có script `test` hay `typecheck`.

---

## 5. Mảnh còn thiếu

Ba thứ tính năng cốt lõi trong `CLAUDE.md` cần tới, chưa có gói nào trong repo đảm nhiệm:

| Cần             | Trạng thái  | Ràng buộc khi chọn                                                           |
| --------------- | ----------- | ---------------------------------------------------------------------------- |
| Engine tài liệu | _chưa chọn_ | Phải **khứ hồi** (parse → sửa → serialize lại đúng OOXML), chạy trong Worker |
| Lưu trữ cục bộ  | _chưa chọn_ | Web API sẵn có: OPFS cho bytes, IndexedDB cho metadata                       |
| Object storage  | _chưa chọn_ | Tương thích S3 (R2 / MinIO / S3), upload qua presigned URL                   |

Về engine tài liệu, điểm dễ sai khi khảo sát: nhiều thư viện Office phổ biến chỉ đi **một chiều** — có bộ chỉ đọc/render, có bộ chỉ sinh file mới từ số không. Ghép một bộ đọc với một bộ ghi **không tự động cho ra khứ hồi**: phần tài liệu mà bộ đọc bỏ qua sẽ biến mất khi bộ ghi dựng lại file. Tiêu chí chọn phải là "parse và serialize lại _cùng_ một tài liệu", kiểm chứng bằng file thật mở lại bằng Microsoft Office.

Ngoài ra, `src/lib/auth.ts` **chưa cấu hình `database` adapter** → Better Auth đang chạy stateless, chưa có bảng `user/session/account/verification` và thư mục `drizzle/` chưa có migration nào. Cần nối `pg` Pool rồi chạy `npx @better-auth/cli migrate` trước khi dùng tính năng tài khoản (`README.md` có sẵn snippet).
