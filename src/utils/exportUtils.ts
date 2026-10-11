import * as XLSX from 'xlsx';
import { Room, Student, AttendanceRecord, EvaluationRecord, SystemSettings } from '../types';

export interface ReportFilterOptions {
  periodType: 'day' | 'week' | 'month' | 'year';
  dateStr: string; // YYYY-MM-DD
  weekNumber: number;
  monthNumber: number;
  yearNumber: number;
}

export function exportAttendanceToExcel(
  rooms: Room[],
  students: Student[],
  attendanceList: AttendanceRecord[],
  evaluations: EvaluationRecord[],
  settings: SystemSettings,
  options: ReportFilterOptions
) {
  const wb = XLSX.utils.book_new();

  // Sheet 1: Tổng hợp điểm danh 25 phòng
  const summaryRows = rooms.map((room, idx) => {
    const roomStudents = students.filter(s => s.roomId === room.id);
    const morningAtt = attendanceList.find(a => a.roomId === room.id && a.session === 'morning');
    const eveningAtt = attendanceList.find(a => a.roomId === room.id && a.session === 'evening');

    const morningAbsent = morningAtt?.absentStudentIds.length || 0;
    const eveningAbsent = eveningAtt?.absentStudentIds.length || 0;

    return {
      'STT': idx + 1,
      'Mã phòng': room.id,
      'Tên phòng': room.name,
      'Khu vực': room.buildingZone,
      'Giới tính': room.gender === 'nam' ? 'Nam' : 'Nữ',
      'Giáo viên trực': room.assignedTeacherName || '',
      'Sĩ số định mức': room.capacity,
      'Sĩ số hiện tại': roomStudents.length,
      'Vắng sáng': morningAbsent,
      'Giờ nộp sáng': morningAtt ? new Date(morningAtt.submittedAt).toLocaleTimeString('vi-VN') : 'Chưa nộp',
      'Trạng thái sáng': morningAtt ? (morningAtt.isLate ? 'Nộp trễ' : 'Đúng giờ') : 'Chưa nộp',
      'Vắng tối': eveningAbsent,
      'Giờ nộp tối': eveningAtt ? new Date(eveningAtt.submittedAt).toLocaleTimeString('vi-VN') : 'Chưa nộp',
      'Trạng thái tối': eveningAtt ? (eveningAtt.isLate ? 'Nộp trễ' : 'Đúng giờ') : 'Chưa nộp',
      'Ghi chú': morningAtt?.notes || eveningAtt?.notes || '',
    };
  });

  const wsSummary = XLSX.utils.json_to_sheet(summaryRows);
  XLSX.utils.book_append_sheet(wb, wsSummary, 'Tổng hợp điểm danh 25 phòng');

  // Sheet 2: Danh sách học sinh vắng cụ thể
  const absentRows: any[] = [];
  let absentIdx = 1;

  attendanceList.forEach((att) => {
    const room = rooms.find(r => r.id === att.roomId);
    att.absentDetails?.forEach((detail) => {
      const student = students.find(s => s.id === detail.studentId);
      if (student) {
        absentRows.push({
          'STT': absentIdx++,
          'Phòng': room?.name || att.roomId,
          'Buổi vắng': att.session === 'morning' ? 'Sáng' : 'Tối',
          'Ngày': att.date,
          'Họ và tên': student.fullName,
          'Lớp': student.grade,
          'Giới tính': student.gender === 'nam' ? 'Nam' : 'Nữ',
          'Thôn': student.village,
          'Nóc ông/bà': student.nocHamlet,
          'Con ông/bà': student.parentsName,
          'Số điện thoại': student.phone,
          'Lý do vắng': detail.reason === 'om_dau' ? 'Ốm đau' : detail.reason === 've_que' ? 'Về que/nóc' : detail.reason === 'co_phep' ? 'Có phép' : 'Không phép',
          'Chi tiết ghi chú': detail.note || '',
        });
      }
    });
  });

  const wsAbsent = XLSX.utils.json_to_sheet(absentRows.length > 0 ? absentRows : [{ 'Thông báo': 'Không có học sinh vắng' }]);
  XLSX.utils.book_append_sheet(wb, wsAbsent, 'Chi tiết học sinh vắng');

  // Sheet 3: Bảng điểm thi đua các phòng
  const evalRows = evaluations.map((ev, idx) => {
    const room = rooms.find(r => r.id === ev.roomId);
    let xepLoai = 'Khá';
    if (ev.totalScore >= 90) xepLoai = 'Xuất sắc';
    else if (ev.totalScore >= 80) xepLoai = 'Tốt';

    return {
      'Hạng': idx + 1,
      'Phòng': room?.name || ev.roomId,
      'Giáo viên quản nhiệm': room?.assignedTeacherName || '',
      'Nội quy (20đ)': ev.schoolRules,
      'Vệ sinh phòng (20đ)': ev.roomCleanliness,
      'Nề nếp ăn ở (20đ)': ev.discipline,
      'Vệ sinh khu vực (20đ)': ev.areaCleanliness,
      'Trực tuần bếp/WC (20đ)': ev.dutyWeek,
      'Giải Văn nghệ': ev.artsRank === 'first' ? 'Nhất' : ev.artsRank === 'second' ? 'Nhì' : ev.artsRank === 'third' ? 'Ba' : '-',
      'Giải Thể thao': ev.sportsRank === 'first' ? 'Nhất' : ev.sportsRank === 'second' ? 'Nhì' : ev.sportsRank === 'third' ? 'Ba' : '-',
      'Điểm cộng': ev.bonusPoints,
      'Điểm trừ': ev.penaltyPoints,
      'Tổng điểm': ev.totalScore,
      'Xếp loại': xepLoai,
      'Nhận xét': ev.feedback,
    };
  });

  const wsEval = XLSX.utils.json_to_sheet(evalRows);
  XLSX.utils.book_append_sheet(wb, wsEval, 'Thi đua các phòng');

  // Sheet 4: Danh mục toàn bộ học sinh theo thôn nóc
  const studentRows = students.map((s, idx) => {
    const room = rooms.find(r => r.id === s.roomId);
    const statusLabel = s.status === 'tam_nghi' ? 'Tạm nghỉ / Điều trị' : s.status === 'chuyen_truong' ? 'Đã chuyển trường' : s.status === 'dac_biet' ? 'Hoàn cảnh đặc biệt' : 'Đang ở nội trú';

    return {
      'STT': idx + 1,
      'Mã HS': s.id,
      'Phòng': room?.name || s.roomId,
      'Họ và tên': s.fullName,
      'Giới tính': s.gender === 'nam' ? 'Nam' : 'Nữ',
      'Lớp': s.grade,
      'Thôn': s.village,
      'Nóc ông/bà': s.nocHamlet,
      'Con ông/bà': s.parentsName,
      'Số điện thoại': s.phone,
      'Trạng thái': statusLabel,
      'Ghi chú': s.notes || '',
    };
  });

  const wsStudents = XLSX.utils.json_to_sheet(studentRows);
  XLSX.utils.book_append_sheet(wb, wsStudents, 'Danh bạ học sinh theo nóc');

  // Trigger download
  const fileName = `Bao_Cao_Noi_Tru_Tra_Doc_${options.periodType}_${options.dateStr}.xlsx`;
  XLSX.writeFile(wb, fileName);
}

export function exportReportToWord(
  rooms: Room[],
  students: Student[],
  attendanceList: AttendanceRecord[],
  evaluations: EvaluationRecord[],
  settings: SystemSettings,
  options: ReportFilterOptions
) {
  const totalStudents = students.length;
  const morningRecords = attendanceList.filter(a => a.session === 'morning');
  const morningSubmittedCount = morningRecords.length;
  const morningLateCount = morningRecords.filter(a => a.isLate).length;
  
  let totalAbsentMorning = 0;
  morningRecords.forEach(r => totalAbsentMorning += r.absentStudentIds.length);

  const presentCount = totalStudents - totalAbsentMorning;
  const attendanceRate = totalStudents > 0 ? ((presentCount / totalStudents) * 100).toFixed(1) : '100';

  let periodTitle = `NGÀY ${options.dateStr}`;
  if (options.periodType === 'week') periodTitle = `TUẦN ${options.weekNumber} (NĂM HỌC ${settings.academicYear})`;
  else if (options.periodType === 'month') periodTitle = `THÁNG ${options.monthNumber}/${options.yearNumber}`;
  else if (options.periodType === 'year') periodTitle = `CẢ NĂM HỌC ${settings.academicYear}`;

  const rowsHtml = rooms.map((room, idx) => {
    const roomStudents = students.filter(s => s.roomId === room.id);
    const morningAtt = attendanceList.find(a => a.roomId === room.id && a.session === 'morning');
    const absentCount = morningAtt?.absentStudentIds.length || 0;
    const timeStr = morningAtt ? new Date(morningAtt.submittedAt).toLocaleTimeString('vi-VN') : 'Chưa nộp';
    const statusStr = morningAtt ? (morningAtt.isLate ? 'Nộp trễ' : 'Đúng giờ') : 'Chưa nộp';

    return `
      <tr>
        <td style="text-align: center; padding: 6px; border: 1px solid #333;">${idx + 1}</td>
        <td style="padding: 6px; border: 1px solid #333; font-weight: bold;">${room.name}</td>
        <td style="padding: 6px; border: 1px solid #333;">${room.assignedTeacherName || ''}</td>
        <td style="text-align: center; padding: 6px; border: 1px solid #333;">${roomStudents.length}</td>
        <td style="text-align: center; padding: 6px; border: 1px solid #333; color: ${absentCount > 0 ? '#b91c1c' : '#15803d'}; font-weight: ${absentCount > 0 ? 'bold' : 'normal'};">${absentCount}</td>
        <td style="text-align: center; padding: 6px; border: 1px solid #333;">${timeStr}</td>
        <td style="text-align: center; padding: 6px; border: 1px solid #333; font-weight: bold; color: ${statusStr === 'Đúng giờ' ? '#15803d' : statusStr === 'Nộp trễ' ? '#d97706' : '#6b7280'};">${statusStr}</td>
        <td style="padding: 6px; border: 1px solid #333;">${morningAtt?.notes || ''}</td>
      </tr>
    `;
  }).join('');

  const wordContent = `
    <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
    <head>
      <meta charset='utf-8'>
      <title>Báo cáo Quản lý Nội trú</title>
      <style>
        body { font-family: 'Times New Roman', Times, serif; font-size: 13pt; line-height: 1.4; }
        table { border-collapse: collapse; width: 100%; margin-top: 15px; margin-bottom: 20px; }
        th { background-color: #f2f2f2; font-weight: bold; text-align: center; padding: 8px; border: 1px solid #333; }
        .header-table td { border: none !important; padding: 4px; }
      </style>
    </head>
    <body>
      <table class="header-table" style="width: 100%; margin-bottom: 25px;">
        <tr>
          <td style="width: 45%; text-align: center; vertical-align: top;">
            <strong>UBND XÃ TRÀ ĐỐC - TP ĐÀ NẴNG</strong><br/>
            <strong>TRƯỜNG PTDTBT THCS XÃ TRÀ ĐỐC</strong><br/>
            <strong>BAN QUẢN LÝ NỘI TRÚ</strong><br/>
            ──────────────
          </td>
          <td style="width: 55%; text-align: center; vertical-align: top;">
            <strong>CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</strong><br/>
            <strong>Độc lập - Tự do - Hạnh phúc</strong><br/>
            <em>Trà Đốc, ngày ${new Date().getDate()} tháng ${new Date().getMonth() + 1} năm ${new Date().getFullYear()}</em><br/>
            ──────────────
          </td>
        </tr>
      </table>

      <div style="text-align: center; margin-bottom: 25px;">
        <h2 style="margin: 0; font-size: 16pt;">BÁO CÁO CÔNG TÁC QUẢN LÝ HỌC SINH NỘI TRÚ BÁN TRÚ</h2>
        <div style="font-size: 14pt; font-weight: bold; margin-top: 5px;">${periodTitle}</div>
        <div style="font-style: italic; margin-top: 5px;">(Phục vụ chỉ đạo điều hành của Ban Giám hiệu và lưu trữ văn thư)</div>
      </div>

      <p><strong>I. TÌNH HÌNH CHUNG KHU NỘI TRÚ (25 PHÒNG Ở):</strong></p>
      <ul>
        <li>Tổng số phòng ở quản lý: <strong>${rooms.length} phòng</strong> (12 phòng nam, 13 phòng nữ).</li>
        <li>Tổng số học sinh bán trú nội trú: <strong>${totalStudents} em</strong> (Sĩ số định mức 14-15 em/phòng).</li>
        <li>Số học sinh có mặt thực tế: <strong>${presentCount} em</strong> (Đạt tỷ lệ chuyên cần: <strong>${attendanceRate}%</strong>).</li>
        <li>Tổng số học sinh vắng trong kỳ báo cáo: <strong>${totalAbsentMorning} em</strong>.</li>
        <li>Tiến độ điểm danh của giáo viên trực phòng: <strong>${morningSubmittedCount}/${rooms.length} phòng đã nộp</strong> (${morningLateCount} phòng nộp trễ so với quy định ${settings.cutoffMorning}).</li>
      </ul>

      <p><strong>II. BẢNG TỔNG HỢP THEO DÕI TỪNG PHÒNG VÀ THỨ TỰ NỘP ĐIỂM DANH:</strong></p>
      <table>
        <thead>
          <tr>
            <th style="width: 5%;">STT</th>
            <th style="width: 15%;">Tên phòng</th>
            <th style="width: 18%;">Giáo viên trực</th>
            <th style="width: 8%;">Sĩ số</th>
            <th style="width: 8%;">Vắng</th>
            <th style="width: 12%;">Giờ nộp</th>
            <th style="width: 12%;">Trạng thái</th>
            <th style="width: 22%;">Ghi chú</th>
          </tr>
        </thead>
        <tbody>
          ${rowsHtml}
        </tbody>
      </table>

      <p><strong>III. ĐÁNH GIÁ THI ĐUA NỀ NẾP VÀ VĂN HÓA NỘI TRÚ:</strong></p>
      <p>- Vệ sinh phòng ở và khu vực xung quanh cơ bản đảm bảo, học sinh tự giác gấp chăn màn và dọn dẹp vệ sinh trước giờ học.</p>
      <p>- Phòng trực tuần thực hiện nghiêm túc nhiệm vụ hỗ trợ nhà bếp và vệ sinh khu công cộng theo lịch phân công.</p>
      <p>- Tinh thần thể dục thể thao và tiếng hát nội trú được duy trì tích cực, tạo không khí vui tươi, gắn bó cho học sinh các thôn nóc xa xôi.</p>

      <table class="header-table" style="margin-top: 40px; page-break-inside: avoid;">
        <tr>
          <td style="width: 50%; text-align: center; vertical-align: top;">
            <strong>HIỆU TRƯỞNG</strong><br/>
            <em>(Ký, đóng dấu và ghi rõ họ tên)</em><br/><br/><br/><br/><br/>
            <strong>Trần Văn Hải</strong>
          </td>
          <td style="width: 50%; text-align: center; vertical-align: top;">
            <strong>TRƯỞNG BAN QUẢN LÝ NỘI TRÚ</strong><br/>
            <em>(Ký và ghi rõ họ tên)</em><br/><br/><br/><br/><br/>
            <strong>${settings.managerName}</strong>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  const blob = new Blob(['\ufeff', wordContent], { type: 'application/msword' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `Bao_Cao_Noi_Tru_Tra_Doc_${options.periodType}_${options.dateStr}.doc`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
