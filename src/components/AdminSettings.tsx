import React, { useState } from 'react';
import { 
  Settings, Clock, UserPlus, Shield, DoorOpen, Plus, 
  Trash2, Edit, Save, CheckCircle2, RotateCcw, AlertTriangle, Key, Laptop
} from 'lucide-react';
import { Room, SystemSettings, AuthorizedUser, UserRole } from '../types';

interface AdminSettingsProps {
  settings: SystemSettings;
  onUpdateSettings: (settings: SystemSettings) => void;
  rooms: Room[];
  onUpdateRooms: (rooms: Room[]) => void;
  onResetData: () => void;
  onOpenDesktopModal: () => void;
}

export const AdminSettings: React.FC<AdminSettingsProps> = ({
  settings,
  onUpdateSettings,
  rooms,
  onUpdateRooms,
  onResetData,
  onOpenDesktopModal,
}) => {
  // General settings state
  const [schoolName, setSchoolName] = useState(settings.schoolName);
  const [managerName, setManagerName] = useState(settings.managerName);
  const [cutoffMorning, setCutoffMorning] = useState(settings.cutoffMorning);
  const [cutoffEvening, setCutoffEvening] = useState(settings.cutoffEvening);
  const [academicYear, setAcademicYear] = useState(settings.academicYear);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  // User management state
  const [usersList, setUsersList] = useState<AuthorizedUser[]>(settings.authorizedUsers);
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserName, setNewUserName] = useState('');
  const [newUserRole, setNewUserRole] = useState<UserRole>('room_teacher');
  const [newUserRoom, setNewUserRoom] = useState('P01');

  // Room modal state
  const [showRoomModal, setShowRoomModal] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  const [roomIdInput, setRoomIdInput] = useState('');
  const [roomNameInput, setRoomNameInput] = useState('');
  const [roomGenderInput, setRoomGenderInput] = useState<'nam' | 'nu'>('nam');
  const [roomCapacityInput, setRoomCapacityInput] = useState(15);
  const [roomZoneInput, setRoomZoneInput] = useState('Khu A - Tầng 1');

  const handleSaveGeneral = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: SystemSettings = {
      ...settings,
      schoolName,
      managerName,
      cutoffMorning,
      cutoffEvening,
      academicYear,
      authorizedUsers: usersList,
    };
    onUpdateSettings(updated);
    setSaveSuccessMsg('Đã lưu cấu hình thời gian và hệ thống thành công!');
    setTimeout(() => setSaveSuccessMsg(null), 3000);
  };

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserEmail.trim() || !newUserName.trim()) return;

    const newUser: AuthorizedUser = {
      email: newUserEmail.trim().toLowerCase(),
      name: newUserName.trim(),
      role: newUserRole,
      assignedRoomId: newUserRole === 'room_teacher' ? newUserRoom : undefined,
    };

    const updated = [...usersList.filter(u => u.email !== newUser.email), newUser];
    setUsersList(updated);
    onUpdateSettings({
      ...settings,
      authorizedUsers: updated,
    });

    // Also update room's assigned teacher if applicable
    if (newUserRole === 'room_teacher' && newUserRoom) {
      const updatedRooms = rooms.map(r => r.id === newUserRoom ? {
        ...r,
        assignedTeacherEmail: newUser.email,
        assignedTeacherName: newUser.name,
      } : r);
      onUpdateRooms(updatedRooms);
    }

    setNewUserEmail('');
    setNewUserName('');
    setSaveSuccessMsg(`Đã cấp quyền cho ${newUser.name} (${newUser.email}) thành công!`);
    setTimeout(() => setSaveSuccessMsg(null), 3000);
  };

  const handleRemoveUser = (email: string) => {
    if (email === settings.adminEmail) {
      alert('Không thể xóa quyền của Trưởng ban quản trị tối cao!');
      return;
    }
    const updated = usersList.filter(u => u.email !== email);
    setUsersList(updated);
    onUpdateSettings({
      ...settings,
      authorizedUsers: updated,
    });
  };

  const openAddRoomModal = () => {
    const nextNum = rooms.length + 1;
    const nextId = `P${String(nextNum).padStart(2, '0')}`;
    setEditingRoom(null);
    setRoomIdInput(nextId);
    setRoomNameInput(`Phòng ${String(nextNum).padStart(2, '0')}`);
    setRoomGenderInput('nam');
    setRoomCapacityInput(15);
    setRoomZoneInput('Khu A - Tầng 1');
    setShowRoomModal(true);
  };

  const openEditRoomModal = (room: Room) => {
    setEditingRoom(room);
    setRoomIdInput(room.id);
    setRoomNameInput(room.name);
    setRoomGenderInput(room.gender);
    setRoomCapacityInput(room.capacity);
    setRoomZoneInput(room.buildingZone);
    setShowRoomModal(true);
  };

  const handleSaveRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingRoom) {
      const updated = rooms.map(r => r.id === editingRoom.id ? {
        ...r,
        name: roomNameInput,
        gender: roomGenderInput,
        capacity: Number(roomCapacityInput),
        buildingZone: roomZoneInput,
      } : r);
      onUpdateRooms(updated);
    } else {
      const newRoom: Room = {
        id: roomIdInput,
        name: roomNameInput,
        gender: roomGenderInput,
        capacity: Number(roomCapacityInput),
        buildingZone: roomZoneInput,
        assignedTeacherName: 'Chưa phân công',
      };
      onUpdateRooms([...rooms, newRoom]);
    }
    setShowRoomModal(false);
  };

  const handleDeleteRoom = (roomId: string) => {
    if (confirm(`Xác nhận xóa ${roomId}? Hãy chắc chắn không còn học sinh trong phòng này.`)) {
      onUpdateRooms(rooms.filter(r => r.id !== roomId));
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-teal-950 via-slate-900 to-teal-900 rounded-2xl p-6 text-white border border-teal-800 shadow-md">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-teal-800 rounded-xl text-amber-400">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">
              Khu Vực Quản Trị Tối Cao (Thầy Nguyễn Trọng Nghĩa)
            </h1>
            <p className="text-xs text-slate-300 mt-0.5">
              Toàn quyền thiết lập quy định giờ giấc điểm danh sáng tối, số lượng phòng ở học sinh, và phân quyền tài khoản Gmail.
            </p>
          </div>
        </div>
      </div>

      {saveSuccessMsg && (
        <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-semibold flex items-center gap-2 shadow-xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{saveSuccessMsg}</span>
        </div>
      )}

      {/* Grid: 2 Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* Left Column (6 cols): System Settings & Cutoff Times */}
        <div className="lg:col-span-6 bg-white rounded-xl border border-slate-200/90 shadow-2xs p-5 space-y-4">
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2 border-b pb-3">
            <Clock className="w-4 h-4 text-teal-700" />
            <span>Quy Định Giờ Điểm Danh & Thông Tin Trường</span>
          </h2>

          <form onSubmit={handleSaveGeneral} className="space-y-3 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Tên đơn vị trường học</label>
              <input
                type="text"
                value={schoolName}
                onChange={(e) => setSchoolName(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg font-medium"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Họ tên Trưởng ban Quản lý nội trú</label>
              <input
                type="text"
                value={managerName}
                onChange={(e) => setManagerName(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg font-medium"
              />
            </div>

            <div className="grid grid-cols-2 gap-3 p-3 bg-amber-50/50 rounded-xl border border-amber-200">
              <div>
                <label className="block font-bold text-amber-950 mb-1">
                  Giờ chốt điểm danh SÁNG *
                </label>
                <input
                  type="time"
                  value={cutoffMorning}
                  onChange={(e) => setCutoffMorning(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-amber-300 rounded-lg font-bold font-mono-numbers text-slate-900"
                />
                <span className="text-[11px] text-amber-800 block mt-1">Nộp sau giờ này tính nộp trễ</span>
              </div>

              <div>
                <label className="block font-bold text-amber-950 mb-1">
                  Giờ chốt điểm danh TỐI *
                </label>
                <input
                  type="time"
                  value={cutoffEvening}
                  onChange={(e) => setCutoffEvening(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-amber-300 rounded-lg font-bold font-mono-numbers text-slate-900"
                />
                <span className="text-[11px] text-amber-800 block mt-1">Học sinh vào phòng trước giờ này</span>
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Năm học</label>
              <input
                type="text"
                value={academicYear}
                onChange={(e) => setAcademicYear(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg font-medium"
              />
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                className="flex items-center gap-1.5 bg-teal-900 hover:bg-teal-800 text-white font-bold px-4 py-2 rounded-xl text-xs transition-colors shadow-sm"
              >
                <Save className="w-3.5 h-3.5 text-amber-400" />
                <span>Lưu Cấu Hình Giờ Giấc</span>
              </button>
            </div>
          </form>
        </div>

        {/* Right Column (6 cols): User & Role Permission Management (Cấp quyền bằng Gmail) */}
        <div className="lg:col-span-6 bg-white rounded-xl border border-slate-200/90 shadow-2xs p-5 space-y-4">
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2 border-b pb-3">
            <UserPlus className="w-4 h-4 text-teal-700" />
            <span>Phân Quyền Sử Dụng App Cho Giáo Viên & Cán Bộ</span>
          </h2>

          {/* Add User Form */}
          <form onSubmit={handleAddUser} className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-xs">
            <div className="font-semibold text-slate-800">Cấp Quyền Cho Tài Khoản Gmail Mới:</div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <input
                type="email"
                required
                placeholder="Gmail giáo viên (vd: thaynam@gmail.com)"
                value={newUserEmail}
                onChange={(e) => setNewUserEmail(e.target.value)}
                className="px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg"
              />
              <input
                type="text"
                required
                placeholder="Họ và tên (vd: Thầy Hồ Văn Nam)"
                value={newUserName}
                onChange={(e) => setNewUserName(e.target.value)}
                className="px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <select
                value={newUserRole}
                onChange={(e) => setNewUserRole(e.target.value as UserRole)}
                className="px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg font-semibold"
              >
                <option value="room_teacher">Giáo viên trực phòng</option>
                <option value="supervisor">Ban Quản sinh</option>
                <option value="board_director">Ban Giám hiệu (BGH)</option>
                <option value="admin">Quản trị viên (Admin)</option>
              </select>

              {newUserRole === 'room_teacher' ? (
                <select
                  value={newUserRoom}
                  onChange={(e) => setNewUserRoom(e.target.value)}
                  className="px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg"
                >
                  {rooms.map((r) => (
                    <option key={r.id} value={r.id}>
                      Phụ trách {r.name}
                    </option>
                  ))}
                </select>
              ) : (
                <div className="text-[11px] text-slate-400 flex items-center px-2">
                  Toàn quyền giám sát
                </div>
              )}
            </div>

            <button
              type="submit"
              className="w-full bg-slate-800 hover:bg-slate-700 text-white font-bold py-2 rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-xs"
            >
              <Key className="w-3.5 h-3.5 text-amber-400" />
              <span>Cấp Quyền Đăng Nhập Gmail</span>
            </button>
          </form>

          {/* List of Authorized Users */}
          <div className="space-y-1.5 max-h-60 overflow-y-auto">
            {usersList.map((user) => (
              <div
                key={user.email}
                className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-200 text-xs"
              >
                <div>
                  <div className="font-bold text-slate-900 flex items-center gap-1.5">
                    <span>{user.name}</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-200 text-slate-700 font-semibold">
                      {user.role === 'admin' ? 'Trưởng ban' : user.role === 'board_director' ? 'BGH' : user.role === 'supervisor' ? 'Quản sinh' : `Trực ${user.assignedRoomId}`}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400 font-mono-numbers">{user.email}</div>
                </div>

                {user.email !== settings.adminEmail && (
                  <button
                    onClick={() => handleRemoveUser(user.email)}
                    className="p-1 text-slate-400 hover:text-rose-600 rounded hover:bg-rose-50"
                    title="Thu hồi quyền"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ))}
          </div>

        </div>

      </div>

      {/* Room Inventory Management (Tự nhập số lượng phòng ở học sinh) */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-3">
          <div>
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <DoorOpen className="w-4 h-4 text-teal-700" />
              <span>Quản Lý Danh Mục Phòng Ở ({rooms.length} phòng hiện có)</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Trưởng ban có thể tự thêm số lượng phòng, đổi tên, thay đổi sức chứa (14 - 15 em) hoặc dãy nhà
            </p>
          </div>

          <button
            onClick={openAddRoomModal}
            className="flex items-center gap-1.5 bg-teal-900 hover:bg-teal-800 text-white font-bold px-3 py-1.5 rounded-xl text-xs transition-colors self-start sm:self-auto"
          >
            <Plus className="w-3.5 h-3.5 text-amber-400" />
            <span>Thêm phòng ở mới</span>
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          {rooms.map((room) => (
            <div
              key={room.id}
              className="p-3 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:border-teal-700 transition-all text-xs relative group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                    room.gender === 'nam' ? 'bg-blue-100 text-blue-800' : 'bg-rose-100 text-rose-800'
                  }`}>
                    {room.id} ({room.gender === 'nam' ? 'Nam' : 'Nữ'})
                  </span>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => openEditRoomModal(room)}
                      className="p-0.5 hover:text-teal-800"
                      title="Sửa phòng"
                    >
                      <Edit className="w-3 h-3" />
                    </button>
                    {rooms.length > 25 && (
                      <button
                        onClick={() => handleDeleteRoom(room.id)}
                        className="p-0.5 hover:text-rose-600"
                        title="Xóa phòng"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>

                <div className="font-bold text-slate-900 mt-1 truncate">
                  {room.name}
                </div>
                <div className="text-[11px] text-slate-500 font-mono-numbers">
                  Định mức: {room.capacity} em
                </div>
                <div className="text-[10px] text-slate-400 truncate">
                  {room.assignedTeacherName || 'Chưa gán GV'}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Desktop App Setup Card */}
      <div className="p-4 sm:p-5 bg-gradient-to-r from-teal-950 via-slate-900 to-teal-900 rounded-xl border border-teal-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-white">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-teal-800 rounded-xl text-amber-400">
            <Laptop className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">
              Cài Đặt Phần Mềm Lên Màn Hình Laptop (File .exe / Desktop Shortcut)
            </h3>
            <p className="text-xs text-slate-300 mt-0.5">
              Tạo biểu tượng phần mềm ngoài màn hình Desktop và tải file khởi động nhanh cho máy tính xách tay của Thầy
            </p>
          </div>
        </div>

        <button
          onClick={onOpenDesktopModal}
          className="flex items-center gap-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold px-4 py-2 rounded-xl text-xs transition-colors shadow-sm self-start sm:self-auto shrink-0"
        >
          <Laptop className="w-4 h-4" />
          <span>Cài Đặt Lên Laptop (.exe)</span>
        </button>
      </div>

      {/* Database Reset Action */}
      <div className="p-4 bg-slate-100 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div>
          <span className="font-bold text-slate-800">Khôi phục dữ liệu mẫu ban đầu:</span>
          <p className="text-slate-500 mt-0.5">Đặt lại 25 phòng tiêu chuẩn, 365 học sinh Trà Đốc và lịch sử mẫu để trải nghiệm hệ thống</p>
        </div>
        <button
          onClick={() => {
            if (confirm('Khôi phục lại dữ liệu mẫu 25 phòng Trường PTDTBT THCS Trà Đốc?')) {
              onResetData();
            }
          }}
          className="flex items-center gap-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold px-3 py-1.5 rounded-lg transition-colors self-start sm:self-auto"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Khôi phục dữ liệu gốc</span>
        </button>
      </div>

      {/* Add / Edit Room Modal */}
      {showRoomModal && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full border border-slate-200 shadow-2xl p-6">
            <h3 className="text-base font-bold text-slate-900 mb-4">
              {editingRoom ? `Sửa Thông Tin ${editingRoom.id}` : 'Thêm Phòng Ở Mới'}
            </h3>

            <form onSubmit={handleSaveRoom} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Mã phòng</label>
                <input
                  type="text"
                  required
                  disabled={!!editingRoom}
                  value={roomIdInput}
                  onChange={(e) => setRoomIdInput(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg font-mono-numbers font-bold"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Tên hiển thị</label>
                <input
                  type="text"
                  required
                  value={roomNameInput}
                  onChange={(e) => setRoomNameInput(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Dành cho</label>
                  <select
                    value={roomGenderInput}
                    onChange={(e) => setRoomGenderInput(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg"
                  >
                    <option value="nam">Học sinh Nam</option>
                    <option value="nu">Học sinh Nữ</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Sức chứa (14-15 em)</label>
                  <input
                    type="number"
                    min="1"
                    max="30"
                    value={roomCapacityInput}
                    onChange={(e) => setRoomCapacityInput(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg font-mono-numbers"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Khu vực / Tầng</label>
                <input
                  type="text"
                  value={roomZoneInput}
                  onChange={(e) => setRoomZoneInput(e.target.value)}
                  placeholder="Ví dụ: Khu A - Tầng 1"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowRoomModal(false)}
                  className="px-4 py-2 rounded-lg text-slate-600 hover:bg-slate-100 font-semibold"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-teal-900 hover:bg-teal-800 text-white font-bold"
                >
                  {editingRoom ? 'Lưu phòng' : 'Tạo phòng'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
