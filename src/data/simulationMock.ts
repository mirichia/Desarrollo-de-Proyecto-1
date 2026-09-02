import { TrafficLightStatus, VehicleType } from '../types';

export type SimulationOrderStatus = 'pending' | 'assigned' | 'in_route' | 'delivered' | 'failed';
export type SimulationVehicleStatus = 'available' | 'assigned' | 'in_route' | 'broken';
export type SimulationIncidentStatus = 'scheduled' | 'active' | 'resolved';
export type SimulationEventType =
  | 'simulation_started'
  | 'orders_loaded'
  | 'vehicle_dispatched'
  | 'incident_detected'
  | 'route_replanned'
  | 'warehouse_restocked'
  | 'demand_increased'
  | 'operation_stabilized'
  | 'order_delivered'
  | 'simulation_finished';

export type DeadlineHours = 4 | 8 | 12 | 18 | 36;
export type CoordinateKm = {
  x: number;
  y: number;
};

export interface SimulationConfiguration {
  id: string;
  name: string;
  map: {
    widthKm: 70;
    heightKm: 50;
  };
  startsAt: string;
  periodDays: number;
  doubleWayStreets: boolean;
  fleetSpecs: Record<VehicleType, {
    capacity: number;
    speedKmh: number;
    costPerKm: number;
  }>;
  trafficLightThresholdsMinutes: {
    greenAbove: 45;
    amberAbove: 15;
    redAtOrBelow: 15;
  };
}

export interface SimulationWarehouse {
  id: string;
  name: string;
  type: 'central' | 'intermediate';
  position: CoordinateKm;
  capacity: number | 'infinite';
  initialInventory: number | 'infinite';
  restockEveryHours?: number;
  restockAt?: string;
}

export interface SimulationVehicle {
  id: string;
  type: VehicleType;
  label: string;
  capacity: number;
  speedKmh: number;
  costPerKm: number;
  homeWarehouseId: string;
  currentPosition: CoordinateKm;
  status: SimulationVehicleStatus;
  routeId: string | null;
  orders: string[];
}

export interface SimulationOrder {
  id: string;
  customerId: string;
  customerName: string;
  quantity: number;
  originWarehouseId: string;
  destination: CoordinateKm;
  createdAt: string;
  deadlineHours: DeadlineHours;
  deadline: string;
  status: SimulationOrderStatus;
  risk: TrafficLightStatus;
  assignedVehicle: string | null;
}

export interface SimulationRoute {
  id: string;
  vehicleId: string;
  originWarehouseId: string;
  variant?: 'original' | 'replanned';
  nodes: CoordinateKm[];
  stops: Array<{
    orderId: string;
    position: CoordinateKm;
    serviceTimeMinutes: 60;
  }>;
  totalDistanceKm: number;
  estimatedDurationMinutes: number;
}

export interface SimulationIncident {
  id: string;
  type: 'road_block' | 'vehicle_breakdown' | 'delay';
  title: string;
  position: CoordinateKm;
  status: SimulationIncidentStatus;
  startsAt: string;
  affectedRouteIds: string[];
  affectedVehicleIds: string[];
  description: string;
}

export interface SimulationEvent {
  simulationTime: string;
  type: SimulationEventType;
  payload: Record<string, unknown>;
}

export interface SimulationFinalResults {
  processedOrders: number;
  deliveredOrders: number;
  failedOrders: number;
  incidentsHandled: number;
  replannings: number;
  realElapsedTime: string;
  resultLabel: string;
  vehiclesUsedAverage: number;
  fleetCapacity: number;
  totalDistanceKm: number;
  totalOperationalCost: number;
  replannedOrders: number;
}

export interface SimulationScenario {
  configuration: SimulationConfiguration;
  warehouses: SimulationWarehouse[];
  vehicles: SimulationVehicle[];
  orders: SimulationOrder[];
  routes: SimulationRoute[];
  incidents: SimulationIncident[];
  finalResults: SimulationFinalResults;
  events: SimulationEvent[];
}

export const SIMULATION_SCENARIO: SimulationScenario = {
  configuration: {
    id: 'paqrap-5d-course-scenario',
    name: 'PAQRAP - escenario mock 5D',
    map: {
      widthKm: 70,
      heightKm: 50,
    },
    startsAt: '2025-05-10T10:00:00-05:00',
    periodDays: 5,
    doubleWayStreets: true,
    fleetSpecs: {
      auto: {
        capacity: 24,
        speedKmh: 40,
        costPerKm: 8,
      },
      moto: {
        capacity: 8,
        speedKmh: 25,
        costPerKm: 6,
      },
      bicicleta: {
        capacity: 4,
        speedKmh: 12,
        costPerKm: 3,
      },
    },
    trafficLightThresholdsMinutes: {
      greenAbove: 45,
      amberAbove: 15,
      redAtOrBelow: 15,
    },
  },
  warehouses: [
    {
      id: 'wh-central',
      name: 'Almacén central',
      type: 'central',
      position: { x: 25, y: 15 },
      capacity: 'infinite',
      initialInventory: 'infinite',
    },
    {
      id: 'wh-intermedio-no',
      name: 'Almacén intermedio NO',
      type: 'intermediate',
      position: { x: 12, y: 38 },
      capacity: 1000,
      initialInventory: 620,
      restockEveryHours: 24,
      restockAt: '23:59:59',
    },
    {
      id: 'wh-intermedio-e',
      name: 'Almacén intermedio E',
      type: 'intermediate',
      position: { x: 55, y: 27 },
      capacity: 1000,
      initialInventory: 480,
      restockEveryHours: 24,
      restockAt: '23:59:59',
    },
  ],
  vehicles: [
    {
      id: 'veh-auto-01',
      type: 'auto',
      label: 'Auto A01',
      capacity: 24,
      speedKmh: 40,
      costPerKm: 8,
      homeWarehouseId: 'wh-central',
      currentPosition: { x: 25, y: 15 },
      status: 'assigned',
      routeId: 'route-auto-01',
      orders: ['ord-001', 'ord-002', 'ord-003'],
    },
    {
      id: 'veh-auto-02',
      type: 'auto',
      label: 'Auto A02',
      capacity: 24,
      speedKmh: 40,
      costPerKm: 8,
      homeWarehouseId: 'wh-central',
      currentPosition: { x: 25, y: 15 },
      status: 'available',
      routeId: null,
      orders: [],
    },
    {
      id: 'veh-auto-03',
      type: 'auto',
      label: 'AUTO-03',
      capacity: 24,
      speedKmh: 40,
      costPerKm: 8,
      homeWarehouseId: 'wh-central',
      currentPosition: { x: 25, y: 15 },
      status: 'assigned',
      routeId: 'route-auto-03-original',
      orders: ['PED-042'],
    },
    {
      id: 'veh-auto-04',
      type: 'auto',
      label: 'AUTO-04',
      capacity: 24,
      speedKmh: 40,
      costPerKm: 8,
      homeWarehouseId: 'wh-central',
      currentPosition: { x: 25, y: 15 },
      status: 'available',
      routeId: null,
      orders: [],
    },
    {
      id: 'veh-moto-01',
      type: 'moto',
      label: 'Moto M01',
      capacity: 8,
      speedKmh: 25,
      costPerKm: 6,
      homeWarehouseId: 'wh-intermedio-e',
      currentPosition: { x: 55, y: 27 },
      status: 'assigned',
      routeId: 'route-moto-01',
      orders: ['ord-004', 'ord-005'],
    },
    {
      id: 'veh-moto-02',
      type: 'moto',
      label: 'Moto M02',
      capacity: 8,
      speedKmh: 25,
      costPerKm: 6,
      homeWarehouseId: 'wh-intermedio-no',
      currentPosition: { x: 12, y: 38 },
      status: 'assigned',
      routeId: 'route-moto-02',
      orders: ['ord-006'],
    },
    {
      id: 'veh-bici-01',
      type: 'bicicleta',
      label: 'Bicicleta B01',
      capacity: 4,
      speedKmh: 12,
      costPerKm: 3,
      homeWarehouseId: 'wh-intermedio-no',
      currentPosition: { x: 12, y: 38 },
      status: 'assigned',
      routeId: 'route-bici-01',
      orders: ['ord-007'],
    },
    {
      id: 'veh-bici-02',
      type: 'bicicleta',
      label: 'Bicicleta B02',
      capacity: 4,
      speedKmh: 12,
      costPerKm: 3,
      homeWarehouseId: 'wh-intermedio-e',
      currentPosition: { x: 55, y: 27 },
      status: 'available',
      routeId: null,
      orders: [],
    },
  ],
  orders: [
    {
      id: 'ord-001',
      customerId: 'cus-001',
      customerName: 'Distribuidora San Martin',
      quantity: 6,
      originWarehouseId: 'wh-central',
      destination: { x: 31, y: 9 },
      createdAt: '2025-05-10T07:15:00-05:00',
      deadlineHours: 4,
      deadline: '2025-05-10T11:15:00-05:00',
      status: 'assigned',
      risk: 'verde',
      assignedVehicle: 'veh-auto-01',
    },
    {
      id: 'ord-002',
      customerId: 'cus-002',
      customerName: 'Inversiones Pacifico',
      quantity: 8,
      originWarehouseId: 'wh-central',
      destination: { x: 20, y: 31 },
      createdAt: '2025-05-09T18:00:00-05:00',
      deadlineHours: 18,
      deadline: '2025-05-10T12:00:00-05:00',
      status: 'assigned',
      risk: 'verde',
      assignedVehicle: 'veh-auto-01',
    },
    {
      id: 'ord-003',
      customerId: 'cus-003',
      customerName: 'Consultorio Medico Grau',
      quantity: 1,
      originWarehouseId: 'wh-central',
      destination: { x: 25, y: 25 },
      createdAt: '2025-05-10T06:36:00-05:00',
      deadlineHours: 4,
      deadline: '2025-05-10T10:36:00-05:00',
      status: 'assigned',
      risk: 'rojo',
      assignedVehicle: 'veh-auto-01',
    },
    {
      id: 'ord-004',
      customerId: 'cus-004',
      customerName: 'Libreria Universal',
      quantity: 4,
      originWarehouseId: 'wh-intermedio-e',
      destination: { x: 61, y: 36 },
      createdAt: '2025-05-10T08:00:00-05:00',
      deadlineHours: 4,
      deadline: '2025-05-10T12:00:00-05:00',
      status: 'assigned',
      risk: 'verde',
      assignedVehicle: 'veh-moto-01',
    },
    {
      id: 'ord-005',
      customerId: 'cus-005',
      customerName: 'Comercial Andina',
      quantity: 3,
      originWarehouseId: 'wh-intermedio-e',
      destination: { x: 64, y: 18 },
      createdAt: '2025-05-09T22:30:00-05:00',
      deadlineHours: 12,
      deadline: '2025-05-10T10:30:00-05:00',
      status: 'assigned',
      risk: 'rojo',
      assignedVehicle: 'veh-moto-01',
    },
    {
      id: 'ord-006',
      customerId: 'cus-006',
      customerName: 'Farmacias del Centro',
      quantity: 3,
      originWarehouseId: 'wh-intermedio-no',
      destination: { x: 18, y: 42 },
      createdAt: '2025-05-10T03:00:00-05:00',
      deadlineHours: 8,
      deadline: '2025-05-10T11:00:00-05:00',
      status: 'assigned',
      risk: 'ambar',
      assignedVehicle: 'veh-moto-02',
    },
    {
      id: 'ord-007',
      customerId: 'cus-007',
      customerName: 'Restaurante El Criollo',
      quantity: 2,
      originWarehouseId: 'wh-intermedio-no',
      destination: { x: 9, y: 33 },
      createdAt: '2025-05-09T15:00:00-05:00',
      deadlineHours: 36,
      deadline: '2025-05-11T03:00:00-05:00',
      status: 'assigned',
      risk: 'verde',
      assignedVehicle: 'veh-bici-01',
    },
    {
      id: 'PED-078',
      customerId: 'c7842',
      customerName: 'Pedido reasignado por avería',
      quantity: 5,
      originWarehouseId: 'wh-intermedio-e',
      destination: { x: 43, y: 38 },
      createdAt: '2025-05-13T09:10:00-05:00',
      deadlineHours: 8,
      deadline: '2025-05-13T17:10:00-05:00',
      status: 'assigned',
      risk: 'ambar',
      assignedVehicle: 'veh-moto-02',
    },
    {
      id: 'PED-042',
      customerId: 'c9167',
      customerName: 'Cliente prioritario c9167',
      quantity: 12,
      originWarehouseId: 'wh-central',
      destination: { x: 38, y: 29 },
      createdAt: '2025-05-11T10:24:00-05:00',
      deadlineHours: 4,
      deadline: '2025-05-11T15:16:00-05:00',
      status: 'assigned',
      risk: 'verde',
      assignedVehicle: 'veh-auto-03',
    },
  ],
  routes: [
    {
      id: 'route-auto-01',
      vehicleId: 'veh-auto-01',
      originWarehouseId: 'wh-central',
      nodes: [
        { x: 25, y: 15 },
        { x: 25, y: 25 },
        { x: 31, y: 25 },
        { x: 31, y: 9 },
        { x: 20, y: 31 },
      ],
      stops: [
        { orderId: 'ord-003', position: { x: 25, y: 25 }, serviceTimeMinutes: 60 },
        { orderId: 'ord-001', position: { x: 31, y: 9 }, serviceTimeMinutes: 60 },
        { orderId: 'ord-002', position: { x: 20, y: 31 }, serviceTimeMinutes: 60 },
      ],
      totalDistanceKm: 47,
      estimatedDurationMinutes: 251,
    },
    {
      id: 'route-moto-01',
      vehicleId: 'veh-moto-01',
      originWarehouseId: 'wh-intermedio-e',
      nodes: [
        { x: 55, y: 27 },
        { x: 61, y: 27 },
        { x: 61, y: 36 },
        { x: 64, y: 36 },
        { x: 64, y: 18 },
      ],
      stops: [
        { orderId: 'ord-004', position: { x: 61, y: 36 }, serviceTimeMinutes: 60 },
        { orderId: 'ord-005', position: { x: 64, y: 18 }, serviceTimeMinutes: 60 },
      ],
      totalDistanceKm: 36,
      estimatedDurationMinutes: 206,
    },
    {
      id: 'route-moto-02',
      vehicleId: 'veh-moto-02',
      originWarehouseId: 'wh-intermedio-no',
      nodes: [
        { x: 12, y: 38 },
        { x: 18, y: 38 },
        { x: 18, y: 42 },
      ],
      stops: [
        { orderId: 'ord-006', position: { x: 18, y: 42 }, serviceTimeMinutes: 60 },
      ],
      totalDistanceKm: 10,
      estimatedDurationMinutes: 84,
    },
    {
      id: 'route-bici-01',
      vehicleId: 'veh-bici-01',
      originWarehouseId: 'wh-intermedio-no',
      nodes: [
        { x: 12, y: 38 },
        { x: 9, y: 38 },
        { x: 9, y: 33 },
      ],
      stops: [
        { orderId: 'ord-007', position: { x: 9, y: 33 }, serviceTimeMinutes: 60 },
      ],
      totalDistanceKm: 8,
      estimatedDurationMinutes: 100,
    },
    {
      id: 'route-auto-03-original',
      vehicleId: 'veh-auto-03',
      originWarehouseId: 'wh-central',
      variant: 'original',
      nodes: [
        { x: 25, y: 15 },
        { x: 31, y: 15 },
        { x: 31, y: 21 },
        { x: 34, y: 21 },
        { x: 34, y: 29 },
        { x: 38, y: 29 },
      ],
      stops: [
        { orderId: 'PED-042', position: { x: 38, y: 29 }, serviceTimeMinutes: 60 },
      ],
      totalDistanceKm: 27,
      estimatedDurationMinutes: 101,
    },
    {
      id: 'route-auto-03-replanned',
      vehicleId: 'veh-auto-03',
      originWarehouseId: 'wh-central',
      variant: 'replanned',
      nodes: [
        { x: 31, y: 21 },
        { x: 31, y: 24 },
        { x: 36, y: 24 },
        { x: 36, y: 29 },
        { x: 38, y: 29 },
      ],
      stops: [
        { orderId: 'PED-042', position: { x: 38, y: 29 }, serviceTimeMinutes: 60 },
      ],
      totalDistanceKm: 15,
      estimatedDurationMinutes: 83,
    },
    {
      id: 'route-moto-02-before-breakdown',
      vehicleId: 'veh-moto-02',
      originWarehouseId: 'wh-intermedio-e',
      variant: 'original',
      nodes: [
        { x: 55, y: 27 },
        { x: 55, y: 34 },
        { x: 49, y: 34 },
      ],
      stops: [],
      totalDistanceKm: 13,
      estimatedDurationMinutes: 31,
    },
    {
      id: 'route-auto-04-reassigned',
      vehicleId: 'veh-auto-04',
      originWarehouseId: 'wh-central',
      variant: 'replanned',
      nodes: [
        { x: 25, y: 15 },
        { x: 25, y: 38 },
        { x: 43, y: 38 },
      ],
      stops: [
        { orderId: 'PED-078', position: { x: 43, y: 38 }, serviceTimeMinutes: 60 },
      ],
      totalDistanceKm: 41,
      estimatedDurationMinutes: 122,
    },
  ],
  incidents: [
    {
      id: 'inc-road-042',
      type: 'road_block',
      title: 'Bloqueo en tramo prioritario',
      position: { x: 31, y: 21 },
      status: 'scheduled',
      startsAt: '2025-05-11T14:24:00-05:00',
      affectedRouteIds: ['route-auto-03-original'],
      affectedVehicleIds: ['veh-auto-03'],
      description: 'Bloqueo mock del tramo (31,21) -> (34,21) que compromete PED-042 y fuerza una ruta alternativa predefinida.',
    },
    {
      id: 'inc-breakdown-078',
      type: 'vehicle_breakdown',
      title: 'Averia Tipo 1',
      position: { x: 49, y: 34 },
      status: 'scheduled',
      startsAt: '2025-05-13T11:40:00-05:00',
      affectedRouteIds: ['route-moto-02-before-breakdown'],
      affectedVehicleIds: ['veh-moto-02'],
      description: 'Avería de tipo 1. El vehículo queda no disponible por 2 horas y no bloquea la calle.',
    },
  ],
  finalResults: {
    processedOrders: 1248,
    deliveredOrders: 1248,
    failedOrders: 0,
    incidentsHandled: 2,
    replannings: 2,
    realElapsedTime: '00:43:12',
    resultLabel: 'Todos los pedidos dentro del plazo',
    vehiclesUsedAverage: 28,
    fleetCapacity: 60,
    totalDistanceKm: 4826,
    totalOperationalCost: 29480,
    replannedOrders: 2,
  },
  events: [
    {
      simulationTime: '2025-05-10T10:00:00-05:00',
      type: 'simulation_started',
      payload: {
        scenarioId: 'paqrap-5d-course-scenario',
        periodDays: 5,
      },
    },
    {
      simulationTime: '2025-05-10T10:00:05-05:00',
      type: 'orders_loaded',
      payload: {
        orderIds: ['ord-001', 'ord-002', 'ord-003', 'ord-004', 'ord-005', 'ord-006', 'ord-007', 'PED-042', 'PED-078'],
      },
    },
    {
      simulationTime: '2025-05-10T10:02:00-05:00',
      type: 'vehicle_dispatched',
      payload: {
        vehicleId: 'veh-auto-01',
        routeId: 'route-auto-01',
      },
    },
    {
      simulationTime: '2025-05-10T10:04:00-05:00',
      type: 'vehicle_dispatched',
      payload: {
        vehicleId: 'veh-moto-01',
        routeId: 'route-moto-01',
      },
    },
    {
      simulationTime: '2025-05-10T10:08:00-05:00',
      type: 'vehicle_dispatched',
      payload: {
        vehicleId: 'veh-bici-01',
        routeId: 'route-bici-01',
      },
    },
    {
      simulationTime: '2025-05-10T10:36:00-05:00',
      type: 'order_delivered',
      payload: {
        orderId: 'ord-003',
        vehicleId: 'veh-auto-01',
      },
    },
    {
      simulationTime: '2025-05-10T11:00:00-05:00',
      type: 'order_delivered',
      payload: {
        orderId: 'ord-006',
        vehicleId: 'veh-moto-02',
      },
    },
    {
      simulationTime: '2025-05-10T23:59:59-05:00',
      type: 'warehouse_restocked',
      payload: {
        warehouseIds: ['wh-intermedio-no', 'wh-intermedio-e'],
      },
    },
    {
      simulationTime: '2025-05-11T14:18:00-05:00',
      type: 'orders_loaded',
      payload: {
        orderIds: ['PED-042'],
        priority: true,
        reason: 'Pedido prioritario entra a monitoreo crítico',
      },
    },
    {
      simulationTime: '2025-05-11T14:24:00-05:00',
      type: 'incident_detected',
      payload: {
        incidentId: 'inc-road-042',
        blockedSegment: {
          from: { x: 31, y: 21 },
          to: { x: 34, y: 21 },
        },
        criticalOrderId: 'PED-042',
        remainingMinutes: 52,
      },
    },
    {
      simulationTime: '2025-05-11T14:24:30-05:00',
      type: 'route_replanned',
      payload: {
        affectedRouteIds: ['route-auto-03-original'],
        newRouteId: 'route-auto-03-replanned',
        vehicleId: 'veh-auto-03',
        criticalOrderId: 'PED-042',
        remainingMinutes: 52,
      },
    },
    {
      simulationTime: '2025-05-12T09:10:00-05:00',
      type: 'demand_increased',
      payload: {
        additionalPrioritizedOrders: 18,
        affectedWarehouses: ['wh-central', 'wh-intermedio-e'],
        description: 'Incremento mock de demanda sin incidencia operativa.',
      },
    },
    {
      simulationTime: '2025-05-12T16:45:00-05:00',
      type: 'operation_stabilized',
      payload: {
        deliveredBatch: 23,
        pendingCriticalOrders: 0,
      },
    },
    {
      simulationTime: '2025-05-13T11:40:00-05:00',
      type: 'incident_detected',
      payload: {
        incidentId: 'inc-breakdown-078',
        vehicleId: 'veh-moto-02',
        vehicleLabel: 'MOTO-02',
        unavailableHours: 2,
        criticalOrderId: 'PED-078',
        doesNotBlockRoad: true,
      },
    },
    {
      simulationTime: '2025-05-13T11:42:00-05:00',
      type: 'route_replanned',
      payload: {
        previousVehicleId: 'veh-moto-02',
        newVehicleId: 'veh-auto-04',
        previousVehicleLabel: 'MOTO-02',
        newVehicleLabel: 'AUTO-04',
        orderId: 'PED-078',
        newRouteId: 'route-auto-04-reassigned',
      },
    },
    {
      simulationTime: '2025-05-15T23:59:00-05:00',
      type: 'simulation_finished',
      payload: {
        expectedDeliveredOrders: 7,
        expectedFailedOrders: 0,
        incidentsHighlighted: ['inc-road-042', 'inc-breakdown-078'],
      },
    },
  ],
};
