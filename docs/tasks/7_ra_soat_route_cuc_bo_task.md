# TASK-7: Rà soát route xác nhận ranh giới cục bộ/đám mây không bị đăng nhập chặn nhầm

**Story:** [US-4](../stories/4_dung_duoc_khi_chua_dang_nhap_story.md)
**Issue:** #7 · **Nhánh:** `docs/ra-soat-route-cuc-bo`
**Trạng thái:** ⬜ Chưa làm

---

## Mục tiêu

Xác nhận (và giữ nguyên) rằng không route/luồng cục bộ nào trong ứng dụng bị ép đăng nhập, khớp với bất biến "Cục bộ là trạng thái mặc định của mọi tài liệu vừa mở, kể cả khi người dùng đã đăng nhập" ở `docs/ARCHITECTURE.md`.

## Việc cần làm

- [ ] Liệt kê toàn bộ route hiện có trong `src/routes/` và đánh dấu route nào cần đăng nhập (nếu có) — hiện tại dự kiến chỉ có route đám mây (chưa tồn tại) mới cần · `src/routes/`
- [ ] Xác nhận không route nào dùng `beforeLoad` hay guard nào redirect người dùng chưa đăng nhập ra khỏi luồng mở/xem/sửa/tải về cục bộ · `src/routes/`
- [ ] Ghi kết quả rà soát vào phần Ghi chú bên dưới, làm mốc tham chiếu cho các feature đám mây sau này khi chúng thêm guard đăng nhập thật

## Kiểm thử

- [ ] `npm run lint` sạch
- [ ] Kiểm thử tay: mở app ở chế độ ẩn danh (chưa đăng nhập) trên mọi route hiện có → không route nào redirect sang trang đăng nhập
- [ ] Trường hợp biên: xoá cookie phiên khi đang giữa luồng cục bộ (nếu đã có tính năng tài liệu) → luồng không bị gián đoạn

## Ghi chú

Task này chủ yếu là rà soát/tài liệu hoá — vì tính năng mở/xem/sửa tài liệu (mô tả ở `CLAUDE.md`) chưa có code, kết quả rà soát hiện tại sẽ ngắn; giá trị của task là đặt ra tiêu chí rõ ràng để feature tài liệu và feature đám mây sau này tuân theo, tránh vô tình thêm guard đăng nhập vào luồng cục bộ.
