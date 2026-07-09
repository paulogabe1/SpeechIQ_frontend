import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";

const STAGES = [
  "Uploading your recording...",
  "Transcribing your speech...",
  "Detecting pauses & pacing...",
  "Scoring fluency, clarity & confidence...",
  "Putting together your feedback...",
];
const STAGE_INTERVAL_MS = 1800;

/**
 * Full-screen overlay shown while the backend analyzes a recording. The
 * FastAPI pipeline doesn't stream real progress events back, so these stages
 * are a timed sequence rather than genuine per-step completion — it advances
 * every STAGE_INTERVAL_MS and holds on the last stage if analysis runs long,
 * rather than looping back to the start (which would read as "stuck/restarting").
 */
export function AnalyzingOverlay() {
  const [stageIndex, setStageIndex] = useState(0);

  useEffect(() => {
    setStageIndex(0);
    const interval = window.setInterval(() => {
      setStageIndex((i) => Math.min(i + 1, STAGES.length - 1));
    }, STAGE_INTERVAL_MS);
    return () => window.clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 bg-white/85 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl border border-purple-100 px-10 py-12 max-w-sm w-full flex flex-col items-center text-center">
        <div className="relative w-20 h-20 mb-6">
          <div className="absolute inset-0 rounded-full border-4 border-purple-100" />
          <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-purple-600 border-r-blue-600 animate-spin" />
        </div>

        <AnimatePresence mode="wait">
          <motion.p
            key={stageIndex}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.25 }}
            className="text-lg font-bold text-gray-900 mb-4"
          >
            {STAGES[stageIndex]}
          </motion.p>
        </AnimatePresence>

        <div className="flex items-center gap-1.5">
          {STAGES.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all ${
                i === stageIndex ? "w-6 bg-purple-600" : i < stageIndex ? "w-1.5 bg-purple-300" : "w-1.5 bg-gray-200"
              }`}
            />
          ))}
        </div>

        <p className="text-xs text-gray-400 mt-6">This usually takes a few seconds</p>
      </div>
    </div>
  );
}
