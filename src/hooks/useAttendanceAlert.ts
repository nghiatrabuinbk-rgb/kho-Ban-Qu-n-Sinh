import { useState, useEffect, useCallback, useRef } from 'react';
import { AttendanceRecord, SystemSettings } from '../types';

interface AttendanceAlertState {
  isOverdue: boolean;
  minutesOverdue: number;
  timeRemainingStr: string;
  isApproaching: boolean; // 15 mins before deadline
  hasNotificationPermission: boolean;
  requestNotificationPermission: () => Promise<boolean>;
  playAlertSound: () => void;
  triggerTestAlert: () => void;
}

export function useAttendanceAlert(
  roomId: string,
  session: 'morning' | 'evening',
  selectedDate: string,
  attendanceList: AttendanceRecord[],
  settings: SystemSettings,
  isRoomSubmitted: boolean
): AttendanceAlertState {
  const [isOverdue, setIsOverdue] = useState(false);
  const [minutesOverdue, setMinutesOverdue] = useState(0);
  const [timeRemainingStr, setTimeRemainingStr] = useState('');
  const [isApproaching, setIsApproaching] = useState(false);
  const [hasNotificationPermission, setHasNotificationPermission] = useState(
    typeof Notification !== 'undefined' && Notification.permission === 'granted'
  );

  const lastNotifiedSession = useRef<string | null>(null);

  // Play a soft attention alert chime using Web Audio API (zero external assets)
  const playAlertSound = useCallback(() => {
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();

      // Two-tone warning chime
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();

      osc1.type = 'triangle';
      osc2.type = 'sine';

      osc1.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc1.frequency.setValueAtTime(880.00, ctx.currentTime + 0.15); // A5
      osc2.frequency.setValueAtTime(293.66, ctx.currentTime); // D4

      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.6);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);

      osc1.start();
      osc2.start();
      osc1.stop(ctx.currentTime + 0.6);
      osc2.stop(ctx.currentTime + 0.6);
    } catch (e) {
      console.warn('Audio alert not permitted or unavailable:', e);
    }
  }, []);

  const requestNotificationPermission = useCallback(async () => {
    if (typeof Notification === 'undefined') return false;
    try {
      const perm = await Notification.requestPermission();
      const granted = perm === 'granted';
      setHasNotificationPermission(granted);
      if (granted) {
        new Notification('✅ Đã Kích Hoạt Thông Báo Nội Trú', {
          body: 'Thầy/Cô sẽ nhận được cảnh báo đỏ ngay trên màn hình khi đến giờ chốt điểm danh.',
          icon: '/icon.svg',
        });
      }
      return granted;
    } catch (e) {
      return false;
    }
  }, []);

  // Check deadline relative to current time
  useEffect(() => {
    const checkDeadline = () => {
      if (isRoomSubmitted) {
        setIsOverdue(false);
        setIsApproaching(false);
        setTimeRemainingStr('');
        return;
      }

      const now = new Date();
      const cutoffStr = session === 'morning' ? settings.cutoffMorning : settings.cutoffEvening;
      const [cutoffH, cutoffM] = cutoffStr.split(':').map(Number);

      const deadline = new Date();
      deadline.setHours(cutoffH, cutoffM, 0, 0);

      const diffMs = now.getTime() - deadline.getTime();
      const diffMins = Math.floor(diffMs / 60000);

      if (diffMs > 0) {
        // OVERDUE!
        setIsOverdue(true);
        setMinutesOverdue(diffMins);
        setIsApproaching(false);
        setTimeRemainingStr(`Đã quá hạn ${diffMins} phút`);

        // Send browser push notification once per session if not submitted
        const sessionKey = `${roomId}_${selectedDate}_${session}`;
        if (lastNotifiedSession.current !== sessionKey) {
          lastNotifiedSession.current = sessionKey;

          if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
            new Notification(`🚨 BÁO ĐỘNG ĐIỂM DANH: ${roomId} CHƯA NỘP`, {
              body: `Đã quá giờ giới hạn (${cutoffStr}) do Trưởng ban Nguyễn Trọng Nghĩa quy định! Vui lòng gửi báo cáo ngay để tránh bị trừ điểm thi đua.`,
              icon: '/icon.svg',
              requireInteraction: true,
            });
          }

          playAlertSound();
        }
      } else {
        // Approaching deadline
        setIsOverdue(false);
        const remainMs = Math.abs(diffMs);
        const remainMins = Math.floor(remainMs / 60000);
        const remainSecs = Math.floor((remainMs % 60000) / 1000);

        setIsApproaching(remainMins < 15);
        setTimeRemainingStr(`Còn ${remainMins}p ${remainSecs}s đến hạn ${cutoffStr}`);
      }
    };

    checkDeadline();
    const interval = setInterval(checkDeadline, 1000);
    return () => clearInterval(interval);
  }, [roomId, session, selectedDate, settings, isRoomSubmitted, playAlertSound]);

  // Trigger simulated test alert
  const triggerTestAlert = useCallback(() => {
    setIsOverdue(true);
    setMinutesOverdue(15);
    setTimeRemainingStr('Đã quá hạn 15 phút (Mô phỏng thử nghiệm)');
    playAlertSound();

    if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
      new Notification(`🚨 [THỬ NGHIỆM] CẢNH BÁO QUÁ HẠN ĐIỂM DANH: ${roomId}`, {
        body: `Đã quá giờ giới hạn điểm danh (${session === 'morning' ? settings.cutoffMorning : settings.cutoffEvening})!`,
        icon: '/icon.svg',
      });
    }
  }, [roomId, session, settings, playAlertSound]);

  return {
    isOverdue,
    minutesOverdue,
    timeRemainingStr,
    isApproaching,
    hasNotificationPermission,
    requestNotificationPermission,
    playAlertSound,
    triggerTestAlert,
  };
}
