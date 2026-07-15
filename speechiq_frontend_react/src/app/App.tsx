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
import { Login } from "./components/Login";
import { API_BASE_URL } from "./lib/config";

type View = "home" | "practice" | "synthesis" | "learn" | "goals" | "history" | "profile";

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

  return (
    <div className="min-h-screen flex bg-[#F5F5F8] text-[#17161B] tracking-[-0.01em] antialiased font-['Geist','Inter',system-ui,sans-serif]">
      <Toaster position="top-center" richColors />
      <SideNav currentPage={currentView} onNavigate={(page) => setCurrentView(page)} />

      <main className="flex-1 min-w-0">
        <div className={`${wrapWidth} mx-auto px-8 pt-7 pb-16`}>
          {currentView === "home" && <Dashboard onNavigate={navigate} />}
          {currentView === "practice" && <PracticeHub onNavigate={navigate} />}
          {currentView === "synthesis" && <VoiceSynthesis onNavigate={navigate} />}
          {currentView === "learn" && <LearningPath onNavigate={navigate} />}
          {currentView === "goals" && <Goals onNavigate={navigate} />}
          {currentView === "history" && <PracticeHistory onNavigate={navigate} />}
          {currentView === "profile" && <Profile onNavigate={navigate} />}
        </div>
      </main>
    </div>
  );
}
