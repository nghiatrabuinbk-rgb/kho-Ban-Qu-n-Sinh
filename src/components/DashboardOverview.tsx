import React, { useState } from 'react';
import { 
  Users, UserCheck, UserX, Clock, CheckCircle2, AlertTriangle, 
  Search, ArrowUpDown, ChevronRight, Phone, Home, Sparkles 
} from 'lucide-react';
import { Room, Student, AttendanceRecord, SystemSettings } from '../types';

interface DashboardOverviewProps {
  rooms: Room[];
  students: Student[];
  attendanceList: AttendanceRecord[];
  settings: SystemSettings;
  onSelectRoom: (roomId: string) => void;
  selectedDate: string;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  rooms,
  students,
  attendanceList,
  settings,
  onSelectRoom,
  selectedDate,
}) => {
  const [sessionFilter, setSessionFilter] = useState<'morning' | 'evening'>('morning');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedModalRoom, setSelectedModalRoom] = useState<Room | null>(null);

  // Filter attendance for current date & session
  const currentAttendance = attendanceList.filter(
    (a) => a.date === selectedDate && a.session === sessionFilter
  );

  // Calculate metrics
  const totalStudents = students.length;
  
  // Aggregate all absents for this session
  const absentStudentIds = new Set<string>();
  const absentDetailsList: { student: Student; room: Room; reason: string; note?: string }[] = [];

  currentAttendance.forEach((att) => {
    const room = rooms.find(r => r.id === att.roomId);
    att.absentDetails?.forEach((d) => {
      absentStudentIds.add(d.studentId);
      const student = students.find(s => s.id === d.studentId);
      if (student && room) {
        absentDetailsList.push({
          student,
          room,
          reason: d.reason,
          note: d.note,
        });
      }
    });
  });

  const absentCount = absentStudentIds.size;
  const presentCount = totalStudents - absentCount;
  const attendanceRate = totalStudents > 0 ? ((presentCount / totalStudents) * 100).toFixed(1) : '100';

  const submittedRoomsCount = currentAttendance.length;
  const pendingRoomsCount = Math.max(0, rooms.length - submittedRoomsCount);
  const lateRoomsCount = currentAttendance.filter((a) => a.isLate).length;

  // Build sorted submission list (Order of submission with exact timestamps)
  const submissionRankList = [...currentAttendance].sort((a, b) => 
    new Date(a.submittedAt).getTime() - new Date(b.submittedAt).getTime()
  );

  const cutoffTime = sessionFilter === 'morning' ? settings.cutoffMorning : settings.cutoffEvening;

  return (
    <div className="space-y-6">
      
      {/* Top Banner & Date / Session Selector */}
      <div className="bg-gradient-to-r from-slate-900 via-teal-950 to-slate-900 rounded-2xl p-6 text-white border border-teal-900/60 shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-amber-400 text-xs font-semibold tracking-wide uppercase">
              <Sparkles className="w-4 h-4" />
              <span>Bảng Tổng Hợp Công Tác Quản Lý Bán Trú Nội Trú</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white mt-1">
              Trường PTDTBT THCS Xã Trà Đốc · TP Đà Nẵng
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm mt-1 max-w-3xl">
              Quy mô 25 phòng ở (12 phòng nam, 13 phòng nữ), kiểm soát nề nếp học sinh vùng sâu thôn nóc, điểm danh 2 buổi sáng & tối, bảo đảm an toàn 100% học sinh nội trú.
            </p>
          </div>

          {/* Session Switcher (Morning / Evening) */}
          <div className="flex items-center gap-2 bg-slate-800/90 p-1.5 rounded-xl border border-slate-700/80 shrink-0 self-start md:self-auto">
            <button
              onClick={() => setSessionFilter('morning')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                sessionFilter === 'morning'
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              Buổi Sáng (Chốt {settings.cutoffMorning})
            </button>
            <button
              onClick={() => setSessionFilter('evening')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                sessionFilter === 'evening'
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              Buổi Tối (Chốt {settings.cutoffEvening})
            </button>
          </div>
        </div>
      </div>

      {/* 4 Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        
        {/* Card 1: Total Boarding Students */}
        <div className="bg-white rounded-xl p-4 sm:p-5 border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">Tổng Sĩ Số Nội Trú</span>
            <Users className="w-4 h-4 text-teal-700" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-mono-numbers">
              {totalStudents}
            </span>
            <span className="text-xs text-slate-500">em / 25 phòng</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-2 flex items-center justify-between pt-2 border-t border-slate-100">
            <span>Nam: 12 phòng (176 em)</span>
            <span>Nữ: 13 phòng (189 em)</span>
          </div>
        </div>

        {/* Card 2: Present Count */}
        <div className="bg-white rounded-xl p-4 sm:p-5 border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">Hiện Diện Thực Tế</span>
            <UserCheck className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-emerald-700 font-mono-numbers">
              {presentCount}
            </span>
            <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
              {attendanceRate}%
            </span>
          </div>
          <div className="text-[11px] text-slate-500 mt-2 pt-2 border-t border-slate-100">
            Tỷ lệ chuyên cần duy trì xuất sắc
          </div>
        </div>

        {/* Card 3: Absent Count */}
        <div className="bg-white rounded-xl p-4 sm:p-5 border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">Học Sinh Vắng {sessionFilter === 'morning' ? 'Sáng' : 'Tối'}</span>
            <UserX className="w-4 h-4 text-rose-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className={`text-2xl sm:text-3xl font-extrabold font-mono-numbers ${absentCount > 0 ? 'text-rose-600' : 'text-slate-800'}`}>
              {absentCount}
            </span>
            <span className="text-xs text-slate-500">em</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-2 pt-2 border-t border-slate-100 truncate">
            {absentCount === 0 ? 'Tất cả phòng đủ sĩ số' : 'Có lý do sức khỏe & gia đình'}
          </div>
        </div>

        {/* Card 4: Progress of Room Submissions */}
        <div className="bg-white rounded-xl p-4 sm:p-5 border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">Tiến Độ Điểm Danh</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-mono-numbers">
              {submittedRoomsCount}/{rooms.length}
            </span>
            <span className="text-xs text-slate-500">phòng</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-2 flex items-center justify-between pt-2 border-t border-slate-100">
            <span className="text-emerald-700 font-semibold">{submittedRoomsCount - lateRoomsCount} đúng giờ</span>
            {lateRoomsCount > 0 && <span className="text-amber-700 font-semibold">{lateRoomsCount} trễ hạn</span>}
            {pendingRoomsCount > 0 && <span className="text-rose-600 font-semibold">{pendingRoomsCount} chưa nộp</span>}
          </div>
        </div>

      </div>

      {/* Main Grid: Submission Ranking Order vs Room Matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* Left Column (7 cols): Order of Submissions (Thứ tự nhập trước sau có ngày giờ thi đua) */}
        <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200/90 shadow-2xs overflow-hidden flex flex-col">
          <div className="p-4 sm:p-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-900">
                  Thứ Tự Nộp Điểm Danh {sessionFilter === 'morning' ? 'Buổi Sáng' : 'Buổi Tối'}
                </h2>
                <span className="text-xs font-mono-numbers text-slate-500">
                  (Khóa sổ: {cutoffTime})
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Ghi nhận chính xác ngày giờ nộp của từng phòng để chấm điểm thi đua chuyên cần
              </p>
            </div>
            <div className="text-xs font-medium text-slate-500 self-end sm:self-auto">
              Đã nộp: <strong className="text-slate-900 font-mono-numbers">{submittedRoomsCount}</strong> / {rooms.length} phòng
            </div>
          </div>

          <div className="p-4 flex-1 overflow-x-auto">
            {submissionRankList.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-xs">
                Chưa có phòng nào nộp điểm danh {sessionFilter === 'morning' ? 'buổi sáng' : 'buổi tối'} hôm nay.
              </div>
            ) : (
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 font-semibold">
                    <th className="pb-2 text-center w-12">Thứ tự</th>
                    <th className="pb-2">Phòng ở</th>
                    <th className="pb-2">Giáo viên trực</th>
                    <th className="pb-2 text-center">Giờ nộp</th>
                    <th className="pb-2 text-center">Trạng thái</th>
                    <th className="pb-2 text-center">Vắng</th>
                    <th className="pb-2 text-right">Chi tiết</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {submissionRankList.map((record, index) => {
                    const room = rooms.find(r => r.id === record.roomId);
                    const subDate = new Date(record.submittedAt);
                    const timeOnly = subDate.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
                    const isLate = record.isLate;

                    return (
                      <tr key={record.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-2.5 text-center">
                          <span className={`inline-flex items-center justify-center w-5 h-5 rounded-full font-bold font-mono-numbers text-[11px] ${
                            index === 0
                              ? 'bg-amber-100 text-amber-800 border border-amber-300'
                              : index === 1
                              ? 'bg-slate-200 text-slate-700'
                              : index === 2
                              ? 'bg-amber-50 text-amber-900'
                              : 'text-slate-600'
                          }`}>
                            {index + 1}
                          </span>
                        </td>
                        <td className="py-2.5">
                          <span className="font-bold text-slate-900">{room?.name || record.roomId}</span>
                          <span className="text-[11px] text-slate-400 block">{room?.buildingZone}</span>
                        </td>
                        <td className="py-2.5 text-slate-600 truncate max-w-[120px]">
                          {record.submittedBy || room?.assignedTeacherName}
                        </td>
                        <td className="py-2.5 text-center font-mono-numbers text-slate-700 font-semibold">
                          {timeOnly}
                        </td>
                        <td className="py-2.5 text-center">
                          {isLate ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                              <AlertTriangle className="w-3 h-3" />
                              Nộp trễ
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                              <CheckCircle2 className="w-3 h-3" />
                              Đúng giờ
                            </span>
                          )}
                        </td>
                        <td className="py-2.5 text-center">
                          {record.absentStudentIds.length > 0 ? (
                            <span className="font-bold text-rose-600 font-mono-numbers bg-rose-50 px-2 py-0.5 rounded">
                              {record.absentStudentIds.length} em
                            </span>
                          ) : (
                            <span className="text-slate-400">Đủ</span>
                          )}
                        </td>
                        <td className="py-2.5 text-right">
                          <button
                            onClick={() => onSelectRoom(record.roomId)}
                            className="p-1 hover:bg-slate-200 rounded text-slate-600 hover:text-teal-800 transition-colors"
                            title="Xem phòng"
                          >
                            <ChevronRight className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>

          {/* Pending Rooms Notice */}
          {pendingRoomsCount > 0 && (
            <div className="p-3 bg-amber-50/60 border-t border-amber-200/60 text-xs text-amber-900 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>
                  Còn <strong>{pendingRoomsCount} phòng</strong> chưa gửi báo cáo điểm danh {sessionFilter === 'morning' ? 'sáng' : 'tối'}.
                </span>
              </div>
              <span className="text-[11px] text-amber-800 italic">Vui lòng nhắc nhở giáo viên trực</span>
            </div>
          )}
        </div>

        {/* Right Column (5 cols): 25 Rooms Matrix View */}
        <div className="lg:col-span-5 bg-white rounded-xl border border-slate-200/90 shadow-2xs overflow-hidden flex flex-col">
          <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900">Sơ Đồ 25 Phòng Ở</h2>
              <p className="text-xs text-slate-500 mt-0.5">Nhấp vào từng phòng để xem học sinh và điểm danh</p>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <span className="flex items-center gap-1 text-slate-500">
                <span className="w-2.5 h-2.5 rounded-sm bg-blue-600 inline-block"></span> 12 Nam
              </span>
              <span className="flex items-center gap-1 text-slate-500">
                <span className="w-2.5 h-2.5 rounded-sm bg-rose-500 inline-block"></span> 13 Nữ
              </span>
            </div>
          </div>

          <div className="p-4 flex-1">
            <div className="grid grid-cols-5 gap-2">
              {rooms.map((room) => {
                const att = currentAttendance.find(a => a.roomId === room.id);
                const isSubmitted = !!att;
                const isLate = att?.isLate;
                const hasAbsent = att && att.absentStudentIds.length > 0;
                const isMale = room.gender === 'nam';

                return (
                  <button
                    key={room.id}
                    onClick={() => onSelectRoom(room.id)}
                    className={`p-2 rounded-lg border text-center transition-all relative group flex flex-col justify-between h-20 ${
                      !isSubmitted
                        ? 'bg-slate-50 border-slate-200 hover:border-slate-400'
                        : isLate
                        ? 'bg-amber-50/80 border-amber-300 hover:border-amber-500'
                        : 'bg-emerald-50/80 border-emerald-300 hover:border-emerald-500'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className={`text-[10px] font-bold px-1 rounded ${
                        isMale ? 'bg-blue-100 text-blue-800' : 'bg-rose-100 text-rose-800'
                      }`}>
                        {room.id}
                      </span>
                      {isSubmitted ? (
                        <span className={`w-2 h-2 rounded-full ${isLate ? 'bg-amber-500' : 'bg-emerald-500'}`} />
                      ) : (
                        <span className="w-2 h-2 rounded-full bg-slate-300" />
                      )}
                    </div>

                    <div className="my-auto">
                      <div className="text-[11px] font-bold text-slate-800 truncate">
                        {room.name.split(' ')[0]} {room.name.split(' ')[1]}
                      </div>
                      <div className="text-[10px] text-slate-500 font-mono-numbers">
                        {students.filter(s => s.roomId === room.id).length} em
                      </div>
                    </div>

                    <div className="text-[9px] w-full truncate">
                      {hasAbsent ? (
                        <span className="text-rose-600 font-bold">Vắng {att.absentStudentIds.length}</span>
                      ) : isSubmitted ? (
                        <span className="text-emerald-700 font-medium">Đã nộp</span>
                      ) : (
                        <span className="text-slate-400">Chưa nộp</span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-around text-[11px] text-slate-500">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Đã nộp đúng giờ
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-500"></span> Nộp trễ hạn
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-slate-300"></span> Chưa nộp
              </span>
            </div>
          </div>
        </div>

      </div>

      {/* Absent Students Spotlight Table */}
      {absentDetailsList.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <UserX className="w-4 h-4 text-rose-600" />
                <span>Danh Sách Học Sinh Vắng {sessionFilter === 'morning' ? 'Buổi Sáng' : 'Buổi Tối'} ({absentDetailsList.length} em)</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Thông tin thôn nóc và số điện thoại phụ huynh để Ban Quản lý phối hợp nắm bắt tình hình
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 font-semibold">
                  <th className="pb-2">Họ và tên</th>
                  <th className="pb-2">Phòng ở</th>
                  <th className="pb-2">Lớp</th>
                  <th className="pb-2">Thôn / Nóc</th>
                  <th className="pb-2">Con ông / bà</th>
                  <th className="pb-2">SĐT Liên hệ</th>
                  <th className="pb-2">Lý do vắng</th>
                  <th className="pb-2">Ghi chú</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {absentDetailsList.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-50">
                    <td className="py-2.5 font-bold text-slate-900">{item.student.fullName}</td>
                    <td className="py-2.5">{item.room.name}</td>
                    <td className="py-2.5 font-mono-numbers">{item.student.grade}</td>
                    <td className="py-2.5">
                      <span className="text-slate-800">{item.student.village}</span>
                      <span className="text-slate-400 block text-[11px]">{item.student.nocHamlet}</span>
                    </td>
                    <td className="py-2.5 text-slate-600">{item.student.parentsName}</td>
                    <td className="py-2.5 font-mono-numbers text-teal-800">
                      <span className="inline-flex items-center gap-1">
                        <Phone className="w-3 h-3 text-slate-400" />
                        {item.student.phone}
                      </span>
                    </td>
                    <td className="py-2.5">
                      <span className="inline-block px-2 py-0.5 rounded text-[11px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                        {item.reason === 'om_dau' ? 'Ốm đau' : item.reason === 've_que' ? 'Về que / nóc' : item.reason === 'co_phep' ? 'Có phép' : 'Không phép'}
                      </span>
                    </td>
                    <td className="py-2.5 text-slate-500 italic">{item.note || 'Không có'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
};
