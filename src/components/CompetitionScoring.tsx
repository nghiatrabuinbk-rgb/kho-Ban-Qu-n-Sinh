import React, { useState } from 'react';
import { 
  Trophy, Award, Image as ImageIcon, Upload, Trash2, CheckCircle2, 
  Sparkles, Star, MessageSquare, ChevronRight, Eye, Medal
} from 'lucide-react';
import { Room, EvaluationRecord, AwardRank } from '../types';

interface CompetitionScoringProps {
  rooms: Room[];
  evaluations: EvaluationRecord[];
  onSaveEvaluation: (evaluation: EvaluationRecord) => void;
  currentUser: { email: string; name: string; role: string };
}

export const CompetitionScoring: React.FC<CompetitionScoringProps> = ({
  rooms,
  evaluations,
  onSaveEvaluation,
  currentUser,
}) => {
  const [selectedWeek, setSelectedWeek] = useState(6);
  const [selectedRoomId, setSelectedRoomId] = useState('P01');
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Current evaluation record or fallback
  const currentRoom = rooms.find((r) => r.id === selectedRoomId) || rooms[0];
  const existingEval = evaluations.find(
    (e) => e.roomId === currentRoom.id && e.weekNumber === selectedWeek
  );

  // Form states
  const [schoolRules, setSchoolRules] = useState(existingEval?.schoolRules ?? 18);
  const [roomCleanliness, setRoomCleanliness] = useState(existingEval?.roomCleanliness ?? 17);
  const [discipline, setDiscipline] = useState(existingEval?.discipline ?? 19);
  const [areaCleanliness, setAreaCleanliness] = useState(existingEval?.areaCleanliness ?? 18);
  const [dutyWeek, setDutyWeek] = useState(existingEval?.dutyWeek ?? 19);

  const [artsActivity, setArtsActivity] = useState(existingEval?.artsActivity ?? 'Tiếng hát học sinh nội trú Trà Đốc lần IV');
  const [artsRank, setArtsRank] = useState<AwardRank>(existingEval?.artsRank ?? 'none');
  const [sportsActivity, setSportsActivity] = useState(existingEval?.sportsActivity ?? 'Giải bóng đá mini & đá cầu khu nội trú');
  const [sportsRank, setSportsRank] = useState<AwardRank>(existingEval?.sportsRank ?? 'none');

  const [bonusPoints, setBonusPoints] = useState(existingEval?.bonusPoints ?? 0);
  const [penaltyPoints, setPenaltyPoints] = useState(existingEval?.penaltyPoints ?? 0);
  const [evidenceImages, setEvidenceImages] = useState<string[]>(existingEval?.evidenceImages ?? []);
  const [feedback, setFeedback] = useState(existingEval?.feedback ?? '');

  // Calculate points for arts & sports ranks
  const getRankBonus = (rank: AwardRank): number => {
    switch (rank) {
      case 'first': return 10;
      case 'second': return 7;
      case 'third': return 5;
      case 'consolation': return 3;
      default: return 0;
    }
  };

  const calculatedTotal = 
    Number(schoolRules) + 
    Number(roomCleanliness) + 
    Number(discipline) + 
    Number(areaCleanliness) + 
    Number(dutyWeek) + 
    getRankBonus(artsRank) + 
    getRankBonus(sportsRank) + 
    Number(bonusPoints) - 
    Number(penaltyPoints);

  // Sync form when selected room or week changes
  const handleSelectRoom = (roomId: string) => {
    setSelectedRoomId(roomId);
    const found = evaluations.find((e) => e.roomId === roomId && e.weekNumber === selectedWeek);
    if (found) {
      setSchoolRules(found.schoolRules);
      setRoomCleanliness(found.roomCleanliness);
      setDiscipline(found.discipline);
      setAreaCleanliness(found.areaCleanliness);
      setDutyWeek(found.dutyWeek);
      setArtsActivity(found.artsActivity);
      setArtsRank(found.artsRank);
      setSportsActivity(found.sportsActivity);
      setSportsRank(found.sportsRank);
      setBonusPoints(found.bonusPoints);
      setPenaltyPoints(found.penaltyPoints);
      setEvidenceImages(found.evidenceImages || []);
      setFeedback(found.feedback || '');
    } else {
      setSchoolRules(18);
      setRoomCleanliness(17);
      setDiscipline(18);
      setAreaCleanliness(17);
      setDutyWeek(18);
      setArtsRank('none');
      setSportsRank('none');
      setBonusPoints(0);
      setPenaltyPoints(0);
      setEvidenceImages([]);
      setFeedback('');
    }
    setSaveSuccess(false);
  };

  // Upload image handler (compressed Base64)
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        if (result) {
          setEvidenceImages((prev) => [...prev, result]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleRemoveImage = (index: number) => {
    setEvidenceImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    const record: EvaluationRecord = {
      id: `${currentRoom.id}_w${selectedWeek}_2026`,
      roomId: currentRoom.id,
      weekNumber: selectedWeek,
      month: 10,
      year: 2026,
      schoolRules: Number(schoolRules),
      roomCleanliness: Number(roomCleanliness),
      discipline: Number(discipline),
      areaCleanliness: Number(areaCleanliness),
      dutyWeek: Number(dutyWeek),
      artsActivity,
      artsRank,
      sportsActivity,
      sportsRank,
      bonusPoints: Number(bonusPoints),
      penaltyPoints: Number(penaltyPoints),
      totalScore: calculatedTotal,
      evidenceImages,
      feedback: feedback.trim() || 'Thực hiện tốt các nội quy nội trú trường học',
      assessedBy: currentUser.name || 'Ban Quản Sinh',
      assessedAt: new Date().toISOString(),
    };

    onSaveEvaluation(record);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 4000);
  };

  // Sort all 25 rooms for the leaderboard
  const leaderboard = rooms.map((room) => {
    const ev = evaluations.find((e) => e.roomId === room.id && e.weekNumber === selectedWeek);
    const score = ev ? ev.totalScore : 88;
    return {
      room,
      evaluation: ev,
      score,
    };
  }).sort((a, b) => b.score - a.score);

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-amber-950 via-slate-900 to-teal-950 rounded-2xl p-6 text-white border border-amber-900/40 shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-amber-400 text-xs font-semibold uppercase tracking-wider">
              <Trophy className="w-4 h-4" />
              <span>Chấm Điểm Thi Đua Nội Trú Ban Quản Sinh</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white mt-1">
              Đánh Giá Thi Đua 25 Phòng Ở · Tuần {selectedWeek}
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm mt-1 max-w-2xl">
              Chấm điểm nội quy, vệ sinh phòng, nề nếp ăn ở, trực tuần nhà bếp/WC và các giải phong trào Tiếng hát nội trú, bóng đá, cầu lông... kèm hình ảnh minh chứng.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-300 font-semibold">Chọn Tuần học:</span>
            <select
              value={selectedWeek}
              onChange={(e) => setSelectedWeek(Number(e.target.value))}
              className="bg-slate-800 text-amber-300 border border-slate-700 rounded-xl px-3 py-1.5 text-xs font-bold font-mono-numbers focus:ring-2 focus:ring-amber-500"
            >
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((w) => (
                <option key={w} value={w}>
                  Tuần {w} (Học kỳ I)
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Main Grid: Scoring Form on Left vs Leaderboard on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* Left Column (7 cols): Evaluation Form */}
        <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200/90 shadow-2xs p-5 space-y-5">
          
          {/* Room Selector Tab */}
          <div className="border-b border-slate-200 pb-4">
            <label className="block text-xs font-bold text-slate-700 mb-2">
              Chọn Phòng Cần Chấm Điểm:
            </label>
            <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto p-1 bg-slate-50 rounded-xl border border-slate-200">
              {rooms.map((r) => {
                const isSelected = r.id === currentRoom.id;
                return (
                  <button
                    key={r.id}
                    onClick={() => handleSelectRoom(r.id)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                      isSelected
                        ? 'bg-amber-500 text-slate-950 shadow-xs'
                        : 'bg-white text-slate-700 hover:bg-slate-200 border border-slate-200/80'
                    }`}
                  >
                    {r.id}
                  </button>
                );
              })}
            </div>
            
            <div className="mt-3 flex items-center justify-between text-xs">
              <span className="font-bold text-slate-900 text-sm">
                Đang chấm: {currentRoom.name}
              </span>
              <span className="text-slate-500">
                GV: <strong>{currentRoom.assignedTeacherName}</strong> ({currentRoom.buildingZone})
              </span>
            </div>
          </div>

          {/* Section 1: 5 Core Criteria (20 points each) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-teal-900">
                1. 5 Tiêu Chí Đánh Giá Cốt Lõi (Tối đa 20 điểm / tiêu chí)
              </h3>
              <span className="text-xs font-mono-numbers text-slate-500">
                Tổng cơ bản: <strong>{Number(schoolRules) + Number(roomCleanliness) + Number(discipline) + Number(areaCleanliness) + Number(dutyWeek)}/100đ</strong>
              </span>
            </div>

            <div className="space-y-2.5 text-xs">
              {/* Criterion 1 */}
              <div className="flex items-center justify-between bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                <div>
                  <span className="font-bold text-slate-800">1. Nội quy nhà trường</span>
                  <p className="text-[11px] text-slate-500">Giờ giấc ra vào cổng, trang phục, chào hỏi thầy cô</p>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    min="0"
                    max="20"
                    value={schoolRules}
                    onChange={(e) => setSchoolRules(Number(e.target.value))}
                    className="w-24 accent-teal-700"
                  />
                  <span className="w-8 text-center font-bold font-mono-numbers text-teal-900 bg-white px-1.5 py-0.5 rounded border">
                    {schoolRules}
                  </span>
                </div>
              </div>

              {/* Criterion 2 */}
              <div className="flex items-center justify-between bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                <div>
                  <span className="font-bold text-slate-800">2. Vệ sinh phòng ở</span>
                  <p className="text-[11px] text-slate-500">Sàn nhà quét sạch, cửa sổ lau bụi, rác đổ đúng nơi</p>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    min="0"
                    max="20"
                    value={roomCleanliness}
                    onChange={(e) => setRoomCleanliness(Number(e.target.value))}
                    className="w-24 accent-teal-700"
                  />
                  <span className="w-8 text-center font-bold font-mono-numbers text-teal-900 bg-white px-1.5 py-0.5 rounded border">
                    {roomCleanliness}
                  </span>
                </div>
              </div>

              {/* Criterion 3 */}
              <div className="flex items-center justify-between bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                <div>
                  <span className="font-bold text-slate-800">3. Nề nếp phòng ở</span>
                  <p className="text-[11px] text-slate-500">Chăn màn gấp vuông vức, dép guốc ngay ngắn, yên tĩnh giờ ngủ</p>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    min="0"
                    max="20"
                    value={discipline}
                    onChange={(e) => setDiscipline(Number(e.target.value))}
                    className="w-24 accent-teal-700"
                  />
                  <span className="w-8 text-center font-bold font-mono-numbers text-teal-900 bg-white px-1.5 py-0.5 rounded border">
                    {discipline}
                  </span>
                </div>
              </div>

              {/* Criterion 4 */}
              <div className="flex items-center justify-between bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                <div>
                  <span className="font-bold text-slate-800">4. Vệ sinh khu vực chung</span>
                  <p className="text-[11px] text-slate-500">Hành lang, cầu thang, sân phơi quần áo trước phòng</p>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    min="0"
                    max="20"
                    value={areaCleanliness}
                    onChange={(e) => setAreaCleanliness(Number(e.target.value))}
                    className="w-24 accent-teal-700"
                  />
                  <span className="w-8 text-center font-bold font-mono-numbers text-teal-900 bg-white px-1.5 py-0.5 rounded border">
                    {areaCleanliness}
                  </span>
                </div>
              </div>

              {/* Criterion 5 */}
              <div className="flex items-center justify-between bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                <div>
                  <span className="font-bold text-slate-800">5. Phòng trực tuần (WC & Nhà bếp)</span>
                  <p className="text-[11px] text-slate-500">Vệ sinh nhà vệ sinh chung, hỗ trợ chia cơm, dọn bàn ăn bán trú</p>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    min="0"
                    max="20"
                    value={dutyWeek}
                    onChange={(e) => setDutyWeek(Number(e.target.value))}
                    className="w-24 accent-teal-700"
                  />
                  <span className="w-8 text-center font-bold font-mono-numbers text-teal-900 bg-white px-1.5 py-0.5 rounded border">
                    {dutyWeek}
                  </span>
                </div>
              </div>

            </div>
          </div>

          {/* Section 2: Phong trào Văn hóa Văn nghệ & Thể dục Thể thao */}
          <div className="space-y-3 pt-3 border-t border-slate-200">
            <h3 className="text-xs font-bold uppercase tracking-wider text-amber-800">
              2. Điểm Thi Đua Phong Trào (Văn nghệ & Thể thao)
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              
              {/* Arts Activity */}
              <div className="bg-amber-50/50 p-3 rounded-xl border border-amber-200/80">
                <label className="block font-bold text-slate-800 mb-1">
                  Văn nghệ: {artsActivity}
                </label>
                <div className="mt-2">
                  <span className="text-[11px] text-slate-500 block mb-1">Thứ hạng đạt được:</span>
                  <select
                    value={artsRank}
                    onChange={(e) => setArtsRank(e.target.value as AwardRank)}
                    className="w-full bg-white border border-amber-300 rounded-lg p-1.5 text-xs font-bold text-amber-900"
                  >
                    <option value="none">Không có giải (0 điểm)</option>
                    <option value="first">🏆 Giải Nhất (+10 điểm)</option>
                    <option value="second">🥈 Giải Nhì (+7 điểm)</option>
                    <option value="third">🥉 Giải Ba (+5 điểm)</option>
                    <option value="consolation">🎖 Khuyến khích (+3 điểm)</option>
                  </select>
                </div>
              </div>

              {/* Sports Activity */}
              <div className="bg-teal-50/50 p-3 rounded-xl border border-teal-200/80">
                <label className="block font-bold text-slate-800 mb-1">
                  Thể thao: {sportsActivity}
                </label>
                <div className="mt-2">
                  <span className="text-[11px] text-slate-500 block mb-1">Thứ hạng đạt được:</span>
                  <select
                    value={sportsRank}
                    onChange={(e) => setSportsRank(e.target.value as AwardRank)}
                    className="w-full bg-white border border-teal-300 rounded-lg p-1.5 text-xs font-bold text-teal-900"
                  >
                    <option value="none">Không có giải (0 điểm)</option>
                    <option value="first">🏆 Giải Nhất (+10 điểm)</option>
                    <option value="second">🥈 Giải Nhì (+7 điểm)</option>
                    <option value="third">🥉 Giải Ba (+5 điểm)</option>
                    <option value="consolation">🎖 Khuyến khích (+3 điểm)</option>
                  </select>
                </div>
              </div>

            </div>
          </div>

          {/* Section 3: Evidence Images Upload (Minh chứng ảnh) */}
          <div className="space-y-3 pt-3 border-t border-slate-200">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                <ImageIcon className="w-4 h-4 text-teal-700" />
                <span>3. Tải Hình Ảnh Minh Chứng Chấm Điểm</span>
              </h3>
              <label className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-colors">
                <Upload className="w-3.5 h-3.5 text-amber-400" />
                <span>Chọn ảnh tải lên</span>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>
            </div>

            {evidenceImages.length === 0 ? (
              <div className="p-6 border-2 border-dashed border-slate-200 rounded-xl text-center text-xs text-slate-400">
                Chưa có ảnh minh chứng cho phòng này trong Tuần {selectedWeek}.
                <br />
                Bấm "Chọn ảnh tải lên" để tải ảnh chụp chăn màn, vệ sinh phòng hoặc ảnh nhận giải thi đấu.
              </div>
            ) : (
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                {evidenceImages.map((img, idx) => (
                  <div key={idx} className="relative group rounded-lg overflow-hidden border border-slate-200 h-20 bg-slate-100">
                    <img
                      src={img}
                      alt={`Minh chứng ${idx + 1}`}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <button
                        onClick={() => setPreviewImage(img)}
                        className="p-1 bg-white text-slate-800 rounded-full hover:bg-slate-100"
                        title="Xem phóng to"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleRemoveImage(idx)}
                        className="p-1 bg-rose-600 text-white rounded-full hover:bg-rose-700"
                        title="Xóa ảnh"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Section 4: Feedback & Total Score Summary */}
          <div className="space-y-2 pt-3 border-t border-slate-200">
            <label className="block text-xs font-bold text-slate-800">
              Nhận Xét Chi Tiết Của Ban Quản Sinh:
            </label>
            <textarea
              rows={2}
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Ghi nhận ưu điểm và nhắc nhở tồn tại của phòng trong tuần..."
              className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-700"
            />
          </div>

          {/* Bottom Action Bar */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
            <div className="flex items-baseline gap-2">
              <span className="text-xs text-slate-500 font-semibold">TỔNG ĐIỂM:</span>
              <span className="text-2xl font-black font-mono-numbers text-teal-900">
                {calculatedTotal}
              </span>
              <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                {calculatedTotal >= 95 ? 'Xuất Sắc (Dẫn đầu)' : calculatedTotal >= 85 ? 'Tốt' : 'Khá'}
              </span>
            </div>

            <div className="flex items-center gap-2">
              {saveSuccess && (
                <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4" /> Đã lưu thành công!
                </span>
              )}
              <button
                onClick={handleSave}
                className="bg-teal-900 hover:bg-teal-800 text-white font-bold px-5 py-2.5 rounded-xl text-xs transition-colors shadow-sm"
              >
                Lưu Bảng Điểm Phòng {currentRoom.id}
              </button>
            </div>
          </div>

        </div>

        {/* Right Column (5 cols): 25 Rooms Competition Leaderboard */}
        <div className="lg:col-span-5 bg-white rounded-xl border border-slate-200/90 shadow-2xs overflow-hidden flex flex-col">
          <div className="p-4 border-b border-slate-200 flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-1.5">
                <Medal className="w-4 h-4 text-amber-500" />
                <span>Bảng Xếp Hạng Thi Đua Tuần {selectedWeek}</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">Xếp hạng 25 phòng toàn khu nội trú</p>
            </div>
          </div>

          <div className="p-3 flex-1 overflow-y-auto max-h-[640px]">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 font-semibold">
                  <th className="pb-2 text-center w-10">Hạng</th>
                  <th className="pb-2">Phòng ở</th>
                  <th className="pb-2 text-center">Nội quy</th>
                  <th className="pb-2 text-center">Giải</th>
                  <th className="pb-2 text-right">Tổng điểm</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {leaderboard.map((item, index) => {
                  const isCurrent = item.room.id === currentRoom.id;
                  const hasArts = item.evaluation?.artsRank && item.evaluation.artsRank !== 'none';
                  const hasSports = item.evaluation?.sportsRank && item.evaluation.sportsRank !== 'none';

                  return (
                    <tr
                      key={item.room.id}
                      onClick={() => handleSelectRoom(item.room.id)}
                      className={`cursor-pointer transition-colors ${
                        isCurrent
                          ? 'bg-amber-50/90 font-bold'
                          : 'hover:bg-slate-50'
                      }`}
                    >
                      <td className="py-2 text-center font-mono-numbers">
                        {index === 0 ? (
                          <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-amber-400 text-slate-950 font-black text-[11px] shadow-xs">
                            1
                          </span>
                        ) : index === 1 ? (
                          <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-slate-300 text-slate-800 font-bold text-[11px]">
                            2
                          </span>
                        ) : index === 2 ? (
                          <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-amber-200 text-amber-900 font-bold text-[11px]">
                            3
                          </span>
                        ) : (
                          <span className="text-slate-500">{index + 1}</span>
                        )}
                      </td>

                      <td className="py-2">
                        <div className="font-bold text-slate-900 flex items-center gap-1">
                          <span>{item.room.name}</span>
                          <span className={`text-[9px] px-1 rounded ${
                            item.room.gender === 'nam' ? 'bg-blue-100 text-blue-700' : 'bg-rose-100 text-rose-700'
                          }`}>
                            {item.room.gender === 'nam' ? 'Nam' : 'Nữ'}
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-400 truncate max-w-[110px]">
                          {item.room.assignedTeacherName}
                        </div>
                      </td>

                      <td className="py-2 text-center font-mono-numbers text-slate-600">
                        {item.evaluation ? (item.evaluation.schoolRules + item.evaluation.roomCleanliness + item.evaluation.discipline) : 54}
                      </td>

                      <td className="py-2 text-center text-[10px]">
                        {hasArts || hasSports ? (
                          <span className="text-amber-700 font-bold bg-amber-100 px-1.5 py-0.5 rounded">
                            {hasArts && hasSports ? 'VN + TT' : hasArts ? 'Văn nghệ' : 'Thể thao'}
                          </span>
                        ) : (
                          <span className="text-slate-300">-</span>
                        )}
                      </td>

                      <td className="py-2 text-right">
                        <span className="font-mono-numbers font-black text-sm text-teal-900">
                          {item.score}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* Lightbox Modal for Proof Image Preview */}
      {previewImage && (
        <div 
          onClick={() => setPreviewImage(null)}
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 cursor-pointer"
        >
          <div className="max-w-3xl w-full bg-slate-900 rounded-2xl p-2 overflow-hidden shadow-2xl">
            <img
              src={previewImage}
              alt="Minh chứng chi tiết"
              className="w-full max-h-[80vh] object-contain rounded-xl"
            />
            <div className="p-3 text-center text-xs text-slate-300">
              Nhấp ra ngoài để đóng xem ảnh
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
