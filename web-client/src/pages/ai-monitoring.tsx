import { useLiveData } from "@/providers/live-data-context";
import { useAIDetections } from "@/hooks/use-ai-detections";
import { MaterialIcon } from "@/components/shared/material-icon";
import { PageHeader } from "@/components/shared/page-header";
import { formatTimestamp, confidencePercent, cn } from "@/lib/utils";

const FACILITY_IMG =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuAuUoqIRD6Q7O08IeRBGE6lstjO4kgZzNDVba-HvKebwm2kyCDz3NLYCjQ1xwMRIODot49sfmgW3yVmHpWXimTmZK0Dpixvnrav2rVY10HxpVCzVtC-L2I6hLfcCDyS6FmBClecdOCI5sk7mE7k7jNnQXYuLnB3o6V7-VfyYpohFZv12XoPxSv0YgAtmuP_qNS_XDf_e_QM1nR76gGAV_wRsfTe08vh2OUv_MITGQ-ecKqF1euRbqhvD2s0TZXvhHtABIDTq77lxlq0";

export default function AIMonitoringPage() {
  const { ai } = useLiveData();
  const { data: detections } = useAIDetections({ limit: 20 });

  const fireDetected = ai?.fire ?? false;
  const smokeDetected = ai?.smoke ?? false;

  return (
    <>
      <PageHeader
        kicker="Fire and Smoke Detection"
        title="AI Monitoring"
        description="Real-time neural network fire detection"
      />

      <div className="flex flex-col md:flex-row gap-6 h-[calc(100vh-16rem)] overflow-hidden">
        {/* Left: Live AI View */}
        <section className="flex-1 flex flex-col gap-6 overflow-hidden">
          {/* Central Monitor */}
          <div className="relative flex-1 bg-surface-container-lowest rounded-xl overflow-hidden shadow-sm group min-h-[300px]">
            <img
              className="w-full h-full object-cover opacity-90 grayscale brightness-75 transition-all group-hover:grayscale-0 group-hover:brightness-100 duration-1000"
              src={FACILITY_IMG}
              alt="AI surveillance view"
            />

            {/* Bounding Box Overlays */}
            {fireDetected && (
              <div className="absolute bottom-[25%] right-[25%] w-40 h-24 border-2 border-primary rounded-lg flex flex-col">
                <div className="bg-primary text-on-primary text-[9px] font-bold px-2 py-0.5 self-start rounded-br-lg rounded-tl-sm uppercase tracking-tighter">
                  Fire {confidencePercent(ai!.fireConfidence)}
                </div>
                <div className="flex-1 bg-primary/10 backdrop-blur-[1px]" />
              </div>
            )}
            {smokeDetected && (
              <div className="absolute top-[20%] left-[30%] w-32 h-48 border-2 border-white rounded-lg flex flex-col">
                <div className="bg-white text-black text-[9px] font-bold px-2 py-0.5 self-start rounded-br-lg rounded-tl-sm uppercase tracking-tighter">
                  Smoke {confidencePercent(ai!.smokeConfidence)}
                </div>
                <div className="flex-1 bg-white/10 backdrop-blur-[2px]" />
              </div>
            )}

            {/* Bottom Overlay */}
            <div className="absolute inset-x-0 bottom-0 p-8 flex justify-between items-end bg-gradient-to-t from-black/60 to-transparent">
              <div className="flex gap-4">
                <button className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-white/40 transition-all">
                  <MaterialIcon icon="videocam" />
                </button>
                <button className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-white/40 transition-all">
                  <MaterialIcon icon="zoom_in" />
                </button>
              </div>
              <div className="text-right">
                <p className="text-white text-[10px] font-bold tracking-[0.2em] uppercase mb-1">
                  Detection Status
                </p>
                <p
                  className={cn(
                    "font-mono text-xs",
                    fireDetected ? "text-red-400" : "text-white/60",
                  )}
                >
                  {fireDetected
                    ? `FIRE DETECTED — ${confidencePercent(ai!.fireConfidence)}`
                    : "ALL CLEAR"}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Right: Side Panel */}
        <aside className="w-full md:w-80 flex flex-col gap-6 h-full overflow-y-auto md:overflow-visible shrink-0 pb-6 md:pb-0">
          {/* Performance Metrics */}
          <div className="bg-surface-container-low rounded-xl p-6 flex flex-col gap-6 shrink-0">
            <h2 className="text-[10px] font-black tracking-[0.2em] uppercase text-on-surface-variant">
              System Performance
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <span className="text-3xl font-black tracking-tighter">
                  {ai ? "14ms" : "--"}
                </span>
                <span className="text-[10px] text-on-surface-variant uppercase font-bold tracking-widest">
                  Inference
                </span>
              </div>
              <div className="flex flex-col gap-1 text-right">
                <span className="text-3xl font-black tracking-tighter">
                  {ai ? "30" : "--"}
                </span>
                <span className="text-[10px] text-on-surface-variant uppercase font-bold tracking-widest">
                  FPS
                </span>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex flex-col gap-2">
                <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest">
                  <span>Fire Confidence</span>
                  <span>
                    {ai ? confidencePercent(ai.fireConfidence) : "--"}
                  </span>
                </div>
                <div className="h-1 bg-surface-container-highest rounded-full overflow-hidden">
                  <div
                    className={cn(
                      "h-full rounded-full transition-all duration-500",
                      fireDetected ? "bg-error" : "bg-primary",
                    )}
                    style={{ width: `${(ai?.fireConfidence ?? 0) * 100}%` }}
                  />
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest">
                  <span>Smoke Confidence</span>
                  <span>
                    {ai ? confidencePercent(ai.smokeConfidence) : "--"}
                  </span>
                </div>
                <div className="h-1 bg-surface-container-highest rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full transition-all duration-500"
                    style={{ width: `${(ai?.smokeConfidence ?? 0) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Observation Log */}
          <div className="flex-1 bg-surface-container-low rounded-xl p-6 flex flex-col overflow-hidden min-h-[300px]">
            <div className="flex items-center justify-between mb-6 shrink-0">
              <h2 className="text-[10px] font-black tracking-[0.2em] uppercase text-on-surface-variant">
                Observation Log
              </h2>
              <span className="w-2 h-2 bg-primary rounded-full animate-ping" />
            </div>
            <div className="flex-1 overflow-y-auto pr-2 space-y-6 scrollbar-hide">
              {detections && detections.length > 0 ? (
                detections.map((d) => (
                  <div key={d.id} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div
                        className={cn(
                          "w-1.5 h-1.5 rounded-full mb-1",
                          d.fire || d.smoke
                            ? "bg-primary"
                            : "bg-outline-variant",
                        )}
                      />
                      <div className="flex-1 w-px bg-surface-container-highest" />
                    </div>
                    <div className="pb-2">
                      <p className="text-[10px] font-mono text-on-surface-variant">
                        {formatTimestamp(d.timestamp)}
                      </p>
                      <p className="text-xs font-bold mt-1">
                        {d.fire
                          ? `Fire detected (${confidencePercent(d.fire_confidence)})`
                          : d.smoke
                            ? `Smoke detected (${confidencePercent(d.smoke_confidence)})`
                            : "No anomalies"}
                      </p>
                      <p className="text-[10px] text-on-surface-variant leading-relaxed mt-1 opacity-70">
                        Fire: {confidencePercent(d.fire_confidence)} · Smoke:{" "}
                        {confidencePercent(d.smoke_confidence)}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-on-surface-variant">
                  No detection data yet
                </p>
              )}
            </div>
          </div>
        </aside>
      </div>
    </>
  );
}
