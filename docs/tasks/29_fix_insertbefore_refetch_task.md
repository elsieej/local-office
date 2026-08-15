# TASK-29: Vá lỗi `insertBefore` khi tab được focus lại trong lúc đang mở `.docx`

**Story:** [US-9](../stories/9_xem_sua_docx_onlyoffice_story.md)
**Issue:** #58 · **Nhánh:** `fix/insertbefore-refetch-focus`
**Trạng thái:** 🔵 Chờ review

---

## Mục tiêu

Vá lỗi console `Failed to execute 'insertBefore' on 'Node': The node
before which the new node is to be inserted is not a child of this node`
— người dùng báo cáo: mở tài liệu `.docx` (mode Xem), chuyển sang tab
trình duyệt khác, quay lại tab cũ thì gặp lỗi trên, trang crash (React
error boundary bắt lỗi, phải reload).

## Việc cần làm

- [x] `router.tsx`: đặt `refetchOnWindowFocus: false` mặc định cho mọi
      query — dữ liệu tài liệu chỉ đổi khi chính app ghi qua mutation
      (không có nguồn ngoài nào thay đổi ngầm khi tab mất focus), giữ
      mặc định `true` của React Query chỉ tạo rủi ro không cần thiết ·
      `src/router.tsx`
- [x] `$documentId.tsx`: thêm `staleTime: Infinity` cho `fileQuery`
      (query `'bytes'`) — pin triệt để, không chỉ chặn riêng trigger
      "window focus" mà chặn mọi nguồn tự động refetch khác (mount lại
      observer, reconnect mạng,...) cùng gây đúng lớp lỗi này ·
      `src/routes/documents/$documentId.tsx`

## Kiểm thử

- [x] `npm run format && npm run lint` sạch
- [x] `npx tsc --noEmit` sạch (trừ 1 lỗi `drizzle.config.ts` có từ trước,
      không liên quan)
- [x] **Xác nhận nguyên nhân gốc bằng thực nghiệm** (Playwright MCP +
      `run_code_unsafe`, expose tạm `queryClient` qua `window.__qc` trong
      `useEffect` để không vỡ SSR): mở `.docx` mode Xem, đợi editor
      `ready`, gọi thẳng `queryClient.invalidateQueries` lên đúng query
      key `'bytes'` → lỗi `insertBefore` tái hiện **100%, deterministic**,
      xảy ra trong `<Skeleton>` — khớp đúng cơ chế đã ghi trong comment
      của `saveMutation` (TASK-26): refetch → `file` đổi identity → effect
      tạo editor trong `OnlyofficeEditor` chạy lại giữa chừng trong khi
      `DocEditor` vẫn còn sở hữu DOM cũ
- [x] Sau khi vá: gọi lại đúng lệnh `invalidateQueries` trên **vẫn**
      refetch được (xác nhận không vô tình chặn luôn `saveMutation`/
      `deleteMutation` — 2 mutation này gọi `invalidateQueries` một cách
      tường minh, không phụ thuộc `staleTime`/`refetchOnWindowFocus`)
- [x] **Tái hiện đúng kịch bản gốc bằng Playwright** (sau khi tìm ra CDP
      domain đúng — xem Ghi chú): `Page.setWebLifecycleState('frozen')`
      rồi `'active'` mô phỏng đúng việc Chrome tạm dừng/kích hoạt lại một
      tab nền. Ở bản **trước khi vá**: cycle này tái hiện `insertBefore`
      100% (dù `document.visibilityState` đọc qua `page.evaluate()` không
      đổi giá trị — sự kiện lifecycle vẫn được bắn ra, `FocusManager` của
      React Query vẫn bắt được). Ở bản **đã vá**: lặp lại đúng cycle đó,
      console sạch (chỉ còn baseline 4 lỗi 404 đã biết) — xác nhận fix có
      tác dụng thật, không chỉ đúng về lý thuyết

## Ghi chú

**Cách tái hiện đúng kịch bản "chuyển tab" bằng Playwright — thử sai
nhiều lần mới ra**: các cách "hiển nhiên" đều KHÔNG kích hoạt được gì —
`browser_tabs` (select qua/lại 2 tab của MCP), `page.bringToFront()`
(API chính thức của Playwright, khác hẳn MCP's `browser_tabs`), CDP
`Emulation.setFocusEmulationEnabled(false/true)`, ghi đè trực tiếp
`document.visibilityState`/`document.hidden` qua `Object.defineProperty`
rồi dispatch `visibilitychange`/`focus`/`blur` thủ công — không cách nào
khiến `document.hidden` đổi giá trị hay kích hoạt `FocusManager` của React
Query (`dataUpdatedAt` không đổi qua mọi lần thử). Chromium headless
dường như không mô phỏng occlusion giữa các tab (không có window manager
thật để biết tab nào "che khuất" tab nào), nên Page Visibility API luôn
báo `visible` bất kể cách nào tác động từ phía JS/CDP thông thường.

Cách đúng: CDP domain **`Page.setWebLifecycleState`** (khác hẳn
`Emulation.setFocusEmulationEnabled`) — dành riêng để giả lập tính năng
"tab freezing/discarding" thật của Chrome (browser tự tạm dừng tab nền để
tiết kiệm tài nguyên). Gọi `state: 'frozen'` rồi `state: 'active'` khiến
Chrome tự bắn đúng chuỗi sự kiện lifecycle mà tab nền/foreground thật trải
qua — `document.visibilityState` đọc qua `page.evaluate()` **vẫn không
đổi giá trị quan sát được**, nhưng sự kiện DOM liên quan vẫn được dispatch
đúng, đủ để `FocusManager` của React Query bắt được và trigger refetch.
Xác nhận bằng cách tắt tạm `refetchOnWindowFocus`/`staleTime` (baseline
trước-vá): cycle này tái hiện `insertBefore` 100%; bật lại fix, lặp đúng
cycle: sạch. Đây mới là feedback loop tái hiện ĐÚNG trigger gốc, không
phải suy luận gián tiếp qua `invalidateQueries` nữa.

**Trong lúc kiểm thử phát hiện 1 false positive tự gây ra**: lần đầu
expose `queryClient` qua `window.__qc = queryClient` viết thẳng trong
thân component (không phải trong `useEffect`) — dòng này chạy cả lúc SSR
trên server, nơi `window` không tồn tại, gây lỗi `window is not defined`
→ TanStack Start tự fallback "Switched to client rendering" → gây ra
**một lỗi `insertBefore` khác, không liên quan gì tới bug thật** (hydration
mismatch do SSR crash). Ban đầu nhầm lẫn đây là false positive của toàn
bộ giả thuyết — advisor chỉ ra đúng: so sánh số lỗi/warning trước/sau
`invalidateQueries` (5 lỗi/0 warning → 6 lỗi/2 warning) cho thấy lỗi
`insertBefore` xuất hiện SAU, KHÔNG PHẢI cùng lúc với SSR crash lúc load
trang — 2 lỗi độc lập, bị nhầm chung. Sửa cách expose (đưa vào
`useEffect`) rồi lặp lại thí nghiệm mới xác nhận đúng, sạch.

**Rủi ro còn lại (chưa vá, ngoài phạm vi task này)**: cả `staleTime:
Infinity` lẫn `refetchOnWindowFocus: false` chỉ chặn các nguồn refetch TỰ
ĐỘNG. Nếu có code nào đó CHỦ ĐỘNG gọi `invalidateQueries` khớp query
`'bytes'` trong lúc `OnlyofficeEditor` đang mount (ví dụ lỡ tay mở rộng
phạm vi invalidate của `deleteMutation`/`saveMutation` sau này), lỗi
`insertBefore` vẫn tái diễn — gốc rễ thật sự là effect tạo editor trong
`OnlyofficeEditor` (deps `[file, fileType, title, mode]`) không chịu được
việc `file` đổi identity giữa chừng trong khi `DocEditor` còn sống. Fix ở
đây chặn đúng trigger cụ thể đã biết (auto-refetch), không refactor lại
effect đó — để lại cho sau nếu phát sinh thêm ca tương tự.
