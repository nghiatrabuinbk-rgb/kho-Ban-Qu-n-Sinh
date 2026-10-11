/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { doc, setDoc, getDoc, collection, getDocs } from 'firebase/firestore';
import { auth, db, loginWithGoogle, logoutUser, handleFirestoreError, OperationType } from './firebase';

import { Header } from './components/Header';
import { NavigationTabs, ActiveTab } from './components/NavigationTabs';
import { DashboardOverview } from './components/DashboardOverview';
import { RoomAttendance } from './components/RoomAttendance';
import { CompetitionScoring } from './components/CompetitionScoring';
import { ReportView } from './components/ReportView';
import { AdminSettings } from './components/AdminSettings';
import { DesktopAppModal } from './components/DesktopAppModal';
import { GlobalTeacherAlertBanner } from './components/GlobalTeacherAlertBanner';

import { 
  Room, Student, AttendanceRecord, EvaluationRecord, 
  SystemSettings, AuthorizedUser 
} from './types';
import { 
  INITIAL_ROOMS, INITIAL_STUDENTS, INITIAL_ATTENDANCE, 
  INITIAL_EVALUATIONS, INITIAL_SETTINGS 
} from './data/seedData';

export default function App() {
  // Persistence with localStorage fallback
  const [rooms, setRooms] = useState<Room[]>(() => {
    const saved = localStorage.getItem('tradoc_rooms');
    return saved ? JSON.parse(saved) : INITIAL_ROOMS;
  });

  const [students, setStudents] = useState<Student[]>(() => {
    const saved = localStorage.getItem('tradoc_students');
    return saved ? JSON.parse(saved) : INITIAL_STUDENTS;
  });

  const [attendanceList, setAttendanceList] = useState<AttendanceRecord[]>(() => {
    const saved = localStorage.getItem('tradoc_attendance');
    return saved ? JSON.parse(saved) : INITIAL_ATTENDANCE;
  });

  const [evaluations, setEvaluations] = useState<EvaluationRecord[]>(() => {
    const saved = localStorage.getItem('tradoc_evaluations');
    return saved ? JSON.parse(saved) : INITIAL_EVALUATIONS;
  });

  const [settings, setSettings] = useState<SystemSettings>(() => {
    const saved = localStorage.getItem('tradoc_settings');
    return saved ? JSON.parse(saved) : INITIAL_SETTINGS;
  });

  // Current active user
  const [currentUser, setCurrentUser] = useState<AuthorizedUser>(() => {
    return {
      email: 'nghiatrabui.nbk@gmail.com',
      name: 'Thầy Nguyễn Trọng Nghĩa (Trưởng ban)',
      role: 'admin',
      phone: '0914.882.345',
    };
  });

  const [activeTab, setActiveTab] = useState<ActiveTab>('overview');
  const [selectedRoomId, setSelectedRoomId] = useState<string>('P01');
  const [selectedDate, setSelectedDate] = useState<string>('2026-10-10');
  const [isFirebaseConnected, setIsFirebaseConnected] = useState<boolean>(true);
  const [showDesktopModal, setShowDesktopModal] = useState<boolean>(false);

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('tradoc_rooms', JSON.stringify(rooms));
  }, [rooms]);

  useEffect(() => {
    localStorage.setItem('tradoc_students', JSON.stringify(students));
  }, [students]);

  useEffect(() => {
    localStorage.setItem('tradoc_attendance', JSON.stringify(attendanceList));
  }, [attendanceList]);

  useEffect(() => {
    localStorage.setItem('tradoc_evaluations', JSON.stringify(evaluations));
  }, [evaluations]);

  useEffect(() => {
    localStorage.setItem('tradoc_settings', JSON.stringify(settings));
  }, [settings]);

  // Auth listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user: FirebaseUser | null) => {
      if (user && user.email) {
        const found = settings.authorizedUsers.find(
          (u) => u.email.toLowerCase() === user.email?.toLowerCase()
        );
        if (found) {
          setCurrentUser(found);
        } else if (user.email === 'nghiatrabui.nbk@gmail.com') {
          setCurrentUser({
            email: user.email,
            name: user.displayName || 'Thầy Nguyễn Trọng Nghĩa',
            role: 'admin',
          });
        } else {
          // New guest teacher
          setCurrentUser({
            email: user.email,
            name: user.displayName || 'Giáo viên',
            role: 'room_teacher',
            assignedRoomId: 'P01',
          });
        }
      }
    });

    return () => unsubscribe();
  }, [settings.authorizedUsers]);

  // Save an attendance record (sync to local state + firestore)
  const handleSaveAttendance = async (record: AttendanceRecord) => {
    setAttendanceList((prev) => {
      const filtered = prev.filter((a) => a.id !== record.id);
      return [record, ...filtered];
    });

    try {
      if (auth.currentUser) {
        await setDoc(doc(db, 'attendance', record.id), record);
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `attendance/${record.id}`);
    }
  };

  // Add / Update / Delete Student
  const handleAddStudent = async (newStudent: Student) => {
    setStudents((prev) => [...prev, newStudent]);
    try {
      if (auth.currentUser) {
        await setDoc(doc(db, 'students', newStudent.id), newStudent);
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `students/${newStudent.id}`);
    }
  };

  const handleAddBulkStudents = async (newStudents: Student[]) => {
    setStudents((prev) => [...prev, ...newStudents]);
    try {
      if (auth.currentUser) {
        for (const st of newStudents) {
          await setDoc(doc(db, 'students', st.id), st);
        }
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `students`);
    }
  };

  const handleUpdateStudent = async (updatedStudent: Student) => {
    setStudents((prev) => prev.map((s) => (s.id === updatedStudent.id ? updatedStudent : s)));
    try {
      if (auth.currentUser) {
        await setDoc(doc(db, 'students', updatedStudent.id), updatedStudent);
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `students/${updatedStudent.id}`);
    }
  };

  const handleDeleteStudent = (studentId: string) => {
    setStudents((prev) => prev.filter((s) => s.id !== studentId));
  };

  // Save evaluation record
  const handleSaveEvaluation = async (evaluation: EvaluationRecord) => {
    setEvaluations((prev) => {
      const filtered = prev.filter((e) => e.id !== evaluation.id);
      return [evaluation, ...filtered];
    });

    try {
      if (auth.currentUser) {
        await setDoc(doc(db, 'evaluations', evaluation.id), evaluation);
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `evaluations/${evaluation.id}`);
    }
  };

  // Update System Settings
  const handleUpdateSettings = async (newSettings: SystemSettings) => {
    setSettings(newSettings);
    try {
      if (auth.currentUser) {
        await setDoc(doc(db, 'system_config', 'settings'), newSettings);
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'system_config/settings');
    }
  };

  // Reset to initial seed data
  const handleResetData = () => {
    localStorage.removeItem('tradoc_rooms');
    localStorage.removeItem('tradoc_students');
    localStorage.removeItem('tradoc_attendance');
    localStorage.removeItem('tradoc_evaluations');
    localStorage.removeItem('tradoc_settings');
    setRooms(INITIAL_ROOMS);
    setStudents(INITIAL_STUDENTS);
    setAttendanceList(INITIAL_ATTENDANCE);
    setEvaluations(INITIAL_EVALUATIONS);
    setSettings(INITIAL_SETTINGS);
  };

  // Select room from Overview and switch to Attendance tab
  const handleSelectRoomFromOverview = (roomId: string) => {
    setSelectedRoomId(roomId);
    setActiveTab('attendance');
  };

  const isAdminOrBGH = currentUser.role === 'admin' || currentUser.role === 'board_director';

  // Compute pending rooms count for badge
  const morningSubmittedRoomIds = new Set(
    attendanceList
      .filter((a) => a.date === selectedDate && a.session === 'morning')
      .map((a) => a.roomId)
  );
  const pendingMorningCount = Math.max(0, rooms.length - morningSubmittedRoomIds.size);

  const [isPastCutoff, setIsPastCutoff] = useState(false);

  useEffect(() => {
    const checkTime = () => {
      const now = new Date();
      const currentH = now.getHours();
      const currentM = now.getMinutes();
      const currentTimeStr = `${String(currentH).padStart(2, '0')}:${String(currentM).padStart(2, '0')}`;
      
      const isMorningOverdue = currentTimeStr > settings.cutoffMorning && currentTimeStr < '12:00';
      const isEveningOverdue = currentTimeStr > settings.cutoffEvening || currentTimeStr < '05:00';
      setIsPastCutoff(isMorningOverdue || isEveningOverdue);
    };
    checkTime();
    const interval = setInterval(checkTime, 5000);
    return () => clearInterval(interval);
  }, [settings.cutoffMorning, settings.cutoffEvening]);

  const hasOverdueRooms = isPastCutoff && pendingMorningCount > 0;

  // Determine if the current teacher's specific room is overdue
  const currentHour = new Date().getHours();
  const currentActiveSession = currentHour < 12 ? 'morning' : 'evening';
  const teacherRoomId = currentUser.assignedRoomId;
  const isTeacherRoomSubmitted = teacherRoomId
    ? attendanceList.some(
        (a) => a.roomId === teacherRoomId && a.date === selectedDate && a.session === currentActiveSession
      )
    : false;
  const isTeacherOverdue = isPastCutoff && !!teacherRoomId && !isTeacherRoomSubmitted;

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans">
      
      {/* Top Header */}
      <Header
        currentUser={currentUser}
        onSwitchUser={(user) => {
          setCurrentUser(user);
          if (user.assignedRoomId) {
            setSelectedRoomId(user.assignedRoomId);
          }
        }}
        authorizedUsers={settings.authorizedUsers}
        onLoginGoogle={loginWithGoogle}
        onLogout={logoutUser}
        isFirebaseConnected={isFirebaseConnected}
        onOpenDesktopModal={() => setShowDesktopModal(true)}
        isTeacherOverdue={isTeacherOverdue}
      />

      {/* Global Duty Teacher Red Alert & Push Notification Banner */}
      <GlobalTeacherAlertBanner
        currentUser={currentUser}
        rooms={rooms}
        attendanceList={attendanceList}
        settings={settings}
        selectedDate={selectedDate}
        onNavigateToAttendance={(roomId) => {
          setSelectedRoomId(roomId);
          setActiveTab('attendance');
        }}
      />

      {/* Main Tab Navigation */}
      <NavigationTabs
        activeTab={activeTab}
        onChangeTab={setActiveTab}
        isAdminOrBGH={isAdminOrBGH}
        pendingMorningCount={pendingMorningCount}
        hasOverdueRooms={hasOverdueRooms}
      />

      {/* Main View Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {activeTab === 'overview' && (
          <DashboardOverview
            rooms={rooms}
            students={students}
            attendanceList={attendanceList}
            settings={settings}
            onSelectRoom={handleSelectRoomFromOverview}
            selectedDate={selectedDate}
          />
        )}

        {activeTab === 'attendance' && (
          <RoomAttendance
            rooms={rooms}
            students={students}
            attendanceList={attendanceList}
            selectedRoomId={selectedRoomId}
            onSelectRoomId={setSelectedRoomId}
            onSaveAttendance={handleSaveAttendance}
            onAddStudent={handleAddStudent}
            onAddBulkStudents={handleAddBulkStudents}
            onUpdateStudent={handleUpdateStudent}
            onDeleteStudent={handleDeleteStudent}
            currentUser={currentUser}
            settings={settings}
            selectedDate={selectedDate}
          />
        )}

        {activeTab === 'competition' && (
          <CompetitionScoring
            rooms={rooms}
            evaluations={evaluations}
            onSaveEvaluation={handleSaveEvaluation}
            currentUser={currentUser}
          />
        )}

        {activeTab === 'reports' && (
          <ReportView
            rooms={rooms}
            students={students}
            attendanceList={attendanceList}
            evaluations={evaluations}
            settings={settings}
          />
        )}

        {activeTab === 'settings' && isAdminOrBGH && (
          <AdminSettings
            settings={settings}
            onUpdateSettings={handleUpdateSettings}
            rooms={rooms}
            onUpdateRooms={setRooms}
            onResetData={handleResetData}
            onOpenDesktopModal={() => setShowDesktopModal(true)}
          />
        )}

      </main>

      {/* Executive Footer */}
      <footer className="no-print bg-slate-900 border-t border-slate-800 text-slate-400 py-6 text-xs mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div>
            <span className="font-bold text-slate-200">
              Trường Phổ thông Dân tộc Bán trú THCS Xã Trà Đốc · TP Đà Nẵng
            </span>
            <div className="text-slate-500 mt-0.5">
              Hệ thống Quản lý Nội trú Học sinh 25 Phòng ở · Trưởng ban: Thầy Nguyễn Trọng Nghĩa ({settings.adminEmail})
            </div>
          </div>
          <div className="flex items-center gap-4 text-slate-500">
            <span>Phiên bản 2.4 Bán trú số</span>
            <span>·</span>
            <span>Hỗ trợ xuất Excel · Word · PDF</span>
          </div>
        </div>
      </footer>

      {/* Desktop / Laptop (.exe) Modal */}
      <DesktopAppModal
        isOpen={showDesktopModal}
        onClose={() => setShowDesktopModal(false)}
      />

    </div>
  );
}
