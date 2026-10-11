import React, { useState, useEffect } from 'react';
import { 
  Check, X, AlertCircle, Plus, Edit2, Trash2, Phone, Home, 
  Clock, Send, Calendar, UserCheck, ShieldAlert, Sparkles, AlertTriangle,
  FileSpreadsheet, Filter, Users, BellRing, Volume2
} from 'lucide-react';
import { Room, Student, AttendanceRecord, SystemSettings, AbsentDetail, WeekendRegistration, StudentStatus } from '../types';
import { BulkStudentModal } from './BulkStudentModal';
import { useAttendanceAlert } from '../hooks/useAttendanceAlert';
import { UrgentAlertBanner } from './UrgentAlertBanner';

interface RoomAttendanceProps {
  rooms: Room[];
  students: Student[];
  attendanceList: AttendanceRecord[];
  selectedRoomId: string;
  onSelectRoomId: (roomId: string) => void;
  onSaveAttendance: (record: AttendanceRecord) => void;
  onAddStudent: (student: Student) => void;
  onAddBulkStudents: (newStudents: Student[]) => void;
  onUpdateStudent: (student: Student) => void;
  onDeleteStudent: (studentId: string) => void;
  currentUser: { email: string; name: string; role: string; assignedRoomId?: string };
  settings: SystemSettings;
  selectedDate: string;
}

export const RoomAttendance: React.FC<RoomAttendanceProps> = ({
  rooms,
  students,
  attendanceList,
  selectedRoomId,
  onSelectRoomId,
  onSaveAttendance,
  onAddStudent,
  onAddBulkStudents,
  onUpdateStudent,
  onDeleteStudent,
  currentUser,
  settings,
  selectedDate,
}) => {
  const [session, setSession] = useState<'morning' | 'evening'>('morning');
  const [showWeekendSection, setShowWeekendSection] = useState(false);
  const [showStudentModal, setShowStudentModal] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [submissionSuccessMsg, setSubmissionSuccessMsg] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Student form state
  const [fullName, setFullName] = useState('');
  const [gender, setGender] = useState<'nam' | 'nu'>('nam');
  const [grade, setGrade] = useState('6A');
  const [village, setVillage] = useState('Thôn 1');
  const [nocHamlet, setNocHamlet] = useState('Nóc Ông Tuấn');
  const [parentsName, setParentsName] = useState('');
  const [phone, setPhone] = useState('');
  const [studentStatus, setStudentStatus] = useState<StudentStatus>('dang_o');
  const [notes, setNotes] = useState('');

  const currentRoom = rooms.find((r) => r.id === selectedRoomId) || rooms[0];
  const allRoomStudents = students.filter((s) => s.roomId === currentRoom.id);
  
  // Apply status filter if selected
  const roomStudents = statusFilter === 'all' 
    ? allRoomStudents 
    : allRoomStudents.filter(s => (s.status || 'dang_o') === statusFilter);

  // Existing attendance record
  const existingRecord = attendanceList.find(
    (a) => a.roomId === currentRoom.id && a.date === selectedDate && a.session === session
  );

  const isRoomSubmitted = !!existingRecord;
  const cutoffTime = session === 'morning' ? settings.cutoffMorning : settings.cutoffEvening;

  const {
    isOverdue,
    minutesOverdue,
    timeRemainingStr,
    isApproaching,
    hasNotificationPermission,
    requestNotificationPermission,
    playAlertSound,
    triggerTestAlert,
  } = useAttendanceAlert(
    currentRoom.id,
    session,
    selectedDate,
    attendanceList,
    settings,
    isRoomSubmitted
  );

  // Local attendance state
  const [absentMap, setAbsentMap] = useState<Record<string, { isAbsent: boolean; reason: string; note: string }>>({});
  const [weekendMap, setWeekendMap] = useState<Record<string, { status: 'stay' | 'home'; pickupPerson: string; returnDate: string }>>({});
  const [generalNote, setGeneralNote] = useState('');

  // Sync state when room, session or record changes
  useEffect(() => {
    const newAbsentMap: Record<string, { isAbsent: boolean; reason: string; note: string }> = {};
    const newWeekendMap: Record<string, { status: 'stay' | 'home'; pickupPerson: string; returnDate: string }> = {};

    allRoomStudents.forEach((student) => {
      newAbsentMap[student.id] = { isAbsent: false, reason: 'co_phep', note: '' };
      newWeekendMap[student.id] = { status: 'stay', pickupPerson: 'Ở lại ký túc xá', returnDate: 'Chủ Nhật' };
    });

    if (existingRecord) {
      existingRecord.absentStudentIds.forEach((id) => {
        const detail = existingRecord.absentDetails?.find((d) => d.studentId === id);
        newAbsentMap[id] = {
          isAbsent: true,
          reason: detail?.reason || 'co_phep',
          note: detail?.note || '',
        };
      });

      existingRecord.weekendRegistrations?.forEach((w) => {
        newWeekendMap[w.studentId] = {
          status: w.status,
          pickupPerson: w.pickupPerson || '',
          returnDate: w.expectedReturn || '',
        };
      });

      setGeneralNote(existingRecord.notes || '');
    } else {
      setGeneralNote('');
    }

    setAbsentMap(newAbsentMap);
    setWeekendMap(newWeekendMap);
    setSubmissionSuccessMsg(null);
  }, [currentRoom.id, session, selectedDate, existingRecord, allRoomStudents.length]);

  // Handle absent toggle
  const toggleAbsent = (studentId: string, absent: boolean, reason: string = 'co_phep') => {
    setAbsentMap((prev) => ({
      ...prev,
      [studentId]: {
        isAbsent: absent,
        reason,
        note: prev[studentId]?.note || '',
      },
    }));
  };

  const updateAbsentNote = (studentId: string, note: string) => {
    setAbsentMap((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        note,
      },
    }));
  };

  const updateWeekendStatus = (studentId: string, status: 'stay' | 'home', pickupPerson: string) => {
    setWeekendMap((prev) => ({
      ...prev,
      [studentId]: {
        status,
        pickupPerson,
        returnDate: status === 'home' ? 'Chiều Chủ Nhật' : 'Ở lại trường',
      },
    }));
  };

  // Submit roll-call
  const handleSubmitAttendance = () => {
    const now = new Date();
    const cutoffTime = session === 'morning' ? settings.cutoffMorning : settings.cutoffEvening;
    
    // Check if late
    const currentHours = now.getHours().toString().padStart(2, '0');
    const currentMinutes = now.getMinutes().toString().padStart(2, '0');
    const currentTimeStr = `${currentHours}:${currentMinutes}`;
    const isLate = currentTimeStr > cutoffTime;

    const absentStudentIds: string[] = [];
    const absentDetails: AbsentDetail[] = [];

    Object.entries(absentMap).forEach(([studentId, data]) => {
      if (data.isAbsent) {
        absentStudentIds.push(studentId);
        absentDetails.push({
          studentId,
          reason: data.reason as any,
          note: data.note,
        });
      }
    });

    const weekendRegistrations: WeekendRegistration[] = Object.entries(weekendMap).map(([studentId, w]) => ({
      studentId,
      status: w.status,
      pickupPerson: w.pickupPerson,
      expectedReturn: w.returnDate,
    }));

    const record: AttendanceRecord = {
      id: `${currentRoom.id}_${selectedDate}_${session}`,
      roomId: currentRoom.id,
      date: selectedDate,
      session,
      absentStudentIds,
      absentDetails,
      weekendRegistrations: showWeekendSection ? weekendRegistrations : existingRecord?.weekendRegistrations || [],
      submittedAt: now.toISOString(),
      submittedBy: currentUser.name || currentRoom.assignedTeacherName || 'Giáo viên trực phòng',
      isLate,
      notes: generalNote,
    };

    onSaveAttendance(record);

    // Calculate current submission ranking
    const currentSubmissions = attendanceList.filter((a) => a.date === selectedDate && a.session === session);
    const rank = currentSubmissions.length + (existingRecord ? 0 : 1);

    setSubmissionSuccessMsg(
      `Đã nộp báo cáo ${session === 'morning' ? 'buổi sáng' : 'buổi tối'} thành công lúc ${now.toLocaleTimeString('vi-VN')}! ` +
      (isLate ? `(Nộp trễ so với quy định ${cutoffTime})` : `(Đúng giờ, đứng thứ ${rank} trong số các phòng nộp hôm nay)`)
    );
  };

  // Open modal to add or edit student
  const openStudentModal = (student?: Student) => {
    if (student) {
      setEditingStudent(student);
      setFullName(student.fullName);
      setGender(student.gender);
      setGrade(student.grade);
      setVillage(student.village);
      setNocHamlet(student.nocHamlet);
      setParentsName(student.parentsName);
      setPhone(student.phone);
      setStudentStatus(student.status || 'dang_o');
      setNotes(student.notes || '');
    } else {
      setEditingStudent(null);
      setFullName('');
      setGender(currentRoom.gender);
      setGrade('6A');
      setVillage('Thôn 1');
      setNocHamlet('Nóc Ông Tuấn');
      setParentsName('');
      setPhone('');
      setStudentStatus('dang_o');
      setNotes('');
    }
    setShowStudentModal(true);
  };

  const handleSaveStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) return;

    if (editingStudent) {
      onUpdateStudent({
        ...editingStudent,
        fullName: fullName.trim(),
        gender,
        grade,
        village,
        nocHamlet,
        parentsName: parentsName.trim() || 'Chưa cập nhật',
        phone: phone.trim() || '0900000000',
        status: studentStatus,
        notes: notes.trim() || undefined,
      });
    } else {
      const newStudent: Student = {
        id: `STU_${Date.now().toString().slice(-6)}`,
        roomId: currentRoom.id,
        fullName: fullName.trim(),
        gender,
        grade,
        village,
        nocHamlet,
        parentsName: parentsName.trim() || 'Chưa cập nhật',
        phone: phone.trim() || '0900000000',
        status: studentStatus,
        notes: notes.trim() || undefined,
      };
      onAddStudent(newStudent);
    }
    setShowStudentModal(false);
  };

  const absentTotal = Object.values(absentMap).filter((d) => d.isAbsent).length;
  const presentTotal = allRoomStudents.length - absentTotal;

  const renderStatusBadge = (student: Student) => {
    const status = student.status || 'dang_o';
    return (
      <select
        value={status}
        onChange={(e) => onUpdateStudent({ ...student, status: e.target.value as StudentStatus })}
        className={`text-[10px] font-bold rounded px-1.5 py-0.5 border cursor-pointer ${
          status === 'tam_nghi'
            ? 'bg-amber-100 text-amber-900 border-amber-300'
            : status === 'dac_biet'
            ? 'bg-purple-100 text-purple-900 border-purple-300'
            : status === 'chuyen_truong'
            ? 'bg-slate-200 text-slate-700 border-slate-300'
            : 'bg-emerald-50 text-emerald-800 border-emerald-200'
        }`}
        title="Nhấp để đổi trạng thái học sinh"
      >
        <option value="dang_o">Đang ở</option>
        <option value="dac_biet">Đặc biệt</option>
        <option value="tam_nghi">Tạm nghỉ</option>
        <option value="chuyen_truong">Đã chuyển</option>
      </select>
    );
  };

  return (
    <div className={`space-y-6 ${isOverdue ? 'ring-4 ring-rose-500/80 rounded-3xl p-1 bg-rose-50/20' : ''}`}>
      
      {/* Red Alert Banner when Overdue */}
      <UrgentAlertBanner
        currentRoom={currentRoom}
        session={session}
        cutoffTime={cutoffTime}
        isOverdue={isOverdue}
        minutesOverdue={minutesOverdue}
        timeRemainingStr={timeRemainingStr}
        hasNotificationPermission={hasNotificationPermission}
        onRequestNotificationPermission={requestNotificationPermission}
        onPlaySound={playAlertSound}
        onTriggerTestAlert={triggerTestAlert}
        onSubmitNow={handleSubmitAttendance}
      />

      {/* Top Header Card: Room Selector & Session Cutoff Info */}
      <div className={`bg-white rounded-2xl border shadow-2xs p-5 ${
        isOverdue ? 'border-rose-300 shadow-rose-100' : 'border-slate-200/90'
      }`}>
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          
          {/* Room Selector */}
          <div>
            <div className="text-xs text-slate-500 font-medium mb-1 flex items-center gap-2">
              <span>Đang thao tác phòng:</span>
              <span className={`px-2 py-0.5 rounded font-bold text-[11px] ${
                currentRoom.gender === 'nam' ? 'bg-blue-100 text-blue-800' : 'bg-rose-100 text-rose-800'
              }`}>
                {currentRoom.gender === 'nam' ? 'Dãy Nam' : 'Dãy Nữ'}
              </span>
              {isOverdue && (
                <span className="bg-rose-600 text-white font-black text-[10px] px-2 py-0.5 rounded-full animate-pulse">
                  🚨 CHƯA NỘP - QUÁ HẠN!
                </span>
              )}
            </div>
            
            <div className="flex flex-wrap items-center gap-2">
              <select
                value={selectedRoomId}
                onChange={(e) => onSelectRoomId(e.target.value)}
                className="bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-700 font-mono-numbers"
              >
                {rooms.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name} · {r.assignedTeacherName || 'GV Trực'} ({students.filter(s => s.roomId === r.id).length} em)
                  </option>
                ))}
              </select>

              <div className="text-xs text-slate-600 pl-2 border-l border-slate-200">
                <span>GV trực phụ trách: <strong>{currentRoom.assignedTeacherName || 'Thầy Nguyễn Trọng Nghĩa'}</strong></span>
                <span className="text-slate-400 block text-[11px]">Sĩ số định mức: {currentRoom.capacity} em (Hiện có: {allRoomStudents.length} em)</span>
              </div>
            </div>
          </div>

          {/* Morning / Evening Cutoff Switcher & Actions */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <div className="bg-slate-100 p-1 rounded-xl flex items-center gap-1 border border-slate-200">
              <button
                onClick={() => setSession('morning')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  session === 'morning'
                    ? 'bg-teal-900 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Buổi Sáng (Hạn {settings.cutoffMorning})
              </button>
              <button
                onClick={() => setSession('evening')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  session === 'evening'
                    ? 'bg-teal-900 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Buổi Tối (Hạn {settings.cutoffEvening})
              </button>
            </div>

            {/* Test Alarm Simulation Button */}
            <button
              onClick={triggerTestAlert}
              className="flex items-center gap-1 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-300 px-2.5 py-2 rounded-xl text-xs font-bold transition-colors"
              title="Thử nghiệm chuông và thông báo đỏ quá giờ"
            >
              <BellRing className="w-3.5 h-3.5 text-rose-600" />
              <span>Thử cảnh báo đỏ</span>
            </button>

            {/* Bulk Add Button */}
            <button
              onClick={() => setShowBulkModal(true)}
              className="flex items-center gap-1.5 bg-teal-800 hover:bg-teal-700 text-white px-3 py-2 rounded-xl text-xs font-bold transition-colors shadow-2xs"
              title="Thêm nhiều học sinh từ Excel hoặc dán danh sách"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-amber-400" />
              <span>Thêm hàng loạt</span>
            </button>

            {/* Single Add Button */}
            <button
              onClick={() => openStudentModal()}
              className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-white px-3 py-2 rounded-xl text-xs font-semibold transition-colors"
            >
              <Plus className="w-3.5 h-3.5 text-amber-400" />
              <span>Thêm 1 em</span>
            </button>
          </div>

        </div>

        {/* Existing Submission Status Alert */}
        {existingRecord && (
          <div className={`mt-4 p-3 rounded-xl border text-xs flex items-center justify-between ${
            existingRecord.isLate
              ? 'bg-amber-50 border-amber-200 text-amber-900'
              : 'bg-emerald-50 border-emerald-200 text-emerald-900'
          }`}>
            <div className="flex items-center gap-2">
              {existingRecord.isLate ? (
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
              ) : (
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
              )}
              <span>
                Phòng này <strong>đã gửi báo cáo điểm danh</strong> vào lúc{' '}
                <strong className="font-mono-numbers">
                  {new Date(existingRecord.submittedAt).toLocaleTimeString('vi-VN')}
                </strong>{' '}
                bởi {existingRecord.submittedBy}.
                {existingRecord.isLate ? ' (Ghi nhận nộp trễ)' : ' (Ghi nhận đúng giờ)'}
              </span>
            </div>
            <span className="text-[11px] font-mono-numbers text-slate-500">
              Có thể cập nhật lại trước giờ quy định
            </span>
          </div>
        )}

        {/* Success message popup */}
        {submissionSuccessMsg && (
          <div className="mt-4 p-3 rounded-xl bg-teal-50 border border-teal-300 text-teal-950 text-xs font-semibold flex items-center gap-2 shadow-xs">
            <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
            <span>{submissionSuccessMsg}</span>
          </div>
        )}
      </div>

      {/* Roll Call Summary Bar & Status Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
        <div className="flex flex-wrap items-center gap-4 text-xs font-semibold">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
            <span>Có mặt: <strong className="text-emerald-700 font-mono-numbers text-sm">{presentTotal}</strong> em</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-rose-500"></span>
            <span>Vắng: <strong className="text-rose-700 font-mono-numbers text-sm">{absentTotal}</strong> em</span>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1 pl-3 border-l border-slate-200">
            <Filter className="w-3 h-3 text-slate-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-md px-2 py-1 text-[11px] text-slate-700 font-medium"
            >
              <option value="all">Tất cả trạng thái ({allRoomStudents.length})</option>
              <option value="dang_o">Đang ở nội trú</option>
              <option value="tam_nghi">Tạm nghỉ / Điều trị</option>
              <option value="dac_biet">Hoàn cảnh đặc biệt</option>
              <option value="chuyen_truong">Đã chuyển trường</option>
            </select>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowWeekendSection(!showWeekendSection)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
              showWeekendSection
                ? 'bg-amber-100 text-amber-900 border-amber-300'
                : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
            }`}
          >
            {showWeekendSection ? 'Ẩn đăng ký cuối tuần' : 'Mở đăng ký cuối tuần (về nóc/ở lại)'}
          </button>

          <button
            onClick={handleSubmitAttendance}
            className="flex items-center gap-1.5 bg-teal-900 hover:bg-teal-800 text-white font-bold px-4 py-2 rounded-xl text-xs transition-colors shadow-sm"
          >
            <Send className="w-3.5 h-3.5 text-amber-400" />
            <span>Gửi Báo Cáo Điểm Danh</span>
          </button>
        </div>
      </div>

      {/* Student List & 1-Touch Roll-Call */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900">
            Danh Sách Học Sinh Phòng {currentRoom.name} ({roomStudents.length} em)
          </h3>
          <span className="text-xs text-slate-500">
            Bấm nút để đánh dấu vắng hoặc có mặt tức thì
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 font-semibold bg-slate-50/50">
                <th className="py-2.5 px-3 text-center w-10">STT</th>
                <th className="py-2.5 px-3">Họ và tên</th>
                <th className="py-2.5 px-3 text-center">Trạng thái</th>
                <th className="py-2.5 px-3">Lớp</th>
                <th className="py-2.5 px-3">Thôn / Nóc ông bà</th>
                <th className="py-2.5 px-3">Con ông / bà</th>
                <th className="py-2.5 px-3">SĐT Phụ huynh</th>
                <th className="py-2.5 px-3 text-center w-48">Điểm danh {session === 'morning' ? 'Sáng' : 'Tối'}</th>
                {showWeekendSection && (
                  <th className="py-2.5 px-3 text-center w-40">Đăng ký cuối tuần</th>
                )}
                <th className="py-2.5 px-3 text-right w-16">Sửa</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {roomStudents.map((student, idx) => {
                const absentInfo = absentMap[student.id] || { isAbsent: false, reason: 'co_phep', note: '' };
                const isAbsent = absentInfo.isAbsent;
                const weekendInfo = weekendMap[student.id] || { status: 'stay', pickupPerson: 'Ở lại trường', returnDate: 'Chủ Nhật' };

                return (
                  <tr
                    key={student.id}
                    className={`transition-colors ${
                      isAbsent ? 'bg-rose-50/40' : 'hover:bg-slate-50/60'
                    }`}
                  >
                    <td className="py-3 px-3 text-center font-mono-numbers text-slate-500">
                      {idx + 1}
                    </td>

                    <td className="py-3 px-3">
                      <div className="font-bold text-slate-900 flex items-center gap-1.5">
                        <span>{student.fullName}</span>
                        {student.notes && (
                          <span className="text-[10px] text-amber-700 bg-amber-50 px-1.5 py-0.2 rounded border border-amber-200" title={student.notes}>
                            Lưu ý
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono-numbers">{student.id}</div>
                    </td>

                    <td className="py-3 px-3 text-center">
                      {renderStatusBadge(student)}
                    </td>

                    <td className="py-3 px-3 font-mono-numbers text-slate-700">
                      {student.grade}
                    </td>

                    <td className="py-3 px-3">
                      <div className="text-slate-800">{student.village}</div>
                      <div className="text-[11px] text-teal-800 font-semibold">{student.nocHamlet}</div>
                    </td>

                    <td className="py-3 px-3 text-slate-600">
                      {student.parentsName}
                    </td>

                    <td className="py-3 px-3 font-mono-numbers text-slate-700">
                      <span className="inline-flex items-center gap-1">
                        <Phone className="w-3 h-3 text-slate-400" />
                        {student.phone}
                      </span>
                    </td>

                    {/* 1-Touch Attendance Control */}
                    <td className="py-3 px-3 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => toggleAbsent(student.id, false)}
                          className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-all ${
                            !isAbsent
                              ? 'bg-emerald-600 text-white shadow-xs'
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}
                        >
                          Có mặt
                        </button>
                        
                        <button
                          onClick={() => toggleAbsent(student.id, true, 'co_phep')}
                          className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-all ${
                            isAbsent && absentInfo.reason === 'co_phep'
                              ? 'bg-amber-600 text-white shadow-xs'
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}
                        >
                          Có phép
                        </button>

                        <button
                          onClick={() => toggleAbsent(student.id, true, 'om_dau')}
                          className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-all ${
                            isAbsent && absentInfo.reason === 'om_dau'
                              ? 'bg-blue-600 text-white shadow-xs'
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}
                        >
                          Ốm đau
                        </button>

                        <button
                          onClick={() => toggleAbsent(student.id, true, 'khong_phep')}
                          className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-all ${
                            isAbsent && absentInfo.reason === 'khong_phep'
                              ? 'bg-rose-600 text-white shadow-xs'
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}
                        >
                          Không phép
                        </button>
                      </div>

                      {/* Absent Note Input */}
                      {isAbsent && (
                        <div className="mt-1.5">
                          <input
                            type="text"
                            placeholder="Nhập lý do vắng cụ thể..."
                            value={absentInfo.note}
                            onChange={(e) => updateAbsentNote(student.id, e.target.value)}
                            className="w-full text-[11px] px-2 py-0.8 bg-white border border-rose-300 rounded text-rose-900 placeholder:text-rose-300 focus:outline-none focus:ring-1 focus:ring-rose-500"
                          />
                        </div>
                      )}
                    </td>

                    {/* Weekend Registration */}
                    {showWeekendSection && (
                      <td className="py-3 px-3 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => updateWeekendStatus(student.id, 'stay', 'Ở lại ký túc xá')}
                            className={`px-2 py-1 rounded text-[10px] font-semibold ${
                              weekendInfo.status === 'stay'
                                ? 'bg-teal-800 text-white'
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            }`}
                          >
                            Ở lại trường
                          </button>
                          <button
                            onClick={() => updateWeekendStatus(student.id, 'home', 'Phụ huynh đón')}
                            className={`px-2 py-1 rounded text-[10px] font-semibold ${
                              weekendInfo.status === 'home'
                                ? 'bg-amber-600 text-white'
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            }`}
                          >
                            Về nhà/nóc
                          </button>
                        </div>
                      </td>
                    )}

                    <td className="py-3 px-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => openStudentModal(student)}
                          className="p-1 hover:bg-slate-200 rounded text-slate-500 hover:text-slate-800"
                          title="Sửa thông tin"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Xác nhận xóa học sinh ${student.fullName}?`)) {
                              onDeleteStudent(student.id);
                            }
                          }}
                          className="p-1 hover:bg-rose-100 rounded text-slate-400 hover:text-rose-600"
                          title="Xóa học sinh"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>

                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* General Note for Teacher */}
      <div className="bg-white rounded-xl border border-slate-200 p-4">
        <label className="block text-xs font-bold text-slate-800 mb-1">
          Nội Dung Ghi Chú Của Giáo Viên Trực Phòng:
        </label>
        <textarea
          rows={2}
          value={generalNote}
          onChange={(e) => setGeneralNote(e.target.value)}
          placeholder="Nhập tình hình nề nếp vệ sinh, học sinh ốm đau, học tập hoặc đề xuất lên Trưởng ban..."
          className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-700"
        />
        <div className="mt-3 flex justify-end">
          <button
            onClick={handleSubmitAttendance}
            className="flex items-center gap-1.5 bg-teal-900 hover:bg-teal-800 text-white font-bold px-5 py-2.5 rounded-xl text-xs transition-colors shadow-sm"
          >
            <Send className="w-4 h-4 text-amber-400" />
            <span>Lưu & Gửi Báo Cáo Điểm Danh Phòng {currentRoom.name}</span>
          </button>
        </div>
      </div>

      {/* Add / Edit Student Modal */}
      {showStudentModal && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-lg w-full border border-slate-200 shadow-2xl p-6">
            <h3 className="text-base font-bold text-slate-900 mb-4">
              {editingStudent ? 'Chỉnh Sửa Học Sinh' : `Thêm Học Sinh Vào ${currentRoom.name}`}
            </h3>

            <form onSubmit={handleSaveStudent} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Họ và tên học sinh *</label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Hồ Văn Tiến"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg font-medium focus:ring-2 focus:ring-teal-700"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Giới tính</label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg font-medium"
                  >
                    <option value="nam">Nam</option>
                    <option value="nu">Nữ</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Lớp</label>
                  <input
                    type="text"
                    value={grade}
                    onChange={(e) => setGrade(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg font-medium"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Trạng thái</label>
                  <select
                    value={studentStatus}
                    onChange={(e) => setStudentStatus(e.target.value as StudentStatus)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg font-semibold text-teal-900"
                  >
                    <option value="dang_o">Đang ở nội trú</option>
                    <option value="tam_nghi">Tạm nghỉ / Điều trị</option>
                    <option value="dac_biet">Hoàn cảnh đặc biệt</option>
                    <option value="chuyen_truong">Chuyển trường</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Thôn *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ví dụ: Thôn 1, Thôn Khe Chữ..."
                    value={village}
                    onChange={(e) => setVillage(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg font-medium"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Nóc ông / bà *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ví dụ: Nóc Ông Tuấn, Nóc Măng Xoan..."
                    value={nocHamlet}
                    onChange={(e) => setNocHamlet(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Con ông / bà (Tên cha mẹ)</label>
                <input
                  type="text"
                  placeholder="Ví dụ: Con ông Hồ Văn Toàn & bà Alăng Thị Nga"
                  value={parentsName}
                  onChange={(e) => setParentsName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg font-medium"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Số điện thoại liên lạc khẩn cấp</label>
                <input
                  type="text"
                  placeholder="0914xxxxxx"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg font-medium font-mono-numbers"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Ghi chú sức khỏe / hoàn cảnh</label>
                <input
                  type="text"
                  placeholder="Tiền sử dị ứng, hoàn cảnh đặc biệt khó khăn..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg font-medium"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowStudentModal(false)}
                  className="px-4 py-2 rounded-lg text-slate-600 hover:bg-slate-100 font-semibold"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-teal-900 hover:bg-teal-800 text-white font-bold"
                >
                  {editingStudent ? 'Lưu thay đổi' : 'Thêm học sinh'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Bulk Add Student Modal */}
      <BulkStudentModal
        isOpen={showBulkModal}
        onClose={() => setShowBulkModal(false)}
        currentRoom={currentRoom}
        rooms={rooms}
        existingStudents={students}
        onAddBulkStudents={(newBatch) => {
          onAddBulkStudents(newBatch);
          setSubmissionSuccessMsg(`Đã thêm thành công ${newBatch.length} học sinh vào hệ thống!`);
        }}
      />

    </div>
  );
};
