import React from 'react';
import {
  Calendar,
  ChevronRight,
  ChevronDown,
  Info,
  RotateCw,
  AlertTriangle,
  Wrench,
  Clock,
  Car,
  Bike,
  Building2,
  ListTodo,
  TrendingUp,
  MapPin,
} from 'lucide-react';
import { MapInteractive } from './MapInteractive';
import { INITIAL_VEHICLES, INITIAL_ORDERS, INITIAL_INCIDENTS, INITIAL_WAREHOUSES } from '../data/mockData';

interface DashboardViewProps {
  onNavigateToSimulation: () => void;
  onNavigateToOrders?: () => void;
  onNavigateToFleet?: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onNavigateToSimulation,
  onNavigateToOrders,
  onNavigateToFleet,
}) => {
  return (
    <div className="p-6 space-y-5 max-w-[1680px] mx-auto animate-in fade-in duration-200">
      {/* Title & Subtitle */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          Dashboard
        </h1>
        <p className="text-sm text-slate-500 font-medium mt-0.5">
          Resumen general de la operación logística
        </p>
      </div>

      {/* TOP ROW: 3 Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Card 1: Resumen de pedidos (4 cols) */}
        <div className="lg:col-span-4 bg-white rounded-xl border border-slate-200/90 p-5 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-slate-700" />
              <h3 className="font-bold text-[15px] text-slate-800">
                Resumen de pedidos
              </h3>
            </div>
            <button className="flex items-center gap-1.5 px-2.5 py-1 text-[12px] font-medium text-slate-600 bg-slate-50 border border-slate-200 rounded-md hover:bg-slate-100 transition-colors">
              <span>Hoy</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
            </button>
          </div>

          <div className="grid grid-cols-3 gap-4 py-4">
            {/* Pedidos totales */}
            <div>
              <p className="text-2xl font-extrabold text-blue-600">120</p>
              <p className="text-[11px] font-medium text-slate-500 mt-1">Pedidos totales</p>
            </div>
            {/* Entregados */}
            <div>
              <p className="text-2xl font-extrabold text-emerald-600">48</p>
              <p className="text-[11px] font-medium text-slate-500 mt-1">Entregados</p>
            </div>
            {/* Pendientes */}
            <div>
              <p className="text-2xl font-extrabold text-amber-500">57</p>
              <p className="text-[11px] font-medium text-slate-500 mt-1">Pendientes</p>
            </div>
            {/* En riesgo */}
            <div>
              <p className="text-2xl font-extrabold text-rose-600">15</p>
              <p className="text-[11px] font-medium text-slate-500 mt-1">En riesgo</p>
            </div>
            {/* Nivel de servicio */}
            <div>
              <div className="flex items-center gap-1">
                <p className="text-2xl font-extrabold text-blue-600">85%</p>
              </div>
              <p className="text-[11px] font-medium text-slate-500 mt-1 flex items-center gap-1">
                <span>Nivel de servicio</span>
                <Info className="w-3 h-3 text-slate-400" />
              </p>
            </div>
            {/* Tiempo prom. entrega */}
            <div>
              <p className="text-2xl font-extrabold text-slate-800">4.2 h</p>
              <p className="text-[11px] font-medium text-slate-500 mt-1">Tiempo prom. entrega</p>
            </div>
          </div>
        </div>

        {/* Card 2: Mapa de operaciones (4 cols) */}
        <div
          onClick={onNavigateToSimulation}
          className="lg:col-span-4 bg-white rounded-xl border border-slate-200/90 p-5 shadow-sm flex flex-col justify-between cursor-pointer hover:border-slate-300 transition-all group"
        >
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-slate-700" />
              <h3 className="font-bold text-[15px] text-slate-800">
                Mapa de operaciones
              </h3>
            </div>
            <div className="w-6 h-6 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-500 group-hover:bg-blue-50 group-hover:text-blue-600 group-hover:border-blue-200 transition-colors">
              <ChevronRight className="w-4 h-4" />
            </div>
          </div>

          <div className="h-44 w-full my-2 relative rounded-lg overflow-hidden border border-slate-200/60">
            <MapInteractive
              isMiniMap={true}
              vehicles={INITIAL_VEHICLES}
              orders={INITIAL_ORDERS}
              incidents={INITIAL_INCIDENTS}
              warehouses={INITIAL_WAREHOUSES}
            />
          </div>

          <div className="flex items-center justify-between text-[11px] font-medium text-slate-600 pt-1">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
              <span>Entregadas</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
              <span>En ruta</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
              <span>En riesgo</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
              <span>Almacenes</span>
            </div>
          </div>
        </div>

        {/* Card 3: Estado de la flota (4 cols) */}
        <div
          onClick={onNavigateToFleet}
          className="lg:col-span-4 bg-white rounded-xl border border-slate-200/90 p-5 shadow-sm flex flex-col justify-between cursor-pointer hover:border-slate-300 transition-all group"
        >
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Car className="w-5 h-5 text-slate-700" />
              <h3 className="font-bold text-[15px] text-slate-800">
                Estado de la flota
              </h3>
            </div>
            <div className="w-6 h-6 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-500 group-hover:bg-blue-50 group-hover:text-blue-600 group-hover:border-blue-200 transition-colors">
              <ChevronRight className="w-4 h-4" />
            </div>
          </div>

          <div className="py-2">
            <table className="w-full text-[12px] text-left">
              <thead>
                <tr className="text-slate-400 font-medium border-b border-slate-100">
                  <th className="pb-2 font-normal">Tipo de vehículo</th>
                  <th className="pb-2 font-normal text-center">Disponibles</th>
                  <th className="pb-2 font-normal text-center">En ruta</th>
                  <th className="pb-2 font-normal text-center">Averiados</th>
                  <th className="pb-2 font-normal text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr>
                  <td className="py-2.5 font-medium text-slate-700 flex items-center gap-2">
                    <Car className="w-4 h-4 text-blue-600" />
                    <span>Autos</span>
                  </td>
                  <td className="py-2.5 text-center font-bold text-emerald-600">6</td>
                  <td className="py-2.5 text-center font-bold text-blue-600">10</td>
                  <td className="py-2.5 text-center font-bold text-rose-600">2</td>
                  <td className="py-2.5 text-right font-bold text-slate-800">18</td>
                </tr>
                <tr>
                  <td className="py-2.5 font-medium text-slate-700 flex items-center gap-2">
                    <Bike className="w-4 h-4 text-orange-500" />
                    <span>Motos</span>
                  </td>
                  <td className="py-2.5 text-center font-bold text-emerald-600">12</td>
                  <td className="py-2.5 text-center font-bold text-blue-600">14</td>
                  <td className="py-2.5 text-center font-bold text-rose-600">1</td>
                  <td className="py-2.5 text-right font-bold text-slate-800">27</td>
                </tr>
                <tr>
                  <td className="py-2.5 font-medium text-slate-700 flex items-center gap-2">
                    <Bike className="w-4 h-4 text-emerald-600" />
                    <span>Bicicletas</span>
                  </td>
                  <td className="py-2.5 text-center font-bold text-emerald-600">20</td>
                  <td className="py-2.5 text-center font-bold text-blue-600">18</td>
                  <td className="py-2.5 text-center font-bold text-slate-400">0</td>
                  <td className="py-2.5 text-right font-bold text-slate-800">38</td>
                </tr>
              </tbody>
              <tfoot>
                <tr className="border-t border-slate-200/90 font-bold text-[13px]">
                  <td className="pt-2.5 text-slate-900">Total</td>
                  <td className="pt-2.5 text-center text-emerald-600">38</td>
                  <td className="pt-2.5 text-center text-blue-600">42</td>
                  <td className="pt-2.5 text-center text-rose-600">3</td>
                  <td className="pt-2.5 text-right text-slate-900">83</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </div>

      {/* BOTTOM ROW: 4 Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* 1. Pedidos por estado (Donut Chart) */}
        <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-sm flex flex-col justify-between">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <ListTodo className="w-5 h-5 text-slate-700" />
            <h3 className="font-bold text-[15px] text-slate-800">
              Pedidos por estado
            </h3>
          </div>

          {/* Donut Chart and Legend */}
          <div className="py-4 flex items-center justify-between gap-4">
            {/* SVG Donut */}
            <div className="relative w-28 h-28 shrink-0 flex items-center justify-center">
              <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                {/* Background circle */}
                <circle cx="18" cy="18" r="14" fill="transparent" stroke="#f1f5f9" strokeWidth="4.5" />
                {/* Entregados 40% (Green) */}
                <circle
                  cx="18"
                  cy="18"
                  r="14"
                  fill="transparent"
                  stroke="#16a34a"
                  strokeWidth="4.5"
                  strokeDasharray="35.2 88"
                  strokeDashoffset="0"
                />
                {/* En ruta 47.5% (Orange) */}
                <circle
                  cx="18"
                  cy="18"
                  r="14"
                  fill="transparent"
                  stroke="#f97316"
                  strokeWidth="4.5"
                  strokeDasharray="41.8 88"
                  strokeDashoffset="-35.2"
                />
                {/* En riesgo 12.5% (Red) */}
                <circle
                  cx="18"
                  cy="18"
                  r="14"
                  fill="transparent"
                  stroke="#dc2626"
                  strokeWidth="4.5"
                  strokeDasharray="11 88"
                  strokeDashoffset="-77"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-lg font-extrabold text-slate-900 leading-none">120</span>
                <span className="text-[10px] text-slate-500 font-medium mt-0.5">Total</span>
              </div>
            </div>

            {/* Donut Legend */}
            <div className="space-y-2 text-[11px] flex-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#16a34a]"></span>
                  <span className="text-slate-600">Entregados</span>
                </div>
                <span className="font-bold text-slate-800">48 (40%)</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#f97316]"></span>
                  <span className="text-slate-600">En ruta</span>
                </div>
                <span className="font-bold text-slate-800">57 (47.5%)</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#dc2626]"></span>
                  <span className="text-slate-600">En riesgo</span>
                </div>
                <span className="font-bold text-slate-800">15 (12.5%)</span>
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100 flex items-center gap-1.5 text-[11px] text-slate-400">
            <RotateCw className="w-3.5 h-3.5" />
            <span>Actualizado: hace 2 min</span>
          </div>
        </div>

        {/* 2. Actividad diaria (Bar Chart) */}
        <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-slate-700" />
              <h3 className="font-bold text-[15px] text-slate-800">
                Actividad diaria
              </h3>
            </div>
            <button className="flex items-center gap-1.5 px-2 py-0.5 text-[11px] font-medium text-slate-600 bg-slate-50 border border-slate-200 rounded hover:bg-slate-100">
              <span>Hoy</span>
              <ChevronDown className="w-3 h-3 text-slate-500" />
            </button>
          </div>

          {/* Bar Chart Visualization */}
          <div className="py-3">
            <div className="h-28 flex items-end justify-between gap-1.5 border-b border-slate-200 pb-1">
              {[
                { time: '00:00', delivered: 2, inRoute: 3, pending: 2 },
                { time: '04:00', delivered: 5, inRoute: 8, pending: 4 },
                { time: '08:00', delivered: 14, inRoute: 22, pending: 12 },
                { time: '12:00', delivered: 28, inRoute: 35, pending: 15 },
                { time: '16:00', delivered: 20, inRoute: 28, pending: 10 },
                { time: '20:00', delivered: 12, inRoute: 15, pending: 6 },
                { time: '24:00', delivered: 4, inRoute: 6, pending: 2 },
              ].map((bar, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-0.5 group relative">
                  <div className="w-full max-w-[18px] flex flex-col justify-end gap-0.5 h-24">
                    <div
                      style={{ height: `${bar.pending * 1.5}%` }}
                      className="w-full bg-amber-400 rounded-t-sm"
                      title={`Pendientes: ${bar.pending}`}
                    />
                    <div
                      style={{ height: `${bar.inRoute * 1.8}%` }}
                      className="w-full bg-blue-500"
                      title={`En ruta: ${bar.inRoute}`}
                    />
                    <div
                      style={{ height: `${bar.delivered * 2}%` }}
                      className="w-full bg-emerald-500 rounded-b-sm"
                      title={`Entregados: ${bar.delivered}`}
                    />
                  </div>
                  <span className="text-[9px] text-slate-400">{bar.time}</span>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-center gap-3 text-[10px] text-slate-500 pt-2">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Entregados
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-blue-500"></span> En ruta
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-amber-400"></span> Pendientes
              </span>
            </div>
          </div>
        </div>

        {/* 3. Incidencias recientes */}
        <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-slate-700" />
              <h3 className="font-bold text-[15px] text-slate-800">
                Incidencias recientes
              </h3>
            </div>
            <button
              onClick={onNavigateToSimulation}
              className="text-[12px] font-semibold text-blue-600 hover:text-blue-800 hover:underline"
            >
              Ver todas
            </button>
          </div>

          <div className="py-2 space-y-3">
            {/* Item 1: Obstrucción en vía */}
            <div className="flex items-start justify-between text-[12px]">
              <div className="flex items-start gap-2.5">
                <div className="p-1 rounded bg-amber-50 text-amber-600 mt-0.5">
                  <AlertTriangle className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-semibold text-slate-800 leading-tight">
                    Obstrucción en vía
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Av. Libertad y Calle 23
                  </p>
                </div>
              </div>
              <span className="text-[11px] text-slate-400 font-mono">10:21</span>
            </div>

            {/* Item 2: Avería de vehículo */}
            <div className="flex items-start justify-between text-[12px]">
              <div className="flex items-start gap-2.5">
                <div className="p-1 rounded bg-rose-50 text-rose-600 mt-0.5">
                  <Wrench className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-semibold text-slate-800 leading-tight">
                    Avería de vehículo
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Moto 07 • Almacén intermedio
                  </p>
                </div>
              </div>
              <span className="text-[11px] text-slate-400 font-mono">10:18</span>
            </div>

            {/* Item 3: Retraso en entrega */}
            <div className="flex items-start justify-between text-[12px]">
              <div className="flex items-start gap-2.5">
                <div className="p-1 rounded bg-amber-50 text-amber-600 mt-0.5">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-semibold text-slate-800 leading-tight">
                    Retraso en entrega
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Pedido #P0891 • Zona Norte
                  </p>
                </div>
              </div>
              <span className="text-[11px] text-slate-400 font-mono">09:55</span>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100 text-center">
            <button
              onClick={onNavigateToSimulation}
              className="text-[12px] font-semibold text-blue-600 hover:text-blue-800 hover:underline"
            >
              Ver todas las incidencias (15)
            </button>
          </div>
        </div>

        {/* 4. Almacenes e inventario */}
        <div
          onClick={onNavigateToFleet}
          className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-sm flex flex-col justify-between cursor-pointer hover:border-slate-300 transition-all"
        >
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Building2 className="w-5 h-5 text-slate-700" />
              <h3 className="font-bold text-[15px] text-slate-800">
                Almacenes e inventario
              </h3>
            </div>
            <button className="text-[12px] font-semibold text-blue-600 hover:text-blue-800 hover:underline">
              Ver detalle
            </button>
          </div>

          <div className="py-2">
            <table className="w-full text-[12px]">
              <thead>
                <tr className="text-slate-400 font-normal border-b border-slate-100 text-left">
                  <th className="pb-1.5 font-normal">Almacén</th>
                  <th className="pb-1.5 font-normal text-right">Inventario disp.</th>
                  <th className="pb-1.5 font-normal text-right">Nivel</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr>
                  <td className="py-2 text-slate-800 font-medium">Almacén central</td>
                  <td className="py-2 text-right font-bold text-slate-800">∞ (Infinito)</td>
                  <td className="py-2 text-right text-emerald-600 font-semibold flex items-center justify-end gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Alto
                  </td>
                </tr>
                <tr>
                  <td className="py-2 text-slate-800 font-medium">Almacén intermedio 1</td>
                  <td className="py-2 text-right font-bold text-slate-800">620 / 1,000</td>
                  <td className="py-2 text-right text-amber-500 font-semibold flex items-center justify-end gap-1">
                    <span className="w-2 h-2 rounded-full bg-amber-500"></span> Medio
                  </td>
                </tr>
                <tr>
                  <td className="py-2 text-slate-800 font-medium">Almacén intermedio 2</td>
                  <td className="py-2 text-right font-bold text-slate-800">480 / 1,000</td>
                  <td className="py-2 text-right text-amber-500 font-semibold flex items-center justify-end gap-1">
                    <span className="w-2 h-2 rounded-full bg-amber-500"></span> Medio
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span>Próxima recarga:</span>
            <span className="font-bold font-mono text-slate-800">23:59:59</span>
          </div>
        </div>
      </div>

      {/* BOTTOM BANNER: Matching all screenshots */}
      <div className="bg-white rounded-xl border border-slate-200/90 p-4 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <Info className="w-5 h-5" />
          </div>
          <p className="text-[13px] text-slate-700 font-medium">
            La simulación se ejecuta sobre un período de 5 días consecutivos.
          </p>
        </div>

        <button
          onClick={onNavigateToSimulation}
          className="flex items-center gap-2 px-5 py-2.5 bg-[#082937] hover:bg-[#0c394c] text-white font-semibold text-[13px] rounded-lg shadow transition-all duration-150 shrink-0 hover:shadow-md cursor-pointer"
        >
          <Calendar className="w-4 h-4 text-emerald-400" />
          <span>Ir a Simulación 5D</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
