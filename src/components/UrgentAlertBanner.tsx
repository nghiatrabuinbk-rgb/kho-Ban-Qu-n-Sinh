import React from 'react';
import { AlertTriangle, Bell, BellRing, Volume2, ShieldAlert, Sparkles, Send } from 'lucide-react';
import { Room } from '../types';

interface UrgentAlertBannerProps {
  currentRoom: Room;
  session: 'morning' | 'evening';
  cutoffTime: string;
  isOverdue: boolean;
  minutesOverdue: number;
  timeRemainingStr: string;
  hasNotificationPermission: boolean;
  onRequestNotificationPermission: () => void;
  onPlaySound: () => void;
  onTriggerTestAlert: () => void;
  onSubmitNow: () => void;
}

export const UrgentAlertBanner: React.FC<UrgentAlertBannerProps> = ({
  currentRoom,
  session,
  cutoffTime,
  isOverdue,
  minutesOverdue,
  timeRemainingStr,
  hasNotificationPermission,
  onRequestNotificationPermission,
  onPlaySound,
  onTriggerTestAlert,
  onSubmitNow,
}) => {
  if (!isOverdue) return null;

  return (
    <div className="rounded-2xl bg-gradient-to-r from-rose-900 via-rose-800 to-red-900 border-2 border-rose-500 shadow-xl p-4 sm:p-5 text-white animate-pulse-subtle">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        
        {/* Left: Urgent Alarm Icon & Message */}
        <div className="flex items-start gap-3.5">
          <div className="p-3 bg-white text-rose-700 rounded-xl shadow-lg shrink-0 animate-bounce">
            <BellRing className="w-6 h-6" />
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="bg-white/20 text-white border border-white/30 text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full">
                🚨 CẢNH BÁO ĐỎ TỪ TRƯỞNG BAN
              </span>
              <span className="text-amber-300 font-mono-numbers text-xs font-bold">
                Đã quá giờ {session === 'morning' ? 'buổi sáng' : 'buổi tối'} ({cutoffTime})
              </span>
            </div>

            <h2 className="text-base sm:text-lg font-black tracking-tight text-white mt-1">
              {currentRoom.name} CHƯA HOÀN THÀNH ĐIỂM DANH!
            </h2>

            <p className="text-xs sm:text-sm text-rose-100 mt-1 max-w-2xl leading-relaxed">
              Theo quy định của Thầy Nguyễn Trọng Nghĩa (Trưởng ban quản lý), giờ chốt điểm danh là <strong className="text-white underline">{cutoffTime}</strong>. 
              Hiện tại phòng này đã trễ <strong className="text-amber-300 font-mono-numbers">{minutesOverdue > 0 ? `${minutesOverdue} phút` : 'hạn'}</strong>. 
              Vui lòng chốt sĩ số và gửi báo cáo khẩn cấp để tránh ảnh hưởng điểm thi đua nề nếp của phòng!
            </p>
          </div>
        </div>

        {/* Right: Quick Action Controls */}
        <div className="flex flex-wrap items-center gap-2 self-start md:self-auto shrink-0">
          
          {/* Notification Permission Button */}
          {!hasNotificationPermission && (
            <button
              onClick={onRequestNotificationPermission}
              className="flex items-center gap-1.5 bg-white/10 hover:bg-white/20 text-white text-xs font-bold px-3 py-2 rounded-xl border border-white/30 transition-colors"
              title="Nhận thông báo đẩy trên điện thoại và laptop"
            >
              <Bell className="w-3.5 h-3.5 text-amber-300" />
              <span>Bật thông báo đẩy</span>
            </button>
          )}

          {/* Sound Test / Chime Button */}
          <button
            onClick={onPlaySound}
            className="flex items-center gap-1.5 bg-white/10 hover:bg-white/20 text-white text-xs font-bold px-3 py-2 rounded-xl border border-white/30 transition-colors"
            title="Nghe thử chuông báo động"
          >
            <Volume2 className="w-3.5 h-3.5 text-amber-300" />
            <span>Chuông báo</span>
          </button>

          {/* Urgent Submit Button */}
          <button
            onClick={onSubmitNow}
            className="flex items-center gap-1.5 bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-black px-4 py-2 rounded-xl shadow-lg transition-transform hover:scale-105"
          >
            <Send className="w-4 h-4 text-rose-900" />
            <span>NỘP BÁO CÁO NGAY</span>
          </button>

        </div>

      </div>
    </div>
  );
};
