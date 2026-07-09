import { Lock, Check, Star, Play, Sparkles, ArrowRight } from "lucide-react";

interface LearningPathProps {
  onNavigate: (page: string) => void;
}

type LessonStatus = "completed" | "current" | "locked";
type LessonType = "review" | "challenge" | undefined;

interface Lesson {
  title: string;
  status: LessonStatus;
  type?: LessonType;
}

interface Unit {
  title: string;
  subtitle: string;
  grad: [string, string];
  lessons: Lesson[];
}

const UNITS: Unit[] = [
  {
    title: "Unit 1",
    subtitle: "Foundations of Clear Speech",
    grad: ["#10B981", "#0D9488"],
    lessons: [
      { title: "Breathing Basics", status: "completed" },
      { title: "Posture & Voice", status: "completed" },
      { title: "Warm-Up Exercises", status: "completed" },
      { title: "First Speech", status: "completed" },
      { title: "Unit Review", status: "completed", type: "review" },
    ],
  },
  {
    title: "Unit 2",
    subtitle: "Pacing & Rhythm",
    grad: ["#3B82F6", "#4F46E5"],
    lessons: [
      { title: "Natural Pace", status: "completed" },
      { title: "Pause Technique", status: "current" },
      { title: "Rhythm Patterns", status: "locked" },
      { title: "Speech Flow", status: "locked" },
      { title: "Pacing Challenge", status: "locked", type: "challenge" },
    ],
  },
  {
    title: "Unit 3",
    subtitle: "Articulation & Clarity",
    grad: ["#A855F7", "#9333EA"],
    lessons: [
      { title: "Consonant Clarity", status: "locked" },
      { title: "Vowel Shaping", status: "locked" },
      { title: "Tongue Twisters", status: "locked" },
      { title: "Minimal Pairs", status: "locked" },
      { title: "Articulation Test", status: "locked", type: "review" },
    ],
  },
  {
    title: "Unit 4",
    subtitle: "Vocal Confidence",
    grad: ["#F43F5E", "#DB2777"],
    lessons: [
      { title: "Projection Power", status: "locked" },
      { title: "Authority Tone", status: "locked" },
      { title: "Audience Control", status: "locked" },
      { title: "Confidence Challenge", status: "locked", type: "challenge" },
    ],
  },
];

// Horizontal fractions each node sits at along the winding path, cycling — matches
// the original design's hand-picked zigzag rather than a formula.
const FRACS = [0.12, 0.4, 0.68, 0.47, 0.23];
const TRACK_W = 660;
const TOP0 = 46;
const GAP = 126;
const NODE_R = 31;

function UnitPath({ unit }: { unit: Unit }) {
  const n = unit.lessons.length;
  const height = TOP0 + (n - 1) * GAP + 96;
  const points = unit.lessons.map((_, i) => {
    const cx = FRACS[i % FRACS.length] * TRACK_W;
    const cy = TOP0 + i * GAP;
    return { cx, cy };
  });
  const polyline = points.map((p) => `${p.cx.toFixed(0)},${p.cy.toFixed(0)}`).join(" ");
  const hasCurrent = unit.lessons.some((l) => l.status === "current");

  return (
    <div
      className="relative mx-auto"
      style={{ width: TRACK_W, height }}
    >
      <svg className="absolute top-0 left-0 pointer-events-none" width={TRACK_W} height={height} viewBox={`0 0 ${TRACK_W} ${height}`}>
        <polyline points={polyline} fill="none" stroke="#E2E2EA" strokeWidth={3} strokeDasharray="2 9" strokeLinecap="round" />
      </svg>

      {unit.lessons.map((lesson, i) => {
        const { cx, cy } = points[i];
        const completed = lesson.status === "completed";
        const current = lesson.status === "current";
        const locked = lesson.status === "locked";
        const Icon = completed ? Check : current ? Play : lesson.type ? Star : Lock;

        return (
          <div key={lesson.title}>
            {current && (
              <div
                className="absolute bg-white border-[1.5px] border-[#C9B6F3] rounded-[10px] px-[11px] py-1 text-[10.5px] font-bold uppercase tracking-[0.08em] text-[#9333EA] whitespace-nowrap animate-bounce"
                style={{ left: cx, top: cy - 52, transform: "translateX(-50%)", boxShadow: "0 6px 16px -6px rgba(80,50,220,0.4)" }}
              >
                Start
              </div>
            )}
            <button
              disabled={locked}
              className={`absolute w-[62px] h-[62px] rounded-full flex items-center justify-center border-none transition-transform ${
                locked ? "cursor-not-allowed bg-[#F1F1F5] text-[#B7B7C2]" : "cursor-pointer hover:scale-[1.08]"
              } ${current ? "relative" : ""}`}
              style={{
                left: cx - NODE_R,
                top: cy - NODE_R,
                background: completed ? `linear-gradient(135deg,${unit.grad[0]},${unit.grad[1]})` : current ? "linear-gradient(135deg,#9333EA,#2563EB)" : undefined,
                color: completed || current ? "#fff" : undefined,
                boxShadow: completed
                  ? "0 8px 18px -6px rgba(20,20,40,0.28)"
                  : current
                    ? "0 10px 22px -6px rgba(80,50,220,0.55)"
                    : "none",
              }}
            >
              {current && (
                <span
                  className="absolute rounded-full border-[3px] border-[#9333EA]/35 animate-ping"
                  style={{ inset: -6 }}
                />
              )}
              <Icon className="w-[26px] h-[26px] relative" />
              {current && (
                <span className="absolute -top-[3px] -right-[3px] w-5 h-5 rounded-full bg-[#F59E0B] border-2 border-white flex items-center justify-center text-[11px] font-bold text-white z-[3]">
                  !
                </span>
              )}
            </button>
            <div
              className={`absolute text-center w-[120px] text-xs font-semibold ${
                locked ? "text-[#A6A5B0] font-medium" : completed ? "text-[#3B3A44]" : "text-[#9333EA]"
              }`}
              style={{ left: cx, top: cy + 38, transform: "translateX(-50%)" }}
            >
              {lesson.title}
            </div>
            {completed && (
              <div className="absolute flex gap-0.5" style={{ left: cx, top: cy + 60, transform: "translateX(-50%)" }}>
                {[0, 1, 2].map((i) => (
                  <Star key={i} className="w-3 h-3 text-[#F59E0B] fill-[#F59E0B]" />
                ))}
              </div>
            )}
          </div>
        );
      })}

      {hasCurrent && (
        <button
          className="absolute w-full flex items-center justify-center gap-2 text-sm font-semibold rounded-xl py-[13px] bg-[#9333EA] text-white transition-colors hover:bg-[#7E22CE]"
          style={{ top: height - 46 }}
        >
          Continue unit <ArrowRight className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}

export function LearningPath({ onNavigate: _onNavigate }: LearningPathProps) {
  return (
    <div className="text-[#17161B] tracking-[-0.01em]">
      <h1 className="text-[30px] font-semibold tracking-[-0.03em] mb-1.5">Learning Path</h1>
      <p className="text-[14.5px] text-[#71707B]">Progress through structured units to master your speech.</p>

      <div
        className="relative overflow-hidden rounded-[18px] px-7 py-[26px] text-white my-[22px]"
        style={{ background: "linear-gradient(135deg,#9333EA 0%,#2563EB 100%)", boxShadow: "0 12px 30px -12px rgba(80,50,220,0.5)" }}
      >
        <div className="absolute rounded-full bg-white/[0.09]" style={{ width: 130, height: 130, top: -40, right: -30 }} />
        <div className="absolute rounded-full bg-white/[0.09]" style={{ width: 80, height: 80, bottom: -24, left: -16 }} />
        <div className="relative z-10">
          <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-white/[0.82]">
            <Sparkles className="w-[15px] h-[15px] text-[#FCD34D]" /> Recommended for you
          </div>
          <div className="text-[23px] font-semibold tracking-[-0.02em] mt-2.5 mb-1.5">Pause Technique</div>
          <div className="text-[13.5px] leading-relaxed text-white/85 max-w-lg">
            Based on your last analysis — reducing long pauses will boost your fluency by +7 points.
          </div>
          <div className="flex gap-2.5 mt-4 flex-wrap">
            <span className="text-xs font-semibold bg-white/[0.16] rounded-full px-3.5 py-1.5 backdrop-blur-sm">+7 Fluency pts</span>
            <span className="text-xs font-semibold bg-white/[0.16] rounded-full px-3.5 py-1.5 backdrop-blur-sm">Unit 2 · Lesson 2</span>
          </div>
        </div>
      </div>

      <div className="space-y-0">
        {UNITS.map((unit) => {
          const done = unit.lessons.filter((l) => l.status === "completed").length;
          const total = unit.lessons.length;
          return (
            <div key={unit.title} className="mb-[22px]">
              <div className="flex items-center justify-between gap-4 px-5 py-4 rounded-t-2xl border border-b-0 border-[#EAEAEF] bg-white">
                <div className="flex items-center gap-[13px]">
                  <div
                    className="w-2.5 h-11 rounded-full shrink-0"
                    style={{ background: `linear-gradient(180deg,${unit.grad[0]},${unit.grad[1]})` }}
                  />
                  <div>
                    <div className="text-[11px] font-semibold uppercase tracking-[0.07em] text-[#A6A5B0]">{unit.title}</div>
                    <div className="text-[17px] font-semibold tracking-[-0.01em] mt-0.5">{unit.subtitle}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[22px] font-semibold tracking-[-0.02em]">
                    {done}
                    <span className="text-[13px] font-medium text-[#A6A5B0]">/{total}</span>
                  </div>
                  <div className="text-[11px] text-[#71707B] font-medium">lessons done</div>
                </div>
              </div>
              <div className="h-1.5 bg-[#F3F3F7] relative border-x border-[#EAEAEF]">
                <div
                  className="absolute left-0 top-0 bottom-0 rounded-r-full"
                  style={{ width: `${(done / total) * 100}%`, background: `linear-gradient(90deg,${unit.grad[0]},${unit.grad[1]})` }}
                />
              </div>
              <div
                className="border border-t-0 border-[#EAEAEF] rounded-b-2xl pt-5 pb-6 overflow-x-auto"
                style={{ background: "linear-gradient(180deg,#FAFAFC,#FFFFFF)" }}
              >
                <UnitPath unit={unit} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
