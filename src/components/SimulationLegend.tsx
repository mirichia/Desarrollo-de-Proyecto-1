import React from 'react';
import { Building2, Car, Bike, AlertTriangle, Wrench, Info, PackageCheck } from 'lucide-react';

interface SimulationLegendProps {
  isCompleted?: boolean;
}

export const SimulationLegend: React.FC<SimulationLegendProps> = ({
  isCompleted = false,
}) => {
  return (
    <div className="space-y-3">
      <div className="bg-white rounded-xl border border-slate-200/90 p-4 shadow-sm space-y-3.5 transition-all">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <h4 className="text-[13px] font-bold text-slate-800 flex items-center gap-1.5">
            <span>Leyenda</span>
          </h4>
        </div>

        <div className="space-y-3.5 animate-in fade-in duration-150">
          <div>
            <span className="text-[10.5px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
              Elementos en mapa
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2.5 gap-x-3 text-[12px]">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded bg-[#0a2e3f] text-white flex items-center justify-center shrink-0">
                  <Building2 className="w-3.5 h-3.5" />
                </div>
                <span className="text-slate-700 font-medium text-[11px] leading-tight">Almacen central</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="text-blue-600 shrink-0">
                  <Car className="w-4 h-4" />
                </div>
                <span className="text-slate-700 font-medium text-[11px] truncate">Auto</span>
              </div>

              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded bg-emerald-700 text-white flex items-center justify-center shrink-0">
                  <Building2 className="w-3.5 h-3.5" />
                </div>
                <span className="text-slate-700 font-medium text-[11px] leading-tight">Almacen intermedio</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="text-orange-500 shrink-0">
                  <Bike className="w-4 h-4" />
                </div>
                <span className="text-slate-700 font-medium text-[11px] truncate">Moto</span>
              </div>

              <div className="flex items-center gap-2">
                <div className="text-amber-500 shrink-0">
                  <AlertTriangle className="w-4 h-4" />
                </div>
                <span className="text-slate-700 font-medium text-[11px] truncate">Bloqueo</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="text-emerald-600 shrink-0">
                  <Bike className="w-4 h-4" />
                </div>
                <span className="text-slate-700 font-medium text-[11px] truncate">Bicicleta</span>
              </div>

              <div className="flex items-center gap-2">
                <div className="w-5 h-0.5 border-t-2 border-dashed border-rose-500 shrink-0"></div>
                <span className="text-slate-700 font-medium text-[11px] truncate">Tramo no disponible</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="text-rose-600 shrink-0">
                  <Wrench className="w-4 h-4" />
                </div>
                <span className="text-slate-700 font-medium text-[11px] truncate">Averia</span>
              </div>

              <div className="flex items-center gap-2">
                <div className="w-5 h-1 bg-blue-600 rounded-xs shrink-0"></div>
                <span className="text-slate-700 font-medium text-[11px] leading-tight">Ruta replanificada</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="text-emerald-600 shrink-0">
                  <PackageCheck className="w-4 h-4" />
                </div>
                <span className="text-slate-700 font-medium text-[11px] leading-tight">Pedido entregado</span>
              </div>
            </div>
          </div>

          <div className="pt-2.5 border-t border-slate-100">
            <span className="text-[10.5px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
              Estado de pedidos (Semaforo)
            </span>
            <div className="space-y-2 text-[11.5px]">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-emerald-500 ring-2 ring-emerald-100 shrink-0"></span>
                <span className="text-slate-700 font-medium truncate">
                  <strong className="text-emerald-700 font-semibold">Verde:</strong> Margen suficiente
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-amber-500 ring-2 ring-amber-100 shrink-0"></span>
                <span className="text-slate-700 font-medium truncate">
                  <strong className="text-amber-700 font-semibold">Ambar:</strong> Proximo al plazo
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-rose-500 ring-2 ring-rose-100 shrink-0"></span>
                <span className="text-slate-700 font-medium truncate">
                  <strong className="text-rose-700 font-semibold">Rojo:</strong> Critico
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-blue-50/70 rounded-xl border border-blue-100 p-3.5 flex items-start gap-2.5 animate-in fade-in duration-150">
        <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
        <p className="text-[11px] text-blue-900 leading-relaxed font-medium">
          {isCompleted
            ? 'Periodo de simulacion completado. Resultados finales basados en 5 dias consecutivos.'
            : 'La simulacion se ejecuta sobre un periodo de 5 dias consecutivos.'}
        </p>
      </div>
    </div>
  );
};
