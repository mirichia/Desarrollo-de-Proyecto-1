import React, { useState } from 'react';
import {
  Car,
  Bike,
  Building2,
  BatteryCharging,
  Fuel,
} from 'lucide-react';
import { INITIAL_VEHICLES, INITIAL_WAREHOUSES } from '../data/mockData';
import { Vehicle, VehicleType, Warehouse } from '../types';

interface FleetViewProps {
  vehicles?: Vehicle[];
  warehouses?: Warehouse[];
}

export const FleetView: React.FC<FleetViewProps> = ({
  vehicles = INITIAL_VEHICLES,
  warehouses = INITIAL_WAREHOUSES,
}) => {
  const [selectedType, setSelectedType] = useState<'all' | VehicleType>('all');

  const filteredVehicles = vehicles.filter(
    (v) => selectedType === 'all' || v.type === selectedType
  );

  const getVehicleAvgSpeed = (type: VehicleType) => {
    switch (type) {
      case 'auto':
        return 40;
      case 'moto':
        return 25;
      case 'bicicleta':
        return 12;
    }
  };

  const getVehicleCostPerKm = (type: VehicleType) => {
    switch (type) {
      case 'auto':
        return 'S/ 8.00/km';
      case 'moto':
        return 'S/ 6.00/km';
      case 'bicicleta':
        return 'S/ 3.00/km';
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-[1680px] mx-auto animate-in fade-in duration-200">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          Flota y Almacenes
        </h1>
        <p className="text-sm text-slate-500 font-medium mt-0.5">
          Gestión de inventario de almacenes y estado operativo de vehículos multimodales
        </p>
      </div>

      {/* SECTION 1: Almacenes e Inventario */}
      <div className="space-y-3">
        <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
          <Building2 className="w-5 h-5 text-slate-700" />
          <span>Red de Almacenes Logísticos</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {warehouses.map((wh) => (
            <div
              key={wh.id}
              className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-sm space-y-3"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center text-white font-bold ${
                      wh.type === 'central' ? 'bg-[#0a2e3f]' : 'bg-emerald-700'
                    }`}
                  >
                    <Building2 className="w-4 h-4" />
                  </div>
                  <h3 className="font-bold text-[14px] text-slate-900">{wh.name}</h3>
                </div>
                <span
                  className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                    wh.type === 'central'
                      ? 'bg-blue-50 text-blue-700 border border-blue-200'
                      : wh.level === 'Alto'
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : wh.level === 'Medio'
                      ? 'bg-amber-50 text-amber-700 border border-amber-200'
                      : 'bg-rose-50 text-rose-700 border border-rose-200'
                  }`}
                >
                  {wh.type === 'central' ? 'Permanente' : wh.level}
                </span>
              </div>

              {wh.type === 'central' ? (
                <div className="space-y-1.5 text-[12px] text-slate-600">
                  <div className="flex items-center justify-between">
                    <span>Inventario:</span>
                    <span className="font-bold text-slate-900 text-[15px]">∞</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Abastecimiento:</span>
                    <span className="font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded text-[11px]">
                      Permanente
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Vehículos en base:</span>
                    <span className="font-bold text-slate-800">{wh.activeVehicles}</span>
                  </div>
                </div>
              ) : (
                <div className="space-y-1.5 text-[12px] text-slate-600">
                  <div className="flex items-center justify-between">
                    <span>Inventario disponible:</span>
                    <span className="font-bold text-slate-900 text-[13px]">
                      {wh.availableInventory.toLocaleString()} / {wh.capacity.toLocaleString()} uds
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Capacidad máxima:</span>
                    <span className="font-semibold text-slate-700">1,000 uds</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Recarga:</span>
                    <span className="font-medium text-slate-700">Cada 24 h</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Hora de recarga:</span>
                    <span className="font-bold font-mono text-slate-800">23:59:59</span>
                  </div>
                </div>
              )}

              {/* Progress bar / Ocupación visual */}
              <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                <div
                  className={`h-full rounded-full ${
                    wh.type === 'central'
                      ? 'bg-blue-500 w-full'
                      : wh.level === 'Alto'
                      ? 'bg-emerald-500'
                      : wh.level === 'Medio'
                      ? 'bg-amber-500'
                      : 'bg-rose-500'
                  }`}
                  style={{
                    width: wh.type === 'central' ? '100%' : `${(wh.availableInventory / wh.capacity) * 100}%`,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SECTION 2: Flota Multimodal */}
      <div className="space-y-3 pt-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
            <Car className="w-5 h-5 text-slate-700" />
            <span>Vehículos y Operadores</span>
          </h2>

          {/* Vehicle Type Filter */}
          <div className="flex items-center gap-2 bg-white p-1.5 rounded-xl border border-slate-200/90 shadow-sm text-[12px]">
            <button
              onClick={() => setSelectedType('all')}
              className={`px-3 py-1 rounded-lg font-semibold transition-colors ${
                selectedType === 'all' ? 'bg-[#082937] text-white' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Todos ({vehicles.length})
            </button>
            <button
              onClick={() => setSelectedType('auto')}
              className={`px-3 py-1 rounded-lg font-semibold flex items-center gap-1.5 transition-colors ${
                selectedType === 'auto' ? 'bg-blue-600 text-white' : 'text-blue-700 hover:bg-blue-50'
              }`}
            >
              <Car className="w-3.5 h-3.5" />
              Autos
            </button>
            <button
              onClick={() => setSelectedType('moto')}
              className={`px-3 py-1 rounded-lg font-semibold flex items-center gap-1.5 transition-colors ${
                selectedType === 'moto' ? 'bg-orange-500 text-white' : 'text-orange-700 hover:bg-orange-50'
              }`}
            >
              <Bike className="w-3.5 h-3.5" />
              Motos
            </button>
            <button
              onClick={() => setSelectedType('bicicleta')}
              className={`px-3 py-1 rounded-lg font-semibold flex items-center gap-1.5 transition-colors ${
                selectedType === 'bicicleta' ? 'bg-emerald-600 text-white' : 'text-emerald-700 hover:bg-emerald-50'
              }`}
            >
              <Bike className="w-3.5 h-3.5" />
              Bicicletas
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredVehicles.map((vehicle) => (
            <div
              key={vehicle.id}
              className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-sm space-y-3"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div
                    className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                      vehicle.type === 'auto'
                        ? 'bg-blue-50 text-blue-600'
                        : vehicle.type === 'moto'
                        ? 'bg-orange-50 text-orange-600'
                        : 'bg-emerald-50 text-emerald-600'
                    }`}
                  >
                    {vehicle.type === 'auto' ? <Car className="w-5 h-5" /> : <Bike className="w-5 h-5" />}
                  </div>
                  <div>
                    <h3 className="font-bold text-[14px] text-slate-900 leading-tight">
                      {vehicle.name}
                    </h3>
                    <p className="text-[11px] text-slate-500 font-mono">
                      Placa: {vehicle.plate}
                    </p>
                  </div>
                </div>

                <span
                  className={`px-2.5 py-1 rounded-full text-[11px] font-bold capitalize ${
                    vehicle.status === 'en_ruta'
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : vehicle.status === 'disponible'
                      ? 'bg-blue-50 text-blue-700 border border-blue-200'
                      : 'bg-rose-50 text-rose-700 border border-rose-200'
                  }`}
                >
                  {vehicle.status === 'en_ruta' ? '● En ruta' : vehicle.status === 'disponible' ? '● Disponible' : '● Averiado'}
                </span>
              </div>

              <div className="space-y-1.5 text-[12px] text-slate-600 pt-1 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <span>Conductor / Repartidor:</span>
                  <span className="font-semibold text-slate-800">{vehicle.driver}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Carga:</span>
                  <span className="font-bold text-slate-800">
                    {vehicle.assignedPackages} / {vehicle.capacity} paquetes
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Capacidad máxima:</span>
                  <span className="font-medium text-slate-700">{vehicle.capacity} paquetes</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Velocidad promedio:</span>
                  <span className="font-medium text-slate-700">{getVehicleAvgSpeed(vehicle.type)} km/h</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Velocidad actual:</span>
                  <span className={`font-semibold ${vehicle.status === 'averiado' ? 'text-rose-600' : 'text-slate-800'}`}>
                    {vehicle.status === 'averiado' ? '0 km/h (Inoperativo)' : vehicle.status === 'en_ruta' ? `${vehicle.speed} km/h` : '0 km/h (En base)'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Costo operativo:</span>
                  <span className="font-bold text-slate-800">{getVehicleCostPerKm(vehicle.type)}</span>
                </div>
                {vehicle.batteryOrFuel !== undefined && (
                  <div className="flex items-center justify-between pt-1 border-t border-slate-50">
                    <span className="flex items-center gap-1">
                      {vehicle.type === 'bicicleta' ? <BatteryCharging className="w-3.5 h-3.5" /> : <Fuel className="w-3.5 h-3.5" />}
                      Batería / Combustible:
                    </span>
                    <span className="font-bold text-slate-800">{vehicle.batteryOrFuel}%</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
