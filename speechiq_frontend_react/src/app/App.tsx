import { useEffect, useState } from "react";
import { Toaster } from "sonner";
import { Dashboard } from "./components/Dashboard";
import { PracticeHub } from "./components/PracticeHub";
import { VoiceSynthesis } from "./components/VoiceSynthesis";
import { PracticeHistory } from "./components/PracticeHistory";
import { Profile } from "./components/Profile";
import { Goals } from "./components/Goals";
import { LearningPath } from "./components/LearningPath";
import { SideNav } from "./components/SideNav";
import { BottomNav } from "./components/BottomNav";
import { Login } from "./components/Login";
import { API_BASE_URL } from "./lib/config";
import { AudioLines } from "lucide-react";

type View = "home" | "practice" | "synthesis" | "learn" | "goals" | "history" | "profile";

// Practice and Voice Lab are full-screen flows with no chrome, same as the desktop
// SideNav's behavior — matches the Flutter reference app's documented navigation.
const TAB_VIEWS: View[] = ["home", "learn", "goals", "history", "profile"];

// UI-only auth gate for now — real Supabase auth is a later wiring task. "Keep me
// signed in" decides whether the flag survives the browser session.
const AUTH_FLAG = "speechiq_signed_in";

export default function App() {
  const [currentView, setCurrentView] = useState<View>("home");
  const [signedIn, setSignedIn] = useState(
    () => localStorage.getItem(AUTH_FLAG) === "1" || sessionStorage.getItem(AUTH_FLAG) === "1",
  );

  const navigate = (page: string) => setCurrentView(page as View);

  // Hitting the backend here, as early as possible in the visit, gives it a head
  // start on cold-starting (importing torch/whisper + loading the model) before
  // the user reaches the practice flow. Fire-and-forget: a slow or failed ping
  // must never block or affect the UI, so no loading state and errors are
  // swallowed silently. The header skips ngrok's free-tier browser warning
  // interstitial, which otherwise intercepts this request instead of the backend.
  useEffect(() => {
    fetch(`${API_BASE_URL}/`, { headers: { "ngrok-skip-browser-warning": "1" } }).catch(() => {});
  }, []);

  const handleSignIn = (remember: boolean) => {
    (remember ? localStorage : sessionStorage).setItem(AUTH_FLAG, "1");
    setSignedIn(true);
  };

  if (!signedIn) {
    return <Login onSignIn={handleSignIn} />;
  }

  // The redesigned pages (dashboard) use the full 1140px canvas. The practice flow's
  // analysis screen needs ~1040px for its charts and breakdown+bell-curve grid. Pages
  // still on the old design keep their narrower 720px column until they're ported.
  const wrapWidth =
    currentView === "home"
      ? "max-w-[1140px]"
      : currentView === "practice"
        ? "max-w-[1104px]"
        : "max-w-[784px]";

  const isTabView = TAB_VIEWS.includes(currentView);

  return (
    <div className="min-h-screen flex bg-[#F5F5F8] text-[#17161B] tracking-[-0.01em] antialiased font-['Geist','Inter',system-ui,sans-serif]">
      <Toaster position="top-center" richColors />
      <SideNav currentPage={currentView} onNavigate={(page) => setCurrentView(page)} />

      {/* Mobile top bar — replaces the SideNav's brand mark below lg, where the
          sidebar itself is hidden entirely. */}
      {isTabView && (
        <div className="lg:hidden fixed top-0 left-0 right-0 z-40 flex items-center gap-2.5 px-4 py-3 bg-white border-b border-[#EAEAEF]">
          <div className="w-8 h-8 rounded-[9px] bg-gradient-to-br from-[#9333EA] to-[#2563EB] flex items-center justify-center shrink-0">
            <AudioLines className="w-[17px] h-[17px] text-white" />
          </div>
          <span className="text-base font-semibold tracking-[-0.03em]">
            Speech<span className="text-[#9333EA]">IQ</span>
          </span>
        </div>
      )}

      <main className="flex-1 min-w-0">
        <div
          className={`${wrapWidth} mx-auto px-4 sm:px-6 lg:px-8 pt-[72px] lg:pt-7 ${
            isTabView ? "pb-24 lg:pb-16" : "pb-16"
          }`}
        >
          {currentView === "home" && <Dashboard onNavigate={navigate} />}
          {currentView === "practice" && <PracticeHub onNavigate={navigate} />}
          {currentView === "synthesis" && <VoiceSynthesis onNavigate={navigate} />}
          {currentView === "learn" && <LearningPath onNavigate={navigate} />}
          {currentView === "goals" && <Goals onNavigate={navigate} />}
          {currentView === "history" && <PracticeHistory onNavigate={navigate} />}
          {currentView === "profile" && <Profile onNavigate={navigate} />}
        </div>
      </main>

      {isTabView && <BottomNav currentPage={currentView} onNavigate={(page) => setCurrentView(page as View)} />}
    </div>
  );
}
