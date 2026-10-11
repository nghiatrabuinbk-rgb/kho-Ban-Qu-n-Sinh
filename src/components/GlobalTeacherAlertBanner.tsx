import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  BellRing, Bell, Volume2, ShieldAlert, Sparkles, Send, 
  AlertTriangle, ArrowRight, CheckCircle2, ChevronRight, X
} from 'lucide-react';
import { Room, AttendanceRecord, SystemSettings, AuthorizedUser } from '../types';

interface GlobalTeacherAlertBannerProps {
  currentUser: AuthorizedUser;
  rooms: Room[];
  attendanceList: AttendanceRecord[];
  settings: SystemSettings;
  selectedDate: string;
  onNavigateToAttendance: (roomId: string) => void;
}

export const GlobalTeacherAlertBanner: React.FC<GlobalTeacherAlertBannerProps> = ({
  currentUser,
  rooms,
  attendanceList,
  settings,
  selectedDate,
  onNavigateToAttendance,
}) => {
  const [isDismissed, setIsDismissed] = useState(false);
  const [minutesOverdue, setMinutesOverdue] = useState(0);
  const [timeRemainingStr, setTimeRemainingStr] = useState('');
  const [isOverdue, setIsOverdue] = useState(false);
  const [isApproaching, setIsApproaching] = useState(false);
  const [hasNotificationPermission, setHasNotificationPermission] = useState(
    typeof Notification !== 'undefined' && Notification.permission === 'granted'
  );
  const [testAlertTriggered, setTestAlertTriggered] = useState(false);

  // Determine current active session based on time of day
  const [currentSession, setCurrentSession] = useState<'morning' | 'evening'>(() => {
    const hours = new Date().getHours();
    return hours < 12 ? 'morning' : 'evening';
  });

  const lastPushNotifiedRef = useRef<string | null>(null);

  // Determine teacher's assigned room or active target room
  const teacherRoomId = currentUser.assignedRoomId || (currentUser.role === 'room_teacher' ? 'P01' : null);
  const teacherRoom = rooms.find((r) => r.id === teacherRoomId);

  // Check if teacher's room has completed roll call for this session & date
  const isTeacherRoomSubmitted = teacherRoomId
    ? attendanceList.some(
        (a) => a.roomId === teacherRoomId && a.date === selectedDate && a.session === currentSession
      )
    : false;

  // For Admin / Supervisors: Find all overdue rooms
  const submittedRoomIdsSet = new Set(
    attendanceList
      .filter((a) => a.date === selectedDate && a.session === currentSession)
      .map((a) => a.roomId)
  );
  const pendingRooms = rooms.filter((r) => !submittedRoomIdsSet.has(r.id));

  // Audio warning chime using Web Audio API
  const playAlertChime = useCallback(() => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();

      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();

      osc1.type = 'triangle';
      osc2.type = 'sine';

      // Urgent two-tone buzzer
      osc1.frequency.setValueAtTime(659.25, ctx.currentTime); // E5
      osc1.frequency.setValueAtTime(880.00, ctx.currentTime + 0.15); // A5
      osc1.frequency.setValueAtTime(659.25, ctx.currentTime + 0.30); // E5
      osc1.frequency.setValueAtTime(1046.50, ctx.currentTime + 0.45); // C6

      osc2.frequency.setValueAtTime(329.63, ctx.currentTime); // E4

      gain.gain.setValueAtTime(0.35, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.7);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);

      osc1.start();
      osc2.start();
      osc1.stop(ctx.currentTime + 0.7);
      osc2.stop(ctx.currentTime + 0.7);
    } catch (e) {
      console.warn('Audio alert not permitted:', e);
    }
  }, []);

  // Request browser push notification permission
  const handleRequestPermission = async () => {
    if (typeof Notification === 'undefined') return;
    try {
      const perm = await Notification.requestPermission();
      const granted = perm === 'granted';
      setHasNotificationPermission(granted);
      if (granted) {
        new Notification('🔔 Đã Kích Hoạt Thông Báo Đẩy Nội Trú Trà Đốc', {
          body: 'Thầy/Cô sẽ nhận được cảnh báo tự động trên laptop và điện thoại khi đến giờ giới hạn điểm danh.',
          icon: '/favicon.ico',
        });
        playAlertChime();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Trigger test simulation
  const handleTriggerTest = () => {
    setTestAlertTriggered(true);
    setIsOverdue(true);
    setMinutesOverdue(12);
    setTimeRemainingStr('Đã quá hạn 12 phút (Mô phỏng thử nghiệm)');
    setIsDismissed(false);
    playAlertChime();

    if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
      new Notification('🚨 [THỬ NGHIỆM] CẢNH BÁO ĐỎ TỪ TRƯỞNG BAN', {
        body: `Điểm danh phòng ${teacherRoom?.name || 'P01'} chưa nộp! Đã quá giờ giới hạn do Thầy Nguyễn Trọng Nghĩa quy định.`,
        icon: '/favicon.ico',
        requireInteraction: true,
      });
    }
  };

  // Timer interval to check cutoff time
  useEffect(() => {
    const checkStatus = () => {
      const now = new Date();
      const hours = now.getHours();
      const session = hours < 12 ? 'morning' : 'evening';
      setCurrentSession(session);

      const cutoffStr = session === 'morning' ? settings.cutoffMorning : settings.cutoffEvening;
      const [cutoffH, cutoffM] = cutoffStr.split(':').map(Number);

      const deadline = new Date();
      deadline.setHours(cutoffH, cutoffM, 0, 0);

      const diffMs = now.getTime() - deadline.getTime();
      const diffMins = Math.floor(diffMs / 60000);

      if (diffMs > 0) {
        // PAST CUTOFF
        setIsOverdue(true);
        setMinutesOverdue(diffMins);
        setIsApproaching(false);
        setTimeRemainingStr(`Đã quá hạn ${diffMins} phút`);

        // Send native browser notification if not submitted
        if (teacherRoomId && !isTeacherRoomSubmitted) {
          const pushKey = `${teacherRoomId}_${selectedDate}_${session}_overdue`;
          if (lastPushNotifiedRef.current !== pushKey) {
            lastPushNotifiedRef.current = pushKey;

            if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
              new Notification(`🚨 BÁO ĐỘNG ĐỎ: ${teacherRoom?.name || teacherRoomId} CHƯA ĐIỂM DANH`, {
                body: `Đã quá giờ giới hạn (${cutoffStr}) do Thầy Nguyễn Trọng Nghĩa quy định! Vui lòng nộp báo cáo khẩn cấp.`,
                icon: '/favicon.ico',
                requireInteraction: true,
              });
            }

            playAlertChime();
          }
        }
      } else {
        // BEFORE CUTOFF
        setIsOverdue(false);
        const remainMs = Math.abs(diffMs);
        const remainMins = Math.floor(remainMs / 60000);
        const remainSecs = Math.floor((remainMs % 60000) / 1000);
        setIsApproaching(remainMins <= 15);
        setTimeRemainingStr(`Còn ${remainMins}p ${remainSecs}s đến giờ khóa sổ ${cutoffStr}`);
      }
    };

    checkStatus();
    const interval = setInterval(checkStatus, 2000);
    return () => clearInterval(interval);
  }, [settings, teacherRoomId, isTeacherRoomSubmitted, selectedDate, teacherRoom, playAlertChime]);

  const cutoffTime = currentSession === 'morning' ? settings.cutoffMorning : settings.cutoffEvening;
  const isDutyTeacher = currentUser.role === 'room_teacher' || !!currentUser.assignedRoomId;
  const isAdminOrBGH = currentUser.role === 'admin' || currentUser.role === 'board_director' || currentUser.role === 'supervisor';

  // SCENARIO 1: DUTY TEACHER WITH UNFINISHED ATTENDANCE PAST CUTOFF (OR TEST TRIGGERED)
  if (isDutyTeacher && teacherRoom && (!isTeacherRoomSubmitted || testAlertTriggered) && (isOverdue || testAlertTriggered)) {
    if (isDismissed) {
      return (
        <div className="no-print bg-rose-700 text-white text-xs font-bold py-1.5 px-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BellRing className="w-4 h-4 text-amber-300 animate-bounce" />
            <span>🚨 CẢNH BÁO ĐỎ: {teacherRoom.name} chưa nộp điểm danh {currentSession === 'morning' ? 'sáng' : 'tối'} (quá {minutesOverdue}p)!</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => onNavigateToAttendance(teacherRoom.id)}
              className="bg-amber-400 hover:bg-amber-300 text-slate-950 px-2.5 py-0.5 rounded text-[11px] font-black"
            >
              Điểm danh ngay
            </button>
            <button onClick={() => setIsDismissed(false)} className="underline text-[11px] text-rose-200">
              Mở lại cảnh báo đầy đủ
            </button>
          </div>
        </div>
      );
    }

    return (
      <aside aria-label="Cảnh báo điểm danh quá hạn" className="no-print bg-gradient-to-r from-red-950 via-rose-900 to-red-900 text-white border-b-4 border-rose-500 shadow-2xl relative z-35 animate-pulse-subtle">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 sm:py-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4">
            
            {/* Left: Urgent Alarm Badge & Text */}
            <div className="flex items-start gap-3.5">
              <div className="p-3 bg-white text-rose-800 rounded-2xl shadow-xl shrink-0 animate-bounce">
                <BellRing className="w-6 h-6" />
              </div>

              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="bg-rose-500 text-white text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full shadow-xs">
                    🚨 CẢNH BÁO ĐỎ TỪ TRƯỞNG BAN
                  </span>
                  <span className="text-amber-300 font-mono-numbers text-xs font-bold bg-black/30 px-2 py-0.5 rounded">
                    Chốt {currentSession === 'morning' ? 'buổi sáng' : 'buổi tối'}: {cutoffTime} · Đã quá {minutesOverdue > 0 ? `${minutesOverdue} phút` : 'hạn'}
                  </span>
                </div>

                <h2 className="text-sm sm:text-base font-black tracking-tight text-white mt-1">
                  THẦY/CÔ CHƯA NỘP BÁO CÁO ĐIỂM DANH {teacherRoom.name.toUpperCase()}!
                </h2>

                <p className="text-xs text-rose-100 mt-0.5 max-w-3xl leading-relaxed">
                  Theo quy định của Thầy Nguyễn Trọng Nghĩa (Trưởng ban), giờ khóa sổ là <strong className="text-amber-300 underline font-mono-numbers">{cutoffTime}</strong>. 
                  Phòng đang bị trễ hạn nộp, nguy cơ bị trừ điểm thi đua của phòng. Vui lòng kiểm tra sĩ số và gửi báo cáo khẩn cấp!
                </p>
              </div>
            </div>

            {/* Right: Action Buttons */}
            <div className="flex flex-wrap items-center gap-2 shrink-0 self-start md:self-auto pt-1 md:pt-0">
              
              {!hasNotificationPermission && (
                <button
                  onClick={handleRequestPermission}
                  className="flex items-center gap-1.5 bg-white/10 hover:bg-white/20 text-white text-xs font-bold px-3 py-2 rounded-xl border border-white/30 transition-colors"
                  title="Nhận thông báo đẩy trên Laptop & Điện thoại"
                >
                  <Bell className="w-3.5 h-3.5 text-amber-300" />
                  <span>Bật thông báo đẩy</span>
                </button>
              )}

              <button
                onClick={playAlertChime}
                className="flex items-center gap-1.5 bg-white/10 hover:bg-white/20 text-white text-xs font-bold px-3 py-2 rounded-xl border border-white/30 transition-colors"
                title="Nghe chuông báo"
              >
                <Volume2 className="w-3.5 h-3.5 text-amber-300" />
                <span>Chuông báo</span>
              </button>

              <button
                onClick={() => onNavigateToAttendance(teacherRoom.id)}
                className="flex items-center gap-2 bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-black px-4 py-2.5 rounded-xl shadow-xl transition-transform hover:scale-105"
              >
                <Send className="w-4 h-4 text-rose-900" />
                <span>ĐIỂM DANH NGAY {teacherRoom.id}</span>
              </button>

              <button
                onClick={() => setIsDismissed(true)}
                className="p-1.5 text-rose-300 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
                title="Thu nhỏ cảnh báo"
              >
                <X className="w-4 h-4" />
              </button>

            </div>

          </div>
        </div>
      </aside>
    );
  }

  // SCENARIO 2: ADMIN / SUPERVISOR VIEW WHEN ROOMS ARE OVERDUE
  if (isAdminOrBGH && isOverdue && pendingRooms.length > 0) {
    if (isDismissed) return null;

    return (
      <aside aria-label="Tổng hợp phòng chưa điểm danh" className="no-print bg-slate-950 border-b border-rose-800 text-white text-xs py-2.5 px-4 shadow-md">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div className="flex items-center gap-2.5">
            <span className="p-1.5 bg-rose-600 text-white rounded-lg animate-pulse shrink-0">
              <AlertTriangle className="w-4 h-4" />
            </span>
            <div>
              <span className="font-bold text-amber-300">
                THÔNG BÁO TỔNG HỢP TRƯỞNG BAN ({cutoffTime}):
              </span>{' '}
              <span className="text-slate-200">
                Hiện có <strong className="text-rose-400 font-mono-numbers">{pendingRooms.length} phòng</strong> chưa nộp điểm danh {currentSession === 'morning' ? 'buổi sáng' : 'buổi tối'} (quá {minutesOverdue} phút):
              </span>{' '}
              <span className="text-amber-200 font-mono-numbers">
                {pendingRooms.slice(0, 7).map(r => r.name.split(' ')[0] + ' ' + r.name.split(' ')[1]).join(', ')}
                {pendingRooms.length > 7 && ` và ${pendingRooms.length - 7} phòng khác`}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
            <button
              onClick={handleTriggerTest}
              className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-[11px] font-semibold border border-slate-700 transition-colors"
              title="Mô phỏng thử nghiệm chuông và cảnh báo đỏ"
            >
              Thử cảnh báo đỏ
            </button>
            <button
              onClick={() => onNavigateToAttendance(pendingRooms[0].id)}
              className="px-3 py-1 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-bold transition-colors flex items-center gap-1 shadow-xs"
            >
              <span>Xem phòng trễ ({pendingRooms[0].id})</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setIsDismissed(true)}
              className="p-1 text-slate-400 hover:text-white"
              title="Đóng thông báo"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </aside>
    );
  }

  // SCENARIO 3: DUTY TEACHER APPROACHING DEADLINE (15 MINS REMAINING)
  if (isDutyTeacher && teacherRoom && !isTeacherRoomSubmitted && isApproaching) {
    return (
      <div className="no-print bg-amber-500 text-slate-950 text-xs font-bold py-2 px-4 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bell className="w-4 h-4 text-slate-900 animate-bounce" />
          <span>⏰ SẮP ĐẾN HẠN: {teacherRoom.name} cần gửi điểm danh trước {cutoffTime} ({timeRemainingStr})!</span>
        </div>
        <button
          onClick={() => onNavigateToAttendance(teacherRoom.id)}
          className="bg-slate-950 hover:bg-slate-800 text-amber-300 px-3 py-1 rounded-lg text-xs font-bold shadow-xs transition-colors"
        >
          Điểm danh ngay
        </button>
      </div>
    );
  }

  return null;
};
