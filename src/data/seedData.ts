import { Room, Student, AttendanceRecord, EvaluationRecord, SystemSettings } from '../types';

export const INITIAL_ROOMS: Room[] = [
  // 12 Phòng Nam
  { id: 'P01', name: 'Phòng 01 (Nam)', gender: 'nam', capacity: 15, buildingZone: 'Khu A - Tầng 1', assignedTeacherEmail: 'gv_p01@tradoc.edu.vn', assignedTeacherName: 'Thầy Hồ Văn Nam' },
  { id: 'P02', name: 'Phòng 02 (Nam)', gender: 'nam', capacity: 15, buildingZone: 'Khu A - Tầng 1', assignedTeacherEmail: 'gv_p02@tradoc.edu.vn', assignedTeacherName: 'Thầy Đinh Văn Thắng' },
  { id: 'P03', name: 'Phòng 03 (Nam)', gender: 'nam', capacity: 14, buildingZone: 'Khu A - Tầng 1', assignedTeacherEmail: 'gv_p03@tradoc.edu.vn', assignedTeacherName: 'Thầy Nguyễn Văn Toàn' },
  { id: 'P04', name: 'Phòng 04 (Nam)', gender: 'nam', capacity: 15, buildingZone: 'Khu A - Tầng 1', assignedTeacherEmail: 'gv_p04@tradoc.edu.vn', assignedTeacherName: 'Thầy Zơrâm Hùng' },
  { id: 'P05', name: 'Phòng 05 (Nam)', gender: 'nam', capacity: 14, buildingZone: 'Khu A - Tầng 2', assignedTeacherEmail: 'gv_p05@tradoc.edu.vn', assignedTeacherName: 'Thầy Alăng Dũng' },
  { id: 'P06', name: 'Phòng 06 (Nam)', gender: 'nam', capacity: 15, buildingZone: 'Khu A - Tầng 2', assignedTeacherEmail: 'gv_p06@tradoc.edu.vn', assignedTeacherName: 'Thầy Bríu Việt' },
  { id: 'P07', name: 'Phòng 07 (Nam)', gender: 'nam', capacity: 15, buildingZone: 'Khu A - Tầng 2', assignedTeacherEmail: 'gv_p07@tradoc.edu.vn', assignedTeacherName: 'Thầy Lê Văn Thành' },
  { id: 'P08', name: 'Phòng 08 (Nam)', gender: 'nam', capacity: 14, buildingZone: 'Khu A - Tầng 2', assignedTeacherEmail: 'gv_p08@tradoc.edu.vn', assignedTeacherName: 'Thầy Hồ Văn Lợi' },
  { id: 'P09', name: 'Phòng 09 (Nam)', gender: 'nam', capacity: 15, buildingZone: 'Khu A - Tầng 3', assignedTeacherEmail: 'gv_p09@tradoc.edu.vn', assignedTeacherName: 'Thầy Trần Đình Trọng' },
  { id: 'P10', name: 'Phòng 10 (Nam)', gender: 'nam', capacity: 15, buildingZone: 'Khu A - Tầng 3', assignedTeacherEmail: 'gv_p10@tradoc.edu.vn', assignedTeacherName: 'Thầy Đinh Văn Quân' },
  { id: 'P11', name: 'Phòng 11 (Nam)', gender: 'nam', capacity: 14, buildingZone: 'Khu A - Tầng 3', assignedTeacherEmail: 'gv_p11@tradoc.edu.vn', assignedTeacherName: 'Thầy Võ Hồng Sơn' },
  { id: 'P12', name: 'Phòng 12 (Nam)', gender: 'nam', capacity: 15, buildingZone: 'Khu A - Tầng 3', assignedTeacherEmail: 'gv_p12@tradoc.edu.vn', assignedTeacherName: 'Thầy Hồ Văn Phúc' },

  // 13 Phòng Nữ
  { id: 'P13', name: 'Phòng 13 (Nữ)', gender: 'nu', capacity: 15, buildingZone: 'Khu B - Tầng 1', assignedTeacherEmail: 'gv_p13@tradoc.edu.vn', assignedTeacherName: 'Cô Đinh Thị Hương' },
  { id: 'P14', name: 'Phòng 14 (Nữ)', gender: 'nu', capacity: 15, buildingZone: 'Khu B - Tầng 1', assignedTeacherEmail: 'gv_p14@tradoc.edu.vn', assignedTeacherName: 'Cô Hồ Thị Mai' },
  { id: 'P15', name: 'Phòng 15 (Nữ)', gender: 'nu', capacity: 14, buildingZone: 'Khu B - Tầng 1', assignedTeacherEmail: 'gv_p15@tradoc.edu.vn', assignedTeacherName: 'Cô Alăng Thị Lan' },
  { id: 'P16', name: 'Phòng 16 (Nữ)', gender: 'nu', capacity: 15, buildingZone: 'Khu B - Tầng 1', assignedTeacherEmail: 'gv_p16@tradoc.edu.vn', assignedTeacherName: 'Cô Zơrâm Thị Diệu' },
  { id: 'P17', name: 'Phòng 17 (Nữ)', gender: 'nu', capacity: 14, buildingZone: 'Khu B - Tầng 2', assignedTeacherEmail: 'gv_p17@tradoc.edu.vn', assignedTeacherName: 'Cô Bríu Thị Thảo' },
  { id: 'P18', name: 'Phòng 18 (Nữ)', gender: 'nu', capacity: 15, buildingZone: 'Khu B - Tầng 2', assignedTeacherEmail: 'gv_p18@tradoc.edu.vn', assignedTeacherName: 'Cô Nguyễn Thị Tuyết' },
  { id: 'P19', name: 'Phòng 19 (Nữ)', gender: 'nu', capacity: 15, buildingZone: 'Khu B - Tầng 2', assignedTeacherEmail: 'gv_p19@tradoc.edu.vn', assignedTeacherName: 'Cô Trần Thị Ngọc' },
  { id: 'P20', name: 'Phòng 20 (Nữ)', gender: 'nu', capacity: 14, buildingZone: 'Khu B - Tầng 2', assignedTeacherEmail: 'gv_p20@tradoc.edu.vn', assignedTeacherName: 'Cô Đinh Thị Lệ' },
  { id: 'P21', name: 'Phòng 21 (Nữ)', gender: 'nu', capacity: 15, buildingZone: 'Khu B - Tầng 3', assignedTeacherEmail: 'gv_p21@tradoc.edu.vn', assignedTeacherName: 'Cô Hồ Thị Ánh' },
  { id: 'P22', name: 'Phòng 22 (Nữ)', gender: 'nu', capacity: 15, buildingZone: 'Khu B - Tầng 3', assignedTeacherEmail: 'gv_p22@tradoc.edu.vn', assignedTeacherName: 'Cô Lê Thị Kim' },
  { id: 'P23', name: 'Phòng 23 (Nữ)', gender: 'nu', capacity: 14, buildingZone: 'Khu B - Tầng 3', assignedTeacherEmail: 'gv_p23@tradoc.edu.vn', assignedTeacherName: 'Cô Alăng Thị Thu' },
  { id: 'P24', name: 'Phòng 24 (Nữ)', gender: 'nu', capacity: 15, buildingZone: 'Khu B - Tầng 3', assignedTeacherEmail: 'gv_p24@tradoc.edu.vn', assignedTeacherName: 'Cô Zơrâm Thị Yến' },
  { id: 'P25', name: 'Phòng 25 (Nữ)', gender: 'nu', capacity: 14, buildingZone: 'Khu B - Tầng 3', assignedTeacherEmail: 'gv_p25@tradoc.edu.vn', assignedTeacherName: 'Cô Đặng Thị Hạnh' },
];

export const INITIAL_SETTINGS: SystemSettings = {
  schoolName: 'Trường PTDTBT THCS Xã Trà Đốc',
  managerName: 'Nguyễn Trọng Nghĩa',
  adminEmail: 'nghiatrabui.nbk@gmail.com',
  cutoffMorning: '06:45',
  cutoffEvening: '21:15',
  academicYear: '2026 - 2027',
  authorizedUsers: [
    {
      email: 'nghiatrabui.nbk@gmail.com',
      name: 'Thầy Nguyễn Trọng Nghĩa',
      role: 'admin',
      phone: '0914.882.345',
    },
    {
      email: 'bgh_haitt@tradoc.edu.vn',
      name: 'Thầy Trần Văn Hải (Hiệu trưởng)',
      role: 'board_director',
      phone: '0905.123.456',
    },
    {
      email: 'quansinh_trieu@tradoc.edu.vn',
      name: 'Thầy Hồ Văn Triệu (Ban Quản sinh)',
      role: 'supervisor',
      phone: '0988.765.432',
    },
    {
      email: 'quansinh_nga@tradoc.edu.vn',
      name: 'Cô Đinh Thị Nga (Ban Quản sinh)',
      role: 'supervisor',
      phone: '0977.654.321',
    },
    ...INITIAL_ROOMS.map((room) => ({
      email: room.assignedTeacherEmail || `gv_${room.id.toLowerCase()}@tradoc.edu.vn`,
      name: room.assignedTeacherName || `Giáo viên ${room.name}`,
      role: 'room_teacher' as const,
      assignedRoomId: room.id,
      phone: '0935.123.789',
    })),
  ],
};

const VILLAGES = ['Thôn 1', 'Thôn 2', 'Thôn 3', 'Thôn 4', 'Thôn Khe Chữ', 'Thôn Dương Hòa'];
const HAMLETS = [
  'Nóc Ông Tuấn', 'Nóc Ông Kỷ', 'Nóc Ông Lăng', 'Nóc Ông Thọ',
  'Nóc Măng Xoan', 'Nóc Khe Mây', 'Nóc Đăk Pơr', 'Nóc Làng Mới',
  'Nóc Ông Dũng', 'Nóc Ông Bình', 'Nóc Cà Dong', 'Nóc Nước Xa'
];

const MALE_NAMES = [
  'Hồ Văn Tiến', 'Đinh Văn Long', 'Alăng Hùng', 'Zơrâm Trường', 'Bríu Đạt',
  'Nguyễn Văn Thắng', 'Hồ Văn Khang', 'Đinh Văn Bằng', 'Alăng Nghĩa', 'Zơrâm Bảo',
  'Hồ Văn Sang', 'Đinh Văn Lộc', 'Bríu Thăng', 'Trần Văn Hiếu', 'Hồ Văn Cương',
  'Alăng Vĩ', 'Zơrâm Quyết', 'Đinh Văn Thịnh', 'Hồ Văn Tình', 'Nguyễn Văn Minh'
];

const FEMALE_NAMES = [
  'Đinh Thị Mơ', 'Hồ Thị Hoa', 'Alăng Thị Lan', 'Zơrâm Thị Mai', 'Bríu Thị Cúc',
  'Đinh Thị Tuyết', 'Hồ Thị Đào', 'Alăng Thị Thảo', 'Zơrâm Thị Hằng', 'Bríu Thị Linh',
  'Nguyễn Thị Kim', 'Đinh Thị Nguyệt', 'Hồ Thị Bích', 'Alăng Thị Nhạn', 'Zơrâm Thị Trang',
  'Đinh Thị Kiều', 'Hồ Thị Xuân', 'Bríu Thị Phượng', 'Alăng Thị Oanh', 'Zơrâm Thị Hồng'
];

// Generate ~365 students realistic for 25 rooms
export function generateSeedStudents(): Student[] {
  const students: Student[] = [];
  let studentIdx = 1;

  INITIAL_ROOMS.forEach((room) => {
    const isMale = room.gender === 'nam';
    const namesPool = isMale ? MALE_NAMES : FEMALE_NAMES;
    const count = room.capacity;

    for (let i = 0; i < count; i++) {
      const nameBase = namesPool[(i + parseInt(room.id.replace('P', ''))) % namesPool.length];
      const fullName = `${nameBase} ${i > 5 ? (i + 1) : ''}`.trim();
      const village = VILLAGES[(i + parseInt(room.id.replace('P', ''))) % VILLAGES.length];
      const hamlet = HAMLETS[(i * 3 + parseInt(room.id.replace('P', ''))) % HAMLETS.length];
      const grades = ['6A', '6B', '7A', '7B', '8A', '8B', '9A'];
      const grade = grades[(i + parseInt(room.id.replace('P', ''))) % grades.length];
      const father = isMale ? `Ông Hồ Văn ${['Toàn', 'Dũng', 'Quý', 'Bình', 'Hòa'][i % 5]}` : `Ông Đinh Văn ${['Sơn', 'Tân', 'Thành', 'Vinh', 'Hiền'][i % 5]}`;
      const mother = isMale ? `Bà Alăng Thị ${['Nga', 'Liên', 'Huệ', 'Thu', 'Hiền'][i % 5]}` : `Bà Zơrâm Thị ${['Lan', 'Gái', 'Mai', 'Xuân', 'Loan'][i % 5]}`;

      const status = (i === 2 && room.id === 'P01') ? 'tam_nghi' : (i === 4 && room.id === 'P02') ? 'dac_biet' : 'dang_o';

      students.push({
        id: `STU_${String(studentIdx).padStart(3, '0')}`,
        roomId: room.id,
        fullName,
        gender: room.gender,
        grade,
        village,
        nocHamlet: hamlet,
        parentsName: `Con ${father} & ${mother}`,
        phone: `09${Math.floor(10000000 + Math.random() * 89999999)}`,
        status,
        notes: i === 2 && room.id === 'P01' ? 'Tiền sử hen suyễn nhẹ, cần giữ ấm đêm' : undefined,
      });

      studentIdx++;
    }
  });

  return students;
}

export const INITIAL_STUDENTS = generateSeedStudents();

// Generate initial attendance records for today (showing submission timestamps and ordering)
export function generateSeedAttendance(todayStr: string = '2026-10-10'): AttendanceRecord[] {
  const records: AttendanceRecord[] = [];

  // Morning records for first 20 rooms (some submitted early, some late, some pending)
  const morningTimes = [
    '06:12:15', '06:15:30', '06:18:45', '06:22:10', '06:25:50',
    '06:30:12', '06:33:40', '06:36:15', '06:39:20', '06:41:05',
    '06:43:55', '06:44:30', '06:48:10', '06:52:45', '06:58:20',
    '07:05:10', '07:12:00', '07:20:15'
  ];

  INITIAL_ROOMS.slice(0, 18).forEach((room, index) => {
    const timeStr = morningTimes[index];
    const isLate = timeStr > '06:45:00';
    const roomStudents = INITIAL_STUDENTS.filter(s => s.roomId === room.id);
    
    // Simulate 1 absent student for room P01 and P14
    let absentIds: string[] = [];
    let absentDetails: any[] = [];
    if (room.id === 'P01' && roomStudents.length > 2) {
      absentIds = [roomStudents[1].id];
      absentDetails = [{ studentId: roomStudents[1].id, reason: 'om_dau', note: 'Bị sốt nhẹ, nằm nghỉ tại trạm y tế trường' }];
    } else if (room.id === 'P14' && roomStudents.length > 1) {
      absentIds = [roomStudents[0].id];
      absentDetails = [{ studentId: roomStudents[0].id, reason: 've_que', note: 'Gia đình đón về nóc có đám cưới họ hàng' }];
    }

    records.push({
      id: `${room.id}_${todayStr}_morning`,
      roomId: room.id,
      date: todayStr,
      session: 'morning',
      absentStudentIds: absentIds,
      absentDetails,
      submittedAt: `${todayStr}T${timeStr}.000Z`,
      submittedBy: room.assignedTeacherName || 'Giáo viên trực',
      isLate,
      notes: isLate ? 'Nộp trễ do kiểm tra lại danh sách học sinh khu sau' : 'Điểm danh đầy đủ, sĩ số ổn định',
    });
  });

  // Evening records for some rooms
  const eveningTimes = [
    '20:45:10', '20:52:30', '20:58:15', '21:02:40', '21:09:12', '21:14:05', '21:22:30'
  ];

  INITIAL_ROOMS.slice(0, 7).forEach((room, index) => {
    const timeStr = eveningTimes[index];
    const isLate = timeStr > '21:15:00';
    const roomStudents = INITIAL_STUDENTS.filter(s => s.roomId === room.id);

    records.push({
      id: `${room.id}_${todayStr}_evening`,
      roomId: room.id,
      date: todayStr,
      session: 'evening',
      absentStudentIds: [],
      absentDetails: [],
      submittedAt: `${todayStr}T${timeStr}.000Z`,
      submittedBy: room.assignedTeacherName || 'Giáo viên trực',
      isLate,
      notes: 'Tất cả học sinh có mặt tại phòng trước giờ giới nghiêm',
    });
  });

  return records;
}

export const INITIAL_ATTENDANCE = generateSeedAttendance();

// Evaluation records for week 6
export function generateSeedEvaluations(): EvaluationRecord[] {
  return INITIAL_ROOMS.map((room, index) => {
    const schoolRules = Math.min(20, 16 + (index % 5));
    const roomCleanliness = Math.min(20, 15 + ((index * 2) % 6));
    const discipline = Math.min(20, 17 + (index % 4));
    const areaCleanliness = Math.min(20, 16 + ((index * 3) % 5));
    const dutyWeek = Math.min(20, 18 + (index % 3));

    let artsRank: any = 'none';
    let sportsRank: any = 'none';
    let bonusPoints = 0;

    if (room.id === 'P01') {
      sportsRank = 'first'; // Nhất bóng đá mini
      bonusPoints += 10;
    } else if (room.id === 'P14') {
      artsRank = 'first'; // Nhất Tiếng hát nội trú
      bonusPoints += 10;
    } else if (room.id === 'P04') {
      sportsRank = 'second'; // Nhì cầu lông
      bonusPoints += 7;
    } else if (room.id === 'P16') {
      artsRank = 'second'; // Nhì múa cồng chiêng
      bonusPoints += 7;
    } else if (room.id === 'P07') {
      sportsRank = 'third';
      bonusPoints += 5;
    }

    const baseScore = schoolRules + roomCleanliness + discipline + areaCleanliness + dutyWeek;
    const penaltyPoints = index === 11 ? 5 : 0; // Trừ điểm P12 nộp điểm danh trễ nhiều lần
    const totalScore = baseScore + bonusPoints - penaltyPoints;

    return {
      id: `${room.id}_w06_2026`,
      roomId: room.id,
      weekNumber: 6,
      month: 10,
      year: 2026,
      schoolRules,
      roomCleanliness,
      discipline,
      areaCleanliness,
      dutyWeek,
      artsActivity: 'Tiếng hát học sinh nội trú Trà Đốc lần IV',
      artsRank,
      sportsActivity: 'Giải bóng đá mini & đá cầu khu nội trú',
      sportsRank,
      bonusPoints,
      penaltyPoints,
      totalScore,
      evidenceImages: [
        'https://images.unsplash.com/photo-1577896851231-70ef18881754?auto=format&fit=crop&w=600&q=80',
        'https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=600&q=80'
      ],
      feedback: index === 0
        ? 'Phòng gấp chăn màn vuông vức, sạch sẽ, đạt giải Nhất bóng đá mini.'
        : 'Nề nếp ăn ở tốt, tham gia đầy đủ các buổi thể dục sáng.',
      assessedBy: 'Thầy Hồ Văn Triệu (Ban Quản sinh)',
      assessedAt: '2026-10-09T17:00:00.000Z',
    };
  });
}

export const INITIAL_EVALUATIONS = generateSeedEvaluations();
