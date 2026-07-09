import {
  ArrowLeft,
  ArrowRight,
  RotateCcw,
  Share2,
  Award,
  TrendingUp,
  Sparkles,
  CheckCircle2,
  Target,
  FileText,
  Gauge,
  Clock,
  Pause,
  MessageSquare,
  Type,
  Repeat,
  ChevronRight,
  Lightbulb,
  Brain,
  Mic,
  ArrowUpRight,
} from "lucide-react";
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";
import { useEffect, useState } from "react";
import confetti from "canvas-confetti";
import { MetricBreakdown } from "./MetricBreakdown";
import { MetricPreviewModal } from "./MetricPreviewModal";
import { PerformanceBellCurve } from "./PerformanceBellCurve";
import { AudioPlayer } from "./AudioPlayer";
import { getWorstMetric, type AnalysisResult, type MetricCategory } from "../lib/analysisResult";
import { calculatePercentile } from "../lib/idealRangeScore";
import { METRIC_DEFINITIONS, OVERALL_DEFINITION, POTENTIAL_DEFINITION, MODULE_MAP } from "../lib/metricDefinitions";
import { scoreColor, grade } from "../lib/scoreDisplay";

interface SpeechMetricsProps {
  analysis: AnalysisResult;
  audioSource?: Blob | File | null;
  onBack: () => void;
  onRetry: () => void;
}

const cardClass = "bg-white border border-[#EAEAEF] rounded-[18px]";
const secHeadClass = "text-[17px] font-semibold tracking-[-0.02em]";
const monoClass = "font-['Geist_Mono',monospace] tracking-[-0.02em] [font-variant-numeric:tabular-nums]";

export function SpeechMetrics({ analysis, audioSource, onBack, onRetry }: SpeechMetricsProps) {
  const [tab, setTab] = useState<"overview" | MetricCategory>("overview");
  const [selectedMetric, setSelectedMetric] = useState<MetricCategory | null>(null);
  const [hoveredMetric, setHoveredMetric] = useState<{ name: string; score: number; potential: number } | null>(null);

  const metrics = [
    { category: "Fluency", score: analysis.fluency.score, potential: analysis.fluency.potential },
    { category: "Pacing", score: analysis.pacing.score, potential: analysis.pacing.potential },
    { category: "Clarity", score: analysis.clarity.score, potential: analysis.clarity.potential },
    { category: "Confidence", score: analysis.confidence.score, potential: analysis.confidence.potential },
    { category: "Vocabulary", score: analysis.vocabulary.score, potential: analysis.vocabulary.potential },
  ];

  const radarData = metrics.map((m) => ({ category: m.category, score: m.score, fullMark: 100 }));

  // Real session's score anchors the last point; the first five remain the
  // only historical reference we have until session persistence ships (no
  // Supabase-backed history yet — see HANDOFF.md priority list).
  const progressData = [
    { session: "1", fluency: 65, pacing: 70 },
    { session: "2", fluency: 68, pacing: 75 },
    { session: "3", fluency: 72, pacing: 80 },
    { session: "4", fluency: 78, pacing: 85 },
    { session: "5", fluency: 82, pacing: 88 },
    { session: "6", fluency: analysis.fluency.score, pacing: analysis.pacing.score },
  ];

  const overallScore = analysis.overallScore;
  const overallPotential = Math.round(analysis.overallPotential);
  const worstMetric = getWorstMetric(analysis);
  const worstMetricData = metrics.find((m) => m.category === worstMetric)!;

  const working = metrics.filter((m) => m.score >= 70).map((m) => m.category);
  const focus = metrics.filter((m) => m.score < 70).map((m) => `${m.category} — aim for 70%+`);

  const { module: coachingModule, desc: coachingDesc } = MODULE_MAP[worstMetric];
  const longPauses = analysis.pauseMetrics.longPauseCount;
  const targetPauses = Math.ceil(longPauses / 2);
  const gainPts = worstMetricData.potential - worstMetricData.score;

  const fillerEntries = Object.entries(analysis.speechMetrics.fillers);
  const totalFillers = fillerEntries.reduce((sum, [, c]) => sum + c, 0);
  const fillersLabel = fillerEntries.length > 0 ? fillerEntries.map(([w, c]) => `${w} ×${c}`).join(" · ") : "none detected";

  const currentPercentile = calculatePercentile(overallScore, 50, 15);
  const potentialPercentile = calculatePercentile(overallPotential, 50, 15);

  useEffect(() => {
    if (overallScore >= 85) {
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
    }
  }, [overallScore]);

  const oc = scoreColor(overallScore);

  return (
    <div className="text-[#17161B] tracking-[-0.01em] max-w-[1140px] mx-auto pb-16">
      {/* Topbar */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={tab === "overview" ? onBack : () => setTab("overview")}
          className="inline-flex items-center gap-2 text-[#71707B] hover:text-[#17161B] transition-colors text-sm font-medium py-1.5"
        >
          <ArrowLeft className="w-4 h-4" /> {tab === "overview" ? "Back to Dashboard" : "Back to overview"}
        </button>
        <div className="flex gap-2.5">
          <button className="inline-flex items-center gap-[7px] text-[13.5px] font-medium rounded-[11px] px-4 py-2.5 border border-[#EAEAEF] bg-white text-[#3B3A44] transition-colors hover:border-[#D6D6DE] hover:bg-[#FCFCFD]">
            <Share2 className="w-[15px] h-[15px]" /> Share
          </button>
          <button
            onClick={onRetry}
            className="inline-flex items-center gap-[7px] text-[13.5px] font-medium rounded-[11px] px-4 py-2.5 border border-[#EAEAEF] bg-white text-[#3B3A44] transition-colors hover:border-[#D6D6DE] hover:bg-[#FCFCFD]"
          >
            <RotateCcw className="w-[15px] h-[15px]" /> Practice again
          </button>
        </div>
      </div>

      {/* Tabbar */}
      <div className="sticky top-0 z-20 flex gap-0.5 flex-wrap bg-[#F5F5F8]/90 backdrop-blur-md border-b border-[#EAEAEF] -mx-8 mb-5 px-8">
        <button
          onClick={() => setTab("overview")}
          className={`relative text-sm px-[15px] py-3.5 transition-colors ${
            tab === "overview" ? "text-[#17161B] font-semibold after:content-[''] after:absolute after:left-[11px] after:right-[11px] after:-bottom-px after:h-0.5 after:bg-[#9333EA] after:rounded-full" : "text-[#71707B] font-medium hover:text-[#17161B]"
          }`}
        >
          Overview
        </button>
        {metrics.map((m) => (
          <button
            key={m.category}
            onClick={() => setTab(m.category as MetricCategory)}
            className={`relative inline-flex items-center text-sm px-[15px] py-3.5 transition-colors ${
              tab === m.category ? "text-[#17161B] font-semibold after:content-[''] after:absolute after:left-[11px] after:right-[11px] after:-bottom-px after:h-0.5 after:bg-[#9333EA] after:rounded-full" : "text-[#71707B] font-medium hover:text-[#17161B]"
            }`}
          >
            {m.category}
            <span className={`ml-1.5 text-xs font-semibold ${monoClass}`} style={{ color: scoreColor(m.score) }}>
              {m.score}
            </span>
          </button>
        ))}
      </div>

      {selectedMetric && (
        <MetricPreviewModal
          metric={selectedMetric}
          score={metrics.find((m) => m.category === selectedMetric)?.score ?? 0}
          result={analysis}
          onClose={() => setSelectedMetric(null)}
          onOpenFull={() => {
            setTab(selectedMetric);
            setSelectedMetric(null);
          }}
        />
      )}

      {tab !== "overview" && (
        <MetricBreakdown
          metric={tab}
          score={metrics.find((m) => m.category === tab)?.score ?? 0}
          result={analysis}
          audioSource={audioSource}
          onBack={() => setTab("overview")}
        />
      )}

      {tab === "overview" && (
      <>
      {/* Hero */}
      <div className={`${cardClass} grid grid-cols-1 md:grid-cols-[300px_1fr] overflow-hidden`}>
        <div className="relative px-[30px] pt-[30px] pb-7 border-b md:border-b-0 md:border-r border-[#EAEAEF]">
          <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-gradient-to-b from-[#A855F7] to-[#3B82F6]" />
          <div className="text-[11px] font-semibold tracking-[0.08em] uppercase text-[#A6A5B0]">Overall score</div>
          <div className="flex items-baseline gap-1 mt-3">
            <span className={`text-[82px] font-semibold leading-[0.9] tracking-[-0.04em] ${monoClass}`}>{overallScore}</span>
            <span className={`text-[22px] text-[#A6A5B0] font-medium ${monoClass}`}>/100</span>
          </div>
          <div>
            <span
              className="inline-flex items-center gap-1.5 text-[13px] font-semibold px-[11px] py-[5px] rounded-full mt-4"
              style={{ color: oc, background: `${oc}18` }}
            >
              <Award className="w-3.5 h-3.5" /> {grade(overallScore)}
            </span>
          </div>
          <div className="text-[12.5px] text-[#71707B] mt-2.5">
            You're in the <b className="text-[#17161B] font-semibold">top {100 - currentPercentile}%</b> of speakers
          </div>
          <div className="mt-4.5">
            <span className="inline-flex items-center gap-1.5 text-[12.5px] font-semibold text-[#7A5B12] bg-[#FBEFD0] rounded-full px-3 py-[5px]">
              <Sparkles className="w-3.5 h-3.5" /> +50 XP earned
            </span>
          </div>
        </div>
        <div className="px-[30px] py-[26px] flex flex-col justify-center gap-1.5">
          <div className="text-[11px] font-semibold tracking-[0.08em] uppercase text-[#A6A5B0] mb-1.5">By dimension</div>
          {metrics.map((m) => (
            <div key={m.category} className="grid grid-cols-[78px_1fr_auto] items-center gap-3.5 py-2">
              <span className="text-[13.5px] font-medium">{m.category}</span>
              <div className="h-[7px] bg-[#F3F3F7] rounded-full relative overflow-hidden">
                <div className="absolute top-0 bottom-0 rounded-full bg-[#E3D9FB]" style={{ width: `${m.potential}%` }} />
                <div
                  className="absolute left-0 top-0 bottom-0 rounded-full"
                  style={{ width: `${m.score}%`, background: "linear-gradient(90deg,#A855F7,#3B82F6)" }}
                />
              </div>
              <span className="text-[13px] font-semibold min-w-[30px] text-right" style={{ color: scoreColor(m.score) }}>
                {m.score}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Stats strip */}
      <div className={`${cardClass} grid grid-cols-2 md:grid-cols-4 mt-4`}>
        {[
          {
            icon: Gauge,
            label: "Speaking rate",
            value: Math.round(analysis.speechMetrics.speechRateWpm),
            unit: "wpm",
            note: `${analysis.speechMetrics.speechRateWpm >= 125 && analysis.speechMetrics.speechRateWpm <= 170 ? "Within" : "Outside"} ideal 125–170 band`,
          },
          {
            icon: Clock,
            label: "Duration",
            value: `${Math.floor(analysis.duration / 60)}:${Math.round(analysis.duration % 60).toString().padStart(2, "0")}`,
            note: `${analysis.speechMetrics.wordCount} words spoken`,
          },
          {
            icon: Pause,
            label: "Pauses",
            value: analysis.pauseMetrics.pauseCount,
            unit: `· ${longPauses} long`,
            note: `Avg ${analysis.pauseMetrics.avgPauseDuration.toFixed(1)}s each`,
          },
          { icon: MessageSquare, label: "Fillers", value: totalFillers, note: fillersLabel },
        ].map(({ icon: Icon, label, value, unit, note }, i) => (
          <div key={label} className={`px-[22px] py-[18px] ${i < 3 ? "border-r border-[#EAEAEF]" : ""}`}>
            <div className="flex items-center gap-1.5 text-[11px] font-semibold tracking-[0.05em] uppercase text-[#A6A5B0]">
              <Icon className="w-[13px] h-[13px]" /> {label}
            </div>
            <div className={`text-[26px] font-semibold tracking-[-0.02em] mt-2 ${monoClass}`}>
              {value}
              {unit && <span className="text-[13px] text-[#A6A5B0] font-medium ml-0.5">{unit}</span>}
            </div>
            <div className="text-[11.5px] text-[#71707B] mt-[3px]">{note}</div>
          </div>
        ))}
      </div>

      {/* Feedback + transcript */}
      <div className="grid grid-cols-1 lg:grid-cols-[1.35fr_1fr] gap-4 mt-4">
        <div className={`${cardClass} p-7`}>
          <div className="flex items-center gap-2.5">
            <Sparkles className="w-[18px] h-[18px] text-[#9333EA]" />
            <span className={secHeadClass}>Analysis &amp; feedback</span>
          </div>
          <div className="flex flex-col gap-3.5 mt-[18px]">
            {analysis.feedback.map((tip, i) => (
              <div key={i} className="flex gap-[13px] items-start">
                <div className="w-6 h-6 rounded-lg bg-[#F3F3F7] text-[#71707B] flex items-center justify-center shrink-0 mt-0.5">
                  {i === 0 ? <TrendingUp className="w-3.5 h-3.5" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                </div>
                <div className="text-[14.5px] leading-[1.55] text-[#3B3A44]">{tip}</div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 mt-[22px] pt-5 border-t border-[#F3F3F7]">
            <div className="sm:pr-5">
              <div className="flex items-center gap-[7px] text-xs font-semibold uppercase tracking-[0.04em] mb-3" style={{ color: "#059669" }}>
                <CheckCircle2 className="w-[15px] h-[15px]" /> What's working
              </div>
              {(working.length > 0 ? working : ["Keep practising to build strengths"]).map((item) => (
                <div key={item} className="flex gap-2.5 items-start text-[13.5px] leading-[1.5] text-[#3B3A44] py-[5px]">
                  <CheckCircle2 className="w-[15px] h-[15px] mt-0.5 shrink-0" style={{ color: "#22A05F" }} /> {item}
                </div>
              ))}
            </div>
            <div className="sm:pl-[22px] sm:border-l border-[#F3F3F7] mt-4 sm:mt-0">
              <div className="flex items-center gap-[7px] text-xs font-semibold uppercase tracking-[0.04em] mb-3" style={{ color: "#EA580C" }}>
                <Target className="w-[15px] h-[15px]" /> Focus areas
              </div>
              {(focus.length > 0 ? focus : ["All metrics look good — maintain consistency"]).map((item) => (
                <div key={item} className="flex gap-2.5 items-start text-[13.5px] leading-[1.5] text-[#3B3A44] py-[5px]">
                  <ArrowUpRight className="w-[15px] h-[15px] mt-0.5 shrink-0" style={{ color: "#EA580C" }} /> {item}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className={`${cardClass} p-7 flex flex-col`}>
          <div className="flex items-center gap-2.5 mb-4">
            <FileText className="w-[18px] h-[18px] text-[#71707B]" />
            <span className={secHeadClass}>Transcript</span>
          </div>
          {audioSource && (
            <div className="mb-4">
              <AudioPlayer source={audioSource} />
            </div>
          )}
          <p className="text-[15px] leading-[1.7] text-[#3B3A44]">
            {analysis.transcript || "No transcript available."}
          </p>
          <div className="flex flex-wrap gap-2 mt-[18px]">
            <span className={`inline-flex items-center gap-1.5 text-[12.5px] font-medium text-[#3B3A44] bg-[#F3F3F7] rounded-full px-3 py-1.5 ${monoClass}`}>
              <Gauge className="w-3.5 h-3.5 text-[#A6A5B0]" /> {Math.round(analysis.speechMetrics.speechRateWpm)} <b>WPM</b>
            </span>
            <span className={`inline-flex items-center gap-1.5 text-[12.5px] font-medium text-[#3B3A44] bg-[#F3F3F7] rounded-full px-3 py-1.5 ${monoClass}`}>
              <Type className="w-3.5 h-3.5 text-[#A6A5B0]" /> {analysis.speechMetrics.wordCount} <b>words</b>
            </span>
            <span className={`inline-flex items-center gap-1.5 text-[12.5px] font-medium text-[#3B3A44] bg-[#F3F3F7] rounded-full px-3 py-1.5 ${monoClass}`}>
              <Pause className="w-3.5 h-3.5 text-[#A6A5B0]" /> {analysis.pauseMetrics.pauseCount} <b>pauses</b>
            </span>
            <span className={`inline-flex items-center gap-1.5 text-[12.5px] font-medium text-[#3B3A44] bg-[#F3F3F7] rounded-full px-3 py-1.5 ${monoClass}`}>
              <Clock className="w-3.5 h-3.5 text-[#A6A5B0]" /> {analysis.duration.toFixed(1)}<b>s</b>
            </span>
            <span className={`inline-flex items-center gap-1.5 text-[12.5px] font-medium text-[#3B3A44] bg-[#F3F3F7] rounded-full px-3 py-1.5 ${monoClass}`}>
              <Repeat className="w-3.5 h-3.5 text-[#A6A5B0]" />{" "}
              {analysis.speechMetrics.wordCount > 0
                ? Math.round((analysis.speechMetrics.uniqueWordCount / analysis.speechMetrics.wordCount) * 100)
                : 0}
              % <b>unique</b>
            </span>
          </div>
        </div>
      </div>

      {/* Coaching */}
      <div
        className="rounded-[18px] p-7 mt-4 text-[#EDEBF6]"
        style={{ background: "linear-gradient(135deg,#211E3A 0%,#1A1830 100%)" }}
      >
        <div className="flex items-center gap-[11px] mb-5">
          <div
            className="w-[38px] h-[38px] rounded-[11px] flex items-center justify-center text-white"
            style={{ background: "linear-gradient(135deg,#A855F7,#3B82F6)" }}
          >
            <Target className="w-[19px] h-[19px]" />
          </div>
          <div>
            <div className="text-[11px] font-semibold tracking-[0.08em] uppercase text-[#A79FD6]">Recommended next</div>
            <div className="text-[19px] font-semibold tracking-[-0.02em] mt-px">{coachingModule}</div>
          </div>
        </div>
        <div className="text-sm leading-[1.55] text-[#B8B2D8] max-w-[560px]">{coachingDesc}</div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 my-[22px]">
          <div className="bg-white/[0.05] border border-white/[0.08] rounded-[13px] px-[17px] py-[15px]">
            <div className="text-[11px] text-[#A79FD6] font-medium uppercase tracking-[0.04em]">Current issue</div>
            <div className="text-[22px] font-semibold mt-[7px] tracking-[-0.02em]">{longPauses} long pauses</div>
          </div>
          <div className="bg-white/[0.05] border border-white/[0.08] rounded-[13px] px-[17px] py-[15px]">
            <div className="text-[11px] text-[#A79FD6] font-medium uppercase tracking-[0.04em]">Target</div>
            <div className="text-[22px] font-semibold mt-[7px] tracking-[-0.02em]">{targetPauses} pauses</div>
          </div>
          <div className="bg-white/[0.05] border border-white/[0.08] rounded-[13px] px-[17px] py-[15px]">
            <div className="text-[11px] text-[#A79FD6] font-medium uppercase tracking-[0.04em]">Potential gain</div>
            <div className="text-[22px] font-semibold mt-[7px] tracking-[-0.02em]" style={{ color: "#5FD99B" }}>
              +{gainPts} pts
            </div>
          </div>
        </div>
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="text-[13px] text-[#B8B2D8]">
            Could lift your <b className="text-white font-semibold">{worstMetric}</b> score from{" "}
            <b className="text-white font-semibold">{worstMetricData.score}</b> to{" "}
            <span className="font-semibold" style={{ color: "#5FD99B" }}>
              {worstMetricData.potential}
            </span>
          </div>
          <button className="inline-flex items-center gap-2 bg-white text-[#211E3A] font-semibold text-sm rounded-xl px-5 py-[11px] transition-transform hover:-translate-y-px">
            Go to module <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Breakdown + distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4" onMouseLeave={() => setHoveredMetric(null)}>
        <div className={`${cardClass} p-6`}>
          <div className="px-1.5 pb-1.5">
            <span className={secHeadClass}>Detailed breakdown</span>
            <div className="text-[12.5px] text-[#71707B] mt-[3px]">Tap a dimension for the full analysis</div>
          </div>
          {metrics.map((m) => {
            const c = scoreColor(m.score);
            const gain = m.potential - m.score;
            return (
              <button
                key={m.category}
                onClick={() => setSelectedMetric(m.category as MetricCategory)}
                onMouseEnter={() => setHoveredMetric({ name: m.category, score: m.score, potential: m.potential })}
                className="w-full text-left rounded-xl px-3.5 py-3.5 transition-colors hover:bg-[#FAFAFC]"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5 text-[14.5px] font-medium">
                    {m.category}
                    <span className="text-[10.5px] font-semibold px-2 py-[3px] rounded-full tracking-[0.02em]" style={{ color: c, background: `${c}18` }}>
                      {grade(m.score)}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-base font-semibold" style={{ color: c }}>
                      {m.score}
                    </span>
                    <span className="text-[11.5px] text-[#9333EA] font-medium">+{gain}</span>
                    <ChevronRight className="w-4 h-4 text-[#A6A5B0]" />
                  </div>
                </div>
                <div className="h-[7px] bg-[#F3F3F7] rounded-full relative overflow-hidden mt-0.5">
                  <div className="absolute top-0 bottom-0 rounded-full bg-[#E3D9FB]" style={{ width: `${m.potential}%` }} />
                  <div
                    className="absolute left-0 top-0 bottom-0 rounded-full"
                    style={{ width: `${m.score}%`, background: "linear-gradient(90deg,#A855F7,#3B82F6)" }}
                  />
                </div>
                <div className="text-[11.5px] text-[#A6A5B0] mt-1">
                  Potential {m.potential} · {gain} pts recoverable
                </div>
              </button>
            );
          })}
        </div>

        <div className={`${cardClass} p-7`}>
          <PerformanceBellCurve
            currentScore={hoveredMetric?.score ?? overallScore}
            potentialScore={hoveredMetric?.potential ?? overallPotential}
            metricName={hoveredMetric?.name}
          />
          <div className="mt-4 pt-4 border-t border-[#F3F3F7]">
            <div className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[#A6A5B0] mb-1.5">
              What {hoveredMetric ? hoveredMetric.name : "Overall"} Measures
            </div>
            <p className="text-[13px] leading-[1.55] text-[#71707B]">
              {hoveredMetric ? METRIC_DEFINITIONS[hoveredMetric.name as MetricCategory] : OVERALL_DEFINITION}
            </p>
          </div>
          <div className="mt-4 pt-4 border-t border-[#F3F3F7]">
            <div className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[#A6A5B0] mb-1.5">About potential</div>
            <p className="text-[13px] leading-[1.55] text-[#71707B]">{POTENTIAL_DEFINITION}</p>
          </div>
          {potentialPercentile !== currentPercentile && (
            <div className="mt-4 flex gap-[11px] items-start bg-[#FAF8FE] border border-[#EBE3FB] rounded-xl px-4 py-3.5">
              <TrendingUp className="w-[18px] h-[18px] text-[#9333EA] mt-0.5 shrink-0" />
              <div>
                <div className="text-[13.5px] font-semibold text-[#4A2A87]">+{overallPotential - overallScore} points within reach</div>
                <div className="text-[13px] text-[#6B5A8E] leading-[1.5] mt-[3px]">
                  Clearing the penalties above would move you from the top {100 - currentPercentile}% to the top{" "}
                  {100 - potentialPercentile}% of speakers.
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Radar */}
      <div className={`${cardClass} p-7 mt-4`}>
        <span className={secHeadClass}>Performance profile</span>
        <ResponsiveContainer width="100%" height={280}>
          <RadarChart data={radarData}>
            <PolarGrid stroke="#EFEFF3" />
            <PolarAngleAxis dataKey="category" tick={{ fill: "#71707B", fontSize: 12 }} />
            <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fill: "#A6A5B0", fontSize: 10 }} />
            <Radar name="Current" dataKey="score" stroke="#9333EA" fill="#9333EA" fillOpacity={0.14} strokeWidth={2} />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      {/* Progress */}
      <div className={`${cardClass} p-7 mt-4`}>
        <div className="flex items-baseline justify-between">
          <span className={secHeadClass}>Progress over time</span>
          <span className="text-[12.5px] text-[#71707B]">Last 6 sessions</span>
        </div>
        <ResponsiveContainer width="100%" height={230}>
          <LineChart data={progressData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#F3F3F7" />
            <XAxis dataKey="session" tick={{ fill: "#A6A5B0", fontSize: 11 }} />
            <YAxis domain={[0, 100]} tick={{ fill: "#A6A5B0", fontSize: 10 }} />
            <Tooltip contentStyle={{ backgroundColor: "white", border: "1px solid #EAEAEF", borderRadius: 10 }} />
            <Line type="monotone" dataKey="fluency" stroke="#9333EA" strokeWidth={2.5} dot={{ fill: "#9333EA", r: 3.5 }} name="Fluency" />
            <Line type="monotone" dataKey="pacing" stroke="#2563EB" strokeWidth={2.5} strokeDasharray="4 4" dot={{ fill: "#2563EB", r: 3.5 }} name="Pacing" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Tips */}
      <div className={`${cardClass} p-7 mt-4`}>
        <div className="flex items-center gap-2.5">
          <Lightbulb className="w-[18px] h-[18px] text-[#9333EA]" />
          <span className={secHeadClass}>Tips for your next practice</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 mt-4">
          <div className="border border-[#EAEAEF] rounded-2xl p-[18px]">
            <div className="flex items-center gap-2 text-[13px] font-semibold mb-3">
              <Brain className="w-4 h-4 text-[#9333EA]" /> Before you speak
            </div>
            <ul className="space-y-1.5">
              {["Take a breath and map your first two sentences before starting.", "Decide your one key point — everything anchors to it."].map((t) => (
                <li key={t} className="text-[13.5px] leading-[1.5] text-[#3B3A44] pl-4 relative before:content-[''] before:absolute before:left-0.5 before:top-2 before:w-1 before:h-1 before:rounded-full before:bg-[#A6A5B0]">
                  {t}
                </li>
              ))}
            </ul>
          </div>
          <div className="border border-[#EAEAEF] rounded-2xl p-[18px]">
            <div className="flex items-center gap-2 text-[13px] font-semibold mb-3">
              <Mic className="w-4 h-4 text-[#9333EA]" /> While speaking
            </div>
            <ul className="space-y-1.5">
              {["Replace filler words with a deliberate half-second pause.", "Pause between ideas, not mid-thought — it reads as confidence."].map((t) => (
                <li key={t} className="text-[13.5px] leading-[1.5] text-[#3B3A44] pl-4 relative before:content-[''] before:absolute before:left-0.5 before:top-2 before:w-1 before:h-1 before:rounded-full before:bg-[#A6A5B0]">
                  {t}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3.5 mt-6">
        <button
          onClick={onRetry}
          className="flex-1 inline-flex items-center justify-center gap-2 text-sm font-medium rounded-xl py-[14px] border border-[#EAEAEF] bg-white text-[#3B3A44] transition-colors hover:border-[#D6D6DE] hover:bg-[#FCFCFD]"
        >
          <RotateCcw className="w-4 h-4" /> Practice again
        </button>
        <button
          onClick={onBack}
          className="flex-1 inline-flex items-center justify-center gap-2 text-sm font-semibold rounded-xl py-[14px] text-white bg-[#17161B] hover:bg-black transition-colors"
        >
          Back to Dashboard <ArrowRight className="w-4 h-4" />
        </button>
      </div>
      </>
      )}
    </div>
  );
}
