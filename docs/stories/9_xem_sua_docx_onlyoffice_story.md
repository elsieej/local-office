# US-9: Xem và sửa tài liệu `.docx` thật qua ONLYOFFICE

**Feature:** [Xem và sửa tài liệu Office thật (ONLYOFFICE)](../features/3_xem_sua_tai_lieu_office_that_feature.md)
**Trạng thái:** ⬜ Nháp
**Dữ liệu rời máy:** Không

---

## Câu chuyện

> **Là** người dùng đã lưu một file `.docx` cục bộ (từ [Feature 2](../features/2_mo_va_xem_tai_lieu_cuc_bo_feature.md)), **tôi muốn** bấm "Xem" hoặc "Sửa" để thấy/chỉnh nội dung thật ngay trong trình duyệt, **để** không cần cài Microsoft Office.

**Phạm vi hẹp hơn Feature 3**: story này chỉ làm `.docx` (ONLYOFFICE `documenteditor`). `.xlsx`/`.pptx` (spreadsheet/presentation editor) để lại cho story sau — xem mục 7 của feature doc.

## Mong muốn

- [x] Danh sách tài liệu: file `.docx` có 2 hành động riêng "Xem" và "Sửa" (không còn dùng chung một nút mở)
- [x] Bấm "Xem" → trang chi tiết khởi tạo `DocEditor` ở mode view (qua `document.permissions.edit: false`, không dùng `editorConfig.mode` — xem Ghi chú TASK-21), nội dung hiện đúng như mở bằng Word, không sửa được
- [x] Bấm "Sửa" → trang chi tiết khởi tạo `DocEditor` ở mode edit, gõ/sửa được nội dung
- [x] Đang ở mode Xem, có nút "Chuyển sang Sửa" ngay trên trang chi tiết → huỷ editor cũ, khởi tạo lại ở mode edit, không cần quay lại danh sách
- [x] Đang ở mode Sửa có thay đổi chưa lưu, người dùng rời trang (quay lại danh sách, chuyển sang mode Xem, đóng tab) → xác nhận qua `window.confirm` trước khi huỷ, giống mẫu đã dùng ở nút Xoá
- [x] Sửa xong, bấm lưu → file cập nhật lại trong OPFS (vẫn 🔒 Cục bộ), không có request nào gửi nội dung ra ngoài máy
- [x] Tải về sau khi sửa → file `.docx` mở được bằng Microsoft Office, giữ đúng nội dung đã sửa (khứ hồi thật, không mất định dạng)
- [x] Ô tìm kiếm riêng trên header trang chi tiết (giao diện LocalOffice, không phải panel nổi của ONLYOFFICE) — gõ vào là khớp được highlight vàng trực quan ngay trong tài liệu, hoạt động cả 2 mode Xem/Sửa (xem TASK-28 và Ghi chú)
- [ ] `browser_network_requests` trong suốt luồng xem/sửa/lưu: không có request nào ra ngoài domain LocalOffice (kế thừa câu hỏi mở từ US-8 — đo được thật lần đầu ở story này vì cần editor chạy thật)
- [ ] Đo dung lượng thật trình duyệt tải ở lần mở editor đầu tiên, so với kỳ vọng "vài giây" của `CLAUDE.md` — ghi kết luận rõ ràng dù đạt hay không đạt (kế thừa từ US-8)
- [x] File `.docx` hỏng/không parse được → báo lỗi rõ, không treo trang, không mất file gốc trong OPFS (kiểm ở TASK-21, mode Xem)
- [x] Trang "Tải mã nguồn" (nghĩa vụ AGPL §13) có link thật trỏ đúng bản đang chạy, hiển thị được từ giao diện chính

## Task

- [x] [TASK-19: Vendor pipeline asset ONLYOFFICE + `x2t.wasm`](../tasks/19_vendor_pipeline_onlyoffice_task.md) · #38
- [x] [TASK-20: LICENSE AGPL-3.0 + trang "Tải mã nguồn"](../tasks/20_license_agpl_trang_nguon_task.md) · #41
- [x] [TASK-21: Mở `.docx` ở mode Xem qua `DocEditor`](../tasks/21_mo_docx_mode_xem_task.md) · #43
- [x] [TASK-22: 2 nút Xem/Sửa, chuyển mode, xác nhận thay đổi chưa lưu](../tasks/22_nut_xem_sua_chuyen_mode_task.md) · #45
- [x] [TASK-23: Tinh chỉnh giao diện editor ONLYOFFICE (logo, kích thước, bố cục trang)](../tasks/23_tinh_chinh_giao_dien_editor_task.md) · #47
- [x] [TASK-24: Đồng bộ theme sáng/tối của editor ONLYOFFICE với LocalOffice](../tasks/24_dong_bo_theme_editor_task.md) · #49 —
      điều tra lại TASK-23: theme tối thật ra lên hình đúng, TASK-23 kết
      luận sai do `localStorage['ui-theme-id']` của ONLYOFFICE cache theme
      cũ; sửa cho theme LocalOffice luôn thắng cache, xem Ghi chú task đó
- [x] [TASK-25: Vá lỗi `fetch`/`XHR` proxy resolve URL tương đối sai (window chính, không phải iframe editor)](../tasks/25_vendor_proxy_realm_task.md) · #51 —
      sửa lỗi DOM injection `child.setAttribute is not a function` đã ghi
      từ TASK-21 (icon HiDPI, dữ liệu spellcheck alphabet), không liên
      quan theme, xem Ghi chú task đó
- [x] [TASK-26: Lưu khứ hồi thật vào OPFS khi bấm "Lưu" trong editor](../tasks/26_luu_khu_hoi_opfs_task.md) · #53
- [ ] TASK-27: Đo network payload/egress thật (kế thừa US-8) — cần TASK-26
      xong trước để đo đúng luồng lưu — chưa viết task doc
- [x] [TASK-28: Ô tìm kiếm trên header, highlight trực tiếp trong tài liệu](../tasks/28_o_tim_kiem_header_task.md) · #56
- [x] [TASK-29: Vá lỗi `insertBefore` khi tab được focus lại trong lúc đang mở `.docx`](../tasks/29_fix_insertbefore_refetch_task.md) · #58 —
      phát sinh ngoài kế hoạch, người dùng báo cáo trực tiếp, không thuộc
      chuỗi tách nhỏ ban đầu

## Ghi chú

`DocEditor` của ONLYOFFICE tự nói chuyện với một "Document Server" thật qua
HTTP + WebSocket (coauthoring). Không có server đó — cần một lớp giả lập
chạy hoàn toàn phía client (chặn `XMLHttpRequest`/`fetch`/`Worker` của
iframe editor, trả lời đúng giao thức bằng dữ liệu trong bộ nhớ, chuyển đổi
định dạng thật bằng `x2t.wasm` trong Web Worker). Đây là phần khó và rủi ro
nhất của US-9, không phải phần UI.

Vì vậy tách 1 task-sketch ban đầu ("tích hợp DocEditor + 2 nút Xem/Sửa")
thành 3: TASK-21 chỉ dựng lớp giả lập + mở được `.docx` ở mode Xem (rủi ro
kỹ thuật lớn nhất, phải xong trước thì phần sau mới có ý nghĩa); TASK-22
thêm UI (2 nút, chuyển mode, xác nhận rời trang) — thuần UI, không rủi ro
kỹ thuật thêm; TASK-26 làm lưu thật vào OPFS, TASK-27 đo lường (cần editor
chạy thật và TASK-26 xong trước để đo đúng chỉ số của "Mong muốn"). TASK-23
(polish giao diện: logo, kích thước,
bố cục trang) chèn thêm sau TASK-22 theo yêu cầu phát sinh của người dùng
— không nằm trong tách nhỏ ban đầu, cũng thuần UI không rủi ro kỹ thuật.
Đồng bộ theme sáng/tối ban đầu cũng định làm trong TASK-23 nhưng lúc đó
kết luận nhầm là "không lên hình được" (thật ra do cache theme cũ của
ONLYOFFICE, xem TASK-24) nên tách riêng thành TASK-24; điều tra TASK-24
lại lộ ra một lỗi thật khác không liên quan theme (`fetch`/`XHR` proxy
tính sai gốc URL tương đối của iframe editor), tách tiếp thành TASK-25.

Lớp giả lập ở TASK-21 chuyển thể (adapt) từ mã nguồn AGPL-3.0 của
[baotlake/office-website](https://github.com/baotlake/office-website)
(`utils/editor/*.ts`) — cùng giấy phép với LocalOffice từ TASK-20, ghi rõ
nguồn ở đầu từng file chuyển thể.

**Tìm kiếm nội dung — kết luận ban đầu bị đổi lại sau đó**: có câu hỏi
phát sinh sau TASK-26 — người dùng cần tìm một đoạn chữ trong tài liệu
thì làm sao highlight trực quan cho họ thấy? Kết luận lúc đó: bản thân
`DocEditor` đã có sẵn panel "Tìm kiếm" (nút kính lúp ở left menu, hoặc
Ctrl+F trong iframe editor) — xác nhận bằng Playwright MCP thật, không
cần code thêm. Ngay sau đó người dùng yêu cầu cụ thể hơn: một ô tìm kiếm
**thuộc giao diện LocalOffice** (trên header trang chi tiết), không phải
panel nổi rời rạc của ONLYOFFICE — đổi hẳn kết luận, thành TASK-28 (có
code thật).

Cách TASK-28 làm: `DocEditor` không có API tìm kiếm chính thức nào lộ ra
ngoài qua `DocsAPI.DocEditor` (chỉ có `downloadAs`, `requestClose`,...) —
gọi thẳng object nội bộ `window.editor` (`asc_findText`, minified,
không ổn định giữa các bản build) rủi ro hơn nhiều so với **tái dùng
chính DOM của panel "Tìm kiếm" có sẵn** (`#search-bar-text`, id ổn định,
không bị minify vì là id HTML) — ô header của LocalOffice ghi giá trị
vào đúng input đó (qua native setter + dispatch sự kiện `input`, giống
hệt cách người dùng gõ tay) rồi ẩn hẳn panel nổi bằng CSS
(`.search-bar { display: none }`) chèn ngay từ `onAppReady`. Panel chưa
từng mở thì chưa có DOM (`#search-bar-text` không tồn tại) — mở lần đầu
bằng cách giả lập sự kiện bàn phím Ctrl+F (`KeyboardEvent` dựng tay,
không cần phím thật — đã xác nhận: chỉ cần đúng `ctrlKey`/`key`, không
quan tâm `isTrusted`) vào `#id_main` của iframe. Đánh đổi đã biết: mất
bộ đếm "x/y" và nút điều hướng next/prev của panel gốc (đã ẩn theo panel)
— để lại cho sau nếu cần, phạm vi TASK-28 chỉ cần highlight-khi-gõ.

**TASK-29 — lỗi `insertBefore` khi tab được focus lại**: người dùng báo
cáo mở `.docx` mode Xem, chuyển tab trình duyệt rồi quay lại thì gặp lỗi
console `insertBefore`, trang crash. Xác nhận nguyên nhân bằng thực
nghiệm (Playwright, `queryClient.invalidateQueries` thẳng vào query
`'bytes'` trong lúc `OnlyofficeEditor` đang mount): `refetchOnWindowFocus`
mặc định `true` của React Query khiến tab focus lại tự refetch bytes →
`file` đổi identity → effect tạo editor chạy lại giữa chừng trong khi
`DocEditor` còn sở hữu DOM cũ → cùng cơ chế đã ghi trong comment của
`saveMutation` (TASK-26), khác trigger. Vá bằng `refetchOnWindowFocus:
false` global (`router.tsx`) và `staleTime: Infinity` riêng cho
`fileQuery` (`$documentId.tsx`) — chặn hẳn mọi nguồn refetch tự động,
không chỉ window focus.

Trong lúc kiểm thử suýt kết luận nhầm: lần đầu expose `queryClient` qua
`window.__qc = queryClient` viết thẳng trong thân component (không phải
`useEffect`) làm vỡ SSR (`window is not defined` trên server) → gây ra
MỘT lỗi `insertBefore` khác không liên quan (hydration mismatch do SSR
crash), lẫn với lỗi thật. Sửa cách expose (đưa vào `useEffect`) rồi lặp
lại mới xác nhận đúng, sạch. Sau đó tìm ra cách tái hiện đúng kịch bản gốc
(chuyển tab thật) bằng CDP domain `Page.setWebLifecycleState('frozen'/
'active')` — mô phỏng đúng tính năng tab-freezing thật của Chrome, khác
hẳn `Emulation.setFocusEmulationEnabled` hay `page.bringToFront()` (cả 2
đều không kích hoạt được gì trong Chromium headless) — xác nhận bằng
feedback loop đỏ/xanh thật: tắt tạm fix → cycle này tái hiện `insertBefore`
100%; bật lại fix → cycle giống hệt, sạch. Chi tiết xem Ghi chú TASK-29.

## Xong khi

Mọi ô ở **Mong muốn** và **Task** đều tick → đổi **Trạng thái** thành ✅ Xong, rồi tick dòng tương ứng trong file feature.
