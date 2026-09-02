import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Calendar,
  Clock,
  Timer,
  UploadCloud,
  Play,
  Pause,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Wrench,
  Car,
  Bike,
  Plus,
  Minus,
  Sliders,
  Check,
  FileSpreadsheet,
  ShieldAlert,
  ShieldCheck,
  Route,
  Coins,
  RefreshCw,
  TrendingUp,
} from 'lucide-react';
import { MapInteractive } from './MapInteractive';
import { SimulationActivityFeed, SimulationFeedEvent } from './SimulationActivityFeed';
import { SimulationDemoScript } from './SimulationDemoScript';
import { SimulationLegend } from './SimulationLegend';
import {
  SimulationStage,
  SimulationParams,
  SimulationStats,
  Vehicle,
  Order,
  Incident,
} from '../types';
import { INITIAL_INCIDENTS, INITIAL_WAREHOUSES } from '../data/mockData';
import { SIMULATION_SCENARIO } from '../data/simulationMock';
import { calculateTrafficLightFromDeadline } from '../utils/trafficLight';

interface SimulationViewProps {
  stage: SimulationStage;
  setStage: (stage: SimulationStage) => void;
  stats: SimulationStats;
  setStats: React.Dispatch<React.SetStateAction<SimulationStats>>;
  vehicles: Vehicle[];
  setVehicles: React.Dispatch<React.SetStateAction<Vehicle[]>>;
  orders: Order[];
  setOrders: React.Dispatch<React.SetStateAction<Order[]>>;
  incidents: Incident[];
  setIncidents: React.Dispatch<React.SetStateAction<Incident[]>>;
  initialOrders: Order[];
  initialVehicles: Vehicle[];
  simulationTime: Date;
  setSimulationTime: React.Dispatch<React.SetStateAction<Date>>;
  params: SimulationParams;
  setParams: React.Dispatch<React.SetStateAction<SimulationParams>>;
  feedEvents: SimulationFeedEvent[];
  setFeedEvents: React.Dispatch<React.SetStateAction<SimulationFeedEvent[]>>;
  showRightPanel: boolean;
}

const SIMULATION_START_TIME = new Date(2025, 4, 10, 10, 0, 0, 0);
const SIMULATION_DAYS = 5;
const SIMULATION_DAY_MS = 24 * 60 * 60 * 1000;
const CONCEPTUAL_REAL_DURATION_SECONDS = 45 * 60;

const formatElapsedSeconds = (totalSeconds: number) => {
  const clampedSeconds = Math.max(0, Math.floor(totalSeconds));
  const hours = Math.floor(clampedSeconds / 3600);
  const minutes = Math.floor((clampedSeconds % 3600) / 60);
  const seconds = clampedSeconds % 60;

  return [
    String(hours).padStart(2, '0'),
    String(minutes).padStart(2, '0'),
    String(seconds).padStart(2, '0'),
  ].join(':');
};

const getTimelineSnapshot = (simulationTime: Date) => {
  const elapsedMs = Math.max(0, simulationTime.getTime() - SIMULATION_START_TIME.getTime());
  const totalSimulationMs = SIMULATION_DAYS * SIMULATION_DAY_MS;
  const clampedElapsedMs = Math.min(elapsedMs, totalSimulationMs);
  const currentDay = Math.min(SIMULATION_DAYS, Math.floor(clampedElapsedMs / SIMULATION_DAY_MS) + 1);
  const currentDayElapsedMs = currentDay === SIMULATION_DAYS && clampedElapsedMs === totalSimulationMs
    ? SIMULATION_DAY_MS
    : clampedElapsedMs % SIMULATION_DAY_MS;
  const dayProgress = Math.min(100, Math.max(0, (currentDayElapsedMs / SIMULATION_DAY_MS) * 100));
  const overallProgress = Math.min(100, Math.max(0, (clampedElapsedMs / totalSimulationMs) * 100));

  return {
    currentDay,
    dayProgress,
    overallProgress,
    realElapsedTime: formatElapsedSeconds((overallProgress / 100) * CONCEPTUAL_REAL_DURATION_SECONDS),
  };
};

export const SimulationView: React.FC<SimulationViewProps> = ({
  stage,
  setStage,
  stats,
  setStats,
  vehicles,
  setVehicles,
  orders,
  setOrders,
  incidents,
  setIncidents,
  initialOrders,
  initialVehicles,
  simulationTime,
  setSimulationTime,
  params,
  setParams,
  feedEvents,
  setFeedEvents,
  showRightPanel,
}) => {
  const [isPaused, setIsPaused] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [showConfigAdvanced, setShowConfigAdvanced] = useState(false);

  const deliveredOrderIds = orders
    .filter((order) => order.status === 'entregado')
    .map((order) => order.id);
  const timelineSnapshot = useMemo(() => getTimelineSnapshot(simulationTime), [simulationTime]);
  const finalResults = SIMULATION_SCENARIO.finalResults;

  useEffect(() => {
    const simulationProgress = Math.min(Math.max(timelineSnapshot.overallProgress / 100, 0), 1);
    const processedOrders = stage === 'config'
      ? 0
      : stage === 'results'
      ? finalResults.processedOrders
      : Math.floor(finalResults.processedOrders * simulationProgress);
    const deliveredOrders = stage === 'config'
      ? 0
      : stage === 'results'
      ? finalResults.deliveredOrders
      : Math.min(processedOrders, Math.floor(finalResults.deliveredOrders * simulationProgress));
    const pendingOrders = stage === 'results' ? 0 : Math.max(0, processedOrders - deliveredOrders);
    const visibleAtRiskOrders = orders.filter((order) => (
      order.status !== 'entregado' &&
      order.status !== 'fallido' &&
      calculateTrafficLightFromDeadline(order.deadlineAt, simulationTime, params.trafficLights) === 'rojo'
    )).length;
    const atRiskOrders = stage === 'config' || stage === 'results'
      ? finalResults.failedOrders
      : Math.min(pendingOrders, visibleAtRiskOrders);
    const activeVehicles = stage === 'results'
      ? 0
      : vehicles.filter((vehicle) => vehicle.status !== 'disponible' && vehicle.status !== 'averiado').length;
    const nextStats: SimulationStats = {
      simulatedDateTime: stage === 'config'
        ? '--'
        : `Día ${timelineSnapshot.currentDay} ${String(simulationTime.getHours()).padStart(2, '0')}:${String(simulationTime.getMinutes()).padStart(2, '0')}`,
      realElapsedTime: stage === 'config'
        ? '--'
        : stage === 'results'
        ? finalResults.realElapsedTime
        : timelineSnapshot.realElapsedTime,
      totalOrders: processedOrders,
      deliveredOrders,
      pendingOrders,
      atRiskOrders,
      activeVehicles,
      currentDay: timelineSnapshot.currentDay,
      dayProgress: timelineSnapshot.dayProgress,
    };

    setStats((currentStats) => (
      currentStats.simulatedDateTime === nextStats.simulatedDateTime &&
      currentStats.realElapsedTime === nextStats.realElapsedTime &&
      currentStats.totalOrders === nextStats.totalOrders &&
      currentStats.deliveredOrders === nextStats.deliveredOrders &&
      currentStats.pendingOrders === nextStats.pendingOrders &&
      currentStats.atRiskOrders === nextStats.atRiskOrders &&
      currentStats.activeVehicles === nextStats.activeVehicles &&
      currentStats.currentDay === nextStats.currentDay &&
      currentStats.dayProgress === nextStats.dayProgress
        ? currentStats
        : nextStats
    ));
  }, [finalResults, orders, params.trafficLights, setStats, simulationTime, stage, timelineSnapshot, vehicles]);

  const syncStatsFromOrders = useCallback((
    nextOrders: Order[],
    overrides: Partial<SimulationStats> = {}
  ) => {
    const activeVehicles = vehicles.filter((vehicle) => vehicle.status !== 'disponible' && vehicle.status !== 'averiado').length;

    setStats((current) => ({
      ...current,
      activeVehicles,
      ...overrides,
    }));
  }, [setStats, vehicles]);

  const pushFeedEvent = useCallback((event: SimulationFeedEvent) => {
    setFeedEvents((currentEvents) => {
      if (currentEvents.some((currentEvent) => currentEvent.id === event.id)) {
        return currentEvents;
      }

      return [event, ...currentEvents].slice(0, 30);
    });
  }, []);

  // Handlers
  const handleStartSimulation = () => {
    const initialSimulationTime = SIMULATION_START_TIME;
    const initialTimeline = getTimelineSnapshot(initialSimulationTime);
    setSimulationTime(initialSimulationTime);
    setOrders(initialOrders);
    setVehicles(initialVehicles);
    setIncidents(INITIAL_INCIDENTS);
    setFeedEvents([
      {
        id: 'orders-loaded',
        time: '10:00',
        type: 'order_registered',
        message: `${initialOrders.length} pedidos cargados en el escenario`,
        tone: 'neutral',
      },
    ]);
    setStats({
      simulatedDateTime: '10/05/2025 10:00 am',
      realElapsedTime: '00:00:00',
      totalOrders: 0,
      deliveredOrders: 0,
      pendingOrders: 0,
      atRiskOrders: 0,
      activeVehicles: initialVehicles.filter((vehicle) => vehicle.status !== 'disponible').length,
      currentDay: initialTimeline.currentDay,
      dayProgress: initialTimeline.dayProgress,
    });
    setStage('running');
  };

  const handleTriggerReplan = () => {
    setStage('replanning');
  };

  const handleFinishSimulation = () => {
    const finalSimulationTime = new Date(SIMULATION_START_TIME.getTime() + SIMULATION_DAYS * SIMULATION_DAY_MS);
    const finalTimeline = getTimelineSnapshot(finalSimulationTime);

    setSimulationTime(finalSimulationTime);
    syncStatsFromOrders(orders, {
      simulatedDateTime: `Día ${finalTimeline.currentDay} ${String(finalSimulationTime.getHours()).padStart(2, '0')}:${String(finalSimulationTime.getMinutes()).padStart(2, '0')}`,
      realElapsedTime: finalResults.realElapsedTime,
      totalOrders: finalResults.processedOrders,
      deliveredOrders: finalResults.deliveredOrders,
      pendingOrders: 0,
      atRiskOrders: finalResults.failedOrders,
      activeVehicles: 0,
      currentDay: finalTimeline.currentDay,
      dayProgress: finalTimeline.dayProgress,
    });
    pushFeedEvent({
      id: 'final-results-ready',
      time: '23:59',
      type: 'simulation_closed',
      message: `Día 5: simulación finalizada, ${finalResults.deliveredOrders.toLocaleString()} pedidos dentro del plazo`,
      tone: 'success',
    });
    setStage('results');
  };

  const handleResetToConfig = () => {
    setSimulationTime(SIMULATION_START_TIME);
    setOrders(initialOrders);
    setVehicles(initialVehicles);
    setIncidents(INITIAL_INCIDENTS);
    setFeedEvents([]);
    setStats({
      simulatedDateTime: '--',
      realElapsedTime: '--',
      totalOrders: 0,
      deliveredOrders: 0,
      pendingOrders: 0,
      atRiskOrders: 0,
      activeVehicles: initialVehicles.filter((vehicle) => vehicle.status !== 'disponible' && vehicle.status !== 'averiado').length,
      currentDay: 1,
      dayProgress: 0,
    });
    setStage('config');
  };

  const handleFileUpload = (fileName: string) => {
    setUploadedFile(fileName);
  };

  const handleOrderDelivered = useCallback((deliveredOrder: Order) => {
    setOrders((currentOrders) => {
      const currentTimeline = getTimelineSnapshot(simulationTime);
      const nextOrders = currentOrders.map((order) => (
        order.id === deliveredOrder.id
          ? {
              ...order,
              status: 'entregado' as const,
              remainingTime: '00:00:00',
              remainingMinutes: 0,
            }
          : order
      ));

      syncStatsFromOrders(nextOrders, {
        simulatedDateTime: `Día ${currentTimeline.currentDay} ${String(simulationTime.getHours()).padStart(2, '0')}:${String(simulationTime.getMinutes()).padStart(2, '0')}`,
        realElapsedTime: currentTimeline.realElapsedTime,
        currentDay: currentTimeline.currentDay,
        dayProgress: currentTimeline.dayProgress,
      });
      pushFeedEvent({
        id: `delivery-${deliveredOrder.id}`,
        time: `${String(simulationTime.getHours()).padStart(2, '0')}:${String(simulationTime.getMinutes()).padStart(2, '0')}`,
        type: 'delivery',
        message: `${deliveredOrder.id} entregado`,
        tone: 'success',
      });

      return nextOrders;
    });
  }, [pushFeedEvent, simulationTime, syncStatsFromOrders]);

  const handleVehicleStatusChange = useCallback((vehicleId: string, status: Vehicle['status']) => {
    setVehicles((currentVehicles) => (
      currentVehicles.some((vehicle) => vehicle.id === vehicleId && vehicle.status !== status)
        ? (() => {
            const nextVehicles = currentVehicles.map((vehicle) => (
              vehicle.id === vehicleId
                ? {
                    ...vehicle,
                    status,
                    speed: status === 'averiado' || status === 'disponible' ? 0 : vehicle.speed,
                  }
                : vehicle
            ));

            setStats((currentStats) => ({
              ...currentStats,
              activeVehicles: nextVehicles.filter((vehicle) => vehicle.status !== 'disponible' && vehicle.status !== 'averiado').length,
            }));

            return nextVehicles;
          })()
        : currentVehicles
    ));
  }, [setStats, setVehicles]);

  const handleOrderReassigned = useCallback((orderId: string, vehicle: Vehicle) => {
    setOrders((currentOrders) => (
      currentOrders.some((order) => order.id === orderId && order.assignedVehicleId !== vehicle.id)
        ? currentOrders.map((order) => (
            order.id === orderId
              ? {
                  ...order,
                  assignedVehicleId: vehicle.id,
                  assignedVehicleName: vehicle.id === 'v-auto-09' ? 'AUTO-04' : vehicle.name,
                  assignedVehicleType: vehicle.type,
                  status: 'en_ruta' as const,
                }
              : order
          ))
        : currentOrders
    ));
  }, [setOrders]);

  const handleSimulationTimeChange = useCallback((nextSimulationTime: Date) => {
    const nextTimeline = getTimelineSnapshot(nextSimulationTime);

    setSimulationTime(nextSimulationTime);
    setStats((current) => ({
      ...current,
      simulatedDateTime: `Día ${nextTimeline.currentDay} ${String(nextSimulationTime.getHours()).padStart(2, '0')}:${String(nextSimulationTime.getMinutes()).padStart(2, '0')}`,
      realElapsedTime: nextTimeline.realElapsedTime,
      currentDay: nextTimeline.currentDay,
      dayProgress: nextTimeline.dayProgress,
      atRiskOrders: orders.filter((order) => (
        order.status !== 'entregado' &&
        calculateTrafficLightFromDeadline(order.deadlineAt, nextSimulationTime, params.trafficLights) === 'rojo'
      )).length,
    }));
  }, [orders, params.trafficLights, setStats]);

  return (
    <div className="p-4 space-y-3 max-w-[1800px] mx-auto animate-in fade-in duration-200">
      {/* MAIN CONTAINER: MAP ON LEFT + COLLAPSIBLE RIGHT PANEL */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* LEFT: INTERACTIVE MAP AREA */}
        <div className={`${showRightPanel ? 'lg:col-span-8' : 'lg:col-span-12'} flex flex-col gap-3 transition-all duration-300`}>
          <div className="h-[calc(100vh-104px)] min-h-[680px] w-full relative">
            <MapInteractive
              stage={stage}
              showRoutes={stage !== 'config'}
              showVehicles={stage === 'running' || stage === 'replanning'}
              showIncidents={stage === 'running' || stage === 'replanning'}
              isReplanned={stage === 'replanning'}
              isPaused={isPaused}
              vehicles={vehicles}
              orders={orders}
              incidents={incidents}
              warehouses={INITIAL_WAREHOUSES}
              trafficConfig={params.trafficLights}
              deliveredOrderIds={deliveredOrderIds}
              simulationTime={simulationTime}
              onOrderDelivered={handleOrderDelivered}
              onVehicleStatusChange={handleVehicleStatusChange}
              onOrderReassigned={handleOrderReassigned}
              onSimulationTimeChange={handleSimulationTimeChange}
              onSimulationComplete={handleFinishSimulation}
              onFeedEvent={pushFeedEvent}
            />
          </div>
        </div>

        {/* RIGHT PANEL: DYNAMIC BY STAGE (4 cols) */}
        {showRightPanel && (
        <div className="lg:col-span-4 space-y-4 animate-in fade-in slide-in-from-right-3 duration-200">
          {/* ======================================================== */}
          {/* RESUMEN DE EJECUCIÓN / PANEL PRINCIPAL (COLLAPSIBLE)   */}
          {/* ======================================================== */}
          <>
              {/* 1. CONFIGURATION STAGE (Image 02) */}
              {stage === 'config' && (
                <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-sm space-y-5 animate-in fade-in">
                  {/* Header */}
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-slate-700" />
                      <h3 className="font-bold text-[15px] text-slate-800">
                        Configuración de simulación 5D
                      </h3>
                    </div>
                  </div>

                  {/* Fecha inicial */}
                  <div className="space-y-1.5">
                    <label className="text-[12px] font-semibold text-slate-700">
                      Fecha inicial
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        defaultValue="10/05/2025 10:00 am"
                        className="w-full px-3.5 py-2 text-[13px] bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-medium"
                        placeholder="Seleccionar fecha"
                      />
                      <Calendar className="w-4 h-4 text-slate-400 absolute right-3.5 top-3 pointer-events-none" />
                    </div>
                  </div>

                  {/* Importar pedidos CSV - Drag & Drop */}
                  <div className="space-y-1.5">
                    <label className="text-[12px] font-semibold text-slate-700">
                      Importar pedidos CSV
                    </label>
                    <div
                      onDragOver={(e) => {
                        e.preventDefault();
                        setIsDragging(true);
                      }}
                      onDragLeave={() => setIsDragging(false)}
                      onDrop={(e) => {
                        e.preventDefault();
                        setIsDragging(false);
                        const file = e.dataTransfer.files[0];
                        if (file) handleFileUpload(file.name);
                      }}
                      onClick={() => handleFileUpload('pedidos_semana_mayo2025.csv')}
                      className={`border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-all duration-150 ${
                        isDragging
                          ? 'border-blue-500 bg-blue-50/50'
                          : uploadedFile
                          ? 'border-emerald-400 bg-emerald-50/30'
                          : 'border-slate-200 hover:border-slate-300 bg-slate-50/40 hover:bg-slate-50'
                      }`}
                    >
                      <div className="w-10 h-10 mx-auto rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mb-2">
                        {uploadedFile ? (
                          <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
                        ) : (
                          <UploadCloud className="w-5 h-5 text-blue-600" />
                        )}
                      </div>
                      {uploadedFile ? (
                        <div>
                          <p className="text-[13px] font-bold text-emerald-700">{uploadedFile}</p>
                          <p className="text-[11px] text-slate-500 mt-0.5">120 pedidos cargados con éxito</p>
                        </div>
                      ) : (
                        <div>
                          <p className="text-[12px] font-semibold text-slate-800">
                            Arrastra y suelta tu archivo aquí
                          </p>
                          <p className="text-[11px] text-slate-500 mt-0.5">
                            o haz clic para seleccionar (CSV / Excel)
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Parámetros */}
                  <div className="space-y-2.5 pt-1 border-t border-slate-100">
                    <div className="flex items-center justify-between">
                      <h4 className="text-[12px] font-bold text-slate-800">Parámetros</h4>
                      <button
                        onClick={() => setShowConfigAdvanced(!showConfigAdvanced)}
                        className="text-[11px] font-semibold text-blue-600 hover:underline flex items-center gap-1"
                      >
                        <Sliders className="w-3 h-3" />
                        <span>{showConfigAdvanced ? 'Ocultar ajustes' : 'Ajustar flota y semáforo'}</span>
                      </button>
                    </div>

                    <div className="space-y-2 text-[12px] text-slate-600">
                      <div className="flex items-center gap-2.5">
                        <Calendar className="w-4 h-4 text-slate-500" />
                        <span>Período de simulación: <strong className="text-slate-800">5 días</strong></span>
                      </div>
                      <div className="flex items-center gap-2.5">
                        <Car className="w-4 h-4 text-slate-500" />
                        <span>Flota multimodal: <strong className="text-slate-800">auto, moto y bicicleta</strong></span>
                      </div>
                    </div>

                    {/* Configurable Fleet Numbers & Semáforo */}
                    {showConfigAdvanced && (
                      <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200/80 space-y-3.5 animate-in fade-in">
                        <div>
                          <p className="text-[11px] font-bold text-slate-700 mb-2">Flota disponible configurable</p>
                          <div className="grid grid-cols-3 gap-2 text-center">
                            {/* Autos */}
                            <div className="bg-white p-2 rounded-lg border border-slate-200">
                              <span className="text-[11px] text-slate-500 font-medium">Autos</span>
                              <div className="flex items-center justify-center gap-1.5 mt-1">
                                <button
                                  onClick={() => setParams((p) => ({ ...p, fleet: { ...p.fleet, autos: Math.max(1, p.fleet.autos - 1) } }))}
                                  className="w-5 h-5 bg-slate-100 rounded flex items-center justify-center hover:bg-slate-200 text-slate-700"
                                >
                                  <Minus className="w-3 h-3" />
                                </button>
                                <span className="text-[13px] font-bold text-slate-800">{params.fleet.autos}</span>
                                <button
                                  onClick={() => setParams((p) => ({ ...p, fleet: { ...p.fleet, autos: p.fleet.autos + 1 } }))}
                                  className="w-5 h-5 bg-slate-100 rounded flex items-center justify-center hover:bg-slate-200 text-slate-700"
                                >
                                  <Plus className="w-3 h-3" />
                                </button>
                              </div>
                            </div>

                            {/* Motos */}
                            <div className="bg-white p-2 rounded-lg border border-slate-200">
                              <span className="text-[11px] text-slate-500 font-medium">Motos</span>
                              <div className="flex items-center justify-center gap-1.5 mt-1">
                                <button
                                  onClick={() => setParams((p) => ({ ...p, fleet: { ...p.fleet, motos: Math.max(1, p.fleet.motos - 1) } }))}
                                  className="w-5 h-5 bg-slate-100 rounded flex items-center justify-center hover:bg-slate-200 text-slate-700"
                                >
                                  <Minus className="w-3 h-3" />
                                </button>
                                <span className="text-[13px] font-bold text-slate-800">{params.fleet.motos}</span>
                                <button
                                  onClick={() => setParams((p) => ({ ...p, fleet: { ...p.fleet, motos: p.fleet.motos + 1 } }))}
                                  className="w-5 h-5 bg-slate-100 rounded flex items-center justify-center hover:bg-slate-200 text-slate-700"
                                >
                                  <Plus className="w-3 h-3" />
                                </button>
                              </div>
                            </div>

                            {/* Bicicletas */}
                            <div className="bg-white p-2 rounded-lg border border-slate-200">
                              <span className="text-[11px] text-slate-500 font-medium">Bicis</span>
                              <div className="flex items-center justify-center gap-1.5 mt-1">
                                <button
                                  onClick={() => setParams((p) => ({ ...p, fleet: { ...p.fleet, bicicletas: Math.max(1, p.fleet.bicicletas - 1) } }))}
                                  className="w-5 h-5 bg-slate-100 rounded flex items-center justify-center hover:bg-slate-200 text-slate-700"
                                >
                                  <Minus className="w-3 h-3" />
                                </button>
                                <span className="text-[13px] font-bold text-slate-800">{params.fleet.bicicletas}</span>
                                <button
                                  onClick={() => setParams((p) => ({ ...p, fleet: { ...p.fleet, bicicletas: p.fleet.bicicletas + 1 } }))}
                                  className="w-5 h-5 bg-slate-100 rounded flex items-center justify-center hover:bg-slate-200 text-slate-700"
                                >
                                  <Plus className="w-3 h-3" />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Semáforo Config */}
                        <div>
                          <p className="text-[11px] font-bold text-slate-700 mb-1.5">Configuración del semáforo</p>
                          <div className="space-y-1.5 text-[11px]">
                            <div className="flex items-center justify-between">
                              <span className="flex items-center gap-1 text-emerald-700 font-medium">
                                <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Verde (Margen óptimo)
                              </span>
                              <span className="font-semibold text-slate-700">&gt; 45 min</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="flex items-center gap-1 text-amber-700 font-medium">
                                <span className="w-2 h-2 rounded-full bg-amber-500"></span> Ámbar (Próximo al plazo)
                              </span>
                              <span className="font-semibold text-slate-700">15 – 45 min</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="flex items-center gap-1 text-rose-700 font-medium">
                                <span className="w-2 h-2 rounded-full bg-rose-500"></span> Rojo (Crítico / En riesgo)
                              </span>
                              <span className="font-semibold text-slate-700">&lt; 15 min</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Botón Iniciar simulación */}
                  <button
                    onClick={handleStartSimulation}
                    className="w-full py-3 px-4 bg-[#082937] hover:bg-[#0c394c] text-white font-bold text-[14px] rounded-xl shadow transition-all duration-150 flex items-center justify-center gap-2 cursor-pointer hover:shadow-md"
                  >
                    <Play className="w-4 h-4 fill-white text-white" />
                    <span>Iniciar simulación</span>
                  </button>
                </div>
              )}

              {/* 2. RUNNING STAGE (Image 03) */}
              {stage === 'running' && (
                <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-sm space-y-5 animate-in fade-in">
                  {/* Header with Green Indicator */}
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-2.5">
                      <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse"></span>
                      <h3 className="font-bold text-[15px] text-slate-800">
                        Simulación 5D en ejecución
                      </h3>
                    </div>
                  </div>

                  {/* Resumen de parámetros */}
                  <div className="space-y-2.5">
                    <h4 className="text-[12px] font-bold text-slate-800">
                      Resumen de parámetros
                    </h4>
                    <div className="space-y-2 text-[12px] text-slate-600">
                      <div className="flex items-center gap-2.5">
                        <Calendar className="w-4 h-4 text-slate-500" />
                        <span>Período de simulación: <strong className="text-slate-800">5 días</strong></span>
                      </div>
                      <div className="flex items-center gap-2.5">
                        <Clock className="w-4 h-4 text-slate-500" />
                        <span>Modo de ejecución: <strong className="text-slate-800">Simulación acelerada 5D</strong></span>
                      </div>
                      <div className="flex items-center gap-2.5">
                        <Timer className="w-4 h-4 text-slate-500" />
                        <span>Duración objetivo: <strong className="text-slate-800">30–60 min (43:12)</strong></span>
                      </div>
                      <div className="flex items-center gap-2.5">
                        <Car className="w-4 h-4 text-slate-500" />
                        <span>Flota multimodal: <strong className="text-slate-800">auto, moto y bicicleta</strong></span>
                      </div>
                    </div>
                  </div>

                  {/* Incidencias actuales */}
                  <div className="space-y-3 pt-3 border-t border-slate-100">
                    <h4 className="text-[12px] font-bold text-slate-800">
                      Incidencias actuales
                    </h4>
                    <div className="space-y-2.5">
                      {/* Item 1 */}
                      <div
                        onClick={handleTriggerReplan}
                        className="flex items-start justify-between text-[12px] p-2 rounded-lg hover:bg-amber-50/60 cursor-pointer transition-colors border border-transparent hover:border-amber-200"
                      >
                        <div className="flex items-start gap-2.5">
                          <div className="p-1 rounded bg-amber-50 text-amber-600 mt-0.5">
                            <AlertTriangle className="w-4 h-4" />
                          </div>
                          <div>
                            <h5 className="font-bold text-slate-800 leading-tight">
                              Obstrucción en vía
                            </h5>
                            <p className="text-[11px] text-slate-500 mt-0.5">
                              Av. Libertad y Calle 23
                            </p>
                          </div>
                        </div>
                        <span className="text-[11px] text-slate-400 font-mono">10:21</span>
                      </div>

                      {/* Item 2 */}
                      <div
                        onClick={handleTriggerReplan}
                        className="flex items-start justify-between text-[12px] p-2 rounded-lg hover:bg-rose-50/60 cursor-pointer transition-colors border border-transparent hover:border-rose-200"
                      >
                        <div className="flex items-start gap-2.5">
                          <div className="p-1 rounded bg-rose-50 text-rose-600 mt-0.5">
                            <Wrench className="w-4 h-4" />
                          </div>
                          <div>
                            <h5 className="font-bold text-slate-800 leading-tight">
                              Avería de vehículo
                            </h5>
                            <p className="text-[11px] text-slate-500 mt-0.5">
                              Moto 07 • Almacén intermedio
                            </p>
                          </div>
                        </div>
                        <span className="text-[11px] text-slate-400 font-mono">10:18</span>
                      </div>
                    </div>

                    <div className="text-center pt-1">
                      <button
                        onClick={handleTriggerReplan}
                        className="text-[12px] font-semibold text-blue-600 hover:text-blue-800 hover:underline"
                      >
                        Ver todas las incidencias (2)
                      </button>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="pt-2 border-t border-slate-100 space-y-2">
                    <button
                      onClick={() => setIsPaused(!isPaused)}
                      className="w-full py-2.5 px-4 bg-[#082937] hover:bg-[#0c394c] text-white font-bold text-[13px] rounded-xl shadow transition-all duration-150 flex items-center justify-center gap-2"
                    >
                      {isPaused ? <Play className="w-4 h-4 fill-white" /> : <Pause className="w-4 h-4 fill-white" />}
                      <span>{isPaused ? 'Reanudar simulación' : 'Pausar simulación'}</span>
                    </button>
                  </div>
                </div>
              )}

              {/* 3. REPLANNING STAGE (Image 04) */}
              {stage === 'replanning' && (
                <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-sm space-y-5 animate-in fade-in">
                  {/* Header with Amber Warning */}
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-2.5">
                      <div className="p-1.5 rounded-full bg-amber-100 text-amber-700">
                        <ShieldAlert className="w-4 h-4" />
                      </div>
                      <h3 className="font-bold text-[15px] text-slate-800">
                        Replanificación Automática
                      </h3>
                    </div>
                  </div>

                  {/* Notification card matching Requirement #7 */}
                  <div className="bg-amber-50/80 border border-amber-200/80 rounded-xl p-4 text-[12px] text-amber-900 leading-relaxed">
                    <p className="font-semibold mb-1 flex items-center gap-1.5 text-amber-900">
                      <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                      Incidente detectado en ruta activa
                    </p>
                    <p className="text-amber-800">
                      Se ha detectado un incidente que afecta la ruta. El sistema ha replanificado automáticamente las rutas impactadas.
                    </p>
                  </div>

                  {/* Impact breakdown */}
                  <div className="space-y-2.5 text-[12px]">
                    <h4 className="font-bold text-slate-800">Detalles de replanificación</h4>
                    <div className="bg-slate-50 rounded-lg p-3 space-y-2 border border-slate-200/70">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-600">Rutas afectadas:</span>
                        <span className="font-bold text-rose-600">2 rutas</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-600">Pedidos reprogramados:</span>
                        <span className="font-bold text-blue-600">8 pedidos</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-600">Retraso estimado evitado:</span>
                        <span className="font-bold text-emerald-600 font-mono">~38 min</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-600">Vehículo de relevo:</span>
                        <span className="font-bold text-slate-800">Auto - A04</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-2 border-t border-slate-100 space-y-2">
                    <button
                      onClick={() => setStage('running')}
                      className="w-full py-2.5 px-4 bg-[#082937] hover:bg-[#0c394c] text-white font-bold text-[13px] rounded-xl shadow transition-all duration-150 flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Check className="w-4 h-4" />
                      <span>Continuar simulación (Replanificación aplicada)</span>
                    </button>
                    <button
                      onClick={handleFinishSimulation}
                      className="w-full py-2 px-4 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-semibold text-[12px] rounded-lg transition-colors flex items-center justify-center gap-2"
                    >
                      <span>Avanzar al final (Día 5)</span>
                    </button>
                  </div>
                </div>
              )}

              {/* 4. RESULTS STAGE */}
              {stage === 'results' && (
                <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-sm space-y-4 animate-in fade-in">
                  {/* Header */}
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <RotateCcw className="w-5 h-5 text-slate-700" />
                      <h3 className="font-bold text-[15px] text-slate-800">
                        Resultados de simulación 5D
                      </h3>
                    </div>
                  </div>

                  <div className="bg-white border border-emerald-200 rounded-xl p-4 shadow-sm space-y-2 text-[12px]">
                    <div className="flex items-center gap-2 pb-2 border-b border-emerald-100">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <h4 className="text-[13px] font-extrabold text-emerald-900">SIMULACION FINALIZADA</h4>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-slate-600">Pedidos procesados</span>
                        <strong className="font-mono text-slate-900">{finalResults.processedOrders.toLocaleString()}</strong>
                      </div>
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-slate-600">Entregados</span>
                        <strong className="font-mono text-emerald-700">{finalResults.deliveredOrders.toLocaleString()}</strong>
                      </div>
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-slate-600">Incumplidos</span>
                        <strong className="font-mono text-slate-900">{finalResults.failedOrders}</strong>
                      </div>
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-slate-600">Incidencias</span>
                        <strong className="font-mono text-slate-900">{finalResults.incidentsHandled}</strong>
                      </div>
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-slate-600">Replanificaciones</span>
                        <strong className="font-mono text-slate-900">{finalResults.replannings}</strong>
                      </div>
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-slate-600">Tiempo real</span>
                        <strong className="font-mono text-slate-900">{finalResults.realElapsedTime}</strong>
                      </div>
                    </div>
                    <div className="pt-2 border-t border-emerald-100 flex items-center gap-2 text-emerald-800 font-bold">
                      <Check className="w-4 h-4" />
                      <span>{finalResults.resultLabel}</span>
                    </div>
                  </div>

                  {/* Green Success Card */}
                  <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-xl p-4 flex items-start gap-3">
                    <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                      <Check className="w-4 h-4 stroke-[3]" />
                    </div>
                    <div>
                      <h4 className="font-bold text-[13px] text-emerald-900 leading-tight">
                        Simulación completada
                      </h4>
                      <p className="text-[11px] text-emerald-800 font-medium mt-0.5">
                        Periodo simulado: 5 días
                      </p>
                      <p className="text-[11px] text-emerald-700 mt-0.5">
                        La simulación se ha ejecutado correctamente.
                      </p>
                    </div>
                  </div>

                  {/* Note banner: Compliance confirmed */}
                  <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3 flex items-start gap-2.5 text-[12px] text-slate-700">
                    <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <p className="leading-relaxed">
                      Durante los cinco días simulados se logró mantener el cumplimiento de los plazos comprometidos.
                    </p>
                  </div>

                  {/* Resumen de resultados (List) */}
                  <div className="space-y-2 pt-1">
                    <h4 className="text-[12px] font-bold text-slate-800">
                      Resumen de resultados
                    </h4>
                    <div className="space-y-2 text-[12px] text-slate-600">
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-slate-400" />
                          <span>Pedidos procesados</span>
                        </span>
                        <strong className="text-slate-900 font-mono font-bold">{finalResults.processedOrders.toLocaleString()}</strong>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          <span>Entregados</span>
                        </span>
                        <strong className="text-emerald-600 font-bold">{finalResults.deliveredOrders.toLocaleString()}</strong>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-slate-400" />
                          <span>Incumplidos</span>
                        </span>
                        <strong className="text-slate-700 font-bold">{finalResults.failedOrders}</strong>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-2">
                          <AlertTriangle className="w-4 h-4 text-slate-400" />
                          <span>Resultado</span>
                        </span>
                        <strong className="text-emerald-700 font-bold">{finalResults.resultLabel}</strong>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-2">
                          <Car className="w-4 h-4 text-slate-400" />
                          <span>Vehículos utilizados (prom.)</span>
                        </span>
                        <strong className="text-slate-800 font-bold">{finalResults.vehiclesUsedAverage} / {finalResults.fleetCapacity}</strong>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-2">
                          <Wrench className="w-4 h-4 text-slate-400" />
                          <span>Incidencias</span>
                        </span>
                        <strong className="text-slate-800 font-bold">{finalResults.incidentsHandled}</strong>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-2">
                          <Route className="w-4 h-4 text-slate-400" />
                          <span>Distancia total recorrida</span>
                        </span>
                        <strong className="text-slate-800 font-mono font-bold">{finalResults.totalDistanceKm.toLocaleString()} km</strong>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-2">
                          <Coins className="w-4 h-4 text-slate-400" />
                          <span>Costo operativo total</span>
                        </span>
                        <strong className="text-slate-800 font-mono font-bold">S/ {finalResults.totalOperationalCost.toLocaleString('en-US', { minimumFractionDigits: 2 })}</strong>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-2">
                          <RefreshCw className="w-4 h-4 text-slate-400" />
                          <span>Número de replanificaciones</span>
                        </span>
                        <strong className="text-slate-800 font-bold">{finalResults.replannings}</strong>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-2">
                          <TrendingUp className="w-4 h-4 text-slate-400" />
                          <span>Pedidos que requirieron replanificación</span>
                        </span>
                        <strong className="text-slate-800 font-bold">{finalResults.replannedOrders} pedidos</strong>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-slate-400" />
                          <span>Tiempo simulado</span>
                        </span>
                        <strong className="text-slate-800 font-bold">5 días</strong>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-slate-400" />
                          <span>Duración real de ejecución</span>
                        </span>
                        <strong className="text-slate-900 font-mono font-bold">{finalResults.realElapsedTime}</strong>
                      </div>
                    </div>
                  </div>

                  {/* Botón Reiniciar simulación */}
                  <div className="pt-2 border-t border-slate-100">
                    <button
                      onClick={handleResetToConfig}
                      className="w-full py-2.5 px-4 bg-[#082937] hover:bg-[#0c394c] text-white font-bold text-[13px] rounded-xl shadow transition-all duration-150 flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <RotateCcw className="w-4 h-4" />
                      <span>Configurar nueva simulación</span>
                    </button>
                  </div>
                </div>
              )}
          </>

          {/* LEYENDA & INFO (Controlled collapsible) */}
          <SimulationLegend isCompleted={stage === 'results'} />

          {(stage === 'running' || stage === 'replanning' || stage === 'results') && (
            <>
              <SimulationDemoScript
                currentDay={timelineSnapshot.currentDay}
                isCompleted={stage === 'results'}
              />
              <SimulationActivityFeed events={feedEvents} />
            </>
          )}
        </div>
        )}
      </div>
    </div>
  );
};
