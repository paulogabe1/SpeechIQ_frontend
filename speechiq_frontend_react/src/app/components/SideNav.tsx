import {
  AudioLines,
  Mic,
  LayoutDashboard,
  BookOpen,
  Target,
  BarChart2,
  User,
  Sparkles,
  ChevronRight,
} from "lucide-react";

type View = "home" | "practice" | "synthesis" | "learn" | "goals" | "history" | "profile";

interface SideNavProps {
  currentPage: View;
  onNavigate: (page: View) => void;
}

const menuItems: { id: View; icon: typeof LayoutDashboard; label: string }[] = [
  { id: "home", icon: LayoutDashboard, label: "Home" },
  { id: "learn", icon: BookOpen, label: "Learn" },
  { id: "goals", icon: Target, label: "Goals" },
  { id: "history", icon: BarChart2, label: "History" },
];

function NavItem({
  icon: Icon,
  label,
  active,
  onClick,
}: {
  icon: typeof LayoutDashboard;
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`relative flex items-center gap-3 px-3 py-2.5 rounded-[11px] w-full text-left transition-colors duration-[130ms] ${
        active
          ? "bg-white text-[#17161B] shadow-[0_1px_2px_rgba(20,20,40,0.05),0_0_0_1px_#EAEAEF]"
          : "text-[#71707B] hover:bg-[#F3F3F7] hover:text-[#3B3A44]"
      }`}
    >
      {active && (
        <span className="absolute -left-3.5 top-[9px] bottom-[9px] w-[3px] rounded-r-[3px] bg-gradient-to-b from-[#9333EA] to-[#2563EB]" />
      )}
      <Icon className={`w-[18px] h-[18px] shrink-0 ${active ? "text-[#9333EA]" : "text-[#A6A5B0]"}`} />
      <span className={`text-sm tracking-[-0.01em] ${active ? "font-semibold" : "font-medium"}`}>{label}</span>
    </button>
  );
}

export function SideNav({ currentPage, onNavigate }: SideNavProps) {
  return (
    <nav className="sticky top-0 h-screen w-64 shrink-0 bg-white border-r border-[#EAEAEF] flex flex-col text-[#17161B] tracking-[-0.01em] antialiased z-50">
      {/* Brand */}
      <button
        onClick={() => onNavigate("home")}
        className="flex items-center gap-[11px] px-[22px] pt-6 pb-[18px] text-left"
      >
        <div className="w-9 h-9 rounded-[11px] bg-gradient-to-br from-[#9333EA] to-[#2563EB] flex items-center justify-center shadow-[0_6px_14px_-4px_rgba(90,50,220,0.5)]">
          <AudioLines className="w-[19px] h-[19px] text-white" />
        </div>
        <span className="text-lg font-semibold tracking-[-0.03em]">
          Speech<span className="text-[#9333EA]">IQ</span>
        </span>
      </button>

      <div className="flex-1 px-3.5 py-1.5 flex flex-col gap-0.5">
        {/* Practice CTA */}
        <button
          onClick={() => onNavigate("practice")}
          className="flex items-center gap-[11px] mt-1 mb-0.5 px-3.5 py-3 rounded-[12px] bg-gradient-to-br from-[#9333EA] to-[#2563EB] text-white w-full shadow-[0_8px_18px_-6px_rgba(90,50,220,0.5)] transition-[transform,box-shadow] duration-[130ms] hover:-translate-y-px hover:shadow-[0_12px_22px_-6px_rgba(90,50,220,0.55)]"
        >
          <Mic className="w-[18px] h-[18px]" />
          <span className="text-sm font-semibold">Practice</span>
          <span className="ml-auto text-[11px] font-medium text-white/[0.72]">+50 XP</span>
        </button>

        <div className="text-[10.5px] font-semibold tracking-[0.11em] uppercase text-[#A6A5B0] px-2.5 pt-4 pb-[7px]">
          Menu
        </div>
        {menuItems.map(({ id, icon, label }) => (
          <NavItem key={id} icon={icon} label={label} active={currentPage === id} onClick={() => onNavigate(id)} />
        ))}

        <div className="text-[10.5px] font-semibold tracking-[0.11em] uppercase text-[#A6A5B0] px-2.5 pt-4 pb-[7px]">
          Account
        </div>
        <NavItem icon={User} label="Profile" active={currentPage === "profile"} onClick={() => onNavigate("profile")} />

        {/* Voice Lab / Pro upsell */}
        <button
          onClick={() => onNavigate("synthesis")}
          className="block text-left mt-2.5 mx-1 p-4 rounded-[14px] text-white relative overflow-hidden"
          style={{ background: "linear-gradient(140deg,#1B1730,#2A2350)" }}
        >
          <div
            className="absolute -right-[30px] -top-[30px] w-[110px] h-[110px] rounded-full"
            style={{ background: "radial-gradient(circle,rgba(140,90,255,0.55),transparent 70%)" }}
          />
          <div className="text-[10px] font-semibold tracking-[0.1em] uppercase text-[#C9B6FF] flex items-center gap-1.5 relative">
            <Sparkles className="w-[13px] h-[13px]" /> Voice Lab
          </div>
          <div className="text-sm font-semibold mt-[7px] mb-[3px] tracking-[-0.01em] relative">
            Unlock SpeechIQ Pro
          </div>
          <div className="text-[11.5px] text-white/70 leading-[1.4] relative">
            Clone your voice &amp; get unlimited AI coaching.
          </div>
          <div className="mt-3 w-full text-center text-[12.5px] font-semibold text-[#1B1730] bg-white rounded-[9px] py-2 relative">
            Upgrade
          </div>
        </button>
      </div>

      {/* User footer */}
      <div className="px-3.5 pt-3 pb-4 border-t border-[#EAEAEF]">
        <button
          onClick={() => onNavigate("profile")}
          className="flex items-center gap-[11px] px-2.5 py-[9px] rounded-[12px] w-full text-left transition-colors duration-[130ms] hover:bg-[#F3F3F7]"
        >
          <div
            className="w-9 h-9 rounded-full text-white flex items-center justify-center font-semibold text-[15px] shrink-0"
            style={{ background: "linear-gradient(135deg,#A855F7,#3B82F6)" }}
          >
            A
          </div>
          <div>
            <div className="text-[13.5px] font-semibold leading-tight">Alex Rivera</div>
            <div className="text-[11.5px] text-[#71707B] mt-px">Level 12 · Free plan</div>
          </div>
          <ChevronRight className="ml-auto w-4 h-4 text-[#A6A5B0]" />
        </button>
      </div>
    </nav>
  );
}
