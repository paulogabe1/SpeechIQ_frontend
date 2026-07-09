import { useState } from "react";
import {
  AudioLines,
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  Check,
  ArrowRight,
  MailCheck,
} from "lucide-react";
import { Dashboard } from "./Dashboard";

interface LoginProps {
  onSignIn: (remember: boolean) => void;
}

type AuthMode = "signin" | "signup" | "forgot";

const MODE_META: Record<AuthMode, { title: string; subtitle: string; submitLabel: string }> = {
  signin: {
    title: "Welcome back",
    subtitle: "Sign in to continue your practice.",
    submitLabel: "Sign in",
  },
  signup: {
    title: "Create your account",
    subtitle: "Start improving your speech today.",
    submitLabel: "Create account",
  },
  forgot: {
    title: "Reset your password",
    subtitle: "Enter your email and we'll send you a reset link.",
    submitLabel: "Send reset link",
  },
};

const inputClass =
  "w-full font-[inherit] text-sm text-[#17161B] bg-white border border-[#EAEAEF] rounded-[11px] py-3 px-10 transition-[border-color,box-shadow] duration-[130ms] tracking-[-0.01em] placeholder:text-[#A6A5B0] focus:outline-none focus:border-[#9333EA] focus:shadow-[0_0_0_3px_rgba(124,58,237,0.13)]";

const socialBtnClass =
  "flex items-center justify-center gap-2.5 w-full font-[inherit] text-sm font-semibold text-[#17161B] bg-white border border-[#EAEAEF] rounded-[11px] p-[11px] cursor-pointer transition-colors duration-[130ms] hover:bg-[#F3F3F7] hover:border-[#DEDDE6]";

const submitBtnClass =
  "flex items-center justify-center gap-2 w-full font-[inherit] text-[14.5px] font-semibold text-white bg-[#17161B] border-none rounded-[11px] p-[13px] cursor-pointer transition-colors duration-[130ms] hover:bg-black";

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" className="shrink-0">
      <path fill="#4285F4" d="M23.52 12.27c0-.79-.07-1.54-.2-2.27H12v4.51h6.47a5.53 5.53 0 0 1-2.4 3.63v3h3.88c2.27-2.09 3.57-5.17 3.57-8.87z" />
      <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.76-2.11-6.7-4.94H1.29v3.09A12 12 0 0 0 12 24z" />
      <path fill="#FBBC05" d="M5.3 14.31A7.2 7.2 0 0 1 4.92 12c0-.8.14-1.58.38-2.31V6.6H1.29A12 12 0 0 0 0 12c0 1.94.46 3.77 1.29 5.4z" />
      <path fill="#EA4335" d="M12 4.75c1.76 0 3.34.61 4.58 1.8l3.44-3.44C17.95 1.19 15.24 0 12 0A12 12 0 0 0 1.29 6.6l4.01 3.09C6.24 6.86 8.88 4.75 12 4.75z" />
    </svg>
  );
}

function AppleIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="#17161B" className="shrink-0">
      <path d="M17.05 12.53c-.02-2.02 1.65-2.99 1.72-3.04-.94-1.37-2.4-1.56-2.92-1.58-1.24-.13-2.42.73-3.05.73-.63 0-1.6-.71-2.63-.69-1.35.02-2.6.79-3.29 2-1.4 2.43-.36 6.02 1 8 .67.96 1.46 2.04 2.5 2 1-.04 1.38-.65 2.59-.65 1.2 0 1.55.65 2.6.63 1.07-.02 1.75-.98 2.41-1.95.76-1.12 1.07-2.2 1.09-2.26-.02-.01-2.09-.8-2.11-3.17zM15.1 6.36c.55-.67.92-1.6.82-2.53-.79.03-1.75.53-2.32 1.19-.51.59-.96 1.53-.84 2.44.88.07 1.79-.45 2.34-1.1z" />
    </svg>
  );
}

interface AuthFormProps {
  onSignIn: (remember: boolean) => void;
}

export function AuthForm({ onSignIn }: AuthFormProps) {
  const [mode, setMode] = useState<AuthMode>("signin");
  const [showPw, setShowPw] = useState(false);
  const [remember, setRemember] = useState(false);
  const [sent, setSent] = useState(false);

  const meta = MODE_META[mode];
  const forgotSent = mode === "forgot" && sent;

  const goTo = (next: AuthMode) => {
    setMode(next);
    setSent(false);
  };

  const submit = () => {
    if (mode === "forgot") setSent(true);
    else onSignIn(remember);
  };

  if (forgotSent) {
    return (
      <div className="w-full text-[#17161B] tracking-[-0.01em] antialiased text-center py-2">
        <div className="w-[54px] h-[54px] rounded-[15px] bg-[#F3ECFD] text-[#9333EA] flex items-center justify-center mx-auto mb-[18px]">
          <MailCheck className="w-[26px] h-[26px]" />
        </div>
        <div className="text-xl font-semibold tracking-[-0.02em]">Check your inbox</div>
        <div className="text-[13.5px] text-[#71707B] mt-2 mb-[22px] leading-[1.55]">
          We've sent a password reset link to your email. It expires in 30 minutes.
        </div>
        <button className={submitBtnClass} onClick={() => goTo("signin")}>
          Back to sign in
        </button>
      </div>
    );
  }

  return (
    <div className="w-full text-[#17161B] tracking-[-0.01em] antialiased">
      <div className="mb-6">
        <div className="text-[23px] font-semibold tracking-[-0.03em]">{meta.title}</div>
        <div className="text-sm text-[#71707B] mt-1.5 leading-normal">{meta.subtitle}</div>
      </div>

      {mode !== "forgot" && (
        <>
          <div className="flex flex-col gap-2.5">
            <button className={socialBtnClass} onClick={() => onSignIn(remember)}>
              <GoogleIcon /> Continue with Google
            </button>
            <button className={socialBtnClass} onClick={() => onSignIn(remember)}>
              <AppleIcon /> Continue with Apple
            </button>
          </div>
          <div className="flex items-center gap-3 my-[18px] text-[#A6A5B0] text-xs font-medium before:content-[''] before:flex-1 before:h-px before:bg-[#EAEAEF] after:content-[''] after:flex-1 after:h-px after:bg-[#EAEAEF]">
            or
          </div>
        </>
      )}

      {mode === "signup" && (
        <div className="flex flex-col gap-[7px] mb-3.5">
          <label className="text-[12.5px] font-semibold text-[#3B3A44]">Full name</label>
          <div className="relative flex items-center">
            <User className="absolute left-[13px] text-[#A6A5B0] w-[17px] h-[17px] pointer-events-none" />
            <input type="text" placeholder="Alex Rivera" className={inputClass} />
          </div>
        </div>
      )}

      <div className="flex flex-col gap-[7px] mb-3.5">
        <label className="text-[12.5px] font-semibold text-[#3B3A44]">Email</label>
        <div className="relative flex items-center">
          <Mail className="absolute left-[13px] text-[#A6A5B0] w-[17px] h-[17px] pointer-events-none" />
          <input type="email" placeholder="you@email.com" className={inputClass} />
        </div>
      </div>

      {mode !== "forgot" && (
        <div className="flex flex-col gap-[7px] mb-3.5">
          <div className="flex items-center justify-between">
            <label className="text-[12.5px] font-semibold text-[#3B3A44]">Password</label>
            {mode === "signin" && (
              <a
                className="text-xs text-[#9333EA] font-semibold cursor-pointer no-underline"
                onClick={() => goTo("forgot")}
              >
                Forgot?
              </a>
            )}
          </div>
          <div className="relative flex items-center">
            <Lock className="absolute left-[13px] text-[#A6A5B0] w-[17px] h-[17px] pointer-events-none" />
            <input type={showPw ? "text" : "password"} placeholder="••••••••" className={inputClass} />
            <button
              type="button"
              className="absolute right-2.5 bg-transparent border-none p-1.5 cursor-pointer text-[#A6A5B0] flex"
              onClick={() => setShowPw((v) => !v)}
            >
              {showPw ? <EyeOff className="w-[17px] h-[17px]" /> : <Eye className="w-[17px] h-[17px]" />}
            </button>
          </div>
        </div>
      )}

      {mode === "signin" && (
        <div
          className="flex items-center gap-[9px] text-[13px] text-[#3B3A44] mt-0.5 mb-[18px] cursor-pointer select-none"
          onClick={() => setRemember((v) => !v)}
        >
          <span
            className={`w-[18px] h-[18px] rounded-md border-[1.5px] flex items-center justify-center transition-colors duration-[120ms] ${
              remember ? "bg-[#9333EA] border-[#9333EA]" : "border-[#EAEAEF]"
            }`}
          >
            {remember && <Check className="w-3 h-3 text-white" />}
          </span>
          Keep me signed in
        </div>
      )}

      <button className={submitBtnClass} onClick={submit}>
        {meta.submitLabel} <ArrowRight className="w-[17px] h-[17px]" />
      </button>

      <div className="mt-5 text-center text-[13.5px] text-[#71707B]">
        {mode === "signin" && (
          <>
            New to SpeechIQ?{" "}
            <a className="text-[#9333EA] font-semibold cursor-pointer" onClick={() => goTo("signup")}>
              Create an account
            </a>
          </>
        )}
        {mode === "signup" && (
          <>
            Already have an account?{" "}
            <a className="text-[#9333EA] font-semibold cursor-pointer" onClick={() => goTo("signin")}>
              Sign in
            </a>
          </>
        )}
        {mode === "forgot" && (
          <a className="text-[#9333EA] font-semibold cursor-pointer" onClick={() => goTo("signin")}>
            ← Back to sign in
          </a>
        )}
      </div>
    </div>
  );
}

export function Login({ onSignIn }: LoginProps) {
  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 md:p-11 text-[#17161B] tracking-[-0.01em] antialiased font-['Geist','Inter',system-ui,sans-serif]"
      style={{ background: "linear-gradient(160deg,#FAF5FF 0%,#EFF6FF 55%,#F0FDFA 100%)" }}
    >
      <div className="bg-white rounded-3xl overflow-hidden shadow-[0_40px_90px_-34px_rgba(30,25,60,0.4),0_2px_8px_rgba(30,25,60,0.06)] flex w-[980px] max-w-full md:h-[660px]">
        {/* Brand side */}
        <div
          className="hidden md:flex w-[44%] shrink-0 px-[34px] py-9 flex-col text-white relative overflow-hidden"
          style={{ background: "linear-gradient(160deg,#241D42 0%,#312862 58%,#3A2E74 100%)" }}
        >
          <div
            className="absolute w-[340px] h-[340px] rounded-full -top-[90px] -right-[110px]"
            style={{ background: "radial-gradient(circle,rgba(140,90,255,0.5),transparent 70%)" }}
          />
          <div className="flex items-center gap-[11px] relative">
            <div className="w-[34px] h-[34px] rounded-[10px] flex items-center justify-center shrink-0 bg-white/[0.16]">
              <AudioLines className="w-[18px] h-[18px] text-white" />
            </div>
            <div className="text-[17px] font-semibold tracking-[-0.03em]">SpeechIQ</div>
          </div>

          <div className="flex-1 flex flex-col justify-center relative">
            <div className="text-[30px] font-semibold tracking-[-0.03em] leading-[1.18] max-w-[320px]">
              Your voice is powerful. Learn to use it.
            </div>
            <div className="text-[13.5px] text-white/[0.72] mt-4 leading-[1.55] max-w-[300px]">
              Record, analyze, and improve with AI feedback across five dimensions of how you speak.
            </div>
            {/* Live, non-interactive dashboard preview standing in for the design's screenshot */}
            <div className="mt-6 rounded-xl overflow-hidden bg-white w-[329px] h-[193px] shadow-[0_22px_44px_-16px_rgba(0,0,0,0.55)] border border-white/[0.14] relative">
              <div
                className="w-[800px] h-[470px] origin-top-left pointer-events-none select-none"
                style={{ transform: "scale(0.411)" }}
                aria-hidden="true"
              >
                <div className="p-6 bg-[#F5F5F8] min-h-full">
                  <Dashboard onNavigate={() => {}} />
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-6 relative">
            {[
              { n: "4.8★", l: "App rating" },
              { n: "82%", l: "Avg. improvement" },
              { n: "14k+", l: "Speakers" },
            ].map((s) => (
              <div key={s.l}>
                <div className="text-[19px] font-semibold font-['Geist_Mono',monospace]">{s.n}</div>
                <div className="text-[11px] text-white/60 mt-0.5 leading-[1.3]">{s.l}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Form side */}
        <div className="flex-1 px-6 py-10 md:px-10 md:py-11 flex flex-col justify-center">
          <div className="w-full max-w-[360px] mx-auto">
            <AuthForm onSignIn={onSignIn} />
          </div>
        </div>
      </div>
    </div>
  );
}
