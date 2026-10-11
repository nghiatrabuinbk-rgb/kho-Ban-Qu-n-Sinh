import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import { 
  Users, Upload, FileSpreadsheet, CheckCircle2, AlertTriangle, 
  Trash2, X, Download, Copy, Sparkles, Filter
} from 'lucide-react';
import { Room, Student, StudentStatus, Gender } from '../types';

interface BulkStudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentRoom: Room;
  rooms: Room[];
  existingStudents: Student[];
  onAddBulkStudents: (newStudents: Student[]) => void;
}

export const BulkStudentModal: React.FC<BulkStudentModalProps> = ({
  isOpen,
  onClose,
  currentRoom,
  rooms,
  existingStudents,
  onAddBulkStudents,
}) => {
  const [activeTab, setActiveTab] = useState<'paste' | 'file'>('paste');
  const [pasteText, setPasteText] = useState('');
  const [defaultStatus, setDefaultStatus] = useState<StudentStatus>('dang_o');
  const [destinationMode, setDestinationMode] = useState<'current_room' | 'auto_distribute'>('current_room');
  const [targetRoomId, setTargetRoomId] = useState(currentRoom.id);
  const [parsedStudents, setParsedStudents] = useState<Partial<Student>[]>([]);
  const [parseError, setParseError] = useState<string | null>(null);

  if (!isOpen) return null;

  // Sample data to quickly demo
  const sampleData = `Hồ Văn Tuấn	6A	nam	Thôn 1	Nóc Ông Tuấn	Con ông Hồ Văn Hòa & bà Đinh Thị Lan	0914123456	dang_o
Đinh Thị Thùy	6A	nu	Thôn 2	Nóc Ông Kỷ	Con ông Đinh Văn Thắng & bà Alăng Thị Mai	0905654321	dang_o
Alăng Văn Khang	7B	nam	Thôn Khe Chữ	Nóc Măng Xoan	Con ông Alăng Dũng & bà Zơrâm Thị Hồng	0988776655	dac_biet
Zơrâm Thị Hạnh	8A	nu	Thôn 3	Nóc Ông Lăng	Con ông Zơrâm Bảy & bà Bríu Thị Cúc	0977112233	dang_o
Bríu Văn Lộc	9A	nam	Thôn 4	Nóc Ông Thọ	Con ông Bríu Đạt & bà Hồ Thị Hoa	0935998877	tam_nghi`;

  const handlePasteSample = () => {
    setPasteText(sampleData);
    parseRawText(sampleData);
  };

  const parseRawText = (text: string) => {
    setParseError(null);
    const lines = text.trim().split('\n').filter(line => line.trim().length > 0);
    if (lines.length === 0) {
      setParsedStudents([]);
      return;
    }

    const results: Partial<Student>[] = [];

    lines.forEach((line, idx) => {
      // Split by tab, semicolon, comma or pipe
      let parts = line.split('\t');
      if (parts.length < 3) parts = line.split('|');
      if (parts.length < 3) parts = line.split(';');
      if (parts.length < 3) parts = line.split(',');

      parts = parts.map(p => p.trim());
      if (parts.length >= 1 && parts[0]) {
        const fullName = parts[0];
        const grade = parts[1] || '6A';
        let rawGender = (parts[2] || '').toLowerCase();
        const gender: Gender = rawGender.includes('nu') || rawGender.includes('nữ') || rawGender === 'f' ? 'nu' : 'nam';
        const village = parts[3] || 'Thôn 1';
        const nocHamlet = parts[4] || 'Nóc Ông Tuấn';
        const parentsName = parts[5] || 'Chưa cập nhật';
        const phone = parts[6] || '0900000000';
        let status: StudentStatus = defaultStatus;
        if (parts[7]) {
          const s = parts[7].toLowerCase();
          if (s.includes('tam') || s.includes('nghi')) status = 'tam_nghi';
          else if (s.includes('chuyen') || s.includes('thoi')) status = 'chuyen_truong';
          else if (s.includes('dac') || s.includes('ngheo')) status = 'dac_biet';
          else status = 'dang_o';
        }

        results.push({
          id: `STU_IMP_${Date.now()}_${idx}`,
          fullName,
          grade,
          gender,
          village,
          nocHamlet,
          parentsName,
          phone,
          status,
        });
      }
    });

    if (results.length === 0) {
      setParseError('Không phân tích được danh sách học sinh. Vui lòng kiểm tra định dạng.');
    } else {
      setParsedStudents(results);
    }
  };

  // Handle Excel file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json(ws, { header: 1 }) as any[][];

        if (!data || data.length === 0) {
          setParseError('File trống hoặc không đọc được dữ liệu.');
          return;
        }

        // Determine if first row is header
        let startIndex = 0;
        const firstRowStr = data[0].join(' ').toLowerCase();
        if (firstRowStr.includes('họ') || firstRowStr.includes('tên') || firstRowStr.includes('name')) {
          startIndex = 1;
        }

        const results: Partial<Student>[] = [];
        for (let i = startIndex; i < data.length; i++) {
          const row = data[i];
          if (!row || row.length === 0 || !row[0]) continue;

          const fullName = String(row[0] || '').trim();
          if (!fullName) continue;

          const grade = String(row[1] || '6A').trim();
          const rawGender = String(row[2] || '').toLowerCase();
          const gender: Gender = rawGender.includes('nu') || rawGender.includes('nữ') ? 'nu' : 'nam';
          const village = String(row[3] || 'Thôn 1').trim();
          const nocHamlet = String(row[4] || 'Nóc Ông Tuấn').trim();
          const parentsName = String(row[5] || 'Chưa cập nhật').trim();
          const phone = String(row[6] || '0900000000').trim();

          let status: StudentStatus = defaultStatus;
          if (row[7]) {
            const s = String(row[7]).toLowerCase();
            if (s.includes('tam')) status = 'tam_nghi';
            else if (s.includes('chuyen')) status = 'chuyen_truong';
            else if (s.includes('dac')) status = 'dac_biet';
          }

          results.push({
            id: `STU_IMP_${Date.now()}_${i}`,
            fullName,
            grade,
            gender,
            village,
            nocHamlet,
            parentsName,
            phone,
            status,
          });
        }

        setParsedStudents(results);
        setParseError(null);
      } catch (err) {
        setParseError('Lỗi xử lý file Excel. Vui lòng đảm bảo file đúng định dạng .xlsx hoặc .csv.');
      }
    };
    reader.readAsBinaryString(file);
  };

  // Download Excel template
  const handleDownloadTemplate = () => {
    const wb = XLSX.utils.book_new();
    const templateData = [
      ['Họ và tên', 'Lớp', 'Giới tính (nam/nu)', 'Thôn', 'Nóc ông bà', 'Con ông bà (Cha mẹ)', 'Số điện thoại', 'Trạng thái (dang_o/tam_nghi/chuyen_truong/dac_biet)'],
      ['Hồ Văn Tuấn', '6A', 'nam', 'Thôn 1', 'Nóc Ông Tuấn', 'Con ông Hồ Văn Hòa & bà Đinh Thị Lan', '0914123456', 'dang_o'],
      ['Đinh Thị Thùy', '6A', 'nu', 'Thôn 2', 'Nóc Ông Kỷ', 'Con ông Đinh Văn Thắng & bà Alăng Thị Mai', '0905654321', 'dang_o'],
      ['Alăng Văn Khang', '7B', 'nam', 'Thôn Khe Chữ', 'Nóc Măng Xoan', 'Con ông Alăng Dũng & bà Zơrâm Thị Hồng', '0988776655', 'dac_biet'],
    ];
    const ws = XLSX.utils.aoa_to_sheet(templateData);
    XLSX.utils.book_append_sheet(wb, ws, 'Mau_Nhap_Hoc_Sinh');
    XLSX.writeFile(wb, 'Mau_Nhap_Hang_Loat_Hoc_Sinh_Tra_Doc.xlsx');
  };

  // Confirm and save students
  const handleConfirmSave = () => {
    if (parsedStudents.length === 0) return;

    const finalStudents: Student[] = [];

    // Helper to find available rooms
    let maleRoomIdx = 0;
    let femaleRoomIdx = 0;
    const maleRooms = rooms.filter(r => r.gender === 'nam');
    const femaleRooms = rooms.filter(r => r.gender === 'nu');

    parsedStudents.forEach((p, idx) => {
      let assignedRoom = targetRoomId;

      if (destinationMode === 'auto_distribute') {
        if (p.gender === 'nu' && femaleRooms.length > 0) {
          assignedRoom = femaleRooms[femaleRoomIdx % femaleRooms.length].id;
          femaleRoomIdx++;
        } else if (maleRooms.length > 0) {
          assignedRoom = maleRooms[maleRoomIdx % maleRooms.length].id;
          maleRoomIdx++;
        }
      }

      finalStudents.push({
        id: `STU_${String(existingStudents.length + idx + 1).padStart(3, '0')}`,
        roomId: assignedRoom,
        fullName: p.fullName || 'Học sinh',
        gender: p.gender || 'nam',
        grade: p.grade || '6A',
        village: p.village || 'Thôn 1',
        nocHamlet: p.nocHamlet || 'Nóc Ông Tuấn',
        parentsName: p.parentsName || 'Chưa cập nhật',
        phone: p.phone || '0900000000',
        status: p.status || defaultStatus,
        notes: undefined,
      });
    });

    onAddBulkStudents(finalStudents);
    onClose();
  };

  const handleUpdateStudentStatus = (index: number, newStatus: StudentStatus) => {
    setParsedStudents((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], status: newStatus };
      return copy;
    });
  };

  const handleApplyStatusToAll = (status: StudentStatus) => {
    setDefaultStatus(status);
    setParsedStudents((prev) =>
      prev.map((s) => ({
        ...s,
        status,
      }))
    );
  };

  const getStatusBadge = (status?: StudentStatus) => {
    switch (status) {
      case 'tam_nghi':
        return <span className="text-[10px] bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded font-semibold">Tạm nghỉ / Điều trị</span>;
      case 'chuyen_truong':
        return <span className="text-[10px] bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded font-semibold">Chuyển trường / Thôi học</span>;
      case 'dac_biet':
        return <span className="text-[10px] bg-purple-100 text-purple-800 px-1.5 py-0.5 rounded font-semibold">Hoàn cảnh đặc biệt</span>;
      default:
        return <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded font-semibold">Đang ở nội trú</span>;
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 z-50">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] flex flex-col border border-slate-200 shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-900 text-white">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-teal-800 rounded-lg text-amber-400">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold">Thêm Hàng Loạt Học Sinh Nội Trú</h2>
              <p className="text-xs text-slate-300">
                Nhập danh sách nhiều học sinh từ Excel hoặc dán trực tiếp dữ liệu theo cột
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

        {/* Modal Body */}
        <div className="p-5 flex-1 overflow-y-auto space-y-5 text-xs">
          
          {/* Method Selector & Settings */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            
            {/* Input Method Switcher */}
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
              <label className="block font-bold text-slate-700 mb-1.5">Hình thức nhập:</label>
              <div className="flex gap-1.5">
                <button
                  type="button"
                  onClick={() => setActiveTab('paste')}
                  className={`flex-1 py-1.5 px-2 rounded-lg font-bold text-xs transition-all ${
                    activeTab === 'paste'
                      ? 'bg-teal-900 text-white shadow-xs'
                      : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  Dán văn bản
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('file')}
                  className={`flex-1 py-1.5 px-2 rounded-lg font-bold text-xs transition-all ${
                    activeTab === 'file'
                      ? 'bg-teal-900 text-white shadow-xs'
                      : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  Tải file Excel
                </button>
              </div>
            </div>

            {/* Destination Room Selector */}
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
              <label className="block font-bold text-slate-700 mb-1.5">Phân bổ vào phòng:</label>
              <select
                value={destinationMode === 'current_room' ? targetRoomId : 'auto'}
                onChange={(e) => {
                  if (e.target.value === 'auto') {
                    setDestinationMode('auto_distribute');
                  } else {
                    setDestinationMode('current_room');
                    setTargetRoomId(e.target.value);
                  }
                }}
                className="w-full bg-white border border-slate-300 rounded-lg p-1.5 font-semibold text-slate-800"
              >
                <optgroup label="Tự động phân bổ">
                  <option value="auto">Tự động chia đều theo Nam / Nữ</option>
                </optgroup>
                <optgroup label="Chọn cụ thể 1 phòng">
                  {rooms.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name} ({r.gender === 'nam' ? 'Nam' : 'Nữ'} · {existingStudents.filter(s => s.roomId === r.id).length}/{r.capacity} em)
                    </option>
                  ))}
                </optgroup>
              </select>
            </div>

            {/* Default Status Selector */}
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
              <label className="block font-bold text-slate-700 mb-1.5">Trạng thái học sinh mặc định:</label>
              <select
                value={defaultStatus}
                onChange={(e) => setDefaultStatus(e.target.value as StudentStatus)}
                className="w-full bg-white border border-slate-300 rounded-lg p-1.5 font-semibold text-slate-800"
              >
                <option value="dang_o">Đang ở nội trú (Bình thường)</option>
                <option value="dac_biet">Hoàn cảnh đặc biệt / Hộ nghèo</option>
                <option value="tam_nghi">Tạm nghỉ / Điều trị y tế</option>
                <option value="chuyen_truong">Đã chuyển trường / Thôi học</option>
              </select>
            </div>

          </div>

          {/* Tab 1: Paste Text */}
          {activeTab === 'paste' ? (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-700">
                  Dán danh sách học sinh (Mỗi dòng một em, các cột cách nhau bằng phím Tab hoặc dấu phẩy / chấm phẩy):
                </span>
                <button
                  type="button"
                  onClick={handlePasteSample}
                  className="flex items-center gap-1 text-teal-800 font-bold hover:underline text-[11px]"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>Dán dữ liệu mẫu (5 em)</span>
                </button>
              </div>

              <textarea
                rows={6}
                value={pasteText}
                onChange={(e) => {
                  setPasteText(e.target.value);
                  parseRawText(e.target.value);
                }}
                placeholder="Họ và tên [Tab] Lớp [Tab] Giới tính [Tab] Thôn [Tab] Nóc ông bà [Tab] Con ông bà [Tab] Số điện thoại [Tab] Trạng thái&#10;Hồ Văn Tuấn	6A	nam	Thôn 1	Nóc Ông Tuấn	Con ông Hồ Văn Hòa	0914123456	dang_o&#10;Đinh Thị Mai	6B	nu	Thôn 2	Nóc Ông Kỷ	Con ông Đinh Văn Thắng	0905123456	dang_o"
                className="w-full p-3 font-mono text-[11px] bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-700"
              />
              <p className="text-[11px] text-slate-400">
                Thứ tự cột chuẩn: <strong>Họ tên | Lớp | Giới tính (nam/nu) | Thôn | Nóc | Con ông bà | SĐT | Trạng thái</strong>
              </p>
            </div>
          ) : (
            /* Tab 2: Upload File */
            <div className="p-6 border-2 border-dashed border-slate-300 rounded-2xl bg-slate-50 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-teal-100 text-teal-800 flex items-center justify-center mx-auto">
                <Upload className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-slate-800 text-sm">Chọn file Excel (.xlsx) hoặc file CSV</h4>
                <p className="text-slate-500 text-[11px] mt-0.5">
                  Tự động quét cột Họ tên, Lớp, Giới tính, Thôn, Nóc ông bà, Cha mẹ, SĐT, Trạng thái
                </p>
              </div>
              <div className="flex justify-center gap-3 pt-2">
                <label className="cursor-pointer bg-teal-900 hover:bg-teal-800 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 transition-colors shadow-xs">
                  <Upload className="w-3.5 h-3.5" />
                  <span>Chọn file từ máy tính</span>
                  <input
                    type="file"
                    accept=".xlsx, .xls, .csv"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
                <button
                  type="button"
                  onClick={handleDownloadTemplate}
                  className="bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Tải file Excel mẫu</span>
                </button>
              </div>
            </div>
          )}

          {parseError && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{parseError}</span>
            </div>
          )}

          {/* Preview Table */}
          {parsedStudents.length > 0 && (
            <div className="space-y-2 pt-2 border-t border-slate-200">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="font-bold text-slate-900">
                    Xem trước ({parsedStudents.length} học sinh):
                  </span>
                  <span className="text-[11px] text-slate-500">
                    ({parsedStudents.filter(s => (s.status || defaultStatus) === 'dang_o').length} đang ở,{' '}
                    {parsedStudents.filter(s => s.status === 'dac_biet').length} đặc biệt,{' '}
                    {parsedStudents.filter(s => s.status === 'tam_nghi').length} tạm nghỉ)
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {/* Quick batch change all */}
                  <span className="text-[11px] text-slate-500">Gán nhanh cả lớp:</span>
                  <button
                    type="button"
                    onClick={() => handleApplyStatusToAll('dang_o')}
                    className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 hover:bg-emerald-200"
                  >
                    Đang ở
                  </button>
                  <button
                    type="button"
                    onClick={() => handleApplyStatusToAll('dac_biet')}
                    className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-100 text-purple-800 hover:bg-purple-200"
                  >
                    Đặc biệt
                  </button>
                  <button
                    type="button"
                    onClick={() => handleApplyStatusToAll('tam_nghi')}
                    className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-800 hover:bg-amber-200"
                  >
                    Tạm nghỉ
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setParsedStudents([]);
                      setPasteText('');
                    }}
                    className="text-rose-600 hover:underline text-[11px] flex items-center gap-1 pl-2 border-l border-slate-200"
                  >
                    <Trash2 className="w-3 h-3" /> Xóa
                  </button>
                </div>
              </div>

              <div className="border border-slate-200 rounded-xl overflow-hidden max-h-60 overflow-y-auto">
                <table className="w-full text-left text-[11px]">
                  <thead className="bg-slate-100 text-slate-700 font-bold sticky top-0 border-b border-slate-200">
                    <tr>
                      <th className="p-2 text-center w-8">#</th>
                      <th className="p-2">Họ và tên</th>
                      <th className="p-2 text-center">Phái</th>
                      <th className="p-2">Lớp</th>
                      <th className="p-2">Thôn / Nóc</th>
                      <th className="p-2">Con ông bà</th>
                      <th className="p-2">SĐT</th>
                      <th className="p-2 w-36">Trạng thái học sinh</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {parsedStudents.map((s, i) => (
                      <tr key={i} className="hover:bg-slate-50">
                        <td className="p-2 text-center text-slate-400 font-mono">{i + 1}</td>
                        <td className="p-2 font-bold text-slate-900">{s.fullName}</td>
                        <td className="p-2 text-center">
                          <span className={`px-1 py-0.5 rounded text-[10px] font-bold ${
                            s.gender === 'nam' ? 'bg-blue-100 text-blue-800' : 'bg-rose-100 text-rose-800'
                          }`}>
                            {s.gender === 'nam' ? 'Nam' : 'Nữ'}
                          </span>
                        </td>
                        <td className="p-2 font-mono">{s.grade}</td>
                        <td className="p-2">
                          <span>{s.village}</span> · <span className="text-teal-800 font-medium">{s.nocHamlet}</span>
                        </td>
                        <td className="p-2 text-slate-600 truncate max-w-[130px]">{s.parentsName}</td>
                        <td className="p-2 font-mono text-slate-700">{s.phone}</td>
                        <td className="p-2">
                          <select
                            value={s.status || defaultStatus}
                            onChange={(e) => handleUpdateStudentStatus(i, e.target.value as StudentStatus)}
                            className={`w-full py-1 px-1.5 rounded text-[11px] font-semibold border ${
                              (s.status || defaultStatus) === 'tam_nghi'
                                ? 'bg-amber-50 text-amber-900 border-amber-300'
                                : (s.status || defaultStatus) === 'dac_biet'
                                ? 'bg-purple-50 text-purple-900 border-purple-300'
                                : (s.status || defaultStatus) === 'chuyen_truong'
                                ? 'bg-slate-100 text-slate-700 border-slate-300'
                                : 'bg-emerald-50 text-emerald-900 border-emerald-300'
                            }`}
                          >
                            <option value="dang_o">Đang ở nội trú</option>
                            <option value="dac_biet">Hoàn cảnh đặc biệt</option>
                            <option value="tam_nghi">Tạm nghỉ / Điều trị</option>
                            <option value="chuyen_truong">Đã chuyển trường</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="text-xs text-slate-500">
            {parsedStudents.length > 0 ? (
              <span>
                Sẵn sàng thêm <strong>{parsedStudents.length} học sinh</strong> vào{' '}
                {destinationMode === 'current_room' ? currentRoom.name : '25 phòng theo phân bổ'}
              </span>
            ) : (
              <span>Dán danh sách hoặc tải file để bắt đầu</span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-200 font-semibold text-xs"
            >
              Hủy
            </button>
            <button
              type="button"
              disabled={parsedStudents.length === 0}
              onClick={handleConfirmSave}
              className="px-5 py-2 rounded-xl bg-teal-900 hover:bg-teal-800 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all"
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />
              <span>Xác Nhận Thêm {parsedStudents.length > 0 ? `${parsedStudents.length} Em` : ''}</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
