import { X, Award, ArrowRight } from "lucide-react";
import { getMetricData } from "./MetricBreakdown";
import type { AnalysisResult, MetricCategory } from "../lib/analysisResult";
import { METRIC_DEFINITIONS, METRIC_BLURBS } from "../lib/metricDefinitions";
import { scoreColor, grade } from "../lib/scoreDisplay";

interface MetricPreviewModalProps {
  metric: MetricCategory;
  score: number;
  result?: AnalysisResult;
  onClose: () => void;
  onOpenFull: () => void;
}

/**
 * The quick-preview card the design opens when you tap a "Detailed breakdown"
 * row — score, definition, a real-data reading, and a few measured-vs-ideal
 * rows, capped off with a button into the full per-metric tab (waveform,
 * penalties, strengths). Distinct from that full tab: no waveform/penalties/
 * strengths here, this is meant to be a glance, not the whole report.
 */
export function MetricPreviewModal({ metric, score, result, onClose, onOpenFull }: MetricPreviewModalProps) {
  const data = getMetricData(metric, result);
  const potential = result?.breakdowns?.[metric]?.potential ?? Math.min(score + 12, 100);
  const gain = Math.max(0, potential - score);
  const c = scoreColor(score);

  return (
    <div
      className="fixed inset-0 bg-[rgba(20,18,28,0.5)] backdrop-blur-[3px] flex items-start justify-center z-[100] p-5 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-[20px] max-w-[640px] w-full my-12 relative text-[#17161B] tracking-[-0.01em]"
        style={{ boxShadow: "0 24px 60px rgba(0,0,0,0.25)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between px-[26px] pt-6 pb-5 border-b border-[#F3F3F7]">
          <div className="pr-4">
            <div className="text-[11px] font-semibold tracking-[0.08em] uppercase text-[#A6A5B0]">Metric detail</div>
            <div className="text-[22px] font-semibold tracking-[-0.02em] mt-[5px]">{metric}</div>
            <div className="text-[13.5px] text-[#71707B] mt-1">{METRIC_BLURBS[metric]}</div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-[9px] border border-[#EAEAEF] hover:bg-[#FAFAFC] flex items-center justify-center transition-colors shrink-0"
          >
            <X className="w-4 h-4 text-[#71707B]" />
          </button>
        </div>

        <div className="px-[26px] py-6">
          <div className="flex items-end gap-3.5 mb-1.5">
            <span className="text-[52px] font-semibold leading-[0.9] tracking-[-0.04em] font-['Geist_Mono',monospace]">{score}</span>
            <div className="pb-2">
              <span
                className="inline-flex items-center gap-1.5 text-[13px] font-semibold px-[11px] py-[5px] rounded-full"
                style={{ color: c, background: `${c}18` }}
              >
                <Award className="w-3.5 h-3.5" /> {grade(score)}
              </span>
              <div className="text-[11.5px] text-[#9333EA] font-medium mt-1.5">
                Potential {potential} · +{gain} available
              </div>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-[#F3F3F7]">
            <div className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[#A6A5B0] mb-1.5">What it measures</div>
            <p className="text-[13px] leading-[1.55] text-[#71707B]">{METRIC_DEFINITIONS[metric]}</p>
          </div>

          <div className="mt-4 pt-4 border-t border-[#F3F3F7]">
            <div className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[#A6A5B0] mb-1.5">Your reading</div>
            <p className="text-[14.5px] leading-[1.55] text-[#3B3A44]">{data.description}</p>
          </div>

          <div className="text-[11px] font-semibold tracking-[0.08em] uppercase text-[#A6A5B0] mt-5 mb-1.5">Measured vs ideal</div>
          {data.details.map((d, i) => {
            const hasIdealRange = d.idealMin !== undefined && d.idealMax !== undefined;
            const ok = !hasIdealRange || (d.value >= d.idealMin! && d.value <= d.idealMax!);
            return (
              <div key={i} className="flex items-center justify-between py-3 border-b border-[#F3F3F7] last:border-b-0 text-sm">
                <span>{d.metric}</span>
                <span>
                  <span className="font-semibold" style={{ color: ok ? "#059669" : "#EA580C" }}>
                    {d.value.toFixed(1)} {d.unit}
                  </span>
                  {hasIdealRange && (
                    <span className="text-[13px] text-[#71707B]">
                      {" "}
                      / {d.idealMin}–{d.idealMax} {d.unit}
                    </span>
                  )}
                </span>
              </div>
            );
          })}

          <button
            onClick={onOpenFull}
            className="w-full flex items-center justify-center gap-2 text-sm font-semibold rounded-xl py-[13px] mt-[22px] text-white bg-[#9333EA] hover:bg-[#7E22CE] transition-colors"
          >
            Open full {metric} analysis <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
