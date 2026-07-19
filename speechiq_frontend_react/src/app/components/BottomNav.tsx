import { Home, History, Target, BookOpen, User } from "lucide-react";

interface BottomNavProps {
  currentPage: string;
  onNavigate: (page: string) => void;
}

const navItems = [
  { id: "home", icon: Home, label: "Home" },
  { id: "learn", icon: BookOpen, label: "Learn" },
  { id: "goals", icon: Target, label: "Goals" },
  { id: "history", icon: History, label: "History" },
  { id: "profile", icon: User, label: "Profile" },
];

export function BottomNav({ currentPage, onNavigate }: BottomNavProps) {
  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-[#EAEAEF] pb-[env(safe-area-inset-bottom)]">
      <div className="flex items-stretch justify-around">
        {navItems.map(({ id, icon: Icon, label }) => {
          const active = currentPage === id;
          return (
            <button
              key={id}
              onClick={() => onNavigate(id)}
              className="flex flex-col items-center justify-center gap-1 flex-1 py-2.5 min-w-0"
            >
              <Icon className={`w-5 h-5 ${active ? "text-[#9333EA]" : "text-[#A6A5B0]"}`} />
              <span
                className={`text-[10.5px] tracking-[-0.01em] ${
                  active ? "font-semibold text-[#17161B]" : "font-medium text-[#71707B]"
                }`}
              >
                {label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
