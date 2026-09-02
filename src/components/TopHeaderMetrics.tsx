import React from 'react';
import {
  AlertTriangle,
  Calendar,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Clock,
  Menu,
  PanelLeftOpen,
  ShoppingCart,
  Timer,
  Car,
} from 'lucide-react';
import { SimulationStats } from '../types';

interface TopHeaderMetricsProps {
  stats: SimulationStats;
  isSidebarOpen?: boolean;
  onToggleSidebar?: () => void;
  showTimeline?: boolean;
  isRightPanelOpen?: boolean;
  onToggleRightPanel?: () => void;
}

export const TopHeaderMetrics: React.FC<TopHeaderMetricsProps> = ({
  stats,
  isSidebarOpen = true,
  onToggleSidebar,
  showTimeline = false,
  isRightPanelOpen = true,
  onToggleRightPanel,
}) => {
  return (
    <header className="bg-white border-b border-slate-200/90 px-4 sm:px-6 py-2 shadow-[0_1px_3px_rgba(0,0,0,0.03)] shrink-0 flex items-center gap-3">
      {/* Sidebar toggle button */}
      {onToggleSidebar && (
        <button
          onClick={onToggleSidebar}
          className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200/80 transition-colors shrink-0 flex items-center gap-2 group"
          title={isSidebarOpen ? 'Ocultar menú lateral' : 'Desplegar menú lateral'}
          aria-label={isSidebarOpen ? 'Ocultar menú lateral' : 'Desplegar menú lateral'}
        >
          {isSidebarOpen ? (
            <Menu className="w-5 h-5 text-slate-600 group-hover:text-slate-900" />
          ) : (
            <div className="flex items-center gap-2">
              <PanelLeftOpen className="w-5 h-5 text-[#082937]" />
              <div className="hidden sm:flex items-center gap-1.5 pr-1">
                {/* Mini logo mark */}
                <svg viewBox="0 0 36 36" fill="none" className="w-4 h-4">
                  <rect x="6" y="6" width="10" height="10" transform="rotate(45 11 11)" fill="#10B981" fillOpacity="0.8" />
                  <rect x="18" y="6" width="10" height="10" transform="rotate(45 23 11)" fill="#34D399" />
                  <rect x="6" y="18" width="10" height="10" transform="rotate(45 11 23)" fill="#059669" />
                  <rect x="18" y="18" width="10" height="10" transform="rotate(45 23 23)" fill="#10B981" />
                </svg>
                <span className="text-xs font-bold text-[#082937] tracking-wider">PAQRAP</span>
              </div>
            </div>
          )}
        </button>
      )}

      {/* Metrics Grid */}
      <div className={`flex-1 grid grid-cols-2 sm:grid-cols-4 ${showTimeline ? 'lg:grid-cols-8' : 'lg:grid-cols-7'} gap-2 xl:gap-2.5 items-center`}>
        {showTimeline && (
          <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg border border-slate-100/80 bg-slate-50/40">
            <div className="p-2 rounded-lg bg-[#0a2e3f] text-white shrink-0">
              <Timer className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <p className="text-[11px] font-medium text-slate-500 truncate leading-tight">
                Cronograma
              </p>
              <p className="text-[13.5px] font-extrabold text-slate-900 tracking-tight mt-0.5 truncate">
                Dia {Math.min(Math.max(stats.currentDay, 1), 5)} de 5
              </p>
            </div>
          </div>
        )}

        {/* 1. Fecha y hora simulada */}
        <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg border border-slate-100/80 bg-slate-50/40">
          <div className="p-2 rounded-lg bg-slate-100 text-slate-600 shrink-0">
            <Calendar className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <p className="text-[11px] font-medium text-slate-500 truncate leading-tight">
              Fecha y hora simulada
            </p>
            <p className="text-[13.5px] font-bold text-slate-800 tracking-tight mt-0.5 truncate">
              {stats.simulatedDateTime}
            </p>
          </div>
        </div>

        {/* 2. Tiempo real transcurrido */}
        <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg border border-slate-100/80 bg-slate-50/40">
          <div className="p-2 rounded-lg bg-slate-100 text-slate-600 shrink-0">
            <Clock className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <p className="text-[11px] font-medium text-slate-500 truncate leading-tight">
              Tiempo real transcurrido
            </p>
            <p className="text-[13.5px] font-bold text-slate-800 tracking-tight mt-0.5 truncate font-mono">
              {stats.realElapsedTime}
            </p>
          </div>
        </div>

        {/* 3. Pedidos totales */}
        <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg border border-slate-100/80 bg-slate-50/40">
          <div className="p-2 rounded-lg bg-slate-100 text-slate-600 shrink-0">
            <ShoppingCart className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <p className="text-[11px] font-medium text-slate-500 truncate leading-tight">
              Pedidos totales
            </p>
            <p className="text-[15px] font-extrabold text-slate-900 tracking-tight mt-0.5">
              {stats.totalOrders.toLocaleString()}
            </p>
          </div>
        </div>

        {/* 4. Pedidos entregados */}
        <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg border border-slate-100/80 bg-slate-50/40">
          <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600 shrink-0">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <p className="text-[11px] font-medium text-slate-500 truncate leading-tight">
              Pedidos entregados
            </p>
            <p className="text-[15px] font-extrabold text-emerald-600 tracking-tight mt-0.5">
              {stats.deliveredOrders.toLocaleString()}
            </p>
          </div>
        </div>

        {/* 5. Pedidos pendientes */}
        <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg border border-slate-100/80 bg-slate-50/40">
          <div className="p-2 rounded-lg bg-amber-50 text-amber-600 shrink-0">
            <Clock className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <p className="text-[11px] font-medium text-slate-500 truncate leading-tight">
              Pedidos pendientes
            </p>
            <p className="text-[15px] font-extrabold text-amber-600 tracking-tight mt-0.5">
              {stats.pendingOrders.toLocaleString()}
            </p>
          </div>
        </div>

        {/* 6. Pedidos en riesgo */}
        <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg border border-slate-100/80 bg-slate-50/40">
          <div className="p-2 rounded-lg bg-rose-50 text-rose-600 shrink-0">
            <AlertTriangle className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <p className="text-[11px] font-medium text-slate-500 truncate leading-tight">
              Pedidos en riesgo
            </p>
            <p className="text-[15px] font-extrabold text-rose-600 tracking-tight mt-0.5">
              {stats.atRiskOrders.toLocaleString()}
            </p>
          </div>
        </div>

        {/* 7. Vehículos activos */}
        <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg border border-slate-100/80 bg-slate-50/40">
          <div className="p-2 rounded-lg bg-blue-50 text-blue-600 shrink-0">
            <Car className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <p className="text-[11px] font-medium text-slate-500 truncate leading-tight">
              Vehículos activos
            </p>
            <p className="text-[15px] font-extrabold text-blue-600 tracking-tight mt-0.5">
              {stats.activeVehicles.toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      {onToggleRightPanel && (
        <button
          onClick={onToggleRightPanel}
          className="h-10 px-3 rounded-lg text-slate-700 hover:text-slate-900 hover:bg-slate-100 border border-slate-200/80 transition-colors shrink-0 flex items-center gap-1.5 font-semibold text-[12px]"
          title={isRightPanelOpen ? 'Ocultar panel derecho' : 'Mostrar panel derecho'}
          aria-label={isRightPanelOpen ? 'Ocultar panel derecho' : 'Mostrar panel derecho'}
          aria-expanded={isRightPanelOpen}
        >
          {isRightPanelOpen ? (
            <ChevronRight className="w-4 h-4 text-slate-500" />
          ) : (
            <ChevronLeft className="w-4 h-4 text-blue-600" />
          )}
          <span className="hidden xl:inline">{isRightPanelOpen ? 'Ocultar panel' : 'Mostrar panel'}</span>
        </button>
      )}
    </header>
  );
};
