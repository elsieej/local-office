# Feature: Đăng nhập & tài khoản người dùng

**Trạng thái:** 🟡 Đang làm
**Chủ trì:** elsie
**Cập nhật:** 2026-08-13

---

## 1. Tóm tắt

Cho phép người dùng tạo tài khoản, đăng nhập và đăng xuất bằng email/mật khẩu, để có một danh tính bền vững mở khoá các tính năng đám mây (tải lên, đồng bộ, chia sẻ) của LocalOffice — trong khi mọi tính năng mở/xem/sửa/tải về cục bộ vẫn hoạt động đầy đủ với người chưa đăng nhập.

## 2. Vấn đề

Scaffold `better-auth` đã có trong repo (form đăng ký/đăng nhập, nút đăng xuất, hiển thị avatar) nhưng nằm ở route demo (`/demo/better-auth`), chưa tích hợp vào luồng chính, và quan trọng hơn: `src/lib/auth.ts` chưa cấu hình `database` adapter nên Better Auth đang chạy **stateless** — không có bảng `user/session/account/verification`, không phiên nào được lưu thật. Không có đăng nhập thật thì các tính năng đám mây mô tả trong `CLAUDE.md` (tải lên, đồng bộ nhiều thiết bị, chia sẻ liên kết) chưa thể bắt đầu.

**Đối tượng ảnh hưởng:** người dùng muốn dùng tính năng đám mây (tải lên, đồng bộ, chia sẻ). Người chỉ mở/xem/sửa cục bộ không bị ảnh hưởng bởi feature này.

## 3. Phạm vi

**Trong phạm vi**

- Đăng ký tài khoản bằng email/mật khẩu
- Đăng nhập bằng email/mật khẩu, đăng xuất
- Nối `database` adapter cho Better Auth để phiên tồn tại thật, được nhớ giữa các lần tải lại trang
- Trạng thái đăng nhập hiển thị nhất quán trên header toàn ứng dụng
- Đảm bảo mọi tính năng cục bộ (mở, xem, sửa, tải về) hoạt động đầy đủ khi chưa đăng nhập

**Ngoài phạm vi**

- Đăng nhập qua mạng xã hội / OAuth
- Quên mật khẩu, đặt lại mật khẩu qua email, xác minh email
- Trang quản lý tài khoản (đổi mật khẩu, đổi tên, xoá tài khoản, quản lý danh sách phiên/thiết bị)
- Tải lên đám mây, đồng bộ, chia sẻ liên kết — feature riêng, chỉ _phụ thuộc_ vào đăng nhập đã dựng ở đây

## 4. Trải nghiệm người dùng

### Luồng chính

1. Người chưa có tài khoản mở trang đăng nhập, chuyển sang chế độ đăng ký, nhập email/mật khẩu/tên → tài khoản được tạo, được đăng nhập ngay
2. Người đã có tài khoản mở trang đăng nhập, nhập email/mật khẩu → vào ứng dụng, header hiển thị avatar/tên
3. Bấm đăng xuất từ header → phiên bị huỷ, quay về trạng thái ẩn danh

### Luồng phụ

- **Sai email/mật khẩu khi đăng nhập**: báo lỗi chung chung, không tiết lộ email nào tồn tại hay không
- **Đăng ký bằng email đã tồn tại**: báo lỗi, gợi ý đăng nhập thay vì tạo tài khoản trùng
- **Tải lại trang khi đang đăng nhập**: phiên được khôi phục tự động, không phải đăng nhập lại
- **Dùng ứng dụng mà không đăng nhập**: mọi luồng mở/xem/sửa/tải về cục bộ chạy bình thường, không màn hình nào ép đăng nhập

### Trạng thái giao diện

| Trạng thái  | Hiển thị gì                                                                                           |
| ----------- | ----------------------------------------------------------------------------------------------------- |
| Rỗng        | Form trống, nút submit validate khi bấm thay vì disable im lặng                                       |
| Đang tải    | Spinner trên nút khi gọi API đăng ký/đăng nhập; skeleton avatar khi đang xác định phiên lúc tải trang |
| Lỗi         | Thông báo lỗi trong form (`Alert`), không làm sập trang, không mất dữ liệu đã nhập                    |
| Ngoại tuyến | Form báo không có kết nối thay vì treo vô thời hạn; phần cục bộ của app không bị ảnh hưởng            |

## 5. Ảnh hưởng tới quyền riêng tư

| Câu hỏi                                                                        | Trả lời                                                                                                                                                        |
| ------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Có dữ liệu nào rời khỏi máy người dùng không?                                  | Có: email, mật khẩu (hash phía server), tên hiển thị — gửi lên server khi đăng ký/đăng nhập                                                                    |
| Nếu có, người dùng xác nhận ở bước nào và thấy thông tin gì?                   | Người dùng chủ động điền form và bấm "Tạo tài khoản"/"Đăng nhập" — hành động đó tự thân là xác nhận, tài khoản vô nghĩa nếu không gửi lên server               |
| Feature này đọc/ghi trạng thái tài liệu (🔒 / ☁️) ra sao?                      | Không đụng tới. Đăng nhập/đăng xuất không đổi trạng thái tài liệu nào — tài liệu luôn mặc định 🔒 Cục bộ kể cả khi đã đăng nhập (bất biến ở `ARCHITECTURE.md`) |
| Có hoạt động được khi mất mạng không?                                          | Không — đăng ký/đăng nhập/đăng xuất cần server. Toàn bộ phần xem/sửa cục bộ khác của app vẫn chạy được khi mất mạng                                            |
| Có yêu cầu đăng nhập không? Nếu có, phần nào vẫn dùng được khi chưa đăng nhập? | Đây chính là feature bật đăng nhập; mọi phần mở/xem/sửa/tải về cục bộ vẫn dùng được đầy đủ khi chưa đăng nhập (xem US-4)                                       |

## 6. Ràng buộc kỹ thuật

- **Xử lý ở đâu:** cả hai — client (`authClient` từ `better-auth/react`, form), server (`src/lib/auth.ts`, route splat `src/routes/api/auth/$.ts`)
- **Thư viện mới cần thêm:** không — `better-auth`, `drizzle-orm`, `pg` đã có trong `package.json`, chỉ cần nối dây
- **Đụng tới schema CSDL:** Có — cần sinh bảng `user`/`session`/`account`/`verification` của Better Auth (`npx @better-auth/cli migrate` hoặc generate + `db:migrate`) và cấu hình `database` adapter trong `src/lib/auth.ts`
- **Ảnh hưởng kích thước bundle:** không đáng kể — thư viện đã có sẵn trong scaffold, chỉ thêm route/UI

## 7. User story

- [ ] [US-1: Đăng ký tài khoản mới](../stories/1_dang_ky_tai_khoan_story.md)
- [ ] [US-2: Đăng nhập & đăng xuất bằng email/mật khẩu](../stories/2_dang_nhap_dang_xuat_story.md)
- [ ] [US-3: Trạng thái đăng nhập nhất quán trên toàn ứng dụng](../stories/3_trang_thai_dang_nhap_toan_ung_dung_story.md)
- [ ] [US-4: Dùng đầy đủ tính năng cục bộ khi chưa đăng nhập](../stories/4_dung_duoc_khi_chua_dang_nhap_story.md)

Feature chỉ đóng khi mọi ô ở đây đã tick **và** checklist mục 10 đã chạy hết.

## 8. Rủi ro và câu hỏi mở

| Rủi ro / câu hỏi                                                                            | Ảnh hưởng                                                         | Cách xử lý hoặc ai quyết                                                |
| ------------------------------------------------------------------------------------------- | ----------------------------------------------------------------- | ----------------------------------------------------------------------- |
| Chưa chọn provider gửi email (cần cho quên mật khẩu/xác minh email)                         | Các feature tài khoản sau này (nằm ngoài phạm vi ở đây) bị chặn   | Quyết định khi làm feature "quản lý tài khoản" — không chặn feature này |
| `BETTER_AUTH_SECRET` / `BETTER_AUTH_URL` trong `.env.local` cần đúng giá trị khi triển khai | Session không hợp lệ hoặc lộ secret nếu cấu hình sai ở production | Rà soát khi có môi trường triển khai thật, ngoài phạm vi feature này    |

## 9. Đo lường thành công

- Tỷ lệ đăng ký/đăng nhập thành công trên tổng số lần thử
- Không có lỗi 500 ở route `/api/auth/*` trong log server
- Tải lại trang khi đang đăng nhập không làm mất phiên (0 báo cáo bị đăng xuất ngoài ý muốn)

## 10. Checklist trước khi đóng

- [ ] Mọi user story đã xong
- [ ] Trạng thái rỗng / đang tải / lỗi / ngoại tuyến đều đã làm
- [ ] Bảng ảnh hưởng quyền riêng tư khớp với hành vi thực tế đã code
- [ ] Không có dữ liệu nào rời máy mà thiếu bước xác nhận
- [ ] Tuân thủ [`../RULE.md`](../RULE.md)
- [ ] [`../TECHSTACK.md`](../TECHSTACK.md) cập nhật nếu có gói mới hoặc thư mục mới
- [ ] `npm run lint` và `npm run format` sạch
