import { Trophy, Zap, Flame, Clock, Mic, Check, Lock, Target, Dumbbell, GraduationCap, Star, Crown, Gem } from "lucide-react";

interface ProfileProps {
  onNavigate?: (page: string) => void;
}

const STATS = {
  level: 12,
  currentXP: 2450,
  nextLevelXP: 3000,
  totalXP: 14250,
  longestStreak: 15,
  hoursPracticed: 12.5,
  totalSessions: 47,
};

const ACHIEVEMENTS = [
  { icon: Flame, title: "Week Warrior", desc: "7-day streak", earned: true, date: "today" },
  { icon: Target, title: "Perfect Score", desc: "100% in any metric", earned: true, date: "2 days ago" },
  { icon: Zap, title: "Speed Demon", desc: "Perfect pacing score", earned: true, date: "3 days ago" },
  { icon: Trophy, title: "Level 10", desc: "Reached level 10", earned: true, date: "5 days ago" },
  { icon: Dumbbell, title: "Marathon", desc: "Practice for 1 hour straight", earned: true, date: "1 week ago" },
  { icon: GraduationCap, title: "Scholar", desc: "Complete 50 sessions", earned: false },
  { icon: Star, title: "Rising Star", desc: "Improve by 20 points", earned: true, date: "2 weeks ago" },
  { icon: Crown, title: "Consistency King", desc: "30-day streak", earned: false },
  { icon: Gem, title: "Elite Speaker", desc: "Reach level 20", earned: false },
];

const cardClass = "bg-white border border-[#EAEAEF] rounded-[18px]";

export function Profile(_props: ProfileProps) {
  const xpPct = (STATS.currentXP / STATS.nextLevelXP) * 100;
  const earnedCount = ACHIEVEMENTS.filter((a) => a.earned).length;

  const statTiles = [
    { icon: Zap, color: "#F59E0B", bg: "#FBEFD4", label: "Total XP", value: STATS.totalXP.toLocaleString() },
    { icon: Flame, color: "#EA580C", bg: "#FDE6D6", label: "Longest streak", value: `${STATS.longestStreak}`, unit: "days" },
    { icon: Clock, color: "#2563EB", bg: "#DDE9FD", label: "Hours practiced", value: `${STATS.hoursPracticed}`, unit: "h" },
    { icon: Mic, color: "#9333EA", bg: "#EEE4FB", label: "Total sessions", value: `${STATS.totalSessions}` },
  ];

  return (
    <div className="text-[#17161B] tracking-[-0.01em]">
      <div
        className="relative overflow-hidden rounded-[20px] px-8 py-[30px] text-white"
        style={{ background: "linear-gradient(135deg,#9333EA 0%,#2563EB 100%)", boxShadow: "0 14px 34px -12px rgba(80,50,220,0.5)" }}
      >
        <div className="absolute w-[150px] h-[150px] rounded-full bg-white/[0.08]" style={{ top: -50, right: -30 }} />
        <div className="absolute w-[90px] h-[90px] rounded-full bg-white/[0.08]" style={{ bottom: -30, right: 120 }} />
        <div className="flex items-start justify-between gap-5 relative z-10">
          <div>
            <div className="text-[28px] font-semibold tracking-[-0.03em]">Alex Morgan</div>
            <div className="text-sm text-white/[0.82] mt-[5px]">Keep up the great work.</div>
          </div>
          <div className="w-[66px] h-[66px] rounded-full bg-white/[0.18] flex items-center justify-center shrink-0 text-2xl font-semibold backdrop-blur-sm">
            A
          </div>
        </div>
        <div className="relative z-10 bg-white/[0.12] backdrop-blur-md rounded-[14px] px-[22px] py-5 mt-6">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2 text-base font-semibold">
              <Trophy className="w-[19px] h-[19px] text-[#FCD34D]" /> Level {STATS.level}
            </div>
            <div className="text-[13px] text-white/85 font-['Geist_Mono',monospace]">
              {STATS.currentXP.toLocaleString()} / {STATS.nextLevelXP.toLocaleString()} XP
            </div>
          </div>
          <div className="h-2.5 bg-white/[0.22] rounded-full overflow-hidden">
            <div className="h-full bg-white rounded-full" style={{ width: `${xpPct}%` }} />
          </div>
          <div className="text-[12.5px] text-white/[0.82] mt-2.5 font-['Geist_Mono',monospace]">
            {STATS.nextLevelXP - STATS.currentXP} XP to Level {STATS.level + 1}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-5">
        {statTiles.map(({ icon: Icon, color, bg, label, value, unit }) => (
          <div key={label} className={`${cardClass} flex items-center gap-3.5 px-5 py-5`}>
            <div
              className="w-[46px] h-[46px] rounded-[13px] flex items-center justify-center shrink-0"
              style={{ background: bg, color }}
            >
              <Icon className="w-[22px] h-[22px]" />
            </div>
            <div>
              <div className="text-[12.5px] text-[#71707B] font-medium">{label}</div>
              <div className="text-[23px] font-semibold tracking-[-0.02em] mt-0.5 font-['Geist_Mono',monospace]">
                {value}
                {unit && <span className="text-sm text-[#A6A5B0] font-medium ml-0.5">{unit}</span>}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className={`${cardClass} px-7 py-[26px] mt-5`}>
        <div className="flex items-center justify-between mb-5">
          <span className="text-[17px] font-semibold tracking-[-0.02em]">Achievements</span>
          <span className="text-[13px] text-[#71707B] font-medium">
            <b className="text-[#17161B] font-semibold">{earnedCount}</b> of {ACHIEVEMENTS.length} unlocked
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {ACHIEVEMENTS.map(({ icon: Icon, title, desc, earned, date }) => (
            <div
              key={title}
              className={`border rounded-[14px] p-[18px] flex gap-3.5 items-start ${
                earned ? "border-[#EAEAEF]" : "border-[#EAEAEF] opacity-[0.72] bg-[#FBFBFC]"
              }`}
            >
              <div
                className="w-[46px] h-[46px] rounded-[13px] flex items-center justify-center shrink-0 text-white"
                style={
                  earned
                    ? { background: "linear-gradient(135deg,#FBBF24,#F97316)" }
                    : { background: "#EDEDF1", color: "#AEAEBA" }
                }
              >
                <Icon className="w-[22px] h-[22px]" />
              </div>
              <div>
                <div className="text-[14.5px] font-semibold">{title}</div>
                <div className="text-[12.5px] text-[#71707B] mt-0.5 leading-[1.4]">{desc}</div>
                {earned ? (
                  <div className="inline-flex items-center gap-[5px] text-[11.5px] font-semibold text-[#059669] mt-2">
                    <Check className="w-[13px] h-[13px]" /> Earned {date}
                  </div>
                ) : (
                  <div className="inline-flex items-center gap-[5px] text-[11.5px] font-semibold text-[#A6A5B0] mt-2">
                    <Lock className="w-[13px] h-[13px]" /> Locked
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
