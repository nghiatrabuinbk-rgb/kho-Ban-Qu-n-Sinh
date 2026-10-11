# Hệ Thống Quản Lý Nội Trú Học Sinh - PTDTBT THCS Trà Đốc

Hệ thống quản lý nội trú chuyên biệt dành cho Trường Phổ thông Dân tộc Bán trú THCS Trà Đốc (Đà Nẵng), quản lý 25 phòng ở (12 phòng nam, 13 phòng nữ, quy mô ~375-400 học sinh), đáp ứng quy trình điểm danh 2 buổi sáng/tối, xếp hạng thi đua nếp ở, đăng ký cuối tuần, chấm điểm phong trào có ảnh minh chứng, và xuất báo cáo đa định dạng (Excel, Word, PDF) phục vụ công tác chỉ đạo và lưu trữ hồ sơ.

## User Review & Critical Decisions

> [!IMPORTANT]
> Dựa trên phản hồi trong phiên phỏng vấn định hướng thiết kế và kiến trúc:
> - **Cơ chế lưu trữ dữ liệu**: Sử dụng Firebase Firestore trực tuyến đa thiết bị, đồng bộ tức thời giữa điện thoại/máy tính của Trưởng ban, Ban Giám hiệu, Ban Quản sinh và các Giáo viên trực phòng. Tích hợp cơ chế bộ nhớ đệm giúp thao tác điểm danh mượt mà ngay cả khi đường truyền chập chờn.
> - **Phong cách giao diện**: "Sang trọng hiện đại với tông xanh ngọc (Emerald / Deep Teal) kết hợp vàng gold ấm áp", bố cục chuẩn Dashboard cấp bộ phận chuyên nghiệp, không lạm dụng chi tiết rườm rà, tối ưu chuẩn hiển thị bảng biểu số liệu dân tộc nội trú.
> - **Cơ chế khóa sổ & Thứ tự nộp điểm danh**: Trưởng ban linh hoạt cấu hình mốc giờ điểm danh sáng (ví dụ trước 06:45) và tối (trước 21:15). Hệ thống tự động ghi nhận chính xác `timestamp` nộp bài, phân loại "Đúng giờ" / "Nộp trễ", xếp hạng thứ tự nộp giữa 25 phòng và cộng/trừ điểm thi đua chuyên cần tự động.

- **Quyết định đã xác nhận 1**: Lưu trữ đám mây qua Firebase Firestore + Đăng nhập Google Gmail của thầy Trưởng ban (`nghiatrabui.nbk@gmail.com`) và phân quyền linh hoạt theo tài khoản.
- **Quyết định đã xác nhận 2**: Bảng màu chủ đạo Deep Teal (`#0F4C5C` / `#134E4A`) kết hợp Vàng Gold ấm hoàng gia (`#D97706` / `#B45309`) trên nền Neutral ngà sáng sang trọng (`#F8FAFC`).
- **Lựa chọn mặc định khuyến nghị**: Định dạng xuất báo cáo hỗ trợ đầy đủ 3 chuẩn xuất: File Excel (`.xlsx` phân tích số liệu), File Word (`.doc` chuẩn công văn mẫu báo cáo trường học) và File PDF in ấn trực tiếp không bể khung, có sẵn chữ ký mẫu của Trưởng ban và Hiệu trưởng.

---

## 1. Overview & Core Concept

- **Mục tiêu hệ thống**: Số hóa toàn diện công tác quản trị khu nội trú học sinh vùng cao Trà Đốc, giảm thiểu việc ghi sổ tay truyền thống, tránh sót lọt học sinh vắng trốn ra ngoài, hỗ trợ đánh giá thi đua công bằng giữa các phòng ở theo tuần/tháng/kỳ/năm.
- **Đối tượng sử dụng chính**:
  - **Trưởng ban Quản lý nội trú (Thầy Nguyễn Trọng Nghĩa - Toàn quyền Admin)**: Quản lý danh mục phòng, định mức sĩ số, cấu hình giờ khóa sổ, phân công giáo viên trực phòng, duyệt báo cáo tổng hợp, xếp hạng thi đua, xuất file gửi Ban Giám hiệu & Phòng GD&ĐT.
  - **Ban Giám hiệu (BGH) & Ban Quản sinh**: Tra cứu báo cáo nhanh, chấm điểm thi đua chuyên đề (nội quy, vệ sinh phòng, khu vực công cộng, nhà bếp, nhà vệ sinh, giải phong trào văn nghệ/thể thao) và tải ảnh minh chứng thực tế.
  - **Giáo viên trực phòng (25 phòng)**: Quản lý thông tin học sinh phòng mình (kèm đặc thù miền núi: Thôn, Nóc ông/bà, Tên phụ huynh, SĐT), điểm danh sáng/tối hằng ngày từ Thứ 2 đến Thứ 6, đăng ký ở lại cuối tuần hay về nóc.
- **Giá trị cốt lõi**: Nhanh chóng, chính xác theo thời gian thực, lưu trữ minh chứng ảnh không sợ thất lạc, xuất file in ấn tức thì phục vụ thanh tra và lưu trữ văn thư.

---

## 2. User Experience & Visual Design

### Key User Flows

1. **Đăng nhập & Nhận diện vai trò**:
   - Thầy Trưởng ban đăng nhập Gmail (`nghiatrabui.nbk@gmail.com`) được tự động nhận diện quyền Quản trị tối cao.
   - Quản trị viên có tab "Phân quyền & Giáo viên" để cấp email cho các thầy cô quản nhiệm từng phòng (Phòng 1 -> Phòng 25) hoặc vai trò Ban Giám hiệu / Ban Quản sinh.
   - Có chế độ chuyển đổi vai trò linh hoạt (Demo Mode / Switch Role) để kiểm tra giao diện từng phòng khi cần hỗ trợ giáo viên.
2. **Quản lý danh sách học sinh theo phòng (Giáo viên trực phòng)**:
   - Giáo viên chọn phòng phụ trách: Xem sĩ số chuẩn (14 - 15 em/phòng).
   - Thêm/sửa học sinh với các trường văn hóa bản địa: Họ và tên, Lớp, Giới tính, Thôn, Nóc ông/bà (Ví dụ: Nóc Ông Tuấn, Nóc Ông Bình...), Con ông/bà, Số điện thoại liên lạc khẩn cấp, Ghi chú sức khỏe/hoàn cảnh.
3. **Quy trình Điểm danh Sáng & Tối (Thứ 2 đến Thứ 6)**:
   - Bảng điểm danh trực quan 1-chạm: Mặc định tất cả Có mặt, bấm 1 chạm để chuyển sang Vắng có phép / Vắng không phép.
   - Bấm "Gửi Báo Cáo Điểm Danh": Ghi nhận thời điểm chính xác (giờ:phút:giây).
   - Thứ tự gửi báo cáo giữa 25 phòng được cập nhật trực tiếp lên Bảng Theo Dõi Thi Đua của Trưởng ban: Phòng nộp lúc 06:15 hiển thị vị trí số 1 (Đúng giờ); phòng nộp sau 06:45 hiển thị nhãn cảnh báo nộp trễ.
4. **Đăng ký Ở lại cuối tuần / Về nhà**:
   - Giáo viên tích chọn trạng thái cuối tuần: Ở lại trường hay Về nhà, người đón/tự về, ngày dự kiến quay lại trường (Chiều Chủ Nhật hoặc Sáng Thứ Hai).
5. **Chấm điểm thi đua & Tải minh chứng ảnh (Ban Quản sinh)**:
   - Tiêu chí chấm điểm đa chiều:
     + Nội quy & nề nếp phòng ở (gấp chăn màn, giờ giấc ngủ nghỉ).
     + Vệ sinh phòng ở & Vệ sinh khu vực chung.
     + Phòng trực tuần (Trực nhật nhà vệ sinh, nhà bếp ăn bán trú).
     + Phong trào Văn hóa - Văn nghệ (Tiếng hát nội trú, kể chuyện...).
     + Thể dục - Thể thao (Bóng đá mini, bóng chuyền, cầu lông, đá cầu) theo thứ hạng Nhất / Nhì / Ba.
   - Tải lên ảnh chụp thực tế bằng chứng vi phạm hoặc bằng chứng phòng sạch đẹp/ảnh nhận giải.
6. **Tổng hợp & Xuất báo cáo (Ngày, Tuần, Tháng, Năm)**:
   - Bộ lọc thời gian linh hoạt (Hôm nay, Tuần hiện tại, Tháng học kỳ, Cả năm học).
   - Xuất Excel (`.xlsx` nhiều sheet: Tổng hợp vắng, Chi tiết từng phòng, Bảng điểm thi đua).
   - Xuất Word (`.doc` mẫu báo cáo trường học đóng dấu văn thư).
   - Xuất PDF (`.pdf` bản in A4 căn lề chuẩn, bảng biểu rõ nét, có phần ký duyệt).

### Visual Identity & Theme

- **Aesthetic Direction**: Sang trọng hiện đại (Executive Academic Dashboard), kết hợp tông màu trầm đĩnh đạc của gỗ rừng núi và sự tươi sáng tri thức vùng cao.
- **Bảng màu (Tailwind Theme Tokens)**:
  - Nền tổng thể: `#F8FAFC` (Slate-50) sạch sẽ, thoáng đãng.
  - Màu chủ đạo (`Primary`): Deep Emerald Teal `#0D5C75` / `#0F4C5C` (Uy nghiêm, thanh lịch, đại diện cho thiên nhiên Trà Đốc).
  - Màu điểm xuyết (`Accent`): Warm Imperial Gold `#D97706` / `#B45309` (Sang trọng, vinh danh giải thi đua, nút thao tác quan trọng).
  - Thẻ & Bề mặt (`Surface`): Trắng tinh khiết `#FFFFFF` viền hairline thanh mảnh `border-slate-200`.
  - Màu phân loại giới tính phòng: Nam (Màu chàm Slate Blue), Nữ (Màu san hô đất Terracotta Rose nhã nhặn, không sến).
- **Typography**: Phông chữ hiển thị hiện đại `Plus Jakarta Sans` / `Outfit` chuẩn tiếng Việt, đi kèm phông monospace số liệu `tabular-nums` cho thống kê sĩ số và thời gian.
- **Kỷ luật giao diện**: Không sử dụng badge pill chồng chéo, không dùng nhãn thừa; số liệu rõ ràng; thao tác dứt khoát 1 chạm trên cả điện thoại di động và máy tính bảng.

---

## 3. Key Product Decisions & Trade-Offs

### Quyết định 1: Kiến trúc Dữ liệu & Lưu trữ Minh chứng Hình ảnh
- **Giải pháp**: Sử dụng Firestore cho cơ sở dữ liệu cấu trúc (Phòng, Học sinh, Điểm danh, Chấm điểm, Cấu hình). Với hình ảnh minh chứng chấm điểm thi đua, hỗ trợ nén ảnh trực tiếp tại client xuống độ phân giải chuẩn (JPEG/WebP tối ưu, kích thước <250KB) lưu trữ dạng Base64 Data URL / Cloud Storage tương thích, giúp hiển thị tức thì mà không lo quá tải dung lượng.
- **Lý do**: Giáo viên vùng cao thường dùng điện thoại 4G/Wifi trường học, nén ảnh client giúp tải nhanh tức thì ngay cả khi mạng yếu.

### Quyết định 2: Công cụ Xuất Báo Cáo 3 trong 1 (Excel + Word + PDF)
- **Giải pháp**:
  - Excel: Tích hợp thư viện xử lý bảng tính chuẩn client-side tạo file `.xlsx` định dạng màu mè, kẻ ô viền, chia cột chuẩn.
  - Word: Tạo tài liệu `.doc` định dạng HTML Rich-Text tương thích 100% với Microsoft Word, giữ nguyên quốc hiệu, tiêu ngữ, bảng biểu và chỗ ký tên.
  - PDF: Cung cấp chế độ xem trước bản in (Print Preview) chuẩn CSS `@media print` trang A4 ngang/dọc, xuất PDF sắc nét qua trình in của hệ thống.
- **Lý do**: Trưởng ban có thể gửi file Excel cho kế toán bán trú để tính khẩu phần ăn, gửi file Word cho Ban Giám hiệu nộp báo cáo Phòng GD&ĐT, và in file PDF dán bảng tin nội trú.

### Quyết định 3: Bảng xếp hạng nộp điểm danh thời gian thực
- **Giải pháp**: Lưu mốc `submittedAt` chính xác đến từng giây khi giáo viên nộp báo cáo. Tự động so sánh với cấu hình `deadlineMorning` và `deadlineEvening`.
- **Lý do**: Tạo động lực thi đua tự giác giữa 25 phòng trực, chấm dứt tình trạng quên điểm danh hoặc điểm danh muộn sau giờ học sinh đã vào lớp.

---

## 4. Technical Architecture & Data Strategy

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       GIAO DIỆN NGƯỜI DÙNG (REACT 19 + TAILWIND CSS)         │
├─────────────────────────────────────────────────────────────────────────────┤
│  [Top Navigation]: Quốc hiệu - PTDTBT THCS Trà Đốc | Vai trò & Gmail       │
│  [Tab Bar]: 1. Tổng quan 25 Phòng | 2. Điểm danh | 3. Thi đua | 4. Báo cáo  │
├──────────────────────────────────────┬──────────────────────────────────────┤
│          KHỐI GIÁO VIÊN TRỰC PHÒNG   │        KHỐI QUẢN TRỊ & QUẢN SINH     │
│  - Danh sách học sinh (Thôn, Nóc)    │  - Bảng kiểm soát 25 phòng trực tiếp │
│  - Điểm danh sáng / tối 1-chạm       │  - Bảng thứ tự nộp bài (Real-time)   │
│  - Đăng ký cuối tuần (về/ở lại)      │  - Chấm điểm thi đua & Upload ảnh    │
│  - Cảnh báo học sinh vắng liên tiếp  │  - Xuất báo cáo (Excel, Word, PDF)   │
└──────────────────────────────────────┴──────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                      LỚP QUẢN LÝ DỮ LIỆU & FIRESTORE ADAPTER                │
├─────────────────────────────────────────────────────────────────────────────┤
│  • Firestore Collections:                                                   │
│    - /rooms/{roomId} (25 phòng: 12 nam, 13 nữ, giáo viên phụ trách)         │
│    - /students/{studentId} (Họ tên, Thôn, Nóc, Phụ huynh, SĐT, Giới tính)   │
│    - /attendance/{recordId} (Ngày, Buổi sáng/tối, DS vắng, Thời gian nộp)   │
│    - /evaluations/{evalId} (Tuần/tháng, Phòng, Điểm tiêu chí, Ảnh minh chứng)│
│    - /system_config/settings (Giờ chốt sáng/tối, Quản trị viên, Phân quyền)│
│  • Báo cáo Engine: ExportXLSX, ExportWord, PrintA4Engine                    │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Data Schema Overview

1. **`Room`**:
   - `id`: `phong-01` -> `phong-25`
   - `name`: "Phòng 01", "Phòng 02", ...
   - `gender`: `"nam"` (12 phòng: 01-12) hoặc `"nu"` (13 phòng: 13-25)
   - `capacity`: 14 - 15 em
   - `teacherEmail`: Email giáo viên trực phụ trách
   - `teacherName`: Tên giáo viên trực phòng
2. **`Student`**:
   - `id`: string
   - `roomId`: ID phòng
   - `fullName`: Họ và tên
   - `gender`: `"nam"` | `"nu"`
   - `grade`: Lớp (6, 7, 8, 9)
   - `village`: Thôn (Thôn 1, Thôn 2, Thôn 3, Thôn 4, Trà Đốc...)
   - `nocHamlet`: Nóc ông/bà (Ví dụ: Nóc Ông Lăng, Nóc Ông Kỷ, Nóc Măng Xoan...)
   - `parentsName`: Con ông/bà
   - `phone`: Số điện thoại phụ huynh
   - `notes`: Ghi chú
3. **`Attendance`**:
   - `id`: `${roomId}_${date}_${session}` (session: `'morning'` | `'evening'`)
   - `date`: YYYY-MM-DD
   - `session`: `'morning'` | `'evening'`
   - `roomId`: ID phòng
   - `absentStudentIds`: Danh sách ID học sinh vắng
   - `weekendStatus`: Record học sinh ở lại / về nhà (áp dụng thứ 6)
   - `submittedAt`: ISO String mốc thời gian giáo viên bấm gửi
   - `submittedBy`: Email người nộp
   - `isLate`: boolean (tự động so sánh với hạn giờ cấu hình)
   - `notes`: Ghi chú của giáo viên
4. **`Evaluation` (Chấm điểm thi đua)**:
   - `id`: `${roomId}_week_${weekNumber}_${year}`
   - `roomId`: ID phòng
   - `week`: Tuần học
   - `month`: Tháng
   - `criteriaScores`:
     + `schoolRules`: Điểm nội quy nhà trường (0-20)
     + `roomCleanliness`: Điểm vệ sinh phòng ở (0-20)
     + `discipline`: Điểm nề nếp phòng ở (0-20)
     + `areaCleanliness`: Điểm vệ sinh khu vực chung (0-20)
     + `dutyWeek`: Điểm phòng trực tuần nhà vệ sinh & nhà bếp (0-20)
   - `movementScores`:
     + `artsRank`: Thứ hạng văn nghệ (Nhất/Nhì/Ba/Không có)
     + `sportsRank`: Thứ hạng thể thao (Nhất/Nhì/Ba/Không có)
     + `movementBonus`: Điểm cộng phong trào
   - `evidenceImages`: Array chứa URL / DataURL ảnh minh chứng
   - `assessedBy`: Ban Quản sinh chấm
   - `feedback`: Nhận xét cụ thể cho phòng
5. **`SystemConfig`**:
   - `adminEmail`: `"nghiatrabui.nbk@gmail.com"`
   - `schoolName`: `"Trường PTDTBT THCS Xã Trà Đốc"`
   - `headMaster`: Tên Hiệu trưởng
   - `boardingManager`: `"Nguyễn Trọng Nghĩa"`
   - `cutoffMorning`: Giờ chốt buổi sáng (mặc định "06:45")
   - `cutoffEvening`: Giờ chốt buổi tối (mặc định "21:15")
