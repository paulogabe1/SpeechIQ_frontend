import { Mic, MessageSquare, Target, BookOpen, ArrowLeft, ArrowRight } from "lucide-react";
import { useState } from "react";
import { PracticeSession } from "./PracticeSession";

interface PracticeHubProps {
  onNavigate: (page: string) => void;
}

const GUIDED_PROMPTS = [
  { title: "Job Interview Answer", prompt: "Tell me about a time you overcame a professional challenge." },
  { title: "Presentation Opener", prompt: "Open a presentation introducing a new product to your team." },
  { title: "Elevator Pitch", prompt: "Pitch your business idea to a stranger in under 60 seconds." },
  { title: "Toast or Speech", prompt: "Give a short toast celebrating a friend's achievement." },
];

const FOCUS_DRILL_PROMPT =
  "Describe a recent conversation where you noticed yourself pausing to think. Try to keep your thoughts connected without long gaps of silence.";

const READ_ALOUD_SCRIPT =
  "Public speaking is less about perfect words and more about steady breath and clear intention. When you slow down between ideas, your audience has time to follow you, and your voice carries more confidence with every sentence you complete.";

export function PracticeHub({ onNavigate }: PracticeHubProps) {
  const [activeSession, setActiveSession] = useState<{ prompt?: string; label?: string } | null>(null);
  const [showGuidedPicker, setShowGuidedPicker] = useState(false);

  if (activeSession) {
    return (
      <PracticeSession
        onNavigate={onNavigate}
        onBack={() => {
          setActiveSession(null);
          setShowGuidedPicker(false);
        }}
        prompt={activeSession.prompt}
        promptLabel={activeSession.label}
      />
    );
  }

  if (showGuidedPicker) {
    return (
      <div className="text-[#17161B] tracking-[-0.01em]">
        <button
          onClick={() => setShowGuidedPicker(false)}
          className="inline-flex items-center gap-2 text-[#71707B] hover:text-[#17161B] transition-colors text-sm font-medium py-1.5"
        >
          <ArrowLeft className="w-4 h-4" /> Back to practice modes
        </button>

        <div className="mt-3.5 mb-6">
          <h1 className="text-2xl font-semibold tracking-[-0.02em]">Guided prompts</h1>
          <p className="text-[14.5px] text-[#71707B] mt-1">Pick a scenario to practice for.</p>
        </div>

        <div className="flex flex-col gap-3">
          {GUIDED_PROMPTS.map((g) => (
            <button
              key={g.title}
              onClick={() => setActiveSession({ prompt: g.prompt, label: g.title })}
              className="flex items-center justify-between gap-4 text-left bg-white border border-[#EAEAEF] rounded-2xl px-5 py-[18px] transition-[border-color,transform] hover:border-[#D8CBF5] hover:-translate-y-px"
            >
              <div>
                <div className="text-[15px] font-semibold">{g.title}</div>
                <div className="text-[12.5px] text-[#71707B] mt-[3px] max-w-[520px]">{g.prompt}</div>
              </div>
              <ArrowRight className="w-[18px] h-[18px] text-[#A6A5B0] shrink-0" />
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="text-[#17161B] tracking-[-0.01em]">
      <h1 className="text-[30px] font-semibold tracking-[-0.03em] mb-1.5">Practice</h1>
      <p className="text-[14.5px] text-[#71707B]">Choose how you want to practice today.</p>

      <button
        onClick={() => setActiveSession({})}
        className="group flex items-center gap-[22px] w-full text-left rounded-[18px] px-7 py-[26px] text-white bg-gradient-to-br from-[#9333EA] to-[#2563EB] shadow-[0_12px_30px_-10px_rgba(80,50,220,0.5)] transition-[transform,box-shadow] duration-150 hover:-translate-y-0.5 hover:shadow-[0_18px_38px_-12px_rgba(80,50,220,0.55)] mt-[22px]"
      >
        <div className="w-[58px] h-[58px] rounded-[16px] bg-white/[0.16] flex items-center justify-center shrink-0">
          <Mic className="w-[27px] h-[27px]" />
        </div>
        <div>
          <div className="text-[11px] font-semibold tracking-[0.09em] uppercase text-white/75">Quick practice</div>
          <div className="text-xl font-semibold tracking-[-0.02em] mt-[3px]">Jump in with a random prompt</div>
          <div className="text-[13.5px] text-white/80 mt-1">
            Earn <b className="text-white font-semibold">+50 XP</b> for every session
          </div>
        </div>
        <ArrowRight className="ml-auto shrink-0 w-[23px] h-[23px] text-white/85 transition-transform duration-150 group-hover:translate-x-1" />
      </button>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 mt-3.5">
        <button
          onClick={() => setShowGuidedPicker(true)}
          className="text-left bg-white border border-[#EAEAEF] rounded-2xl p-5 transition-[border-color,transform] hover:border-[#D8CBF5] hover:-translate-y-0.5"
        >
          <div className="w-[42px] h-[42px] rounded-[12px] bg-[#F3ECFD] text-[#9333EA] flex items-center justify-center mb-3.5">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div className="text-[15px] font-semibold">Guided Prompts</div>
          <div className="text-[12.5px] text-[#71707B] mt-[3px] leading-[1.45]">Practice for a specific scenario</div>
        </button>

        <button
          onClick={() => setActiveSession({ prompt: FOCUS_DRILL_PROMPT, label: "Focus Drill · Fluency" })}
          className="text-left bg-white border border-[#EAEAEF] rounded-2xl p-5 transition-[border-color,transform] hover:border-[#F5D3B0] hover:-translate-y-0.5"
        >
          <div className="w-[42px] h-[42px] rounded-[12px] bg-[#FDEEE0] text-[#EA580C] flex items-center justify-center mb-3.5">
            <Target className="w-5 h-5" />
          </div>
          <div className="text-[15px] font-semibold">Focus Drill</div>
          <div className="text-[12.5px] text-[#71707B] mt-[3px] leading-[1.45]">Targets your weakest metric</div>
        </button>

        <button
          onClick={() => setActiveSession({ prompt: READ_ALOUD_SCRIPT, label: "Read This Aloud" })}
          className="text-left bg-white border border-[#EAEAEF] rounded-2xl p-5 transition-[border-color,transform] hover:border-[#B7E3CC] hover:-translate-y-0.5"
        >
          <div className="w-[42px] h-[42px] rounded-[12px] bg-[#E3F5EC] text-[#059669] flex items-center justify-center mb-3.5">
            <BookOpen className="w-5 h-5" />
          </div>
          <div className="text-[15px] font-semibold">Read Aloud</div>
          <div className="text-[12.5px] text-[#71707B] mt-[3px] leading-[1.45]">Clean pacing &amp; clarity baseline</div>
        </button>
      </div>
    </div>
  );
}
