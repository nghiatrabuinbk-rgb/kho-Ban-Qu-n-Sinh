import React, { useState } from 'react';
import { 
  FileSpreadsheet, FileText, Printer, Calendar, Download, 
  CheckCircle2, AlertTriangle, Building, Users, Award, ShieldCheck
} from 'lucide-react';
import { Room, Student, AttendanceRecord, EvaluationRecord, SystemSettings } from '../types';
import { exportAttendanceToExcel, exportReportToWord, ReportFilterOptions } from '../utils/exportUtils';

interface ReportViewProps {
  rooms: Room[];
  students: Student[];
  attendanceList: AttendanceRecord[];
  evaluations: EvaluationRecord[];
  settings: SystemSettings;
}

export const ReportView: React.FC<ReportViewProps> = ({
  rooms,
  students,
  attendanceList,
  evaluations,
  settings,
}) => {
  const [periodType, setPeriodType] = useState<'day' | 'week' | 'month' | 'year'>('day');
  const [selectedDate, setSelectedDate] = useState('2026-10-10');
  const [selectedWeek, setSelectedWeek] = useState(6);
  const [selectedMonth, setSelectedMonth] = useState(10);
  const [selectedYear, setSelectedYear] = useState(2026);

  const filterOptions: ReportFilterOptions = {
    periodType,
    dateStr: selectedDate,
    weekNumber: selectedWeek,
    monthNumber: selectedMonth,
    yearNumber: selectedYear,
  };

  // Filter attendance records based on selected period
  const filteredAttendance = attendanceList.filter((a) => {
    if (periodType === 'day') return a.date === selectedDate;
    if (periodType === 'month') return a.date.startsWith(`${selectedYear}-${String(selectedMonth).padStart(2, '0')}`);
    return true; // For week or year, include all relevant records
  });

  // Calculate totals
  const totalStudents = students.length;
  let totalAbsent = 0;
  const morningRecords = filteredAttendance.filter((a) => a.session === 'morning');
  morningRecords.forEach((a) => (totalAbsent += a.absentStudentIds.length));
  
  const presentStudents = totalStudents - totalAbsent;
  const attendanceRate = totalStudents > 0 ? ((presentStudents / totalStudents) * 100).toFixed(1) : '100';

  const onTimeRooms = morningRecords.filter((a) => !a.isLate).length;
  const lateRooms = morningRecords.filter((a) => a.isLate).length;

  const handleExportExcel = () => {
    exportAttendanceToExcel(rooms, students, filteredAttendance, evaluations, settings, filterOptions);
  };

  const handleExportWord = () => {
    exportReportToWord(rooms, students, filteredAttendance, evaluations, settings, filterOptions);
  };

  const handlePrintPDF = () => {
    window.print();
  };

  let periodTitle = `NGÀY ${selectedDate}`;
  if (periodType === 'week') periodTitle = `TUẦN ${selectedWeek} (NĂM HỌC ${settings.academicYear})`;
  else if (periodType === 'month') periodTitle = `THÁNG ${selectedMonth}/${selectedYear}`;
  else if (periodType === 'year') periodTitle = `CẢ NĂM HỌC ${settings.academicYear}`;

  return (
    <div className="space-y-6">
      
      {/* Top Banner & Export Actions Toolbar (Hidden on Print) */}
      <div className="no-print bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          
          {/* Period Filter Selector */}
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Xuất Báo Cáo Tổng Quát Công Tác Nội Trú
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Tùy chọn lọc theo Ngày, Tuần, Tháng hoặc Cả năm phục vụ Báo cáo cấp trên & In ấn lưu hồ sơ
            </p>

            <div className="flex flex-wrap items-center gap-2 mt-3">
              <div className="bg-slate-100 p-1 rounded-xl flex items-center gap-1 border border-slate-200">
                <button
                  onClick={() => setPeriodType('day')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    periodType === 'day'
                      ? 'bg-teal-900 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Theo Ngày
                </button>
                <button
                  onClick={() => setPeriodType('week')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    periodType === 'week'
                      ? 'bg-teal-900 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Theo Tuần
                </button>
                <button
                  onClick={() => setPeriodType('month')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    periodType === 'month'
                      ? 'bg-teal-900 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Theo Tháng
                </button>
                <button
                  onClick={() => setPeriodType('year')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    periodType === 'year'
                      ? 'bg-teal-900 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Cả Năm Học
                </button>
              </div>

              {/* Dynamic Sub-selector */}
              {periodType === 'day' && (
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold font-mono-numbers text-slate-800"
                />
              )}

              {periodType === 'week' && (
                <select
                  value={selectedWeek}
                  onChange={(e) => setSelectedWeek(Number(e.target.value))}
                  className="px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold font-mono-numbers text-slate-800"
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15].map((w) => (
                    <option key={w} value={w}>
                      Tuần {w}
                    </option>
                  ))}
                </select>
              )}

              {periodType === 'month' && (
                <div className="flex items-center gap-1">
                  <select
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(Number(e.target.value))}
                    className="px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-800"
                  >
                    {[9, 10, 11, 12, 1, 2, 3, 4, 5].map((m) => (
                      <option key={m} value={m}>
                        Tháng {m}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </div>

          {/* 3 Main Export Buttons (Excel, Word, Print/PDF) */}
          <div className="flex flex-wrap items-center gap-2 self-start lg:self-auto">
            {/* Excel button */}
            <button
              onClick={handleExportExcel}
              className="flex items-center gap-2 bg-emerald-700 hover:bg-emerald-600 text-white font-bold px-4 py-2.5 rounded-xl text-xs transition-colors shadow-sm"
              title="Xuất bảng tính Excel nhiều sheet"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-200" />
              <span>Xuất File Excel (.xlsx)</span>
            </button>

            {/* Word button */}
            <button
              onClick={handleExportWord}
              className="flex items-center gap-2 bg-blue-800 hover:bg-blue-700 text-white font-bold px-4 py-2.5 rounded-xl text-xs transition-colors shadow-sm"
              title="Xuất file Word chuẩn công văn văn thư"
            >
              <FileText className="w-4 h-4 text-blue-200" />
              <span>Xuất File Word (.doc)</span>
            </button>

            {/* PDF Print button */}
            <button
              onClick={handlePrintPDF}
              className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white font-bold px-4 py-2.5 rounded-xl text-xs transition-colors shadow-sm"
              title="In trực tiếp hoặc Lưu dưới dạng PDF chuẩn khổ A4"
            >
              <Printer className="w-4 h-4 text-amber-400" />
              <span>In & Xuất PDF A4</span>
            </button>
          </div>

        </div>
      </div>

      {/* Official Academic Document Layout (Printable) */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 sm:p-10 max-w-5xl mx-auto text-slate-900">
        
        {/* National Header & Unit Details */}
        <div className="grid grid-cols-2 gap-4 pb-6 border-b border-slate-800/20 text-center">
          <div>
            <div className="text-xs uppercase font-semibold text-slate-700">
              UBND XÃ TRÀ ĐỐC · TP ĐÀ NẴNG
            </div>
            <div className="text-xs font-bold text-slate-900 mt-0.5">
              TRƯỜNG PTDTBT THCS XÃ TRÀ ĐỐC
            </div>
            <div className="text-xs font-extrabold text-teal-900 mt-0.5">
              BAN QUẢN LÝ NỘI TRÚ HỌC SINH
            </div>
            <div className="w-24 h-0.5 bg-slate-400 mx-auto mt-1"></div>
          </div>

          <div>
            <div className="text-xs font-bold uppercase text-slate-900 tracking-wider">
              CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM
            </div>
            <div className="text-xs font-semibold text-slate-800 mt-0.5">
              Độc lập - Tự do - Hạnh phúc
            </div>
            <div className="w-28 h-0.5 bg-slate-400 mx-auto mt-1"></div>
            <div className="text-[11px] italic text-slate-500 mt-1">
              Trà Đốc, ngày {new Date().getDate()} tháng {new Date().getMonth() + 1} năm {new Date().getFullYear()}
            </div>
          </div>
        </div>

        {/* Report Title */}
        <div className="text-center py-6">
          <h1 className="text-lg sm:text-xl font-black uppercase text-slate-900 tracking-tight">
            BÁO CÁO CÔNG TÁC QUẢN LÝ HỌC SINH NỘI TRÚ BÁN TRÚ
          </h1>
          <div className="text-sm font-bold text-teal-900 mt-1">
            {periodTitle}
          </div>
          <p className="text-xs italic text-slate-500 mt-0.5">
            (Số liệu tổng hợp 25 phòng ở: 12 phòng nam, 13 phòng nữ phục vụ công tác chỉ đạo & lưu trữ hồ sơ)
          </p>
        </div>

        {/* Section 1: Overview Summary */}
        <div className="space-y-2 mb-6 text-xs text-slate-800">
          <h3 className="font-bold text-sm uppercase text-slate-900">
            I. TÌNH HÌNH TỔNG QUÁT KHU NỘI TRÚ:
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
            <div>
              <span className="text-slate-500 block">Tổng sĩ số:</span>
              <strong className="text-slate-900 font-mono-numbers text-sm">{totalStudents} em</strong>
            </div>
            <div>
              <span className="text-slate-500 block">Có mặt thực tế:</span>
              <strong className="text-emerald-700 font-mono-numbers text-sm">{presentStudents} em</strong>
            </div>
            <div>
              <span className="text-slate-500 block">Số học sinh vắng:</span>
              <strong className="text-rose-700 font-mono-numbers text-sm">{totalAbsent} em</strong>
            </div>
            <div>
              <span className="text-slate-500 block">Tỷ lệ chuyên cần:</span>
              <strong className="text-teal-900 font-mono-numbers text-sm">{attendanceRate}%</strong>
            </div>
          </div>
        </div>

        {/* Section 2: Table of 25 Rooms & Submission Timestamps */}
        <div className="space-y-2 mb-6">
          <h3 className="font-bold text-xs uppercase text-slate-900">
            II. THEO DÕI ĐIỂM DANH & THỨ TỰ NỘP BÁO CÁO TỪNG PHÒNG:
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border border-slate-300">
              <thead>
                <tr className="bg-slate-100 text-slate-800 font-bold border-b border-slate-300">
                  <th className="p-2 text-center border-r border-slate-300 w-10">STT</th>
                  <th className="p-2 border-r border-slate-300">Tên phòng</th>
                  <th className="p-2 border-r border-slate-300">Giáo viên trực</th>
                  <th className="p-2 text-center border-r border-slate-300 w-16">Sĩ số</th>
                  <th className="p-2 text-center border-r border-slate-300 w-16">Vắng</th>
                  <th className="p-2 text-center border-r border-slate-300 w-24">Giờ nộp</th>
                  <th className="p-2 text-center border-r border-slate-300 w-24">Trạng thái</th>
                  <th className="p-2">Ghi chú</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {rooms.map((room, idx) => {
                  const roomStudents = students.filter(s => s.roomId === room.id);
                  const att = filteredAttendance.find(a => a.roomId === room.id && a.session === 'morning');
                  const absentCount = att?.absentStudentIds.length || 0;
                  const timeStr = att ? new Date(att.submittedAt).toLocaleTimeString('vi-VN') : 'Chưa nộp';
                  const isLate = att?.isLate;

                  return (
                    <tr key={room.id} className={idx % 2 === 1 ? 'bg-slate-50/50' : ''}>
                      <td className="p-2 text-center font-mono-numbers border-r border-slate-300">{idx + 1}</td>
                      <td className="p-2 font-bold text-slate-900 border-r border-slate-300">{room.name}</td>
                      <td className="p-2 text-slate-700 border-r border-slate-300 truncate max-w-[130px]">
                        {room.assignedTeacherName}
                      </td>
                      <td className="p-2 text-center font-mono-numbers border-r border-slate-300">{roomStudents.length}</td>
                      <td className="p-2 text-center font-mono-numbers border-r border-slate-300">
                        {absentCount > 0 ? (
                          <span className="text-rose-700 font-bold">{absentCount}</span>
                        ) : (
                          <span className="text-slate-400">0</span>
                        )}
                      </td>
                      <td className="p-2 text-center font-mono-numbers border-r border-slate-300">{timeStr}</td>
                      <td className="p-2 text-center border-r border-slate-300">
                        {att ? (
                          isLate ? (
                            <span className="text-amber-700 font-bold">Nộp trễ</span>
                          ) : (
                            <span className="text-emerald-700 font-bold">Đúng giờ</span>
                          )
                        ) : (
                          <span className="text-slate-400">Chưa nộp</span>
                        )}
                      </td>
                      <td className="p-2 text-slate-600 truncate max-w-[150px]">{att?.notes || '-'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Section 3: Assessment & Signatures */}
        <div className="space-y-2 mb-8 text-xs text-slate-800">
          <h3 className="font-bold text-sm uppercase text-slate-900">
            III. ĐÁNH GIÁ THI ĐUA NỀ NẾP & ĐỀ XUẤT:
          </h3>
          <p>- Khu nội trú duy trì tốt nề nếp kỷ luật, vệ sinh phòng ở và khu vực chung được thực hiện nghiêm túc trước giờ học.</p>
          <p>- Công tác trực tuần bếp ăn và nhà vệ sinh hoàn thành đúng nhiệm vụ, bảo đảm an toàn thực phẩm và vệ sinh môi trường.</p>
          <p>- Đề nghị Ban Giám hiệu tiếp tục biểu dương các phòng có thứ hạng nộp điểm danh sớm và đạt giải phong trào.</p>
        </div>

        {/* Formal Signatures Block */}
        <div className="grid grid-cols-2 gap-8 text-center pt-8 border-t border-slate-300 text-xs print-break-inside-avoid">
          <div>
            <div className="font-bold uppercase text-slate-900">HIỆU TRƯỞNG</div>
            <div className="italic text-slate-500">(Ký, đóng dấu và ghi rõ họ tên)</div>
            <div className="h-24 flex items-center justify-center text-slate-300 italic text-[11px]">
              (Chữ ký Hiệu trưởng)
            </div>
            <div className="font-bold text-slate-900 text-sm">Trần Văn Hải</div>
          </div>

          <div>
            <div className="font-bold uppercase text-slate-900">TRƯỞNG BAN QUẢN LÝ NỘI TRÚ</div>
            <div className="italic text-slate-500">(Ký và ghi rõ họ tên)</div>
            <div className="h-24 flex items-center justify-center text-slate-300 italic text-[11px]">
              (Chữ ký Trưởng ban)
            </div>
            <div className="font-bold text-slate-900 text-sm">{settings.managerName}</div>
          </div>
        </div>

      </div>

    </div>
  );
};
