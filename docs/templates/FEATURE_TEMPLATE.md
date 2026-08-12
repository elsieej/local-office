# Feature: <Tên tính năng>

> Copy file này thành `docs/features/<số>_<ten>_feature.md` (ví dụ `001_mo_va_xem_tai_lieu_feature.md`) rồi điền.
> Feature là một mảng tính năng hoàn chỉnh, gồm nhiều user story.
> Nếu việc cần làm chỉ gói trong một story, dùng [`USER_STORY_TEMPLATE.md`](USER_STORY_TEMPLATE.md) thay vì file này.

**Trạng thái:** ⬜ Nháp · 🟡 Đang làm · ✅ Xong
**Chủ trì:** <tên>
**Cập nhật:** <YYYY-MM-DD>

---

## 1. Tóm tắt

<!-- Một đoạn. Người đọc chỉ đọc mỗi đoạn này phải hiểu tính năng làm gì cho ai. -->

## 2. Vấn đề

<!-- Người dùng đang không làm được gì, hoặc đang làm cách khó chịu nào?
     Mô tả vấn đề, chưa nói giải pháp. -->

**Đối tượng ảnh hưởng:** <nhóm người dùng cụ thể>

## 3. Phạm vi

**Trong phạm vi**

- …

**Ngoài phạm vi**

<!-- Quan trọng ngang phần trên. Ghi rõ thứ người đọc dễ tưởng là có. -->

- …

## 4. Trải nghiệm người dùng

### Luồng chính

1. …
2. …

### Luồng phụ

- **<Tên tình huống>**: …

### Trạng thái giao diện

| Trạng thái  | Hiển thị gì |
| ----------- | ----------- |
| Rỗng        | …           |
| Đang tải    | …           |
| Lỗi         | …           |
| Ngoại tuyến | …           |

## 5. Ảnh hưởng tới quyền riêng tư

<!-- Bắt buộc. "Riêng tư là mặc định, chia sẻ là lựa chọn" là ràng buộc sản phẩm,
     không phải mong muốn — mọi feature phải nói rõ nó đứng ở đâu. -->

| Câu hỏi                                                                        | Trả lời       |
| ------------------------------------------------------------------------------ | ------------- |
| Có dữ liệu nào rời khỏi máy người dùng không?                                  | Không / Có: … |
| Nếu có, người dùng xác nhận ở bước nào và thấy thông tin gì?                   | …             |
| Feature này đọc/ghi trạng thái tài liệu (🔒 / ☁️) ra sao?                      | …             |
| Có hoạt động được khi mất mạng không?                                          | …             |
| Có yêu cầu đăng nhập không? Nếu có, phần nào vẫn dùng được khi chưa đăng nhập? | …             |

## 6. Ràng buộc kỹ thuật

<!-- Những thứ đã biết trước khi code. Xem docs/TECHSTACK.md nếu cần đối chiếu stack. -->

- **Xử lý ở đâu:** client / server / cả hai
- **Thư viện mới cần thêm:** … <!-- kèm lý do; mỗi gói mới là một cam kết dài hạn -->
- **Đụng tới schema CSDL:** Không / Có: …
- **Ảnh hưởng kích thước bundle:** …

## 7. User story

<!-- Tick khi story đó chuyển sang ✅ Xong. Xem quy trình ở TASK_TEMPLATE.md. -->

- [ ] [US-001: <tên>](../stories/001_<tên>_story.md)
- [ ] [US-002: <tên>](../stories/002_<tên>_story.md)

Feature chỉ đóng khi mọi ô ở đây đã tick **và** checklist mục 10 đã chạy hết.

## 8. Rủi ro và câu hỏi mở

| Rủi ro / câu hỏi | Ảnh hưởng | Cách xử lý hoặc ai quyết |
| ---------------- | --------- | ------------------------ |
| …                | …         | …                        |

## 9. Đo lường thành công

<!-- Làm sao biết feature này có tác dụng? Nếu không đo được, nói rõ tại sao. -->

- …

## 10. Checklist trước khi đóng

- [ ] Mọi user story đã xong
- [ ] Trạng thái rỗng / đang tải / lỗi / ngoại tuyến đều đã làm
- [ ] Bảng ảnh hưởng quyền riêng tư khớp với hành vi thực tế đã code
- [ ] Không có dữ liệu nào rời máy mà thiếu bước xác nhận
- [ ] Tuân thủ [`../RULE.md`](../RULE.md)
- [ ] [`../TECHSTACK.md`](../TECHSTACK.md) cập nhật nếu có gói mới hoặc thư mục mới
- [ ] `npm run lint` và `npm run format` sạch
