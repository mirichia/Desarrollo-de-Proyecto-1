import React from 'react';
import { Car, Bike, X, Package, Clock, MapPin, Calendar, AlertCircle } from 'lucide-react';
import { Order, Vehicle, TrafficLightConfig } from '../types';
import { calculateTrafficLightFromDeadline, calculateTrafficLightStatus, getRemainingMinutes, getTrafficLightMeta } from '../utils/trafficLight';

interface OrderDetailCardProps {
  order?: Order | null;
  vehicle?: Vehicle | null;
  trafficConfig?: TrafficLightConfig;
  simulationTime?: Date;
  onClose: () => void;
  className?: string;
}

export const OrderDetailCard: React.FC<OrderDetailCardProps> = ({
  order,
  vehicle,
  trafficConfig,
  simulationTime,
  onClose,
  className = '',
}) => {
  if (!order && !vehicle) return null;

  // Derive display values
  const orderId = order ? (order.id.startsWith('#') ? order.id : `#${order.id}`) : `#PED-45872`;
  const clientName = order?.clientName || 'Cliente Logístico';
  const address = order?.address || 'Dirección de destino';
  const vehicleType = vehicle ? vehicle.type : order?.assignedVehicleType || 'auto';
  const vehicleName = vehicle ? vehicle.name : order?.assignedVehicleName || 'Auto - A18';
  const packages = vehicle ? vehicle.assignedPackages : order?.packagesCount || 6;
  const deadlineHours = order?.deadlineHours || 4;
  const deadlineType = order?.deadlineType || (deadlineHours === 36 ? 'normal' : 'priorizado');
  const registeredAt = order?.registeredAt || '10/05/2025 07:15';
  const deadlineAt = order?.deadlineAt || '10/05/2025 11:15';
  const remainingMinutes = order?.status === 'entregado'
    ? 0
    : order && simulationTime
    ? Math.max(0, getRemainingMinutes(order.deadlineAt, simulationTime))
    : order?.remainingMinutes ?? 51;
  const remaining = order && simulationTime
    ? `${String(Math.floor(remainingMinutes / 60)).padStart(2, '0')}:${String(remainingMinutes % 60).padStart(2, '0')}:00`
    : order ? order.remainingTime : '00:51:00';
  const eta = order ? order.eta : '10:56';
  const origin = order ? order.origin : 'Almacén central';
  const orderStatus = order?.status === 'entregado' ? 'ENTREGADO' : order?.status === 'fallido' ? 'FALLIDO' : 'EN RUTA';

  // Calculate traffic light status according to config if available
  const computedStatus = order?.status === 'entregado'
    ? 'verde'
    : order && simulationTime
    ? calculateTrafficLightFromDeadline(order.deadlineAt, simulationTime, trafficConfig)
    : order
    ? calculateTrafficLightStatus(order.remainingMinutes, trafficConfig)
    : 'verde';
  const trafficMeta = getTrafficLightMeta(computedStatus);

  return (
    <div className={`bg-white/95 backdrop-blur-md rounded-xl shadow-xl border border-slate-200/90 p-4 text-slate-800 pointer-events-auto z-40 transition-all duration-200 animate-in fade-in zoom-in-95 ${className ? className : 'w-80'}`}>
      {/* Header */}
      <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-slate-100">
        <div>
          <h4 className="font-bold text-[14px] text-slate-900 tracking-tight flex items-center gap-1.5">
            <span>Pedido:</span>
            <span className="text-slate-900 font-mono">{orderId}</span>
          </h4>
          <p className="text-[11.5px] font-medium text-slate-600 mt-0.5 truncate max-w-[210px]">
            {clientName}
          </p>
        </div>
        <button
          onClick={onClose}
          className="text-slate-400 hover:text-slate-700 p-1 rounded-md hover:bg-slate-100 transition-colors"
          title="Cerrar detalle"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Rows */}
      <div className="space-y-2 text-[12px]">
        {/* Destino */}
        <div className="flex items-start justify-between gap-2">
          <span className="text-slate-500 whitespace-nowrap">Destino</span>
          <span className="font-medium text-slate-800 text-right text-[11.5px] leading-tight">
            {address}
          </span>
        </div>

        {/* Cantidad de paquetes */}
        <div className="flex items-center justify-between">
          <span className="text-slate-500">Cantidad de paquetes</span>
          <span className="font-bold text-slate-800">{packages} paquetes</span>
        </div>

        {/* Plazo: 4/8/12/18/36 h */}
        <div className="flex items-center justify-between">
          <span className="text-slate-500">Plazo</span>
          <span className="font-bold text-slate-800 flex items-center gap-1">
            <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
              deadlineHours <= 8
                ? 'bg-purple-50 text-purple-700 border border-purple-200'
                : deadlineHours <= 18
                ? 'bg-blue-50 text-blue-700 border border-blue-200'
                : 'bg-slate-100 text-slate-700 border border-slate-200'
            }`}>
              {deadlineHours} h ({deadlineType === 'priorizado' ? 'Priorizado' : 'Normal'})
            </span>
          </span>
        </div>

        {/* Registrado */}
        <div className="flex items-center justify-between">
          <span className="text-slate-500">Registrado</span>
          <span className="font-mono text-slate-700 text-[11.5px]">{registeredAt}</span>
        </div>

        {/* Vencimiento */}
        <div className="flex items-center justify-between">
          <span className="text-slate-500">Vencimiento</span>
          <span className="font-mono font-semibold text-slate-800 text-[11.5px]">{deadlineAt}</span>
        </div>

        {/* Tiempo restante */}
        <div className="flex items-center justify-between">
          <span className="text-slate-500">Tiempo restante</span>
          <span className="font-mono font-bold text-slate-800">{remaining}</span>
        </div>

        {/* ETA */}
        <div className="flex items-center justify-between">
          <span className="text-slate-500">ETA</span>
          <span className="font-semibold text-slate-800">{eta}</span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-slate-500">Estado</span>
          <span
            className={`font-bold ${
              orderStatus === 'ENTREGADO'
                ? 'text-emerald-700'
                : orderStatus === 'FALLIDO'
                ? 'text-rose-700'
                : 'text-blue-700'
            }`}
          >
            {orderStatus}
          </span>
        </div>

        {/* Estado semáforo */}
        <div className="flex items-center justify-between">
          <span className="text-slate-500">Estado semáforo</span>
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${trafficMeta.badgeClass}`}>
            <span className={`w-2 h-2 rounded-full ${trafficMeta.dotClass}`} />
            {trafficMeta.tag} • {trafficMeta.description}
          </span>
        </div>

        {/* Vehículo asignado */}
        <div className="flex items-center justify-between pt-1 border-t border-slate-100">
          <span className="text-slate-500">Vehículo asignado</span>
          <span className="font-semibold text-slate-800 flex items-center gap-1.5">
            {vehicleType === 'auto' && <Car className="w-4 h-4 text-blue-600" />}
            {vehicleType === 'moto' && <Bike className="w-4 h-4 text-orange-500" />}
            {vehicleType === 'bicicleta' && <Bike className="w-4 h-4 text-emerald-600" />}
            {vehicleName}
          </span>
        </div>

        {/* Almacén de origen */}
        <div className="flex items-center justify-between">
          <span className="text-slate-500">Almacén de origen</span>
          <span className="font-semibold text-slate-800 truncate max-w-[150px]">
            {origin}
          </span>
        </div>
      </div>
    </div>
  );
};
