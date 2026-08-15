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
- [ ] **Chưa xác nhận được bằng Playwright**: đúng kịch bản người dùng
      báo cáo (chuyển tab trình duyệt thật, quay lại) — xem Ghi chú, giới
      hạn môi trường test. Cần người dùng tự xác nhận trên trình duyệt
      GUI thật trước khi đóng hẳn task này.

## Ghi chú

**Vì sao không tái hiện được đúng kịch bản gốc (chuyển tab) bằng
Playwright MCP**: đã thử nhiều cách — `browser_tabs` (select qua/lại 2
tab), CDP `Emulation.setFocusEmulationEnabled(false/true)`, ghi đè trực
tiếp `document.visibilityState`/`document.hidden` qua
`Object.defineProperty` rồi dispatch `visibilitychange`/`focus`/`blur` —
không cách nào khiến `document.hidden` thực sự đổi hoặc kích hoạt
`FocusManager` của React Query refetch (`dataUpdatedAt` không đổi qua mọi
lần thử). Trang chạy trong Chromium headless điều khiển qua CDP dường
như không mô phỏng đúng Page Visibility API theo cách nhiều tab thật
trong 1 cửa sổ trình duyệt GUI xử lý — đây là hạn chế của môi trường
test, không phải bằng chứng bác bỏ nguyên nhân.

**Cách xác nhận thay thế**: thay vì tái hiện đúng trigger "focus", xác
nhận trực tiếp CƠ CHẾ mà `refetchOnWindowFocus` (mặc định `true` của
React Query khi không set) sẽ kích hoạt — gọi thẳng
`queryClient.invalidateQueries()` lên đúng query key mà `onFocus` handler
nội bộ của thư viện sẽ gọi. Kết quả giống hệt nhau (cùng đường code:
refetch → set data mới → effect deps đổi → remount editor giữa chừng),
chỉ khác đường kích hoạt. Vá đúng nguyên nhân (tắt refetch tự động) nên
tin tưởng được dù chưa tái hiện đúng 100% trigger gốc.

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
