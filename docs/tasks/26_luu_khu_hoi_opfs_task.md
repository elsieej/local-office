# TASK-26: Lưu khứ hồi thật vào OPFS khi bấm "Lưu" trong editor

**Story:** [US-9](../stories/9_xem_sua_docx_onlyoffice_story.md)
**Issue:** #53 · **Nhánh:** `feat/luu-khu-hoi-opfs`
**Trạng thái:** 🔵 Chờ review

---

## Mục tiêu

Bấm "Lưu (Ctrl+S)" trong `DocEditor` ghi đè bytes mới vào đúng slot OPFS
của tài liệu đang mở, thay vì tải file `.docx` xuống máy như hành vi mặc
định của editor — khớp "Mong muốn" US-9: sửa xong bấm lưu thì file cập
nhật lại trong OPFS, vẫn 🔒 Cục bộ, không có request nào gửi nội dung ra
ngoài máy.

## Việc cần làm

- [x] `EditorServer` nhận callback `onNativeSave(file)`, gọi khi lệnh
      `downloadas` của `DocEditor` khớp đúng đuôi file gốc của tài liệu
      (phân biệt "Lưu" thật với "Tải về dưới dạng khác" — xem Ghi chú) ·
      `src/lib/onlyoffice/editor-server.ts`
- [x] `OnlyofficeEditor` nhận prop `onSave`, truyền xuống `EditorServer`
      qua ref (không đưa thẳng vào deps effect tạo editor — tránh
      unmount/remount editor mỗi lần cha re-render) ·
      `src/components/onlyoffice-editor.tsx`
- [x] `updateDocumentBytes(id, file)`: ghi đè bytes trong OPFS + cập nhật
      lại `size` trong metadata, giữ nguyên mọi trường khác (kể cả
      `openedAt`) · `src/lib/documents/store.ts`
- [x] Route `$documentId`: `saveMutation` gọi `updateDocumentBytes`, nối
      vào `onSave` của `OnlyofficeEditor`; `onSuccess` chỉ invalidate 2
      query metadata (danh sách + chi tiết), cố ý không đụng query
      `'bytes'` đang nuôi editor đang mount (xem Ghi chú) ·
      `src/routes/documents/$documentId.tsx`

## Kiểm thử

- [x] `npm run format && npm run lint` sạch
- [x] `npx tsc --noEmit` sạch (trừ 1 lỗi `drizzle.config.ts` có từ trước,
      không liên quan)
- [x] Playwright MCP thật: mở `.docx` có sẵn ở mode Sửa, gõ thêm chữ đánh
      dấu ở đầu tài liệu, bấm Ctrl+S → không có download nào kích hoạt,
      không có dialog "Tải về"
- [x] Playwright MCP thật: **reload lại trang** (`/documents/<id>?mode=view`,
      route mount lại từ đầu, không phải trạng thái editor cũ trong bộ
      nhớ) → chữ vừa gõ vẫn còn — xác nhận bytes thật sự ghi vào OPFS, không
      phải editor chỉ hiển thị bản trong RAM của nó
- [x] Playwright MCP thật: bấm "Tải về" ở trang chi tiết sau khi lưu → file
      tải về là `.docx` hợp lệ (`file` báo "Microsoft Word 2007+"), chứa
      đúng chữ vừa sửa — khứ hồi thật, mở được bằng Office
- [x] `browser_network_requests` trong lúc bấm Lưu → toàn bộ request vẫn
      cùng origin `localhost:3000` (asset ONLYOFFICE + `x2t.wasm`), không
      có request egress nào phát sinh thêm so với trước khi lưu
- [x] Trang danh sách tài liệu sau khi lưu: `size` hiển thị cập nhật đúng
      (26 KB → 27 KB ở file kiểm thử), thời gian "đã mở" **không đổi**
      (đúng thiết kế — lưu không phải mở lại)
- [x] Console không phát sinh lỗi mới so với baseline đã biết từ TASK-25
      (404 sdk cell/slide/visio, service worker 404 — ngoài phạm vi
      `.docx`, không liên quan lưu)

## Ghi chú

**`downloadas` không phân biệt được "Lưu" và "Tải về dạng khác" bằng cờ**:
`DocEditor` gọi lệnh `downloadas` cho MỌI trường hợp cần bytes tài liệu
hiện tại — cả Ctrl+S lẫn "Tải về dưới dạng \<định dạng khác\>" đều đi qua
cùng một đường, cùng `isSaveAs: false` (xác nhận bằng thực nghiệm). Cách
phân biệt duy nhất tìm được: so đuôi file đề xuất trong `cmd.title` với
đuôi gốc của tài liệu (`this.fileType`) — khớp thì coi là "Lưu" thật (ghi
đè OPFS), khác thì giữ hành vi tải file cũ. Giới hạn đã biết: nếu người
dùng chủ động chọn "Tải về dưới dạng .docx" (cùng định dạng, không đổi)
thay vì bấm Lưu, thao tác đó cũng bị coi là "Lưu" — chấp nhận được vì kết
quả (ghi đè đúng bytes hiện tại vào OPFS) giống hệt ý định người dùng
trong cả hai trường hợp.

**Vì sao `onSuccess` của `saveMutation` không invalidate query `'bytes'`**:
invalidate rộng theo prefix (kiểu `deleteMutation` ở trên) sẽ refetch luôn
query `[...DOCUMENTS_QUERY_KEY, documentId, 'bytes']` đang nuôi
`fileQuery` → `fileQuery.data` đổi identity → prop `file` mới đưa vào
`OnlyofficeEditor` **đang mount** → effect tạo editor chạy lại giữa chừng
trong khi `DocEditor` vẫn còn sở hữu DOM cũ → tranh chấp DOM với React.
Phát hiện lỗi này khi kiểm thử task — không cần bytes mới thật ra: editor
đang sống đã có đúng nội dung vừa lưu trong bộ nhớ riêng của nó, đọc lại
từ OPFS chỉ để hiển thị giống hệt những gì đã có.

**Việc còn lại cho TASK-27** (đo network payload/egress thật, kế thừa
US-8): task này chỉ xác nhận bằng mắt qua `browser_network_requests` là
không có domain lạ trong lúc lưu — chưa đo dung lượng cụ thể theo yêu cầu
"vài giây" của `CLAUDE.md` ở lần mở editor đầu tiên. Để lại đúng như dự
tính ban đầu trong story.
