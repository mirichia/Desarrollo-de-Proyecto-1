import React from 'react';
import { AlertTriangle, CheckCircle2, ClipboardList, Truck } from 'lucide-react';
import { DEMO_SCRIPT_DAYS } from '../data/demoScript';

interface SimulationDemoScriptProps {
  currentDay: number;
  isCompleted?: boolean;
}

const getToneClass = (tone: string, isActive: boolean) => {
  if (isActive) return 'border-[#0a2e3f] bg-slate-50 shadow-sm';
  if (tone === 'highlight') return 'border-amber-200 bg-amber-50/50';
  if (tone === 'closing') return 'border-emerald-200 bg-emerald-50/50';
  return 'border-slate-200 bg-white';
};

const getIcon = (tone: string, isCompletedDay: boolean) => {
  if (isCompletedDay) return <CheckCircle2 className="w-4 h-4 text-emerald-600" />;
  if (tone === 'highlight') return <AlertTriangle className="w-4 h-4 text-amber-600" />;
  if (tone === 'closing') return <ClipboardList className="w-4 h-4 text-emerald-700" />;
  return <Truck className="w-4 h-4 text-slate-600" />;
};

export const SimulationDemoScript: React.FC<SimulationDemoScriptProps> = ({
  currentDay,
  isCompleted = false,
}) => {
  const activeDay = isCompleted ? 5 : Math.min(Math.max(currentDay, 1), 5);

  return (
    <div className="bg-white rounded-xl border border-slate-200/90 p-4 shadow-sm space-y-3">
      <div className="pb-2 border-b border-slate-100">
        <h4 className="text-[13px] font-bold text-slate-800">Guion de demostración 5D</h4>
      </div>

      <div className="space-y-2">
        {DEMO_SCRIPT_DAYS.map((item) => {
          const isActive = item.day === activeDay;
          const isCompletedDay = isCompleted || item.day < activeDay;

          return (
            <div
              key={item.day}
              className={`rounded-lg border p-3 transition-colors ${getToneClass(item.tone, isActive)}`}
            >
              <div className="flex items-start gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-white border border-slate-200 flex items-center justify-center shrink-0">
                  {getIcon(item.tone, isCompletedDay)}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-mono font-bold text-slate-500">Día {item.day}</span>
                    {isActive && (
                      <span className="text-[10px] font-extrabold text-[#0a2e3f] bg-white border border-slate-200 rounded px-1.5 py-0.5">
                        ACTUAL
                      </span>
                    )}
                  </div>
                  <p className="text-[12px] font-extrabold text-slate-900 leading-tight mt-0.5">
                    {item.title}
                  </p>
                  <p className="text-[11.5px] text-slate-600 leading-snug mt-1">
                    {item.summary}
                  </p>
                  <p className="text-[11px] text-slate-500 leading-snug mt-1.5">
                    {item.mapFocus}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
