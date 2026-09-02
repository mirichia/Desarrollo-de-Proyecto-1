import React, { useMemo, useState } from 'react';
import {
  Package,
  Search,
  Filter,
  Car,
  Bike,
  Clock,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';
import { Order, TrafficLightConfig, TrafficLightStatus, Vehicle } from '../types';
import { OrderDetailCard } from './OrderDetailCard';
import { calculateTrafficLightFromDeadline, getRemainingMinutes, getTrafficLightMeta } from '../utils/trafficLight';

interface OrdersViewProps {
  orders: Order[];
  vehicles: Vehicle[];
  simulationTime?: Date;
  trafficConfig?: TrafficLightConfig;
  onSelectOrderInSim?: (order: Order) => void;
}

export const OrdersView: React.FC<OrdersViewProps> = ({
  orders,
  vehicles,
  simulationTime,
  trafficConfig,
  onSelectOrderInSim,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [trafficFilter, setTrafficFilter] = useState<'all' | TrafficLightStatus>('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const selectedOrderForDetail = selectedOrder
    ? orders.find((order) => order.id === selectedOrder.id) || selectedOrder
    : null;

  const formatRemainingTime = (minutes: number) => {
    const safeMinutes = Math.max(0, minutes);
    const hours = Math.floor(safeMinutes / 60);
    const mins = safeMinutes % 60;

    return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}:00`;
  };

  const ordersWithDynamicTraffic = useMemo(() => (
    orders.map((order) => {
      const remainingMinutes = simulationTime
        ? getRemainingMinutes(order.deadlineAt, simulationTime)
        : order.remainingMinutes;

      return {
        ...order,
        remainingMinutes,
        remainingTime: order.status === 'entregado' ? '00:00:00' : formatRemainingTime(remainingMinutes),
        trafficLight: simulationTime
          ? calculateTrafficLightFromDeadline(order.deadlineAt, simulationTime, trafficConfig)
          : order.trafficLight,
      };
    })
  ), [orders, simulationTime, trafficConfig]);

  const filteredOrders = ordersWithDynamicTraffic.filter((order) => {
    const matchesSearch =
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.assignedVehicleName.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesTraffic = trafficFilter === 'all' || order.trafficLight === trafficFilter;

    return matchesSearch && matchesTraffic;
  });

  return (
    <div className="p-6 space-y-5 max-w-[1680px] mx-auto animate-in fade-in duration-200">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Gestión de Pedidos
          </h1>
          <p className="text-sm text-slate-500 font-medium mt-0.5">
            Monitoreo en tiempo real de órdenes, plazos comprometidos y semáforo de riesgo
          </p>
        </div>

        {/* Semáforo Filter Chips */}
        <div className="flex items-center gap-2 bg-white p-1.5 rounded-xl border border-slate-200/90 shadow-sm text-[12px]">
          <button
            onClick={() => setTrafficFilter('all')}
            className={`px-3 py-1 rounded-lg font-semibold transition-colors ${
              trafficFilter === 'all'
                ? 'bg-[#082937] text-white'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Todos ({orders.length})
          </button>
          <button
            onClick={() => setTrafficFilter('verde')}
            className={`px-3 py-1 rounded-lg font-semibold flex items-center gap-1.5 transition-colors ${
              trafficFilter === 'verde'
                ? 'bg-emerald-600 text-white'
                : 'text-emerald-700 hover:bg-emerald-50'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            Verde
          </button>
          <button
            onClick={() => setTrafficFilter('ambar')}
            className={`px-3 py-1 rounded-lg font-semibold flex items-center gap-1.5 transition-colors ${
              trafficFilter === 'ambar'
                ? 'bg-amber-500 text-white'
                : 'text-amber-700 hover:bg-amber-50'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-amber-500"></span>
            Ámbar
          </button>
          <button
            onClick={() => setTrafficFilter('rojo')}
            className={`px-3 py-1 rounded-lg font-semibold flex items-center gap-1.5 transition-colors ${
              trafficFilter === 'rojo'
                ? 'bg-rose-600 text-white'
                : 'text-rose-700 hover:bg-rose-50'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-rose-500"></span>
            Rojo
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-xl border border-slate-200/90 p-4 shadow-sm">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por ID de pedido (#PED-XXXX), cliente, dirección o vehículo asignado..."
            className="w-full pl-10 pr-4 py-2 text-[13px] bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          />
        </div>
      </div>

      {/* Orders Table & Detail Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <div className={`${selectedOrder ? 'lg:col-span-8' : 'lg:col-span-12'} bg-white rounded-xl border border-slate-200/90 shadow-sm overflow-hidden`}>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-[13px] whitespace-nowrap">
              <thead className="bg-slate-50 border-b border-slate-200/80 text-slate-500 font-semibold text-[12px]">
                <tr>
                  <th className="py-3 px-4">Pedido ID</th>
                  <th className="py-3 px-4">Cliente / Dirección</th>
                  <th className="py-3 px-4 text-center">Plazo</th>
                  <th className="py-3 px-4 text-center">Paquetes</th>
                  <th className="py-3 px-4">Vehículo asignado</th>
                  <th className="py-3 px-4">Tiempo restante</th>
                  <th className="py-3 px-4">ETA</th>
                  <th className="py-3 px-4">Semáforo</th>
                  <th className="py-3 px-4 text-right">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredOrders.map((order) => {
                  const trafficMeta = getTrafficLightMeta(order.trafficLight);
                  return (
                    <tr
                      key={order.id}
                      onClick={() => setSelectedOrder(order)}
                      className={`hover:bg-slate-50/80 cursor-pointer transition-colors ${
                        selectedOrder?.id === order.id ? 'bg-blue-50/50' : ''
                      }`}
                    >
                      <td className="py-3.5 px-4 font-bold text-slate-900">
                        #{order.id}
                      </td>
                      <td className="py-3.5 px-4">
                        <p className="font-semibold text-slate-800 leading-tight">{order.clientName}</p>
                        <p className="text-[11px] text-slate-500 mt-0.5">{order.address}</p>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-bold ${
                            order.deadlineHours <= 8
                              ? 'bg-purple-50 text-purple-700 border border-purple-200'
                              : order.deadlineHours <= 18
                              ? 'bg-blue-50 text-blue-700 border border-blue-200'
                              : 'bg-slate-100 text-slate-700 border border-slate-200'
                          }`}
                        >
                          {order.deadlineHours} h
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center font-bold text-slate-800">
                        {order.packagesCount}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="flex items-center gap-1.5 font-medium text-slate-700">
                          {order.assignedVehicleType === 'auto' && <Car className="w-4 h-4 text-blue-600" />}
                          {order.assignedVehicleType === 'moto' && <Bike className="w-4 h-4 text-orange-500" />}
                          {order.assignedVehicleType === 'bicicleta' && <Bike className="w-4 h-4 text-emerald-600" />}
                          {order.assignedVehicleName}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-mono font-medium text-slate-700">
                        {order.remainingTime}
                      </td>
                      <td className="py-3.5 px-4 font-medium text-slate-700">
                        {order.eta}
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold ${trafficMeta.badgeClass}`}
                        >
                          <span className={`w-2 h-2 rounded-full ${trafficMeta.dotClass}`} />
                          {trafficMeta.tag}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedOrder(order);
                            onSelectOrderInSim?.(order);
                          }}
                          className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Selected Order Detail Sidebar Card */}
        {selectedOrderForDetail && (
          <div className="lg:col-span-4">
            <div className="sticky top-6">
              <OrderDetailCard
                order={selectedOrderForDetail}
                vehicle={vehicles.find((vehicle) => vehicle.id === selectedOrderForDetail.assignedVehicleId) || null}
                trafficConfig={trafficConfig}
                simulationTime={simulationTime}
                onClose={() => setSelectedOrder(null)}
                className="w-full"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
