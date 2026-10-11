import React from 'react';
import { LayoutGrid, ClipboardCheck, Trophy, FileSpreadsheet, Settings } from 'lucide-react';

export type ActiveTab = 'overview' | 'attendance' | 'competition' | 'reports' | 'settings';

interface NavigationTabsProps {
  activeTab: ActiveTab;
  onChangeTab: (tab: ActiveTab) => void;
  isAdminOrBGH: boolean;
  pendingMorningCount: number;
  hasOverdueRooms?: boolean;
}

export const NavigationTabs: React.FC<NavigationTabsProps> = ({
  activeTab,
  onChangeTab,
  isAdminOrBGH,
  pendingMorningCount,
  hasOverdueRooms,
}) => {
  const tabs = [
    {
      id: 'overview' as ActiveTab,
      label: 'Tổng quan 25 Phòng',
      icon: LayoutGrid,
    },
    {
      id: 'attendance' as ActiveTab,
      label: 'Điểm danh & Thứ tự nộp',
      icon: ClipboardCheck,
      badge: hasOverdueRooms 
        ? '🚨 QUÁ HẠN NỘP!' 
        : pendingMorningCount > 0 
        ? `${pendingMorningCount} phòng chưa nộp` 
        : undefined,
      isUrgent: hasOverdueRooms,
    },
    {
      id: 'competition' as ActiveTab,
      label: 'Thi đua & Ảnh minh chứng',
      icon: Trophy,
    },
    {
      id: 'reports' as ActiveTab,
      label: 'Báo cáo & Xuất hồ sơ (Excel/Word/PDF)',
      icon: FileSpreadsheet,
    },
    ...(isAdminOrBGH
      ? [
          {
            id: 'settings' as ActiveTab,
            label: 'Cấu hình & Phân quyền',
            icon: Settings,
          },
        ]
      : []),
  ];

  return (
    <nav className="no-print bg-white border-b border-slate-200 sticky top-16 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center space-x-1 sm:space-x-2 py-2 overflow-x-auto no-scrollbar">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onChangeTab(tab.id)}
                className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all whitespace-nowrap shrink-0 ${
                  isActive
                    ? 'bg-teal-900 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-amber-400' : 'text-slate-500'}`} />
                <span>{tab.label}</span>
                {tab.badge && (
                  <span className={`text-[11px] font-mono-numbers px-2 py-0.5 rounded-full ${
                    tab.isUrgent
                      ? 'bg-rose-600 text-white font-black animate-pulse shadow-xs'
                      : isActive 
                      ? 'bg-amber-500 text-slate-950 font-bold' 
                      : 'bg-rose-100 text-rose-700 font-bold'
                  }`}>
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};
