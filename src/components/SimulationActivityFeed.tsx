import React from 'react';
import { AlertTriangle, BarChart3, Bike, CheckCircle2, Flag, Package, RefreshCw, Route, Wrench } from 'lucide-react';

export type SimulationFeedEventType =
  | 'delivery'
  | 'route_started'
  | 'order_registered'
  | 'risk'
  | 'block'
  | 'replanning'
  | 'breakdown'
  | 'reassignment'
  | 'demand_increase'
  | 'simulation_closed';

export interface SimulationFeedEvent {
  id: string;
  time: string;
  type: SimulationFeedEventType;
  message: string;
  tone?: 'neutral' | 'success' | 'warning' | 'danger' | 'info';
}

interface SimulationActivityFeedProps {
  events: SimulationFeedEvent[];
}

const getEventIcon = (type: SimulationFeedEventType) => {
  switch (type) {
    case 'delivery':
      return <CheckCircle2 className="w-4 h-4" />;
    case 'route_started':
      return <Route className="w-4 h-4" />;
    case 'order_registered':
      return <Package className="w-4 h-4" />;
    case 'risk':
      return <AlertTriangle className="w-4 h-4" />;
    case 'block':
      return <AlertTriangle className="w-4 h-4" />;
    case 'replanning':
      return <RefreshCw className="w-4 h-4" />;
    case 'breakdown':
      return <Wrench className="w-4 h-4" />;
    case 'reassignment':
      return <Bike className="w-4 h-4" />;
    case 'demand_increase':
      return <BarChart3 className="w-4 h-4" />;
    case 'simulation_closed':
      return <Flag className="w-4 h-4" />;
  }
};

const getToneClass = (tone: SimulationFeedEvent['tone'] = 'neutral') => {
  switch (tone) {
    case 'success':
      return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    case 'warning':
      return 'bg-amber-50 text-amber-700 border-amber-200';
    case 'danger':
      return 'bg-rose-50 text-rose-700 border-rose-200';
    case 'info':
      return 'bg-blue-50 text-blue-700 border-blue-200';
    default:
      return 'bg-slate-50 text-slate-600 border-slate-200';
  }
};

export const SimulationActivityFeed: React.FC<SimulationActivityFeedProps> = ({ events }) => {
  return (
    <div className="bg-white rounded-xl border border-slate-200/90 p-4 shadow-sm space-y-3">
      <div className="flex items-center justify-between pb-2 border-b border-slate-100">
        <h4 className="text-[13px] font-bold text-slate-800">Feed de eventos</h4>
        <span className="text-[11px] font-semibold text-slate-400">{events.length} eventos</span>
      </div>

      <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
        {events.length === 0 ? (
          <div className="text-[12px] text-slate-500 bg-slate-50 border border-slate-200 rounded-lg p-3">
            Sin actividad registrada.
          </div>
        ) : (
          events.map((event) => (
            <div key={event.id} className="grid grid-cols-[2.5rem_1.75rem_1fr] items-start gap-2.5 text-[12px] min-w-0">
              <span className="font-mono text-[11px] text-slate-400 w-10 shrink-0 pt-1">{event.time}</span>
              <div className={`w-7 h-7 rounded-lg border flex items-center justify-center shrink-0 ${getToneClass(event.tone)}`}>
                {getEventIcon(event.type)}
              </div>
              <p className="text-slate-700 font-medium leading-snug pt-1 min-w-0 break-words">{event.message}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
