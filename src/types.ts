export type NavigationTab = 'inicio' | 'pedidos' | 'flota' | 'simulacion' | 'ayuda';

export type SimulationStage = 'config' | 'running' | 'replanning' | 'results';

export type VehicleType = 'auto' | 'moto' | 'bicicleta';

export type TrafficLightStatus = 'verde' | 'ambar' | 'rojo';

export interface Vehicle {
  id: string;
  name: string;
  type: VehicleType;
  plate: string;
  driver: string;
  status: 'disponible' | 'en_ruta' | 'averiado';
  capacity: number;
  assignedPackages: number;
  currentOrderId?: string;
  currentLat: number;
  currentLng: number;
  routeCoordinates: [number, number][];
  progress: number; // 0 to 1
  speed: number;
  batteryOrFuel?: number;
  originWarehouse?: string;
  assignedOrdersCount?: number;
  remainingStops?: number;
  remainingDistanceKm?: number;
  accumulatedCost?: number;
}

export interface Order {
  id: string; // e.g. "PED-45872"
  clientName: string;
  address: string;
  assignedVehicleId: string;
  assignedVehicleName: string;
  assignedVehicleType: VehicleType;
  packagesCount: number;
  deadlineHours: 36 | 18 | 12 | 8 | 4; // Modalidad/Plazo comprometido
  deadlineType: 'normal' | 'priorizado'; // 36h normal; 18, 12, 8, 4h priorizado
  registeredAt: string; // "DD/MM/YYYY HH:mm"
  deadlineAt: string; // "DD/MM/YYYY HH:mm" (Vencimiento)
  remainingTime: string; // e.g. "00:32:15"
  remainingMinutes: number;
  status: 'entregado' | 'en_ruta' | 'en_transito' | 'pendiente' | 'en_riesgo' | 'fallido';
  eta: string; // e.g. "10:56"
  origin: string; // "Almacén central" | "Almacén intermedio"
  destinationCoords: [number, number];
  trafficLight: TrafficLightStatus;
  urgency: 'alta' | 'media' | 'normal';
}

export interface Warehouse {
  id: string;
  name: string;
  type: 'central' | 'intermedio';
  coords: [number, number];
  availableInventory: number;
  capacity: number;
  level: 'Alto' | 'Medio' | 'Bajo';
  activeVehicles: number;
}

export interface Incident {
  id: string;
  type: 'obstruccion' | 'averia' | 'retraso';
  title: string;
  location: string;
  time: string;
  coords: [number, number];
  affectedVehicleId?: string;
  affectedRouteIndex?: number;
  resolved: boolean;
}

export interface FleetConfig {
  autos: number;
  motos: number;
  bicicletas: number;
}

export interface TrafficLightConfig {
  verdeMinutes: number; // > 45 min
  ambarMinutes: number; // 15-45 min
  rojoMinutes: number;  // < 15 min
}

export interface SimulationParams {
  startDate: string;
  startTime: string;
  periodDays: number;
  doubleWayStreets: boolean;
  multimodalFleet: boolean;
  fleet: FleetConfig;
  trafficLights: TrafficLightConfig;
}

export interface SimulationStats {
  simulatedDateTime: string;
  realElapsedTime: string;
  totalOrders: number;
  deliveredOrders: number;
  pendingOrders: number;
  atRiskOrders: number;
  activeVehicles: number;
  currentDay: number; // 1 to 5
  dayProgress: number; // 0 to 100
}
