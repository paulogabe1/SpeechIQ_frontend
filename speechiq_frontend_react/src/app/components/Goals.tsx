import { Target, Plus, CheckCircle2, TrendingUp } from "lucide-react";

interface GoalsProps {
  onNavigate?: (page: string) => void;
}

interface ActiveGoal {
  title: string;
  desc: string;
  current: number;
  target: number;
  icon: typeof Target;
  color: "purple" | "orange" | "blue";
}

const COLOR_STYLES: Record<ActiveGoal["color"], { icBg: string; icText: string; fill: string; pct: string }> = {
  purple: { icBg: "#EEE4FB", icText: "#9333EA", fill: "linear-gradient(90deg,#A855F7,#9333EA)", pct: "#9333EA" },
  orange: { icBg: "#FDE6D6", icText: "#EA580C", fill: "linear-gradient(90deg,#F97316,#EA580C)", pct: "#EA580C" },
  blue: { icBg: "#DDE9FD", icText: "#2563EB", fill: "linear-gradient(90deg,#3B82F6,#2563EB)", pct: "#2563EB" },
};

const ACTIVE_GOALS: ActiveGoal[] = [
  { title: "Reach 90 Fluency", desc: "Improve your fluency score to 90 or above", current: 87, target: 90, icon: Target, color: "purple" },
  { title: "Reach 7-day streak", desc: "Practice every day for 7 days in a row", current: 5, target: 7, icon: Target, color: "orange" },
  { title: "Complete 50 sessions", desc: "Reach a total of 50 practice sessions", current: 47, target: 50, icon: Target, color: "blue" },
];

const COMPLETED_GOALS = [
  { title: "Reach Level 10", date: "5 days ago" },
  { title: "100% Pacing Score", date: "1 week ago" },
  { title: "30 Total Sessions", date: "2 weeks ago" },
];

const SUGGESTED_GOALS = ["Reach 95 Overall Score", "30-day Streak", "Master Pronunciation", "Practice 20 Hours"];

const cardClass = "bg-white border border-[#EAEAEF] rounded-[18px]";

export function Goals({ onNavigate: _onNavigate }: GoalsProps) {
  return (
    <div className="text-[#17161B] tracking-[-0.01em]">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-[11px]">
          <Target className="w-6 h-6 text-[#9333EA]" />
          <h1 className="text-[29px] font-semibold tracking-[-0.03em]">Your Goals</h1>
        </div>
        <button className="inline-flex items-center gap-[7px] text-sm font-semibold rounded-[11px] px-4 py-2.5 bg-[#17161B] text-white transition-colors hover:bg-black">
          <Plus className="w-4 h-4" /> New goal
        </button>
      </div>

      <div className="mb-7">
        <h2 className="text-[15px] font-semibold mb-3.5">Active goals</h2>
        <div className="flex flex-col gap-3.5">
          {ACTIVE_GOALS.map((goal) => {
            const c = COLOR_STYLES[goal.color];
            const pct = Math.round((goal.current / goal.target) * 100);
            const remaining = goal.target - goal.current;
            return (
              <div key={goal.title} className={`${cardClass} px-6 py-[22px]`}>
                <div className="flex items-start gap-[15px] mb-[18px]">
                  <div
                    className="w-12 h-12 rounded-[13px] flex items-center justify-center shrink-0"
                    style={{ background: c.icBg, color: c.icText }}
                  >
                    <goal.icon className="w-[23px] h-[23px]" />
                  </div>
                  <div>
                    <div className="text-[16.5px] font-semibold">{goal.title}</div>
                    <div className="text-[13px] text-[#71707B] mt-[3px]">{goal.desc}</div>
                  </div>
                </div>
                <div className="flex items-center justify-between text-[13px] mb-2">
                  <span className="text-[#3B3A44] font-medium">
                    Progress: {goal.current} / {goal.target}
                  </span>
                  <span className="font-semibold" style={{ color: c.pct }}>
                    {pct}%
                  </span>
                </div>
                <div className="h-[9px] bg-[#F3F3F7] rounded-full overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${Math.min(100, pct)}%`, background: c.fill }} />
                </div>
                <div className="flex items-center gap-1.5 text-[12.5px] text-[#71707B] mt-2.5">
                  <TrendingUp className="w-3.5 h-3.5" /> {remaining} more to go
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mb-7">
        <h2 className="text-[15px] font-semibold mb-3.5">Completed goals</h2>
        <div className={`${cardClass} px-[22px] py-5`}>
          <div className="flex flex-col gap-2.5">
            {COMPLETED_GOALS.map((goal) => (
              <div
                key={goal.title}
                className="flex items-center gap-3.5 px-[17px] py-[15px] border border-[#E1EFE7] bg-[#F7FBF9] rounded-[13px]"
              >
                <div className="w-10 h-10 rounded-[11px] bg-[#DDF2E6] text-[#059669] flex items-center justify-center shrink-0">
                  <Target className="w-[19px] h-[19px]" />
                </div>
                <div>
                  <div className="text-sm font-semibold">{goal.title}</div>
                  <div className="text-[12.5px] text-[#71707B] mt-px">Completed {goal.date}</div>
                </div>
                <span className="ml-auto text-[#059669] flex">
                  <CheckCircle2 className="w-5 h-5" />
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-[15px] font-semibold mb-3.5">Suggested goals</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {SUGGESTED_GOALS.map((title) => (
            <button
              key={title}
              className="group flex items-center gap-[13px] text-left bg-white border border-[#EAEAEF] rounded-[14px] px-[18px] py-4 transition-colors hover:border-[#D8CBF5]"
            >
              <div className="w-[38px] h-[38px] rounded-[11px] bg-[#F3F3F7] text-[#71707B] flex items-center justify-center shrink-0">
                <Target className="w-[18px] h-[18px]" />
              </div>
              <span className="text-sm font-medium flex-1 group-hover:text-[#9333EA]">{title}</span>
              <span className="text-[#A6A5B0] flex group-hover:text-[#9333EA]">
                <Plus className="w-[18px] h-[18px]" />
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
