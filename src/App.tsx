import React, { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { TopHeaderMetrics } from './components/TopHeaderMetrics';
import { DashboardView } from './components/DashboardView';
import { SimulationView } from './components/SimulationView';
import { OrdersView } from './components/OrdersView';
import { FleetView } from './components/FleetView';
import { HelpView } from './components/HelpView';
import { SimulationFeedEvent } from './components/SimulationActivityFeed';
import { DEFAULT_SIM_PARAMS, INITIAL_INCIDENTS, INITIAL_ORDERS, INITIAL_VEHICLES, INITIAL_WAREHOUSES } from './data/mockData';
import { NavigationTab, Order, SimulationParams, SimulationStage, SimulationStats, Vehicle } from './types';

const EXTRA_SIMULATION_ORDERS: Order[] = [
  {
    id: 'PED-042',
    clientName: 'Clinica Norte',
    address: 'Nodo operativo (38,29)',
    assignedVehicleId: 'v-auto-04',
    assignedVehicleName: 'AUTO-03',
    assignedVehicleType: 'auto',
    packagesCount: 12,
    deadlineHours: 4,
    deadlineType: 'priorizado',
    registeredAt: '11/05/2025 10:24',
    deadlineAt: '11/05/2025 14:52',
    remainingTime: '00:52:00',
    remainingMinutes: 52,
    status: 'en_ruta',
    eta: '14:45',
    origin: 'Almacen central',
    destinationCoords: [38, 29],
    trafficLight: 'ambar',
    urgency: 'alta',
  },
  {
    id: 'PED-078',
    clientName: 'Botica San Rafael',
    address: 'Nodo operativo (43,38)',
    assignedVehicleId: 'v-moto-12',
    assignedVehicleName: 'MOTO-02',
    assignedVehicleType: 'moto',
    packagesCount: 4,
    deadlineHours: 8,
    deadlineType: 'priorizado',
    registeredAt: '13/05/2025 09:10',
    deadlineAt: '13/05/2025 17:10',
    remainingTime: '05:30:00',
    remainingMinutes: 330,
    status: 'en_ruta',
    eta: '11:55',
    origin: 'Almacen intermedio E',
    destinationCoords: [43, 38],
    trafficLight: 'verde',
    urgency: 'media',
  },
];

const INITIAL_SIMULATION_ORDERS = [...INITIAL_ORDERS, ...EXTRA_SIMULATION_ORDERS];
const INITIAL_SIMULATION_VEHICLES = INITIAL_VEHICLES.map((vehicle) => {
  if (vehicle.id === 'v-auto-04') {
    return { ...vehicle, name: 'AUTO-03', plate: 'AUTO-003' };
  }

  if (vehicle.id === 'v-moto-12') {
    return { ...vehicle, name: 'MOTO-02', plate: 'MOTO-002' };
  }

  if (vehicle.id === 'v-auto-09') {
    return { ...vehicle, name: 'AUTO-04', plate: 'AUTO-004', status: 'disponible' as const, speed: 0 };
  }

  return vehicle;
});
const SIMULATION_START_TIME = new Date(2025, 4, 10, 10, 0, 0, 0);

export default function App() {
  const [currentTab, setCurrentTab] = useState<NavigationTab>('inicio');
  const [simulationStage, setSimulationStage] = useState<SimulationStage>('config');
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(true);
  const [isSimulationRightPanelOpen, setIsSimulationRightPanelOpen] = useState<boolean>(true);
  const [vehicles, setVehicles] = useState<Vehicle[]>(INITIAL_SIMULATION_VEHICLES);
  const [orders, setOrders] = useState<Order[]>(INITIAL_SIMULATION_ORDERS);
  const [incidents, setIncidents] = useState(INITIAL_INCIDENTS);
  const [simulationTime, setSimulationTime] = useState(SIMULATION_START_TIME);
  const [params, setParams] = useState<SimulationParams>(DEFAULT_SIM_PARAMS);
  const [feedEvents, setFeedEvents] = useState<SimulationFeedEvent[]>([]);

  // Global simulation stats
  const [simStats, setSimStats] = useState<SimulationStats>({
    simulatedDateTime: '--',
    realElapsedTime: '--',
    totalOrders: 0,
    deliveredOrders: 0,
    pendingOrders: 0,
    atRiskOrders: 0,
    activeVehicles: INITIAL_SIMULATION_VEHICLES.filter((vehicle) => vehicle.status !== 'disponible' && vehicle.status !== 'averiado').length,
    currentDay: 1,
    dayProgress: 0,
  });

  const handleSelectTab = (tab: NavigationTab) => {
    setCurrentTab(tab);
  };

  const handleToggleSidebar = () => {
    setIsSidebarOpen((prev) => !prev);
  };

  const handleNavigateToSimulation = () => {
    setCurrentTab('simulacion');
  };

  const handleNavigateToOrders = () => {
    setCurrentTab('pedidos');
  };

  const handleNavigateToFleet = () => {
    setCurrentTab('flota');
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#f0f4f8] font-sans antialiased text-[#1e293b]">
      {/* Left Sidebar (Dark petroleum teal) - Collapsible / Desplegable */}
      <Sidebar
        isOpen={isSidebarOpen}
        onToggle={handleToggleSidebar}
        currentTab={currentTab}
        onSelectTab={handleSelectTab}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden transition-all duration-300">
        <TopHeaderMetrics
          stats={simStats}
          isSidebarOpen={isSidebarOpen}
          onToggleSidebar={handleToggleSidebar}
          showTimeline={currentTab === 'simulacion'}
          isRightPanelOpen={isSimulationRightPanelOpen}
          onToggleRightPanel={
            currentTab === 'simulacion'
              ? () => setIsSimulationRightPanelOpen((prev) => !prev)
              : undefined
          }
        />

        {/* Scrollable View Area */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden">
          {currentTab === 'inicio' && (
            <DashboardView
              onNavigateToSimulation={handleNavigateToSimulation}
              onNavigateToOrders={handleNavigateToOrders}
              onNavigateToFleet={handleNavigateToFleet}
            />
          )}

          {currentTab === 'simulacion' && (
            <SimulationView
              stage={simulationStage}
              setStage={setSimulationStage}
              stats={simStats}
              setStats={setSimStats}
              vehicles={vehicles}
              setVehicles={setVehicles}
              orders={orders}
              setOrders={setOrders}
              incidents={incidents}
              setIncidents={setIncidents}
              initialOrders={INITIAL_SIMULATION_ORDERS}
              initialVehicles={INITIAL_SIMULATION_VEHICLES}
              simulationTime={simulationTime}
              setSimulationTime={setSimulationTime}
              params={params}
              setParams={setParams}
              feedEvents={feedEvents}
              setFeedEvents={setFeedEvents}
              showRightPanel={isSimulationRightPanelOpen}
            />
          )}

          {currentTab === 'pedidos' && (
            <OrdersView
              orders={orders}
              vehicles={vehicles}
              simulationTime={simulationTime}
              trafficConfig={params.trafficLights}
            />
          )}

          {currentTab === 'flota' && <FleetView vehicles={vehicles} warehouses={INITIAL_WAREHOUSES} />}

          {currentTab === 'ayuda' && <HelpView />}
        </main>
      </div>
    </div>
  );
}
