import React from 'react';
import { Calendar, ShieldCheck, AlertTriangle, Route, Warehouse, Users, Clock, Car, Bike, CheckCircle2 } from 'lucide-react';

export const HelpView: React.FC = () => {
  return (
    <div className="p-6 space-y-6 max-w-[1200px] mx-auto animate-in fade-in duration-200">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          Centro de Ayuda y Guía Operativa PAQRAP
        </h1>
        <p className="text-sm text-slate-500 font-medium mt-0.5">
          Reglas de negocio oficiales, especificaciones de flota, almacenes y motor de simulación 5D
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Card 1: Infraestructura de Almacenes */}
        <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-sm space-y-3">
          <div className="flex items-center gap-2.5 text-slate-800">
            <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
              <Warehouse className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-[15px]">Infraestructura de Almacenes</h3>
          </div>
          <div className="space-y-2 text-[12.5px] text-slate-600 leading-relaxed">
            <p>
              • <strong>1 Almacén Central:</strong> Dispone de inventario infinito para efectos del proyecto y abastecimiento continuo.
            </p>
            <p>
              • <strong>2 Almacenes Intermedios:</strong> Capacidad máxima de <strong>1,000 unidades</strong> del producto P cada uno.
            </p>
            <p>
              • <strong>Recarga de Almacenes:</strong> Se recargan automáticamente cada 24 horas a las <strong>23:59:59</strong> con tiempo de reposición instantáneo.
            </p>
          </div>
        </div>

        {/* Card 2: Especificaciones de Flota Multimodal */}
        <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-sm space-y-3">
          <div className="flex items-center gap-2.5 text-slate-800">
            <div className="p-2 rounded-lg bg-purple-50 text-purple-600">
              <Car className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-[15px]">Especificaciones de Flota</h3>
          </div>
          <div className="space-y-2 text-[12.5px] text-slate-600 leading-relaxed">
            <p>
              • <strong className="text-blue-700">Auto:</strong> Capacidad de <strong>24 paquetes</strong>, velocidad promedio <strong>40 km/h</strong>, costo operativo <strong>S/ 8.00 por km</strong>.
            </p>
            <p>
              • <strong className="text-orange-600">Moto:</strong> Capacidad de <strong>8 paquetes</strong>, velocidad promedio <strong>25 km/h</strong>, costo operativo <strong>S/ 6.00 por km</strong>.
            </p>
            <p>
              • <strong className="text-emerald-700">Bicicleta:</strong> Capacidad de <strong>4 paquetes</strong>, velocidad promedio <strong>12 km/h</strong>, costo operativo <strong>S/ 3.00 por km</strong>.
            </p>
            <p className="text-[11.5px] text-slate-500 pt-1 border-t border-slate-100">
              * El tiempo de carga en almacén es despreciable. El tiempo de atención / entrega por destinatario es de <strong>1 hora</strong>.
            </p>
          </div>
        </div>

        {/* Card 3: Plazos y Semáforo de Pedidos */}
        <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-sm space-y-3">
          <div className="flex items-center gap-2.5 text-slate-800">
            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-[15px]">Modalidades y Semáforo de Pedidos</h3>
          </div>
          <div className="space-y-2 text-[12px]">
            <p className="text-slate-600">
              <strong>Plazos de entrega:</strong> Modalidad Normal (máx. <strong>36 h</strong>); Modalidad Priorizada (máx. <strong>18, 12, 8 o 4 h</strong>).
            </p>
            <div className="flex items-start gap-2 pt-1">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 mt-1 shrink-0"></span>
              <div>
                <strong className="text-emerald-700">Verde (Margen suficiente):</strong>
                <p className="text-slate-600">Tiempo restante superior a 45 min. Despacho en tiempo óptimo.</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 mt-1 shrink-0"></span>
              <div>
                <strong className="text-amber-700">Ámbar (Próximo al plazo):</strong>
                <p className="text-slate-600">Tiempo restante entre 15 y 45 min. Monitoreo cercano de ruta.</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 mt-1 shrink-0"></span>
              <div>
                <strong className="text-rose-700">Rojo (Crítico / En riesgo):</strong>
                <p className="text-slate-600">Tiempo restante menor a 15 min o ruta impactada por incidencias.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Card 4: Turnos, Red Vial y Replanificación */}
        <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-sm space-y-3">
          <div className="flex items-center gap-2.5 text-slate-800">
            <div className="p-2 rounded-lg bg-amber-50 text-amber-600">
              <Clock className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-[15px]">Turnos, Red Vial y Replanificación</h3>
          </div>
          <div className="space-y-2 text-[12.5px] text-slate-600 leading-relaxed">
            <p>
              • <strong>Cambios de Turno:</strong> Programados a las <strong>07:00, 15:00 y 23:00</strong>. Incluyen 1 hora de alimentación separada al menos 1 hora del cambio de turno.
            </p>
            <p>
              • <strong>Red Vial:</strong> Todas las calles operan en <strong>doble sentido</strong>.
            </p>
            <p>
              • <strong>Replanificación Automática:</strong> Ante averías mecánicas o bloqueos de vías, el planificador recalcula de forma 100% automática las rutas óptimas sin requerir confirmación manual.
            </p>
            <p>
              • <strong>Simulación 5D:</strong> Simula 5 días de operación continua (duración real de ejecución representativa: <strong>00:43:12</strong>).
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
