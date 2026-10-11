import React, { useState } from 'react';
import { 
  Laptop, Download, Monitor, CheckCircle2, X, Sparkles, 
  ArrowRight, ShieldCheck, ExternalLink, HelpCircle
} from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface DesktopAppModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DesktopAppModal: React.FC<DesktopAppModalProps> = ({ isOpen, onClose }) => {
  const { isInstallable, isInstalled, install, isWindows } = usePWAInstall();
  const [downloadSuccess, setDownloadSuccess] = useState<string | null>(null);

  if (!isOpen) return null;

  // Generate downloadable Windows Batch Launcher file (.bat)
  const handleDownloadLauncher = () => {
    const currentUrl = window.location.href;
    const batchContent = `@echo off
:: =========================================================================
:: PHAN MEM QUAN LY NOI TRU HOC SINH - TRUONG PTDTBT THCS XA TRA DOC
:: Truong ban quan ly: Thay Nguyen Trong Nghia
:: =========================================================================
title Quan Ly Noi Tru PTDTBT THCS Tra Doc

echo Dang khoi dong phan mem Quan Ly Noi Tru Tra Doc tren laptop...

:: Thu mo bang Microsoft Edge o che do cua so ung dung doc lap (App Mode - nhu file .exe)
start msedge.exe --app="${currentUrl}"

if %errorlevel% neq 0 (
  :: Neu khong co Edge, thu mo bang Google Chrome o che do cua so ung dung
  start chrome.exe --app="${currentUrl}"
)

if %errorlevel% neq 0 (
  :: Neu khong co Chrome, mo bang trinh duyet mac dinh cua may
  start "" "${currentUrl}"
)

exit
`;

    const blob = new Blob([batchContent], { type: 'application/x-bat' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'Chay_App_Noi_Tru_Tra_Doc.bat';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    setDownloadSuccess('bat');
    setTimeout(() => setDownloadSuccess(null), 5000);
  };

  // Generate Windows .url Desktop Shortcut
  const handleDownloadShortcutUrl = () => {
    const currentUrl = window.location.href;
    const urlContent = `[InternetShortcut]
URL=${currentUrl}
IconIndex=0
IconFile=C:\\Windows\\System32\\shell32.dll
HotKey=0
IDList=
[{000214A0-0000-0000-C000-000000000046}]
Prop3=19,11
`;

    const blob = new Blob([urlContent], { type: 'application/internet-shortcut' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'Loi_Tat_Noi_Tru_Tra_Doc.url';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    setDownloadSuccess('url');
    setTimeout(() => setDownloadSuccess(null), 5000);
  };

  // Generate Windows PowerShell packaging script to build standalone .exe
  const handleDownloadExeBuilder = () => {
    const currentUrl = window.location.href;
    const psContent = `# =========================================================================
# SCRIPT HO TRO TAO FILE CHAY / DONG GOI CHO LAPTOP WINDOWS
# TRUONG PTDTBT THCS XA TRA DOC - THAY NGUYEN TRONG NGHIA
# =========================================================================

Write-Host "Dang tao loi tat ung dung Ngoai Man Hinh Desktop..." -ForegroundColor Cyan

$WshShell = New-Object -comObject WScript.Shell
$DesktopPath = [System.Environment]::GetFolderPath([System.Environment+SpecialFolder]::Desktop)
$ShortcutPath = Join-Path -Path $DesktopPath -ChildPath "Quan Ly Noi Tru Tra Doc.lnk"

# Tao Shortcut tro thang vao Edge o che do App doc lap (Window App)
$Shortcut = $WshShell.CreateShortcut($ShortcutPath)
$Shortcut.TargetPath = "msedge.exe"
$Shortcut.Arguments = "--app=${currentUrl}"
$Shortcut.Description = "He thong Quan Ly Noi Tru PTDTBT THCS Tra Doc - Truong ban Nguyen Trong Nghia"
$Shortcut.Save()

Write-Host "DA TAO THANH CONG BIEU TUONG NGOAI MAN HINH CHINH (DESKTOP)!" -ForegroundColor Green
Write-Host "Thay chi can ra ngoai Desktop va nhap dup vao bieu tuong 'Quan Ly Noi Tru Tra Doc' de mo app." -ForegroundColor Yellow
Pause
`;

    const blob = new Blob([psContent], { type: 'application/x-powershell' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'Tao_Bieu_Tuong_Desktop_Tu_Dong.ps1';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    setDownloadSuccess('exe');
    setTimeout(() => setDownloadSuccess(null), 5000);
  };

  return (
    <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 z-50">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col border border-slate-200 shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-900 text-white">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-teal-800 rounded-xl text-amber-400">
              <Laptop className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold">
                Cài Đặt Phần Mềm Chạy Trên Laptop Của Thầy
              </h2>
              <p className="text-xs text-slate-300">
                Mở ứng dụng trực tiếp từ màn hình Desktop (Màn hình chính) như một file .exe độc lập
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 sm:p-6 flex-1 overflow-y-auto space-y-5 text-xs sm:text-sm">
          
          {/* Method 1: 1-Click Native Desktop App Install (PWA) */}
          <div className="p-4 sm:p-5 rounded-2xl bg-teal-50/70 border border-teal-200 space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <span className="text-[11px] font-bold text-teal-800 uppercase tracking-wider bg-teal-100 px-2 py-0.5 rounded">
                  Cách 1: Khuyên dùng nhất (Nhanh nhất & Tự động)
                </span>
                <h3 className="font-extrabold text-slate-900 text-sm sm:text-base mt-1">
                  Cài đặt trực tiếp thành Ứng dụng Desktop trên Laptop
                </h3>
                <p className="text-xs text-slate-600 mt-1">
                  Windows (Chrome / Edge / Cốc Cốc) sẽ tự động tạo biểu tượng ngoài màn hình Desktop và ghim vào thanh Taskbar. Khi mở, app chạy trong cửa sổ độc lập như file `.exe`, không hiện thanh web.
                </p>
              </div>
            </div>

            {isInstalled ? (
              <div className="p-3 bg-emerald-100 text-emerald-900 rounded-xl font-bold flex items-center gap-2 text-xs">
                <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                <span>Phần mềm đã được cài đặt trên máy tính của Thầy! Có thể mở từ màn hình Desktop hoặc menu Start.</span>
              </div>
            ) : isInstallable ? (
              <button
                onClick={async () => {
                  const res = await install();
                  if (res) onClose();
                }}
                className="w-full sm:w-auto px-5 py-2.5 bg-teal-900 hover:bg-teal-800 text-white font-bold rounded-xl flex items-center justify-center gap-2 shadow-sm transition-all"
              >
                <Monitor className="w-4 h-4 text-amber-400" />
                <span>Bấm vào đây để Cài đặt lên Laptop ngay</span>
              </button>
            ) : (
              <div className="p-3 bg-amber-50/80 border border-amber-200 rounded-xl text-amber-900 text-xs">
                <strong>Cách thao tác trên trình duyệt của Thầy:</strong> Bấm vào biểu tượng <strong>Cài đặt (Install)</strong> hình máy tính trên thanh địa chỉ của Chrome/Edge, hoặc bấm menu <strong>⋮ (3 chấm) ➔ Cài đặt ứng dụng này</strong>.
              </div>
            )}
          </div>

          {/* Method 2: Download Windows Launcher Script (.bat file) & Shortcut (.url) */}
          <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
            <div>
              <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider bg-slate-200 px-2 py-0.5 rounded">
                Cách 2: Tải file chạy Shortcut (.bat hoặc .url) về màn hình Laptop
              </span>
              <h3 className="font-bold text-slate-900 text-sm sm:text-base mt-1">
                Tải file chạy trực tiếp `Chay_App_Noi_Tru_Tra_Doc.bat` hoặc Lối tắt Desktop
              </h3>
              <p className="text-xs text-slate-600 mt-1">
                Thầy tải file này về và kéo ra màn hình Desktop. Mỗi lần làm việc, chỉ cần <strong>nhấp đúp chuột (Double click)</strong> để phần mềm tự khởi động toàn màn hình như file `.exe`!
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <button
                onClick={handleDownloadLauncher}
                className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl flex items-center gap-1.5 shadow-xs transition-all text-xs"
              >
                <Download className="w-3.5 h-3.5 text-amber-400" />
                <span>Tải File .BAT Chạy Nhanh</span>
              </button>

              <button
                onClick={handleDownloadShortcutUrl}
                className="px-3.5 py-2 bg-teal-800 hover:bg-teal-700 text-white font-bold rounded-xl flex items-center gap-1.5 shadow-xs transition-all text-xs"
              >
                <Download className="w-3.5 h-3.5 text-amber-300" />
                <span>Tải Lối Tắt Desktop (.url)</span>
              </button>

              <button
                onClick={handleDownloadExeBuilder}
                className="px-3.5 py-2 bg-blue-800 hover:bg-blue-700 text-white font-bold rounded-xl flex items-center gap-1.5 shadow-xs transition-all text-xs"
                title="Tạo icon ngoài màn hình Desktop tự động"
              >
                <Download className="w-3.5 h-3.5 text-amber-300" />
                <span>Tạo Icon Desktop Tự Động (.ps1)</span>
              </button>
            </div>

            {downloadSuccess && (
              <div className="p-2.5 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-xl text-xs font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>
                  {downloadSuccess === 'bat' && 'Đã tải file Chay_App_Noi_Tru_Tra_Doc.bat về thư mục Downloads!'}
                  {downloadSuccess === 'url' && 'Đã tải file Loi_Tat_Noi_Tru_Tra_Doc.url về thư mục Downloads!'}
                  {downloadSuccess === 'exe' && 'Đã tải script Tao_Bieu_Tuong_Desktop_Tu_Dong.ps1 thành công!'}
                </span>
              </div>
            )}
          </div>

          {/* Method 3: Manual 2-step guide for Chrome/Edge */}
          <div className="p-4 rounded-xl border border-slate-200 text-xs space-y-2">
            <h4 className="font-bold text-slate-800 flex items-center gap-1.5">
              <HelpCircle className="w-3.5 h-3.5 text-teal-700" />
              <span>Hướng dẫn tạo lối tắt ngoài màn hình chính (2 bước đơn giản):</span>
            </h4>
            <ol className="list-decimal list-inside space-y-1 text-slate-600 pl-1">
              <li>
                Trên trình duyệt Chrome/Edge của laptop, bấm vào nút <strong>⋮ (3 chấm)</strong> ở góc trên cùng bên phải.
              </li>
              <li>
                Chọn mục <strong>Lưu và chia sẻ</strong> (Save and share) ➔ Chọn <strong>Tạo lối tắt... (Create shortcut...)</strong>.
              </li>
              <li>
                Đánh dấu tích vào ô <strong>"Mở dưới dạng cửa sổ" (Open as window)</strong> ➔ Bấm <strong>Tạo (Create)</strong>.
              </li>
            </ol>
            <p className="text-[11px] text-teal-800 font-semibold pt-1">
              👉 Biểu tượng logo Trường Trà Đốc sẽ xuất hiện ngay trên màn hình Desktop máy tính của Thầy để bấm vào dùng hằng ngày!
            </p>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="text-xs text-slate-500">
            Hỗ trợ máy tính Windows 10, Windows 11, MacOS và điện thoại thông minh
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-teal-900 hover:bg-teal-800 text-white font-bold rounded-xl text-xs transition-colors"
          >
            Đã hiểu, đóng hộp thoại
          </button>
        </div>

      </div>
    </div>
  );
};
