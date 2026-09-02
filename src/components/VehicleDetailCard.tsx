import React from 'react';
import { Car, Bike, X } from 'lucide-react';
import { Vehicle, Order } from '../types';

interface VehicleDetailCardProps {
  vehicle: Vehicle;
  orders?: Order[];
  onClose: () => void;
  className?: string;
}

export const VehicleDetailCard: React.FC<VehicleDetailCardProps> = ({
  vehicle,
  orders = [],
  onClose,
  className = '',
}) => {
  // Determine vehicle properties according to official project rules and data
  const maxCapacity = vehicle.capacity || (vehicle.type === 'auto' ? 24 : vehicle.type === 'moto' ? 8 : 4);
  const avgSpeed = `${vehicle.speed || (vehicle.type === 'auto' ? 40 : vehicle.type === 'moto' ? 25 : 12)} km/h`;
  const assignedPackages = vehicle.assignedPackages ?? maxCapacity;
  const originWarehouse = vehicle.originWarehouse || (vehicle.type === 'bicicleta' ? 'Intermedio 1' : vehicle.type === 'moto' ? 'Intermedio 2' : 'Almacén central');

  // Route details
  const assignedOrdersCount =
    vehicle.assignedOrdersCount ??
    (orders.filter((o) => o.assignedVehicleId === vehicle.id).length || (vehicle.assignedPackages > 0 ? 3 : 0));
  const remainingStops = vehicle.remainingStops ?? (vehicle.status === 'en_ruta' ? 3 : 0);
  const remainingDistance =
    vehicle.remainingDistanceKm != null
      ? `${vehicle.remainingDistanceKm} km`
      : vehicle.status === 'en_ruta'
      ? vehicle.type === 'auto'
        ? '14.2 km'
        : vehicle.type === 'moto'
        ? '5.4 km'
        : '6.8 km'
      : '0.0 km';
  const accumulatedCost =
    vehicle.accumulatedCost != null
      ? vehicle.accumulatedCost
      : vehicle.type === 'auto'
      ? 113.6
      : vehicle.type === 'moto'
      ? 32.4
      : 14.4;

  // Format vehicle display name
  const vehicleCleanName = vehicle.name.replace(/^(Auto|Moto|Bicicleta)\s*-\s*/, '');
  const vehicleTypeLabel = vehicle.type === 'auto' ? 'Auto' : vehicle.type === 'moto' ? 'Moto' : 'Bicicleta';

  // Status badge config
  const getStatusBadge = () => {
    switch (vehicle.status) {
      case 'en_ruta':
        return {
          label: 'En ruta',
          badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
          dotClass: 'bg-emerald-500 animate-pulse',
        };
      case 'averiado':
        return {
          label: 'Averiado',
          badgeClass: 'bg-rose-50 text-rose-700 border-rose-200',
          dotClass: 'bg-rose-500',
        };
      default:
        return {
          label: 'Disponible',
          badgeClass: 'bg-blue-50 text-blue-700 border-blue-200',
          dotClass: 'bg-blue-500',
        };
    }
  };

  const statusBadge = getStatusBadge();

  return (
    <div
      className={`bg-white/95 backdrop-blur-md rounded-xl shadow-xl border border-slate-200/90 p-4 text-slate-800 pointer-events-auto z-40 transition-all duration-200 animate-in fade-in zoom-in-95 ${
        className ? className : 'w-80'
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div
            className={`w-7 h-7 rounded-lg flex items-center justify-center ${
              vehicle.type === 'auto'
                ? 'bg-blue-100 text-blue-700'
                : vehicle.type === 'moto'
                ? 'bg-orange-100 text-orange-600'
                : 'bg-emerald-100 text-emerald-700'
            }`}
          >
            {vehicle.type === 'auto' && <Car className="w-4 h-4" />}
            {vehicle.type === 'moto' && <Bike className="w-4 h-4" />}
            {vehicle.type === 'bicicleta' && <Bike className="w-4 h-4" />}
          </div>
          <div>
            <h4 className="font-bold text-[14px] text-slate-900 tracking-tight">
              Vehículo: <span className="font-semibold text-slate-900">{vehicleTypeLabel} {vehicleCleanName}</span>
            </h4>
            <p className="text-[11px] font-mono text-slate-500">
              Placa: {vehicle.plate} • {vehicle.driver}
            </p>
          </div>
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
        {/* Estado */}
        <div className="flex items-center justify-between">
          <span className="text-slate-500">Estado</span>
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${statusBadge.badgeClass}`}>
            <span className={`w-2 h-2 rounded-full ${statusBadge.dotClass}`} />
            {statusBadge.label}
          </span>
        </div>

        {/* Capacidad */}
        <div className="flex items-center justify-between">
          <span className="text-slate-500">Capacidad</span>
          <span className="font-bold text-slate-800">
            {maxCapacity} unidades P
          </span>
        </div>

        {/* Carga actual */}
        <div className="flex items-center justify-between">
          <span className="text-slate-500">Carga actual</span>
          <span className="font-bold text-slate-800 font-mono">
            {assignedPackages} / {maxCapacity}
          </span>
        </div>

        {/* Velocidad */}
        <div className="flex items-center justify-between">
          <span className="text-slate-500">Velocidad</span>
          <span className="font-semibold text-slate-800">{avgSpeed}</span>
        </div>

        {/* Almacén origen */}
        <div className="flex items-center justify-between">
          <span className="text-slate-500">Almacén origen</span>
          <span className="font-semibold text-slate-800">
            {originWarehouse}
          </span>
        </div>

        {/* RUTA ACTUAL */}
        <div className="pt-2.5 mt-2.5 border-t border-slate-100">
          <div className="text-[11px] font-bold text-slate-500 tracking-wider uppercase mb-2">
            RUTA ACTUAL
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Pedidos asignados</span>
              <span className="font-bold text-slate-800 font-mono">
                {assignedOrdersCount}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-500">Paradas restantes</span>
              <span className="font-bold text-slate-800 font-mono">
                {remainingStops}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-500">Distancia restante</span>
              <span className="font-semibold text-slate-800 font-mono">
                {remainingDistance}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-500">Costo acumulado</span>
              <span className="font-bold text-emerald-700 font-mono">
                S/ {accumulatedCost.toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
