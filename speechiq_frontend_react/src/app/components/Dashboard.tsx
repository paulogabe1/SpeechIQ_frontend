import {
  Mic,
  ArrowRight,
  Sparkles,
  GraduationCap,
  WandSparkles,
  Trophy,
  TrendingUp,
  Award,
  Flame,
  Target,
  Zap,
} from "lucide-react";
import { useEffect, useState } from "react";

interface DashboardProps {
  onNavigate: (page: string) => void;
}

const cardClass = "bg-white border border-[#EAEAEF] rounded-[18px] p-6";
const monoClass = "font-['Geist_Mono',monospace] tracking-[-0.02em] [font-variant-numeric:tabular-nums]";

function SectionHeader({
  icon: Icon,
  iconColor = "#9333EA",
  title,
  chip,
  className = "",
}: {
  icon: typeof Sparkles;
  iconColor?: string;
  title: string;
  chip?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`flex items-center gap-[9px] mb-4 ${className}`}>
      <Icon className="w-[17px] h-[17px]" style={{ color: iconColor }} />
      <span className="text-base font-semibold tracking-[-0.02em]">{title}</span>
      {chip}
    </div>
  );
}

const achievements = [
  { icon: Flame, title: "Week Warrior", desc: "7-day streak" },
  { icon: Target, title: "Perfect Score", desc: "100% fluency" },
  { icon: Zap, title: "Speed Demon", desc: "Perfect pacing" },
  { icon: Trophy, title: "Level 10", desc: "Reached level 10" },
];

export function Dashboard({ onNavigate }: DashboardProps) {
  const level = 12;
  const xp = 2450;
  const nextLevelXP = 3000;
  const xpPct = xp / nextLevelXP;

  // Ring fill animates from 0 on mount (CSS transition driven by this flip)
  const [animate, setAnimate] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setAnimate(true), 150);
    return () => clearTimeout(t);
  }, []);

  const ringR = 54;
  const ringCirc = 2 * Math.PI * ringR;

  const now = new Date();
  const today = `${now.toLocaleDateString("en-US", { weekday: "long" })} · ${now.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`;
  const hour = now.getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  return (
    <div>
      {/* Header */}
      <div className="flex items-start justify-between gap-5 mb-6">
        <div>
          <div className="text-[11px] font-semibold tracking-[0.08em] uppercase text-[#A6A5B0]">{today}</div>
          <h1 className="text-[30px] font-semibold tracking-[-0.03em] mt-2 mb-1.5">{greeting}, Alex</h1>
          <div className="text-[14.5px] text-[#71707B]">
            You're on a <b className="text-[#17161B] font-semibold">7-day streak</b> — keep it going.
          </div>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <span className="inline-flex items-center gap-[7px] whitespace-nowrap text-sm font-semibold text-[#EA580C] bg-white border border-[#EAEAEF] rounded-full px-3.5 py-2 shadow-[0_1px_2px_rgba(20,20,40,0.05)]">
            <Flame className="w-4 h-4" /> 7 days
          </span>
          <div
            className="w-[42px] h-[42px] rounded-full text-white flex items-center justify-center font-semibold"
            style={{ background: "linear-gradient(135deg,#A855F7,#3B82F6)" }}
          >
            A
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1.7fr_1fr] gap-4 items-start">
        {/* Left column */}
        <div className="flex flex-col gap-4">
          {/* Practice hero */}
          <button
            onClick={() => onNavigate("practice")}
            className="group flex items-center gap-[22px] w-full text-left rounded-[18px] px-7 py-[26px] text-white bg-gradient-to-br from-[#9333EA] to-[#2563EB] shadow-[0_12px_30px_-10px_rgba(80,50,220,0.5)] transition-[transform,box-shadow] duration-150 hover:-translate-y-0.5 hover:shadow-[0_18px_38px_-12px_rgba(80,50,220,0.55)]"
          >
            <div className="w-[60px] h-[60px] rounded-[16px] bg-white/[0.16] flex items-center justify-center shrink-0">
              <Mic className="w-7 h-7" />
            </div>
            <div>
              <div className="text-[11px] font-semibold tracking-[0.09em] uppercase text-white/75">Practice now</div>
              <div className="text-[21px] font-semibold tracking-[-0.02em] mt-[3px]">Record &amp; analyze your speech</div>
              <div className="text-[13.5px] text-white/80 mt-1">
                Earn <b className="text-white font-semibold">+50 XP</b> for every session
              </div>
            </div>
            <ArrowRight className="ml-auto shrink-0 w-6 h-6 text-white/85 transition-transform duration-150 group-hover:translate-x-1" />
          </button>

          {/* Today's focus */}
          <div className={cardClass}>
            <SectionHeader
              icon={Sparkles}
              title="Today's focus"
              chip={
                <span className="ml-auto text-[11px] font-semibold text-[#9333EA] bg-[#F3ECFD] rounded-full px-2.5 py-1 tracking-[0.02em]">
                  AI Coach
                </span>
              }
            />
            <div
              className="rounded-[14px] p-5 border border-[#EBE7F8]"
              style={{ background: "linear-gradient(135deg,#FAF8FE,#F4F7FE)" }}
            >
              <div className="text-base font-semibold mb-4">Reduce long pauses</div>
              <div className="grid grid-cols-3 gap-3 mb-[18px]">
                {[
                  { label: "Detected", value: "8", unit: "pauses >1s", color: "#DC2626" },
                  { label: "Target", value: "4", unit: "pauses >1s", color: "#15864B" },
                  { label: "Impact", value: "+7", unit: "fluency pts", color: "#9333EA" },
                ].map(({ label, value, unit, color }) => (
                  <div key={label} className="text-center bg-white border border-[#EAEAEF] rounded-[12px] py-3.5 px-2">
                    <div className="text-[11px] text-[#71707B] font-medium">{label}</div>
                    <div className={`text-[26px] font-semibold tracking-[-0.02em] my-0.5 ${monoClass}`} style={{ color }}>
                      {value}
                    </div>
                    <div className="text-[10.5px] text-[#A6A5B0] font-medium">{unit}</div>
                  </div>
                ))}
              </div>
              <button
                onClick={() => onNavigate("learn")}
                className="flex items-center justify-center gap-2 w-full text-sm font-semibold rounded-[12px] p-3 bg-[#17161B] text-white transition-colors duration-150 hover:bg-black"
              >
                Start recommended module <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Quick actions */}
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => onNavigate("learn")}
              className="text-left bg-white border border-[#EAEAEF] rounded-[16px] p-5 transition-[border-color,transform] duration-150 hover:border-[#D8D2EC] hover:-translate-y-0.5"
            >
              <div className="w-[42px] h-[42px] rounded-[12px] bg-[#F3ECFD] text-[#9333EA] flex items-center justify-center mb-3.5">
                <GraduationCap className="w-5 h-5" />
              </div>
              <div className="text-[15px] font-semibold">Continue learning</div>
              <div className="text-[12.5px] text-[#71707B] mt-[3px]">Articulation · Lesson 4 of 5</div>
              <div className="text-xs font-semibold text-[#9333EA] mt-3">Last score 82 · Goal 85</div>
            </button>
            <button
              onClick={() => onNavigate("synthesis")}
              className="text-left bg-white border border-[#EAEAEF] rounded-[16px] p-5 transition-[border-color,transform] duration-150 hover:border-[#D8D2EC] hover:-translate-y-0.5"
            >
              <div className="w-[42px] h-[42px] rounded-[12px] bg-[#E3F5EC] text-[#0E9F6E] flex items-center justify-center mb-3.5">
                <WandSparkles className="w-5 h-5" />
              </div>
              <div className="text-[15px] font-semibold">Voice Lab</div>
              <div className="text-[12.5px] text-[#71707B] mt-[3px]">Generate with your voice</div>
              <span className="inline-block text-[11px] font-semibold text-[#0E9F6E] bg-[#E3F5EC] rounded-full px-[9px] py-[3px] mt-3">
                Premium
              </span>
            </button>
          </div>
        </div>

        {/* Right column */}
        <div className="flex flex-col gap-4">
          {/* Level ring */}
          <div className={`${cardClass} flex flex-col items-center text-center`}>
            <SectionHeader icon={Trophy} iconColor="#EA580C" title="Your level" className="w-full !mb-2" />
            <div className="relative w-[132px] h-[132px] mt-1 mb-1.5">
              <svg width="132" height="132" viewBox="0 0 132 132">
                <circle cx="66" cy="66" r={ringR} fill="none" stroke="#EEEDF3" strokeWidth="10" />
                <circle
                  cx="66"
                  cy="66"
                  r={ringR}
                  fill="none"
                  stroke="url(#lvlRingGradient)"
                  strokeWidth="10"
                  strokeLinecap="round"
                  strokeDasharray={ringCirc}
                  strokeDashoffset={animate ? ringCirc * (1 - xpPct) : ringCirc}
                  transform="rotate(-90 66 66)"
                  style={{ transition: "stroke-dashoffset 1.2s ease-out" }}
                />
                <defs>
                  <linearGradient id="lvlRingGradient" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#A855F7" />
                    <stop offset="100%" stopColor="#3B82F6" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <div className={`text-[38px] font-semibold tracking-[-0.03em] leading-none ${monoClass}`}>{level}</div>
                <div className="text-[10.5px] font-semibold tracking-[0.1em] uppercase text-[#A6A5B0] mt-0.5">Level</div>
              </div>
            </div>
            <div className="text-[13px] text-[#71707B] mt-1.5">
              <b className={`text-[#17161B] font-semibold ${monoClass}`}>{xp.toLocaleString()}</b>{" "}
              / <span className={monoClass}>{nextLevelXP.toLocaleString()}</span> XP
            </div>
            <div className="w-full h-2 bg-[#F3F3F7] rounded-full overflow-hidden mt-3.5 mb-2">
              <div
                className="h-full rounded-full"
                style={{
                  background: "linear-gradient(90deg,#A855F7,#3B82F6)",
                  width: animate ? `${(xpPct * 100).toFixed(1)}%` : 0,
                  transition: "width 1.2s ease-out",
                }}
              />
            </div>
            <div className={`text-xs text-[#A6A5B0] font-medium ${monoClass}`}>
              {nextLevelXP - xp} XP to Level {level + 1}
            </div>
          </div>

          {/* Improvement forecast */}
          <div className={cardClass}>
            <SectionHeader icon={TrendingUp} iconColor="#15864B" title="Improvement forecast" />
            <div className="flex items-center justify-between mt-1.5">
              <div>
                <div className="text-xs text-[#71707B] font-medium">Current fluency</div>
                <div className={`text-[38px] font-semibold tracking-[-0.03em] leading-[1.05] ${monoClass}`}>82</div>
              </div>
              <div className="flex items-center gap-1.5 text-[#7ABF9A]">
                <span className="w-[22px] h-px bg-[#BFE0CD] block" />
                <ArrowRight className="w-[18px] h-[18px]" />
              </div>
              <div className="text-right">
                <div className="text-xs text-[#71707B] font-medium">In 2 weeks</div>
                <div className={`text-[38px] font-semibold tracking-[-0.03em] leading-[1.05] text-[#15864B] ${monoClass}`}>
                  88
                </div>
                <span className="inline-block text-[11px] font-semibold text-[#15864B] bg-[#E4F3EA] rounded-full px-2 py-[3px] mt-1.5">
                  +6 pts
                </span>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-[#F3F3F7] text-[12.5px] text-[#71707B]">
              Improving <b className="text-[#15864B] font-semibold">12% faster</b> than last month.
            </div>
          </div>

          {/* Recent achievements */}
          <div className={cardClass}>
            <SectionHeader icon={Award} iconColor="#EA580C" title="Recent achievements" />
            <div className="grid grid-cols-2 gap-3">
              {achievements.map(({ icon: Icon, title, desc }) => (
                <div key={title} className="text-center bg-white border border-[#EAEAEF] rounded-[14px] px-2.5 py-4">
                  <div className="w-10 h-10 rounded-[12px] bg-[#F4EEFB] text-[#9333EA] flex items-center justify-center mx-auto mb-2.5">
                    <Icon className="w-[19px] h-[19px]" />
                  </div>
                  <div className="text-[12.5px] font-semibold">{title}</div>
                  <div className="text-[11px] text-[#71707B] mt-0.5">{desc}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
