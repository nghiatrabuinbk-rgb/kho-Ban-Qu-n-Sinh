import React, { useState, useEffect } from 'react';
import { User, LogIn, LogOut, ShieldCheck, Clock, School, ChevronDown, Check, Laptop } from 'lucide-react';
import { AuthorizedUser } from '../types';

interface HeaderProps {
  currentUser: {
    email: string;
    name: string;
    role: string;
    assignedRoomId?: string;
  };
  onSwitchUser: (user: AuthorizedUser) => void;
  authorizedUsers: AuthorizedUser[];
  onLoginGoogle: () => void;
  onLogout: () => void;
  isFirebaseConnected: boolean;
  onOpenDesktopModal: () => void;
  isTeacherOverdue?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  currentUser,
  onSwitchUser,
  authorizedUsers,
  onLoginGoogle,
  onLogout,
  isFirebaseConnected,
  onOpenDesktopModal,
  isTeacherOverdue,
}) => {
  const [timeStr, setTimeStr] = useState('');
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setTimeStr(
        now.toLocaleDateString('vi-VN', {
          weekday: 'long',
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
        }) + ' · ' + now.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      );
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  const getRoleBadgeLabel = (role: string) => {
    switch (role) {
      case 'admin':
        return 'Trưởng ban Quản lý (Admin)';
      case 'board_director':
        return 'Ban Giám hiệu (BGH)';
      case 'supervisor':
        return 'Ban Quản sinh';
      case 'room_teacher':
        return `GV trực ${currentUser.assignedRoomId || 'phòng'}`;
      default:
        return 'Giáo viên';
    }
  };

  return (
    <header className="no-print bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-40 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Zone 1: Brand & School Title */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-10 h-10 rounded-lg bg-teal-800 border border-teal-700/60 flex items-center justify-center text-amber-400 font-bold shadow-inner">
              <School className="w-5 h-5" />
            </div>
            <div>
              <div className="text-base font-bold tracking-tight text-white flex items-center gap-2">
                <span>PTDTBT THCS XÃ TRÀ ĐỐC</span>
                <span className="text-teal-400 text-xs font-semibold px-2 py-0.5 rounded bg-teal-950/70 border border-teal-800/60">
                  Nội Trú Học Sinh
                </span>
              </div>
              <div className="text-xs text-slate-400 hidden sm:block">
                Hệ thống Quản lý 25 Phòng ở · Điểm danh 2 buổi & Thi đua
              </div>
            </div>
          </div>

          {/* Zone 2: Real-time Clock & Synchronized Status */}
          <div className="hidden lg:flex items-center gap-4 text-xs text-slate-300">
            <div className="flex items-center gap-1.5 bg-slate-800/80 px-3 py-1.5 rounded-md border border-slate-700/60">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              <span className="font-mono-numbers">{timeStr}</span>
            </div>
            <div className="flex items-center gap-1.5 text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span>Đồng bộ Đám mây Trực tuyến</span>
            </div>
          </div>

          {/* Zone 3: User Role & Actions */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Install Desktop App / .EXE Modal Button */}
            <button
              onClick={onOpenDesktopModal}
              className="flex items-center gap-1.5 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-slate-950 font-bold px-3 py-1.5 rounded-lg text-xs transition-all shadow-sm"
              title="Cài đặt phần mềm chạy trên màn hình Laptop như file .exe"
            >
              <Laptop className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Cài vào Laptop (.exe)</span>
              <span className="sm:hidden">Cài PC</span>
            </button>

            {/* Role Switcher for Testing/Quick Operation */}
            <div className="relative">
              <button
                onClick={() => setShowRoleDropdown(!showRoleDropdown)}
                className={`flex items-center gap-2 border px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  isTeacherOverdue
                    ? 'bg-rose-950 text-white border-rose-500 shadow-md ring-2 ring-rose-500/50'
                    : 'bg-slate-800 hover:bg-slate-700/90 text-slate-200 border-slate-700'
                }`}
                title="Chuyển đổi người dùng kiểm thử"
              >
                <ShieldCheck className={`w-3.5 h-3.5 ${isTeacherOverdue ? 'text-rose-400 animate-bounce' : 'text-amber-400'}`} />
                <span className="max-w-[130px] truncate">{currentUser.name}</span>
                <span className="text-slate-400 font-mono-numbers">({getRoleBadgeLabel(currentUser.role)})</span>
                {isTeacherOverdue && (
                  <span className="bg-rose-600 text-white text-[10px] font-black px-1.5 py-0.5 rounded animate-pulse">
                    🚨 TRỄ HẠN
                  </span>
                )}
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {showRoleDropdown && (
                <div className="absolute right-0 mt-2 w-80 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl py-2 z-50 text-slate-200">
                  <div className="px-3 py-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-800">
                    Chuyển nhanh vai trò kiểm thử
                  </div>
                  <div className="max-h-80 overflow-y-auto divide-y divide-slate-800/60">
                    {authorizedUsers.map((u) => {
                      const isActive = u.email === currentUser.email;
                      return (
                        <button
                          key={u.email}
                          onClick={() => {
                            onSwitchUser(u);
                            setShowRoleDropdown(false);
                          }}
                          className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-slate-800 transition-colors ${
                            isActive ? 'bg-teal-950/50 text-teal-300' : 'text-slate-300'
                          }`}
                        >
                          <div>
                            <div className="font-semibold text-white flex items-center gap-1.5">
                              {u.name}
                              {isActive && <Check className="w-3.5 h-3.5 text-teal-400" />}
                            </div>
                            <div className="text-[11px] text-slate-400">
                              {getRoleBadgeLabel(u.role)} · {u.email}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Google Login / Account Info */}
            {currentUser.email ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={onLogout}
                  className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-rose-400 rounded-lg transition-colors"
                  title="Đăng xuất"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={onLoginGoogle}
                className="flex items-center gap-1.5 bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold px-3 py-1.5 rounded-lg text-xs transition-colors shadow-sm"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Đăng nhập Gmail</span>
              </button>
            )}

          </div>

        </div>
      </div>
    </header>
  );
};
