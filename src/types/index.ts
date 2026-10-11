export type Gender = 'nam' | 'nu';

export type UserRole = 'admin' | 'board_director' | 'supervisor' | 'room_teacher';

export interface AuthorizedUser {
  email: string;
  name: string;
  role: UserRole;
  assignedRoomId?: string; // If room_teacher, which room they manage
  phone?: string;
}

export type StudentStatus = 'dang_o' | 'tam_nghi' | 'chuyen_truong' | 'dac_biet';

export interface Student {
  id: string;
  roomId: string;
  fullName: string;
  gender: Gender;
  grade: string; // e.g. "6A", "7B", "8A", "9A"
  village: string; // Thôn 1, Thôn 2, Thôn 3, Khe Chữ...
  nocHamlet: string; // Nóc Ông Tuấn, Nóc Ông Kỷ, Nóc Măng Xoan...
  parentsName: string; // Con ông/bà...
  phone: string; // Số điện thoại gia đình
  status?: StudentStatus; // Trạng thái học sinh: đang ở, tạm nghỉ, chuyển trường, hoàn cảnh đặc biệt
  notes?: string;
}

export interface Room {
  id: string;
  name: string;
  gender: Gender;
  capacity: number; // 14 - 15
  buildingZone: string; // "Dãy Nam - Tầng 1", "Dãy Nữ - Tầng 2"
  assignedTeacherEmail?: string;
  assignedTeacherName?: string;
}

export type AbsentReason = 'co_phep' | 'khong_phep' | 'om_dau' | 've_que';

export interface AbsentDetail {
  studentId: string;
  reason: AbsentReason;
  note?: string;
}

export interface WeekendRegistration {
  studentId: string;
  status: 'stay' | 'home'; // Ở lại trường hay Về nhà
  pickupPerson?: string; // Người đón / Tự về
  expectedReturn?: string; // Ngày dự kiến vào lại trường
  notes?: string;
}

export interface AttendanceRecord {
  id: string; // ${roomId}_${date}_${session}
  roomId: string;
  date: string; // YYYY-MM-DD
  session: 'morning' | 'evening';
  absentStudentIds: string[];
  absentDetails: AbsentDetail[];
  weekendRegistrations?: WeekendRegistration[];
  submittedAt: string; // ISO 8601 string
  submittedBy: string; // email or name
  isLate: boolean;
  notes?: string;
}

export type AwardRank = 'none' | 'first' | 'second' | 'third' | 'consolation';

export interface EvaluationRecord {
  id: string; // ${roomId}_w${weekNumber}_${year}
  roomId: string;
  weekNumber: number;
  month: number;
  year: number;
  // Criteria scores (0 to 20 each, max 100 base)
  schoolRules: number; // Nội quy nhà trường (0-20)
  roomCleanliness: number; // Vệ sinh phòng ở (0-20)
  discipline: number; // Nề nếp phòng ở (0-20)
  areaCleanliness: number; // Vệ sinh khu vực chung (0-20)
  dutyWeek: number; // Phòng trực tuần: nhà vệ sinh & nhà bếp (0-20)
  
  // Phong trào
  artsActivity: string; // e.g. "Tiếng hát nội trú Trà Đốc"
  artsRank: AwardRank; // Nhất, Nhì, Ba, Khuyến khích
  sportsActivity: string; // e.g. "Giải bóng chuyền / đá cầu nội trú"
  sportsRank: AwardRank;
  bonusPoints: number; // Điểm thưởng nộp điểm danh đúng giờ hoặc thành tích
  penaltyPoints: number; // Điểm trừ vi phạm
  totalScore: number;
  
  evidenceImages: string[]; // Base64 or image URLs
  feedback: string;
  assessedBy: string;
  assessedAt: string;
}

export interface SystemSettings {
  schoolName: string;
  managerName: string; // Nguyễn Trọng Nghĩa
  adminEmail: string; // nghiatrabui.nbk@gmail.com
  cutoffMorning: string; // e.g. "06:45"
  cutoffEvening: string; // e.g. "21:15"
  academicYear: string; // "2026 - 2027"
  authorizedUsers: AuthorizedUser[];
}
