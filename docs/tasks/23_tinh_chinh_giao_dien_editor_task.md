# TASK-23: Tinh chỉnh giao diện editor ONLYOFFICE (logo, kích thước, bố cục trang)

**Story:** [US-9](../stories/9_xem_sua_docx_onlyoffice_story.md)
**Issue:** #47 · **Nhánh:** `feat/onlyoffice-editor-ui-polish`
**Trạng thái:** ✅ Xong

---

## Mục tiêu

Polish nhỏ, độc lập, không đụng tới lớp giả lập Document Server hay luồng
xem/sửa đã chạy ổn ở TASK-21/22:

1. Đổi logo ONLYOFFICE ở góc trái toolbar thành brand LocalOffice
2. Khung editor lấp đầy phần viewport còn lại thay vì cố định `75vh`, card
   thông tin tài liệu thu gọn khi đang xem/sửa
3. (Phát sinh giữa lúc làm, yêu cầu trực tiếp từ người dùng) Thiết kế lại
   trang chi tiết: bỏ header/nav/footer của site trên trang này, thay bằng
   1 thanh trên gọn (nút Quay lại + tên file + trạng thái + nút hành động),
   chừa gần hết viewport cho nội dung tài liệu

**Ngoài phạm vi task này**: đồng bộ theme sáng/tối của editor với
LocalOffice ban đầu cũng nằm trong dự định, nhưng code đọc/map theme đúng
mà CSS theme tối vẫn không lên hình — nghi do một lỗi hiển thị sâu hơn
trong chính ONLYOFFICE, không phải thứ sửa được trong phạm vi "chỉnh 1 tý"
của task này (xem Ghi chú). Tách thành **TASK-24** riêng, không tính vào
"Xong" của task này.

## Việc cần làm

- [x] Tạo asset logo LocalOffice dạng SVG đơn giản (text, không cần thiết
      kế phức tạp) — repo hiện chưa có file logo hình ảnh nào ·
      `public/logo-name_black.svg`, `public/logo-name_white.svg` (đặt tên
      theo đúng mẫu `office-website` đã dùng cho light/dark)
- [x] Gắn `customization.logo` vào config `DocEditor`: `image`/`imageDark`
      trỏ 2 file trên, `url` trỏ về `/` (trang chủ LocalOffice) ·
      `src/components/onlyoffice-editor.tsx`
- [x] (Chuẩn bị cho TASK-24, không phải mục tiêu của task này) Đọc theme
      hiện tại của LocalOffice lúc mount editor (`document
.documentElement.classList.contains('dark')` — theo đúng cách
      `theme-toggle.tsx` áp dụng, không có store/hook riêng để dùng lại) →
      map `light` → `theme-classic-light`, `dark` → `theme-dark`, set vào
      `customization.uiTheme` — code đúng, giữ lại vì vô hại, nhưng KHÔNG
      lên hình đúng (xem Ghi chú) nên không tính là đạt mục tiêu ·
      `src/components/onlyoffice-editor.tsx`
- [x] Card thông tin tài liệu thu gọn (ẩn size/thời gian mở, chỉ giữ tên +
      nút hành động) khi đang hiện `OnlyofficeEditor`; khung editor cao
      theo phần viewport còn lại (`calc(100vh - <chiều cao phần trên>)`
      hoặc tương đương bằng flexbox) thay vì `h-[75vh]` cố định ·
      `src/routes/documents/$documentId.tsx`, `src/components/onlyoffice-editor.tsx`
- [x] (Phát sinh khi kiểm thử) `/themes.json` ở gốc site — `app.js` fetch
      qua đường dẫn tương đối `../../../../themes.json` từ
      `documenteditor/main/index.html`, tính ra đúng site root của
      LocalOffice (không phải gốc `/onlyoffice/`) · `public/themes.json`
- [x] (Phát sinh khi kiểm thử, lỗi có từ TASK-22) `useBlocker`'s
      `enableBeforeUnload` mặc định `true` (không điều kiện) — đóng
      tab/reload luôn hiện cảnh báo trình duyệt kể cả mode Xem không bao
      giờ dirty. Đổi thành hàm đọc `isDirtyRef.current` ·
      `src/components/onlyoffice-editor.tsx`
- [x] `__root.tsx`: ẩn `<Header/>`/`<Footer/>` khi route hiện tại bắt đầu
      bằng `/documents/` (đọc qua `useRouterState`) · `src/routes/__root.tsx`
- [x] `$documentId.tsx`: thay `BackButton` + `Card` bằng 1 `TopBar` gọn
      (icon-only back, tên file, badge trạng thái, các nút hành động dồn
      sang phải), layout `flex min-h-svh flex-col` để phần nội dung
      (`main`, `flex-1`) chiếm hết chỗ còn lại · `src/routes/documents/$documentId.tsx`

## Kiểm thử

- [x] `npm run lint` sạch
- [x] Playwright MCP thật: mở file `.docx` → logo góc trái toolbar là
      LocalOffice, không phải chữ "ONLYOFFICE"
- [x] Playwright MCP thật: light mode → editor hiện đúng theme sáng (đã
      luôn đúng, không đổi so với TASK-21/22)
- [ ] ~~Playwright MCP thật: bật dark mode rồi mở `.docx` → editor hiện
      đúng theme tối~~ **Không đạt, ngoài phạm vi task này** — xem Ghi
      chú, config đúng nhưng không lên hình, tách theo dõi ở TASK-24
- [x] Playwright MCP thật: `browser_resize` một vài kích thước viewport →
      editor luôn lấp gần hết chiều cao còn lại, không để trống nhiều
      khoảng trắng phía dưới, không tràn cần cuộn trang ngoài đôi với
      viewport thường (>700px cao)
- [ ] ~~Trường hợp biên: theme "auto"~~ Không kiểm — phụ thuộc dark mode,
      xem TASK-24
- [x] Playwright MCP thật: mở một file `.pdf` đã lưu cục bộ ở trang chi
      tiết sau khi thiết kế lại layout (`TopBar` + `main flex-1` thay
      `Card`) → `PdfViewer` vẫn hiện đúng, không vỡ layout
- [x] Playwright MCP thật: `browser_snapshot` trang chi tiết → có đúng 1
      node `heading` (tên file) — trước khi sửa tên file chỉ là `<span>`,
      trang không có heading nào (phát hiện khi rà lại a11y, sửa cùng
      thành `<h1>`)
- [x] Kiểm tra tiêu đề tab trình duyệt đổi theo tên file đang mở, quay lại
      trang danh sách thì tiêu đề tab trở về mặc định
- [x] Playwright MCP thật: reload trang ở mode Xem (không dirty) → không
      hiện cảnh báo "leave site?" của trình duyệt (trước khi sửa: luôn
      hiện, kể cả không dirty)
- [x] Playwright MCP thật: trang chi tiết không còn header/nav/footer của
      site, chỉ còn thanh trên gọn — kiểm cả mode Xem lẫn Sửa (ảnh chụp so
      sánh), trang danh sách (`/`) không bị ảnh hưởng (vẫn đủ
      header/nav/footer như cũ)
- [x] Playwright MCP thật: đang mode Sửa có gõ chữ (dirty), bấm nút Quay
      lại mới (icon-only) trên thanh trên → `window.confirm` vẫn hiện đúng
      như hành vi đã có ở TASK-22, không bị đứt do đổi cấu trúc nút

## Ghi chú

**Cả 3 mục tiêu trong phạm vi task đạt hoàn toàn** (kiểm bằng Playwright
MCP thật, ảnh chụp màn hình so sánh): logo LocalOffice thay đúng vị trí
logo ONLYOFFICE ở cả mode Xem lẫn Sửa; khung editor lấp phần viewport còn
lại (đo bằng JS — `getBoundingClientRect().top` của container trừ
`window.innerHeight`, cập nhật lại khi resize), card thông tin thu gọn khi
đang xem tài liệu `.docx`; thiết kế lại trang chi tiết (TopBar gọn, bỏ
header/nav/footer site).

**Đính chính (ghi lại ở TASK-24, đọc chi tiết ở đó)**: kết luận dưới đây
("giao diện vẫn hiện màu sáng") là **chẩn đoán sai do cache** — ONLYOFFICE
tự cache theme UI vào `localStorage['ui-theme-id']` (cùng origin) và đọc
cache đó TRƯỚC `customization.uiTheme` truyền vào, nên tuỳ lịch sử mở
trước đó của trình duyệt, theme mới truyền vào có thể bị bỏ qua hoàn toàn
— không phải lỗi hiển thị sâu trong ONLYOFFICE như đoán ban đầu. TASK-24
xác nhận theme tối **có** lên hình đúng khi cache sạch, và sửa cho
`customization.uiTheme` luôn thắng cache cũ. Giả thuyết "chung nguyên nhân
`child.setAttribute is not a function`" ở cuối phần dưới đây cũng bị rút
lại — không liên quan tới theme (xem TASK-24). Giữ nguyên nội dung gốc bên
dưới để lưu lại quá trình điều tra lúc đó:

- `getResolvedUiTheme()` trả đúng `'theme-dark'` khi `document.documentElement`
  có class `dark` (xác nhận qua `console.log` tạm thời lúc debug, đã gỡ)
- Giá trị này TỚI ĐƯỢC `DocEditor` đúng — xác nhận qua URL của iframe
  `documenteditor/main/index.html` có `uitheme=theme-dark`
- Class `theme-dark chrome theme-type-dark` THẬT SỰ được gắn vào
  `<body>` của iframe editor (xác nhận qua `document.querySelector(...)
.contentDocument.body.className` trong Playwright) — cơ chế áp class
  chạy đúng
- Nhưng **giao diện vẫn hiện màu sáng** — CSS của theme tối không được áp
  dụng dù class đã đúng. Nghi ngờ liên quan tới cùng lỗi
  `TypeError: child.setAttribute is not a function` đã ghi nhận từ
  TASK-21/22 (lỗi DOM injection lặp lại nhiều lần trong console mỗi lần mở
  editor) — có thể đoạn code chèn `<link>` CSS riêng cho theme bị lỗi
  cùng chỗ. Không đi sâu thêm vì đây là polish nhỏ ("chỉnh 1 tý" theo yêu
  cầu), không đáng bỏ thêm thời gian dò code đã minify của ONLYOFFICE.
  Không chặn US-9 — editor vẫn dùng được bình thường ở theme mặc định.
  Ba triệu chứng riêng biệt của ONLYOFFICE (icon HiDPI lỗi, dữ liệu
  spellcheck alphabet lỗi — cả hai ghi từ TASK-21, và theme tối không lên
  hình ở đây) đều trỏ về cùng nghi phạm `child.setAttribute is not a
function` — nếu TASK-24 sửa đúng chỗ đó, cả ba nhiều khả năng hết luôn
  cùng lúc, không cần sửa riêng từng cái.

**Tìm ra nguyên nhân gốc của lỗi `/themes.json` 500** (đã ghi nhận từ
TASK-21 như một giới hạn "cosmetic", giờ mới hiểu rõ): `app.js` fetch
theme registry qua đường dẫn **tương đối** `../../../../themes.json` tính
từ `web-apps/apps/documenteditor/main/index.html` — đúng 4 cấp để leo tới
gốc của một Document Server thật (nơi `web-apps/` là thư mục con của gốc
đó). Ở LocalOffice, `/onlyoffice/` mới là gốc vendor, không phải gốc site,
nên phép tính tương đối này lại trỏ nhầm ra gốc site LocalOffice
(`/themes.json`) — không tồn tại, hit route/SSR khác của app, ra lỗi 500.
Thêm file `public/themes.json` (nội dung y hệt bản đã vendor,
`{"themes": []}`) để đường dẫn tính sai đó vẫn trả về đúng — sửa lỗi 500,
nhưng KHÔNG sửa được vấn đề theme tối ở trên (xác nhận bằng cách thêm file
này rồi kiểm lại, vẫn không lên hình tối) — hai vấn đề độc lập nhau.
Cùng nguyên nhân "đường dẫn tương đối tính theo gốc Document Server thật"
rất có thể còn ảnh hưởng các đường dẫn lạ khác đã ghi ở TASK-21/22
(`/common/main/resources/...`, `/documents/resources/img/...`) — chưa sửa
hết, những cái đó vẫn thuần cosmetic (icon, spellcheck alphabet) nên để
nguyên như đã chấp nhận.

**2 lỗi thật khác tìm ra khi kiểm thử (không liên quan trực tiếp mục tiêu
task, tiện tay sửa luôn)**:

1. `useBlocker`'s `enableBeforeUnload` không truyền thì mặc định `true`
   (không điều kiện, xem `node_modules/@tanstack/history/dist/esm/index.js`)
   — nghĩa là suốt từ TASK-22, cứ mở `OnlyofficeEditor` (bất kỳ mode nào,
   kể cả Xem không bao giờ dirty) rồi reload/đóng tab là trình duyệt luôn
   cảnh báo "rời trang?", vô lý với mode Xem. Sửa bằng cách truyền hàm
   `() => isDirtyRef.current` thay vì để mặc định.
2. `/themes.json` (xem trên) — tiện sửa cùng lúc vì cùng lớp lỗi đường dẫn
   tương đối gặp phải khi debug theme tối.

**Thiết kế lại trang chi tiết (mục 3 ở Mục tiêu)** — phát sinh giữa chừng
task, người dùng yêu cầu trực tiếp sau khi thấy bản polish ban đầu vẫn còn
header/nav to của site choán chỗ. `Header`/`Footer` trước đó render không
điều kiện ở `__root.tsx` cho mọi route; giờ ẩn hẳn khi route bắt đầu bằng
`/documents/` (dùng `useRouterState` đọc pathname, không cần route group
riêng vì chỉ một route cần khác biệt). Trang chi tiết tự vẽ `TopBar` sticky
gọn (nút quay lại icon-only, tên file, badge, hành động dồn phải) thay cho
`BackButton` + `Card` cũ. Không cần đổi cách đo chiều cao ở
`onlyoffice-editor.tsx` (`getBoundingClientRect().top` tới
`window.innerHeight`) — tự động lấp nhiều hơn vì phần tử phía trên giờ
thấp hơn nhiều, không phải sửa gì thêm ở đó. Card `size`/`thời gian mở`
(trước chỉ ẩn khi `isWord`) giờ bỏ hẳn khỏi trang chi tiết cho mọi loại
tài liệu — vẫn xem được ở danh sách, trang chi tiết giờ chỉ tập trung vào
nội dung.

**Lỗ hổng a11y phát sinh từ chính việc thiết kế lại ở trên, tự rà lại và
sửa trước khi mở PR**: bỏ `Header`/`Card` đồng nghĩa bỏ luôn `CardTitle`
(một heading) — tên file trong `TopBar` mới ban đầu chỉ là `<span>`, khiến
cả trang không còn heading nào (kiểm bằng `browser_snapshot`, không thấy
node `heading` nào). Đổi thành `<h1>`. Tiện thể set `document.title` theo
tên file đang mở (trước đó tiêu đề tab luôn là "TanStack Start Starter" cố
định, giờ đây là chỗ duy nhất còn nhận ra tài liệu ngoài `TopBar` — trang
này không có `<title>` riêng), khôi phục lại tiêu đề cũ khi rời trang.
