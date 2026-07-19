import { Calendar, TrendingUp, Trophy, Clock, Award, Star } from "lucide-react";
import { scoreColor } from "../lib/scoreDisplay";

interface PracticeHistoryProps {
  onNavigate?: (page: string) => void;
}

const SESSIONS = [
  { id: 1, overall: 70, fluency: 65, pacing: 73, clarity: 68, confidence: 70, pronunciation: 74, date: "9 days ago", duration: 25 },
  { id: 2, overall: 73, fluency: 68, pacing: 76, clarity: 70, confidence: 73, pronunciation: 78, date: "8 days ago", duration: 28 },
  { id: 3, overall: 75, fluency: 70, pacing: 78, clarity: 73, confidence: 75, pronunciation: 79, date: "7 days ago", duration: 30 },
  { id: 4, overall: 81, fluency: 78, pacing: 83, clarity: 79, confidence: 82, pronunciation: 83, date: "6 days ago", duration: 37 },
  { id: 5, overall: 77, fluency: 73, pacing: 80, clarity: 75, confidence: 77, pronunciation: 80, date: "5 days ago", duration: 33 },
  { id: 6, overall: 83, fluency: 80, pacing: 85, clarity: 81, confidence: 84, pronunciation: 85, date: "4 days ago", duration: 40 },
  { id: 7, overall: 79, fluency: 75, pacing: 82, clarity: 78, confidence: 80, pronunciation: 80, date: "3 days ago", duration: 35 },
  { id: 8, overall: 85, fluency: 82, pacing: 88, clarity: 83, confidence: 85, pronunciation: 87, date: "2 days ago", duration: 42 },
  { id: 9, overall: 82, fluency: 78, pacing: 85, clarity: 80, confidence: 82, pronunciation: 85, date: "Yesterday", duration: 38 },
  { id: 10, overall: 91, fluency: 87, pacing: 92, clarity: 90, confidence: 88, pronunciation: 90, date: "Today", duration: 45 },
];

const DIMS: { key: keyof (typeof SESSIONS)[number]; name: string; color: string }[] = [
  { key: "fluency", name: "Fluency", color: "#9333EA" },
  { key: "pacing", name: "Pacing", color: "#2563EB" },
  { key: "clarity", name: "Clarity", color: "#059669" },
  { key: "confidence", name: "Confidence", color: "#EA580C" },
  { key: "pronunciation", name: "Pronunc.", color: "#DB2777" },
];

const cardClass = "bg-white border border-[#EAEAEF] rounded-[18px]";

export function PracticeHistory(_props: PracticeHistoryProps) {
  const totalSessions = SESSIONS.length;
  const avgScore = Math.round(SESSIONS.reduce((acc, s) => acc + s.overall, 0) / SESSIONS.length);
  const totalMinutes = SESSIONS.reduce((acc, s) => acc + s.duration, 0);

  // --- chart geometry, ported 1:1 from the design's own SVG formulas ---
  const L = 44, R = 904, T = 30, B = 278, dMin = 60, dMax = 95;
  const n = SESSIONS.length;
  const px = (i: number) => L + (i / (n - 1)) * (R - L);
  const py = (v: number) => B - ((v - dMin) / (dMax - dMin)) * (B - T);

  const poly = (key: "overall" | "fluency" | "pacing") =>
    SESSIONS.map((s, i) => `${px(i).toFixed(1)},${py(s[key]).toFixed(1)}`).join(" ");
  const overallLine = poly("overall");
  const fluencyLine = poly("fluency");
  const pacingLine = poly("pacing");
  const overallArea =
    `M ${L} ${B} ` + SESSIONS.map((s, i) => `L ${px(i).toFixed(1)} ${py(s.overall).toFixed(1)}`).join(" ") + ` L ${R} ${B} Z`;

  const milestoneIdx: Record<number, boolean> = { 3: true, 9: true };
  const gridVals = [60, 70, 80, 90];

  return (
    <div className="text-[#17161B] tracking-[-0.01em]">
      <div className="flex items-center gap-[11px] mb-6">
        <Calendar className="w-6 h-6 text-[#9333EA]" />
        <h1 className="text-[29px] font-semibold tracking-[-0.03em]">Practice History</h1>
      </div>

      <div
        className="relative overflow-hidden rounded-[18px] px-[30px] py-[26px] text-white"
        style={{ background: "linear-gradient(135deg,#10B981 0%,#0D9488 100%)", boxShadow: "0 14px 32px -12px rgba(5,120,90,0.5)" }}
      >
        <div className="absolute rounded-full bg-white/10" style={{ width: 150, height: 150, top: -50, right: -30 }} />
        <div className="absolute rounded-full bg-white/10" style={{ width: 90, height: 90, bottom: -34, right: 130 }} />
        <div className="flex items-center gap-[18px] relative z-10">
          <div className="w-14 h-14 rounded-[15px] bg-white/[0.18] flex items-center justify-center shrink-0">
            <TrendingUp className="w-7 h-7" />
          </div>
          <div>
            <div className="text-[34px] font-semibold tracking-[-0.03em] leading-none font-['Geist_Mono',monospace]">+12% Fluency</div>
            <div className="text-sm text-white/85 mt-1">Last 30 days</div>
          </div>
        </div>
        <div className="text-sm text-white/[0.92] font-medium mt-4 relative z-10">
          You're improving faster than last month — keep the momentum going.
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 my-5">
        <div className={`${cardClass} px-[22px] py-5`}>
          <div className="flex items-center gap-2 text-[12.5px] text-[#71707B] font-medium">
            <Calendar className="w-[15px] h-[15px]" /> Total sessions
          </div>
          <div className="text-[30px] font-semibold tracking-[-0.02em] mt-2 font-['Geist_Mono',monospace]">{totalSessions}</div>
        </div>
        <div className={`${cardClass} px-[22px] py-5`}>
          <div className="flex items-center gap-2 text-[12.5px] text-[#71707B] font-medium">
            <Trophy className="w-[15px] h-[15px]" /> Average score
          </div>
          <div className="text-[30px] font-semibold tracking-[-0.02em] mt-2 font-['Geist_Mono',monospace]" style={{ color: "#059669" }}>
            {avgScore}
          </div>
        </div>
        <div className={`${cardClass} px-[22px] py-5`}>
          <div className="flex items-center gap-2 text-[12.5px] text-[#71707B] font-medium">
            <Clock className="w-[15px] h-[15px]" /> Total practice time
          </div>
          <div className="text-[30px] font-semibold tracking-[-0.02em] mt-2 font-['Geist_Mono',monospace]">
            {Math.floor(totalMinutes / 60)}h {totalMinutes % 60}m
          </div>
        </div>
      </div>

      <div className={`${cardClass} px-4 sm:px-7 py-[26px]`}>
        <span className="text-[17px] font-semibold tracking-[-0.02em]">Your progress journey</span>
        <div className="text-[12.5px] text-[#71707B] mt-[3px]">Overall, fluency and pacing across your last 10 sessions</div>

        {/* The chart's text is drawn in SVG user units, so it shrinks along with a
            width:100% render — legible on desktop, unreadably tiny once squeezed
            into a phone screen. Below the viewBox's own 920px, render at native
            size and let the card scroll horizontally instead of shrinking it. */}
        <div className="overflow-x-auto mt-2.5">
          <svg className="h-auto block min-w-[640px]" viewBox="0 0 920 330">
          <defs>
            <linearGradient id="ovf" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#9333EA" stopOpacity={0.13} />
              <stop offset="100%" stopColor="#9333EA" stopOpacity={0} />
            </linearGradient>
          </defs>
          {gridVals.map((v) => (
            <line key={v} x1={44} y1={py(v)} x2={904} y2={py(v)} stroke="#F1F1F5" />
          ))}
          {gridVals.map((v) => (
            <text key={v} x={34} y={py(v) + 3} textAnchor="end" fontSize={10} fill="#A6A5B0" fontFamily="Geist Mono,monospace">
              {v}
            </text>
          ))}
          {[3, 9].map((idx) => (
            <g key={idx}>
              <line x1={px(idx)} y1={30} x2={px(idx)} y2={278} stroke="#F0A020" strokeWidth={1.5} strokeDasharray="5 5" />
              <text x={px(idx)} y={22} textAnchor="middle" fontSize={10.5} fontWeight={600} fill="#F59E0B" fontFamily="Geist,sans-serif">
                {idx === 3 ? "Level Up" : "Personal Best"}
              </text>
            </g>
          ))}
          <path d={overallArea} fill="url(#ovf)" />
          <polyline points={pacingLine} fill="none" stroke="#10B981" strokeWidth={2} />
          <polyline points={fluencyLine} fill="none" stroke="#2563EB" strokeWidth={2} />
          <polyline points={overallLine} fill="none" stroke="#9333EA" strokeWidth={3} />
          {SESSIONS.map((s, i) => {
            const big = milestoneIdx[i];
            return (
              <circle
                key={s.id}
                cx={px(i)}
                cy={py(s.overall)}
                r={big ? 6 : 4}
                fill={big ? "#F0A020" : "#9333EA"}
                stroke="#fff"
                strokeWidth={big ? 2.5 : 1.5}
              />
            );
          })}
          {SESSIONS.map((s, i) => (
            <text key={s.id} x={px(i)} y={302} textAnchor="middle" fontSize={10} fill="#A6A5B0" fontFamily="Geist Mono,monospace">
              #{s.id}
            </text>
          ))}
          </svg>
        </div>

        <div className="flex gap-[22px] mt-3.5 flex-wrap">
          {[
            { label: "Overall", color: "#9333EA" },
            { label: "Fluency", color: "#2563EB" },
            { label: "Pacing", color: "#10B981" },
            { label: "Milestone", color: "#F0A020" },
          ].map(({ label, color }) => (
            <div key={label} className="flex items-center gap-2 text-[12.5px] text-[#71707B]">
              <span className="w-4 h-[3px] rounded-[2px]" style={{ background: color }} />
              {label}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-[22px] pt-5 border-t border-[#F3F3F7]">
          <div className="flex items-center gap-[13px] px-4 py-3.5 border border-[#EAEAEF] rounded-[13px]">
            <div className="w-10 h-10 rounded-[11px] bg-[#FBEFD4] text-[#F59E0B] flex items-center justify-center shrink-0">
              <Award className="w-[19px] h-[19px]" />
            </div>
            <div>
              <div className="text-sm font-semibold">Level Up</div>
              <div className="text-[12.5px] text-[#71707B] mt-px">Session #4</div>
            </div>
          </div>
          <div className="flex items-center gap-[13px] px-4 py-3.5 border border-[#EAEAEF] rounded-[13px]">
            <div className="w-10 h-10 rounded-[11px] bg-[#EEE4FB] text-[#9333EA] flex items-center justify-center shrink-0">
              <Star className="w-[19px] h-[19px]" />
            </div>
            <div>
              <div className="text-sm font-semibold">Personal Best</div>
              <div className="text-[12.5px] text-[#71707B] mt-px">Session #10 · Score 91</div>
            </div>
          </div>
        </div>
      </div>

      <div className={`${cardClass} px-4 sm:px-7 py-[26px] mt-5`}>
        <span className="text-[17px] font-semibold tracking-[-0.02em]">All sessions</span>
        <div className="flex flex-col gap-3 mt-[18px]">
          {SESSIONS.slice()
            .reverse()
            .map((s) => (
              <div key={s.id} className="border border-[#EAEAEF] rounded-[14px] px-3.5 sm:px-5 py-[18px] transition-colors hover:border-[#D8D2EC]">
                <div className="flex items-start justify-between mb-3.5">
                  <div>
                    <div className="text-[15px] font-semibold">Session #{s.id}</div>
                    <div className="flex items-center gap-1.5 text-[12.5px] text-[#71707B] mt-[3px]">
                      <Calendar className="w-[13px] h-[13px]" /> {s.date} · {s.duration} min
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-[26px] font-semibold tracking-[-0.02em]" style={{ color: scoreColor(s.overall) }}>
                      {s.overall}
                    </div>
                    <div className="text-[11px] text-[#A6A5B0] font-medium">Overall</div>
                  </div>
                </div>
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-2.5">
                  {DIMS.map((d) => (
                    <div key={d.name} className="text-center bg-[#F3F3F7] rounded-[10px] py-2.5 px-1.5">
                      <div className="text-[11px] text-[#71707B] mb-1">{d.name}</div>
                      <div className="text-[15px] font-semibold" style={{ color: d.color }}>
                        {s[d.key] as number}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}
