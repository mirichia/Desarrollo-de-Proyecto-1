import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  AlertTriangle,
  BarChart3,
  Bike,
  Building2,
  Car,
  CheckCircle2,
  Crosshair,
  Flag,
  Package,
  Wrench,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';
import { Incident, Order, SimulationStage, TrafficLightConfig, Vehicle, Warehouse } from '../types';
import { INITIAL_INCIDENTS, INITIAL_ORDERS, INITIAL_VEHICLES, INITIAL_WAREHOUSES } from '../data/mockData';
import { DEMO_SCRIPT_MOMENTS } from '../data/demoScript';
import { SIMULATION_SCENARIO } from '../data/simulationMock';
import { calculateTrafficLightFromDeadline, getRemainingMinutes, getTrafficLightMeta } from '../utils/trafficLight';
import { OrderDetailCard } from './OrderDetailCard';
import { SimulationFeedEvent } from './SimulationActivityFeed';
import { VehicleDetailCard } from './VehicleDetailCard';

interface MapInteractiveProps {
  stage?: SimulationStage;
  showRoutes?: boolean;
  showVehicles?: boolean;
  showIncidents?: boolean;
  isReplanned?: boolean;
  isPaused?: boolean;
  vehicles?: Vehicle[];
  orders?: Order[];
  incidents?: Incident[];
  warehouses?: Warehouse[];
  trafficConfig?: TrafficLightConfig;
  isMiniMap?: boolean;
  deliveredOrderIds?: string[];
  simulationTime?: Date;
  onSelectVehicle?: (vehicle: Vehicle) => void;
  onSelectOrder?: (order: Order) => void;
  onOrderDelivered?: (order: Order, vehicle: Vehicle) => void;
  onVehicleStatusChange?: (vehicleId: string, status: Vehicle['status']) => void;
  onOrderReassigned?: (orderId: string, vehicle: Vehicle) => void;
  onSimulationTimeChange?: (simulationTime: Date) => void;
  onSimulationComplete?: () => void;
  onFeedEvent?: (event: SimulationFeedEvent) => void;
}

type SvgPoint = {
  x: number;
  y: number;
};

type GridPoint = {
  x: number;
  y: number;
};

type VisualVehicleStatus = 'EN_ALMACEN' | 'EN_RUTA' | 'ENTREGANDO' | 'REPLANIFICANDO' | 'AVERIADO';

type AnimatedVehicleState = {
  currentNodeIndex: number;
  segmentProgress: number;
  currentPosition: GridPoint;
  status: VisualVehicleStatus;
};

type ReplanPhase = 'normal' | 'problem' | 'replanning' | 'solution';
type BreakdownPhase = 'before' | 'breakdown' | 'reassigning' | 'reassigned';

const MAP_WIDTH_KM = 70;
const MAP_HEIGHT_KM = 50;
const GRID_CELL_SIZE = 12;
const MAP_PADDING = 50;
const SVG_WIDTH = MAP_WIDTH_KM * GRID_CELL_SIZE + MAP_PADDING * 2;
const SVG_HEIGHT = 700;
const MAP_ORIGIN_X = MAP_PADDING;
const MAP_ORIGIN_Y = SVG_HEIGHT - MAP_PADDING;
const GRID_MIN_X = -500;
const GRID_MAX_X = 500;
const GRID_MIN_Y = -500;
const GRID_MAX_Y = 500;

export function gridToSvg(x: number, y: number): SvgPoint {
  return {
    x: MAP_ORIGIN_X + x * GRID_CELL_SIZE,
    y: MAP_ORIGIN_Y - y * GRID_CELL_SIZE,
  };
}

const COURSE_WAREHOUSE_POINTS: Record<string, GridPoint> = {
  'wh-central': { x: 25, y: 15 },
  'wh-int-1': { x: 12, y: 38 },
  'wh-int-2': { x: 55, y: 27 },
  'wh-intermedio-no': { x: 12, y: 38 },
  'wh-intermedio-e': { x: 55, y: 27 },
};

const COURSE_ORDER_POINTS: Record<string, GridPoint> = {
  'PED-45872': { x: 31, y: 9 },
  'PED-45873': { x: 18, y: 42 },
  'PED-45881': { x: 64, y: 18 },
  'PED-45885': { x: 61, y: 36 },
  'PED-45890': { x: 20, y: 31 },
  'PED-45878': { x: 9, y: 33 },
  'PED-45880': { x: 25, y: 25 },
  'PED-042': { x: 38, y: 29 },
  'PED-078': { x: 43, y: 38 },
};

const COURSE_VEHICLE_POINTS: Record<string, GridPoint> = {
  'v-auto-18': { x: 25, y: 21 },
  'v-auto-04': { x: 23, y: 23 },
  'v-auto-09': { x: 25, y: 15 },
  'v-moto-07': { x: 60, y: 22 },
  'v-moto-12': { x: 58, y: 31 },
  'v-moto-15': { x: 12, y: 38 },
  'v-bici-09': { x: 16, y: 40 },
  'v-bici-15': { x: 10, y: 35 },
  'v-bici-21': { x: 25, y: 23 },
};

const COURSE_INCIDENT_POINTS: Record<string, GridPoint> = {
  'inc-1': { x: 31, y: 25 },
  'inc-2': { x: 60, y: 22 },
  'inc-3': { x: 18, y: 42 },
};

const COURSE_ROUTE_POINTS: Record<string, GridPoint[]> = {
  'v-auto-18': [
    { x: 25, y: 15 },
    { x: 25, y: 25 },
    { x: 31, y: 25 },
    { x: 31, y: 9 },
  ],
  'v-auto-04': [
    { x: 25, y: 15 },
    { x: 25, y: 31 },
    { x: 20, y: 31 },
  ],
  'v-moto-07': [
    { x: 55, y: 27 },
    { x: 60, y: 27 },
    { x: 60, y: 22 },
    { x: 64, y: 22 },
    { x: 64, y: 18 },
  ],
  'v-moto-12': [
    { x: 55, y: 27 },
    { x: 58, y: 27 },
    { x: 58, y: 36 },
    { x: 61, y: 36 },
  ],
  'v-bici-09': [
    { x: 12, y: 38 },
    { x: 16, y: 38 },
    { x: 16, y: 42 },
    { x: 18, y: 42 },
  ],
  'v-bici-15': [
    { x: 12, y: 38 },
    { x: 10, y: 38 },
    { x: 10, y: 33 },
    { x: 9, y: 33 },
  ],
  'v-bici-21': [
    { x: 25, y: 15 },
    { x: 25, y: 25 },
  ],
};

const REPLAN_EVENT_TIME_LABEL = 'Día 2 14:24';
const REPLAN_CRITICAL_ORDER_ID = 'PED-042';
const REPLAN_CRITICAL_REMAINING_MINUTES = 52;
const REPLAN_BLOCKED_SEGMENT = {
  from: { x: 31, y: 21 },
  to: { x: 34, y: 21 },
};
const REPLAN_AUTO_03 = INITIAL_VEHICLES.find((vehicle) => vehicle.id === 'v-auto-04') || INITIAL_VEHICLES[1];
const BREAKDOWN_MOTO_02 = INITIAL_VEHICLES.find((vehicle) => vehicle.id === 'v-moto-12') || INITIAL_VEHICLES[4];
const REASSIGN_AUTO_04 = INITIAL_VEHICLES.find((vehicle) => vehicle.id === 'v-auto-09') || INITIAL_VEHICLES[2];
const AUTO_03_ORIGINAL_ROUTE =
  SIMULATION_SCENARIO.routes.find((route) => route.id === 'route-auto-03-original')?.nodes || [
    { x: 25, y: 15 },
    { x: 31, y: 15 },
    { x: 31, y: 21 },
    { x: 34, y: 21 },
    { x: 34, y: 29 },
    { x: 38, y: 29 },
  ];
const AUTO_03_REPLANNED_ROUTE =
  SIMULATION_SCENARIO.routes.find((route) => route.id === 'route-auto-03-replanned')?.nodes || [
    { x: 31, y: 21 },
    { x: 31, y: 24 },
    { x: 36, y: 24 },
    { x: 36, y: 29 },
    { x: 38, y: 29 },
  ];
const PED_078_POINT: GridPoint = { x: 43, y: 38 };
const MOTO_02_BREAKDOWN_POINT: GridPoint = { x: 49, y: 34 };
const MOTO_02_ORIGINAL_ROUTE =
  SIMULATION_SCENARIO.routes.find((route) => route.id === 'route-moto-02-before-breakdown')?.nodes || [
    { x: 55, y: 27 },
    { x: 55, y: 34 },
    { x: 49, y: 34 },
  ];
const AUTO_04_REASSIGNED_ROUTE =
  SIMULATION_SCENARIO.routes.find((route) => route.id === 'route-auto-04-reassigned')?.nodes || [
    { x: 25, y: 15 },
    { x: 25, y: 38 },
    { x: 43, y: 38 },
  ];

const REPLANNED_ROUTE_POINTS: GridPoint[] = [
  { x: 55, y: 27 },
  { x: 55, y: 33 },
  { x: 64, y: 33 },
  { x: 64, y: 18 },
];

const DELIVERY_PAUSE_SECONDS = 1.2;
const VISUAL_SIMULATED_MINUTES_PER_SECOND = 200;
const VISUAL_SIMULATION_DURATION_SECONDS = (5 * 24 * 60) / VISUAL_SIMULATED_MINUTES_PER_SECOND;
const MAP_SIMULATION_START = new Date(2025, 4, 10, 10, 0, 0, 0);
const SECONDS_PER_KM_BY_TYPE: Record<Vehicle['type'], number> = {
  auto: 0.28,
  moto: 0.34,
  bicicleta: 0.46,
};

const getWarehousePoint = (warehouse: Warehouse): GridPoint => {
  return COURSE_WAREHOUSE_POINTS[warehouse.id] || { x: warehouse.coords[0], y: warehouse.coords[1] };
};

const getOrderPoint = (order: Order): GridPoint => {
  return COURSE_ORDER_POINTS[order.id] || { x: order.destinationCoords[0], y: order.destinationCoords[1] };
};

const getVehiclePoint = (vehicle: Vehicle): GridPoint => {
  return COURSE_VEHICLE_POINTS[vehicle.id] || { x: vehicle.currentLat, y: vehicle.currentLng };
};

const getIncidentPoint = (incident: Incident): GridPoint => {
  return COURSE_INCIDENT_POINTS[incident.id] || { x: incident.coords[0], y: incident.coords[1] };
};

const routeColorForVehicle = (vehicle: Vehicle) => {
  if (vehicle.type === 'auto') return '#0284c7';
  if (vehicle.type === 'moto') return '#f97316';
  return '#16a34a';
};

const routeDashForVehicle = (vehicle: Vehicle) => {
  return vehicle.status === 'averiado' ? '8 6' : undefined;
};

const getVehicleDisplayName = (vehicle: Vehicle) => {
  if (vehicle.id === REPLAN_AUTO_03.id) return 'AUTO-03';
  if (vehicle.id === BREAKDOWN_MOTO_02.id) return 'MOTO-02';
  if (vehicle.id === REASSIGN_AUTO_04.id) return 'AUTO-04';
  return vehicle.name;
};

const getVisualStatusMeta = (status: VisualVehicleStatus) => {
  switch (status) {
    case 'EN_ALMACEN':
      return {
        label: 'EN ALMACEN',
        className: 'fill-slate-700',
        background: '#f8fafc',
        border: '#cbd5e1',
      };
    case 'EN_RUTA':
      return {
        label: 'EN RUTA',
        className: 'fill-emerald-700',
        background: '#ecfdf5',
        border: '#10b981',
      };
    case 'ENTREGANDO':
      return {
        label: 'ENTREGANDO',
        className: 'fill-blue-700',
        background: '#eff6ff',
        border: '#3b82f6',
      };
    case 'REPLANIFICANDO':
      return {
        label: 'REPLANIFICANDO',
        className: 'fill-cyan-700',
        background: '#ecfeff',
        border: '#06b6d4',
      };
    case 'AVERIADO':
      return {
        label: 'AVERIADO',
        className: 'fill-rose-700',
        background: '#fff1f2',
        border: '#e11d48',
      };
  }
};

const distanceBetween = (a: GridPoint, b: GridPoint) => {
  return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
};

const euclideanDistance = (a: GridPoint, b: GridPoint) => {
  return Math.hypot(a.x - b.x, a.y - b.y);
};

const normalizeOrthogonalRoute = (points: GridPoint[]) => {
  if (points.length === 0) return points;

  const normalized: GridPoint[] = [points[0]];

  points.slice(1).forEach((point) => {
    const previous = normalized[normalized.length - 1];

    if (previous.x !== point.x && previous.y !== point.y) {
      normalized.push({ x: point.x, y: previous.y });
    }

    normalized.push(point);
  });

  return normalized;
};

const getRouteForVehicle = (vehicle: Vehicle, isReplanned: boolean) => {
  if (vehicle.id === 'v-auto-04') {
    return isReplanned ? AUTO_03_REPLANNED_ROUTE : AUTO_03_ORIGINAL_ROUTE;
  }

  if (vehicle.id === BREAKDOWN_MOTO_02.id) {
    return MOTO_02_ORIGINAL_ROUTE;
  }

  if (vehicle.id === REASSIGN_AUTO_04.id) {
    return AUTO_04_REASSIGNED_ROUTE;
  }

  if (isReplanned && vehicle.id === 'v-moto-07') {
    return REPLANNED_ROUTE_POINTS;
  }

  return COURSE_ROUTE_POINTS[vehicle.id] || [getVehiclePoint(vehicle)];
};

const interpolate = (from: GridPoint, to: GridPoint, progress: number): GridPoint => {
  return {
    x: from.x + (to.x - from.x) * progress,
    y: from.y + (to.y - from.y) * progress,
  };
};

const getPointAlongRoute = (route: GridPoint[], routeProgress: number): {
  currentNodeIndex: number;
  segmentProgress: number;
  currentPosition: GridPoint;
} => {
  if (route.length < 2) {
    return {
      currentNodeIndex: 0,
      segmentProgress: 0,
      currentPosition: route[0],
    };
  }

  const totalDistance = route.slice(0, -1).reduce((total, point, index) => {
    return total + distanceBetween(point, route[index + 1]);
  }, 0);
  let targetDistance = totalDistance * Math.min(Math.max(routeProgress, 0), 1);

  for (let index = 0; index < route.length - 1; index += 1) {
    const segmentDistance = distanceBetween(route[index], route[index + 1]);

    if (targetDistance <= segmentDistance) {
      const segmentProgress = segmentDistance === 0 ? 1 : targetDistance / segmentDistance;
      return {
        currentNodeIndex: index,
        segmentProgress,
        currentPosition: interpolate(route[index], route[index + 1], segmentProgress),
      };
    }

    targetDistance -= segmentDistance;
  }

  return {
    currentNodeIndex: route.length - 1,
    segmentProgress: 1,
    currentPosition: route[route.length - 1],
  };
};

const getReplanPhase = (elapsedSeconds: number): ReplanPhase => {
  if (elapsedSeconds < 7) return 'normal';
  if (elapsedSeconds < 8.3) return 'problem';
  if (elapsedSeconds < 11.2) return 'replanning';
  return 'solution';
};

const getBreakdownPhase = (elapsedSeconds: number): BreakdownPhase => {
  if (elapsedSeconds < 20) return 'before';
  if (elapsedSeconds < 22.5) return 'breakdown';
  if (elapsedSeconds < 25.5) return 'reassigning';
  return 'reassigned';
};

const getAuto03State = (elapsedSeconds: number): AnimatedVehicleState => {
  const phase = getReplanPhase(elapsedSeconds);
  const approachRoute = normalizeOrthogonalRoute(AUTO_03_ORIGINAL_ROUTE.slice(0, 3));
  const solutionRoute = normalizeOrthogonalRoute(AUTO_03_REPLANNED_ROUTE);

  if (phase === 'normal') {
    const position = getPointAlongRoute(approachRoute, elapsedSeconds / 7);
    return {
      ...position,
      status: elapsedSeconds < 0.4 ? 'EN_ALMACEN' : 'EN_RUTA',
    };
  }

  if (phase === 'problem' || phase === 'replanning') {
    return {
      currentNodeIndex: 2,
      segmentProgress: 1,
      currentPosition: REPLAN_BLOCKED_SEGMENT.from,
      status: 'REPLANIFICANDO',
    };
  }

  const solutionElapsed = elapsedSeconds - 11.2;
  const solutionDuration = 7;
  const position = getPointAlongRoute(solutionRoute, solutionElapsed / solutionDuration);

  return {
    ...position,
    status: solutionElapsed >= solutionDuration ? 'ENTREGANDO' : 'EN_RUTA',
  };
};

const getMoto02State = (elapsedSeconds: number): AnimatedVehicleState => {
  const phase = getBreakdownPhase(elapsedSeconds);
  const route = normalizeOrthogonalRoute(MOTO_02_ORIGINAL_ROUTE);

  if (phase === 'before') {
    const position = getPointAlongRoute(route, elapsedSeconds / 20);
    return {
      ...position,
      status: elapsedSeconds < 0.4 ? 'EN_ALMACEN' : 'EN_RUTA',
    };
  }

  return {
    currentNodeIndex: route.length - 1,
    segmentProgress: 1,
    currentPosition: MOTO_02_BREAKDOWN_POINT,
    status: 'AVERIADO',
  };
};

const getAuto04State = (elapsedSeconds: number): AnimatedVehicleState => {
  const phase = getBreakdownPhase(elapsedSeconds);
  const route = normalizeOrthogonalRoute(AUTO_04_REASSIGNED_ROUTE);

  if (phase === 'before' || phase === 'breakdown') {
    return {
      currentNodeIndex: 0,
      segmentProgress: 0,
      currentPosition: route[0],
      status: 'EN_ALMACEN',
    };
  }

  if (phase === 'reassigning') {
    return {
      currentNodeIndex: 0,
      segmentProgress: 0,
      currentPosition: route[0],
      status: 'REPLANIFICANDO',
    };
  }

  const elapsedOnRoute = elapsedSeconds - 25.5;
  const routeDuration = 9;
  const position = getPointAlongRoute(route, elapsedOnRoute / routeDuration);

  return {
    ...position,
    status: elapsedOnRoute >= routeDuration ? 'ENTREGANDO' : 'EN_RUTA',
  };
};

const getAnimatedVehicleState = (
  vehicle: Vehicle,
  route: GridPoint[],
  elapsedSeconds: number,
  isReplanned: boolean,
  startDelaySeconds: number
): AnimatedVehicleState => {
  if (vehicle.status === 'averiado') {
    return {
      currentNodeIndex: 0,
      segmentProgress: 0,
      currentPosition: getVehiclePoint(vehicle),
      status: 'AVERIADO',
    };
  }

  if (route.length < 2) {
    return {
      currentNodeIndex: 0,
      segmentProgress: 0,
      currentPosition: route[0] || getVehiclePoint(vehicle),
      status: 'EN_ALMACEN',
    };
  }

  const segmentDurations = route.slice(0, -1).map((point, index) => {
    const distanceKm = distanceBetween(point, route[index + 1]);
    return Math.max(0.45, distanceKm * SECONDS_PER_KM_BY_TYPE[vehicle.type]);
  });
  const routeDuration = segmentDurations.reduce((total, duration) => total + duration, 0);
  const cycleDuration = routeDuration + DELIVERY_PAUSE_SECONDS;
  const adjustedElapsed = Math.max(0, elapsedSeconds - startDelaySeconds);
  const cycleElapsed = adjustedElapsed % cycleDuration;

  if (adjustedElapsed < 0.4) {
    return {
      currentNodeIndex: 0,
      segmentProgress: 0,
      currentPosition: route[0],
      status: 'EN_ALMACEN',
    };
  }

  if (cycleElapsed >= routeDuration) {
    return {
      currentNodeIndex: route.length - 1,
      segmentProgress: 1,
      currentPosition: route[route.length - 1],
      status: 'ENTREGANDO',
    };
  }

  let elapsedOnRoute = cycleElapsed;

  for (let index = 0; index < segmentDurations.length; index += 1) {
    const segmentDuration = segmentDurations[index];

    if (elapsedOnRoute <= segmentDuration) {
      const segmentProgress = elapsedOnRoute / segmentDuration;
      return {
        currentNodeIndex: index,
        segmentProgress,
        currentPosition: interpolate(route[index], route[index + 1], segmentProgress),
        status: isReplanned && vehicle.id === 'v-moto-07' ? 'REPLANIFICANDO' : 'EN_RUTA',
      };
    }

    elapsedOnRoute -= segmentDuration;
  }

  return {
    currentNodeIndex: route.length - 1,
    segmentProgress: 1,
    currentPosition: route[route.length - 1],
    status: 'ENTREGANDO',
  };
};

const buildOrthogonalPath = (points: GridPoint[]) => {
  if (points.length === 0) return '';

  const [first, ...rest] = points;
  const start = gridToSvg(first.x, first.y);
  const segments = [`M ${start.x} ${start.y}`];
  let cursor = first;

  rest.forEach((point) => {
    if (cursor.x !== point.x && cursor.y !== point.y) {
      const corner = gridToSvg(point.x, cursor.y);
      segments.push(`L ${corner.x} ${corner.y}`);
    }

    const next = gridToSvg(point.x, point.y);
    segments.push(`L ${next.x} ${next.y}`);
    cursor = point;
  });

  return segments.join(' ');
};

const formatFeedTime = (date: Date) => {
  return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
};

export const MapInteractive: React.FC<MapInteractiveProps> = ({
  stage = 'running',
  showRoutes = true,
  showVehicles = true,
  showIncidents = true,
  isReplanned = false,
  isPaused = false,
  vehicles = [],
  orders = [],
  incidents = [],
  warehouses = [],
  trafficConfig,
  isMiniMap = false,
  deliveredOrderIds = [],
  simulationTime,
  onSelectVehicle,
  onSelectOrder,
  onOrderDelivered,
  onVehicleStatusChange,
  onOrderReassigned,
  onSimulationTimeChange,
  onSimulationComplete,
  onFeedEvent,
}) => {
  const [zoomLevel, setZoomLevel] = useState(1);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [hoveredOrder, setHoveredOrder] = useState<Order | null>(null);
  const [hoveredVehicle, setHoveredVehicle] = useState<Vehicle | null>(null);
  const [popupPos, setPopupPos] = useState<SvgPoint | null>(null);
  const [localDeliveredOrderIds, setLocalDeliveredOrderIds] = useState<string[]>([]);
  const [visualSimulationTime, setVisualSimulationTime] = useState<Date>(MAP_SIMULATION_START);
  const [replanPhase, setReplanPhase] = useState<ReplanPhase>('normal');
  const [breakdownPhase, setBreakdownPhase] = useState<BreakdownPhase>('before');
  const [demoElapsedSeconds, setDemoElapsedSeconds] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const deliveredEventKeysRef = useRef<Set<string>>(new Set());
  const feedEventKeysRef = useRef<Set<string>>(new Set());
  const animationStartedAtRef = useRef<number | null>(null);
  const pausedElapsedSecondsRef = useRef(0);
  const deliveredIdsRef = useRef<Set<string>>(new Set());
  const displayOrdersRef = useRef<Order[]>([]);

  const displayOrders = orders.length > 0 ? orders : INITIAL_ORDERS;
  const displayVehicles = vehicles.length > 0 ? vehicles : INITIAL_VEHICLES;
  const displayIncidents = incidents.length > 0 ? incidents : INITIAL_INCIDENTS;
  const displayWarehouses = warehouses.length > 0 ? warehouses : INITIAL_WAREHOUSES;
  const activeRoutesVisible = showRoutes && stage !== 'config' && stage !== 'results';
  const visualDeliveredOrderIds = deliveredOrderIds.length > 0 ? deliveredOrderIds : localDeliveredOrderIds;
  const currentMapSimulationTime = simulationTime || visualSimulationTime;
  const visualDeliveredOrderIdsSet = useMemo(() => new Set(visualDeliveredOrderIds), [visualDeliveredOrderIds]);
  const displayOrderIdsSet = useMemo(() => new Set(displayOrders.map((order) => order.id)), [displayOrders]);
  const isDemandIncreaseVisible = demoElapsedSeconds >= 16 && demoElapsedSeconds < 20;
  const isOperationClosingVisible = demoElapsedSeconds >= 36;

  const emitFeedEvent = useCallback((event: SimulationFeedEvent) => {
    if (feedEventKeysRef.current.has(event.id)) return;

    feedEventKeysRef.current.add(event.id);
    onFeedEvent?.(event);
  }, [onFeedEvent]);

  useEffect(() => {
    deliveredIdsRef.current = new Set(visualDeliveredOrderIds);
  }, [visualDeliveredOrderIds]);

  useEffect(() => {
    displayOrdersRef.current = displayOrders;
  }, [displayOrders]);
  const animatedRoutes = useMemo(() => {
    return Object.fromEntries(
      displayVehicles.map((vehicle) => [
        vehicle.id,
        normalizeOrthogonalRoute(getRouteForVehicle(vehicle, isReplanned)),
      ])
    );
  }, [displayVehicles, isReplanned]);
  const [animatedVehicleStates, setAnimatedVehicleStates] = useState<Record<string, AnimatedVehicleState>>({});

  useEffect(() => {
    if (stage === 'config') {
      deliveredEventKeysRef.current = new Set();
      feedEventKeysRef.current = new Set();
      animationStartedAtRef.current = null;
      pausedElapsedSecondsRef.current = 0;
      setLocalDeliveredOrderIds([]);
      setVisualSimulationTime(MAP_SIMULATION_START);
      setReplanPhase('normal');
      setBreakdownPhase('before');
      setDemoElapsedSeconds(0);
    }
  }, [stage]);

  useEffect(() => {
    if (!showVehicles || !activeRoutesVisible) {
      setAnimatedVehicleStates({});
      return;
    }

    if (isPaused) {
      pausedElapsedSecondsRef.current = demoElapsedSeconds;
      animationStartedAtRef.current = null;
      return;
    }

    let frameId = 0;
    const animate = (timestamp: number) => {
      if (animationStartedAtRef.current === null) {
        animationStartedAtRef.current = timestamp - pausedElapsedSecondsRef.current * 1000;
      }

      const elapsedSeconds = Math.min(
        (timestamp - animationStartedAtRef.current) / 1000,
        VISUAL_SIMULATION_DURATION_SECONDS
      );
      const nextReplanPhase = getReplanPhase(elapsedSeconds);
      const nextBreakdownPhase = getBreakdownPhase(elapsedSeconds);
      const nextSimulationTime = new Date(
        MAP_SIMULATION_START.getTime() + elapsedSeconds * VISUAL_SIMULATED_MINUTES_PER_SECOND * 60000
      );
      setDemoElapsedSeconds(elapsedSeconds);
      setVisualSimulationTime(nextSimulationTime);
      setReplanPhase(nextReplanPhase);
      setBreakdownPhase(nextBreakdownPhase);
      onSimulationTimeChange?.(nextSimulationTime);

      DEMO_SCRIPT_MOMENTS.forEach((moment) => {
        if (elapsedSeconds < moment.elapsedSeconds) return;

        emitFeedEvent({
          id: moment.id,
          time: moment.time,
          type: moment.type,
          message: moment.message,
          tone: moment.tone,
        });
      });

      if (elapsedSeconds >= 0.4) {
        emitFeedEvent({
          id: 'route-start-auto-03',
          time: '14:21',
          type: 'route_started',
          message: 'AUTO-03 inicia ruta hacia PED-042',
          tone: 'info',
        });
      }

      if (nextReplanPhase === 'problem') {
        emitFeedEvent({
          id: 'block-detected-31-21',
          time: '14:24',
          type: 'block',
          message: 'Bloqueo detectado en tramo (31,21) a (34,21)',
          tone: 'danger',
        });
        emitFeedEvent({
          id: 'replanning-start-auto-03',
          time: '14:24',
          type: 'replanning',
          message: 'Replanificación iniciada para AUTO-03',
          tone: 'warning',
        });
        emitFeedEvent({
          id: 'risk-ped-042',
          time: '14:29',
          type: 'risk',
          message: 'PED-042 entra en riesgo por bloqueo de ruta',
          tone: 'warning',
        });
      }

      if (nextReplanPhase === 'solution') {
        emitFeedEvent({
          id: 'route-start-auto-03-replanned',
          time: '14:34',
          type: 'route_started',
          message: 'AUTO-03 inicia ruta alternativa',
          tone: 'info',
        });
      }

      if (elapsedSeconds >= 1.2) {
        emitFeedEvent({
          id: 'route-start-moto-02',
          time: '11:32',
          type: 'route_started',
          message: 'MOTO-02 inicia entrega de PED-078',
          tone: 'info',
        });
      }

      if (nextBreakdownPhase === 'breakdown') {
        onVehicleStatusChange?.(BREAKDOWN_MOTO_02.id, 'averiado');
        emitFeedEvent({
          id: 'breakdown-moto-02',
          time: '11:40',
          type: 'breakdown',
          message: 'Averia Tipo 1 detectada en MOTO-02',
          tone: 'danger',
        });
      }

      if (nextBreakdownPhase === 'reassigning') {
        onOrderReassigned?.('PED-078', REASSIGN_AUTO_04);
        onVehicleStatusChange?.(REASSIGN_AUTO_04.id, 'en_ruta');
        emitFeedEvent({
          id: 'reassignment-ped-078',
          time: '11:42',
          type: 'reassignment',
          message: 'PED-078 reasignado de MOTO-02 a AUTO-04',
          tone: 'warning',
        });
      }

      if (nextBreakdownPhase === 'reassigned') {
        emitFeedEvent({
          id: 'route-start-auto-04',
          time: '11:43',
          type: 'route_started',
          message: 'AUTO-04 inicia nueva ruta hacia PED-078',
          tone: 'info',
        });
      }

      const nextStates = Object.fromEntries(
        displayVehicles.map((vehicle, index) => {
          const route = animatedRoutes[vehicle.id] || [getVehiclePoint(vehicle)];
          return [
            vehicle.id,
            vehicle.id === 'v-auto-04'
              ? getAuto03State(elapsedSeconds)
              : vehicle.id === BREAKDOWN_MOTO_02.id
              ? getMoto02State(elapsedSeconds)
              : vehicle.id === REASSIGN_AUTO_04.id
              ? getAuto04State(elapsedSeconds)
              : getAnimatedVehicleState(
                  vehicle,
                  route,
                  elapsedSeconds,
                  isReplanned,
                  index * 0.35
                ),
          ];
        })
      );

      setAnimatedVehicleStates(nextStates);

      displayVehicles.forEach((vehicle) => {
        const vehicleState = nextStates[vehicle.id];
        if (!vehicleState || vehicleState.status === 'AVERIADO') return;

        const assignedOrders = displayOrdersRef.current.filter((order) => order.assignedVehicleId === vehicle.id);

        assignedOrders.forEach((order) => {
          if (deliveredIdsRef.current.has(order.id) || deliveredEventKeysRef.current.has(order.id)) {
            return;
          }

          const orderPoint = getOrderPoint(order);
          const hasReachedDestination = euclideanDistance(vehicleState.currentPosition, orderPoint) <= 0.22;

          if (!hasReachedDestination) return;

          deliveredEventKeysRef.current.add(order.id);
          setLocalDeliveredOrderIds((currentIds) => (
            currentIds.includes(order.id) ? currentIds : [...currentIds, order.id]
          ));
          emitFeedEvent({
            id: `delivery-${order.id}`,
            time: formatFeedTime(nextSimulationTime),
            type: 'delivery',
            message: `${order.id} entregado por ${getVehicleDisplayName(vehicle)}`,
            tone: 'success',
          });
          onOrderDelivered?.(order, vehicle);
        });
      });

      if (elapsedSeconds >= VISUAL_SIMULATION_DURATION_SECONDS) {
        onSimulationComplete?.();
        return;
      }

      frameId = window.requestAnimationFrame(animate);
    };

    frameId = window.requestAnimationFrame(animate);

    return () => window.cancelAnimationFrame(frameId);
  }, [
    activeRoutesVisible,
    animatedRoutes,
    displayVehicles,
    demoElapsedSeconds,
    emitFeedEvent,
    isPaused,
    isReplanned,
    onOrderReassigned,
    onOrderDelivered,
    onSimulationComplete,
    onSimulationTimeChange,
    onVehicleStatusChange,
    showVehicles,
  ]);

  const getVisibleVehiclePoint = (vehicle: Vehicle) => {
    return animatedVehicleStates[vehicle.id]?.currentPosition || getVehiclePoint(vehicle);
  };
  const selectedOrderForDetail = selectedOrder
    ? displayOrders.find((order) => order.id === selectedOrder.id) || selectedOrder
    : null;
  const gridXValues = useMemo(
    () => Array.from({ length: GRID_MAX_X - GRID_MIN_X + 1 }, (_, index) => GRID_MIN_X + index),
    []
  );
  const gridYValues = useMemo(
    () => Array.from({ length: GRID_MAX_Y - GRID_MIN_Y + 1 }, (_, index) => GRID_MIN_Y + index),
    []
  );
  const axisXValues = useMemo(
    () => Array.from({ length: Math.floor((GRID_MAX_X - GRID_MIN_X) / 5) + 1 }, (_, index) => GRID_MIN_X + index * 5),
    []
  );
  const axisYValues = useMemo(
    () => Array.from({ length: Math.floor((GRID_MAX_Y - GRID_MIN_Y) / 5) + 1 }, (_, index) => GRID_MIN_Y + index * 5),
    []
  );

  const handleZoomIn = () => setZoomLevel((prev) => Math.min(prev + 0.25, 2.2));
  const handleZoomOut = () => setZoomLevel((prev) => Math.max(prev - 0.25, 0.7));
  const handleResetZoom = () => {
    setZoomLevel(1);
    setPanOffset({ x: 0, y: 0 });
  };

  const handleMouseDown = (event: React.MouseEvent) => {
    if (isMiniMap) return;
    setIsDragging(true);
    setDragStart({ x: event.clientX - panOffset.x, y: event.clientY - panOffset.y });
  };

  const handleMouseMove = (event: React.MouseEvent) => {
    if (!isDragging || isMiniMap) return;
    setPanOffset({
      x: event.clientX - dragStart.x,
      y: event.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => setIsDragging(false);

  const handleVehicleClick = (vehicle: Vehicle, event: React.MouseEvent) => {
    event.stopPropagation();
    const point = getVisibleVehiclePoint(vehicle);
    const svgPoint = gridToSvg(point.x, point.y);
    setSelectedVehicle(vehicle);
    setSelectedOrder(null);
    setPopupPos({ x: svgPoint.x + 14, y: svgPoint.y - 12 });
    onSelectVehicle?.(vehicle);
  };

  const handleOrderClick = (order: Order, event: React.MouseEvent) => {
    event.stopPropagation();
    const point = getOrderPoint(order);
    const svgPoint = gridToSvg(point.x, point.y);
    setSelectedOrder(order);
    setSelectedVehicle(null);
    setPopupPos({ x: svgPoint.x + 14, y: svgPoint.y - 12 });
    onSelectOrder?.(order);
  };

  return (
    <div
      className={`relative w-full h-full overflow-hidden bg-white select-none ${
        isMiniMap ? 'rounded-lg cursor-pointer' : 'rounded-2xl border border-slate-200/80 shadow-sm cursor-grab active:cursor-grabbing'
      }`}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onClick={() => {
        setSelectedOrder(null);
        setSelectedVehicle(null);
        setPopupPos(null);
      }}
    >
      <svg
        viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`}
        className="w-full h-full"
      >
        <defs>
          <filter id="mapShadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="2" stdDeviation="2" floodOpacity="0.16" />
          </filter>
        </defs>

        <rect width={SVG_WIDTH} height={SVG_HEIGHT} fill="#ffffff" />
        <g transform={`translate(${panOffset.x}, ${panOffset.y}) scale(${zoomLevel})`}>

        <g stroke="#a8adb4" strokeWidth="0.75" shapeRendering="crispEdges">
          {gridXValues.map((x) => {
            const from = gridToSvg(x, GRID_MIN_Y);
            const to = gridToSvg(x, GRID_MAX_Y);
            return <line key={`grid-x-${x}`} x1={from.x} y1={from.y} x2={to.x} y2={to.y} />;
          })}
          {gridYValues.map((y) => {
            const from = gridToSvg(GRID_MIN_X, y);
            const to = gridToSvg(GRID_MAX_X, y);
            return <line key={`grid-y-${y}`} x1={from.x} y1={from.y} x2={to.x} y2={to.y} />;
          })}
        </g>

        <g stroke="#6b7280" strokeWidth="1.15" shapeRendering="crispEdges">
          {axisXValues.map((x) => {
            const from = gridToSvg(x, GRID_MIN_Y);
            const to = gridToSvg(x, GRID_MAX_Y);
            return <line key={`avenue-x-${x}`} x1={from.x} y1={from.y} x2={to.x} y2={to.y} />;
          })}
          {axisYValues.map((y) => {
            const from = gridToSvg(GRID_MIN_X, y);
            const to = gridToSvg(GRID_MAX_X, y);
            return <line key={`avenue-y-${y}`} x1={from.x} y1={from.y} x2={to.x} y2={to.y} />;
          })}
        </g>

        <g stroke="#111827" strokeWidth="2.2" shapeRendering="crispEdges">
          <line
            x1={gridToSvg(0, GRID_MIN_Y).x}
            y1={gridToSvg(0, GRID_MIN_Y).y}
            x2={gridToSvg(0, GRID_MAX_Y).x}
            y2={gridToSvg(0, GRID_MAX_Y).y}
          />
          <line
            x1={gridToSvg(GRID_MIN_X, 0).x}
            y1={gridToSvg(GRID_MIN_X, 0).y}
            x2={gridToSvg(GRID_MAX_X, 0).x}
            y2={gridToSvg(GRID_MAX_X, 0).y}
          />
        </g>

        <g fill="#475569" fontSize="10" fontWeight="700">
          {axisXValues.filter((x) => x % 10 === 0).map((x) => {
            const point = gridToSvg(x, 0);
            return (
              <text key={`axis-x-${x}`} x={point.x} y={MAP_ORIGIN_Y + 18} textAnchor="middle">
                {x}
              </text>
            );
          })}
          {axisYValues.filter((y) => y % 10 === 0).map((y) => {
            const point = gridToSvg(0, y);
            return (
              <text key={`axis-y-${y}`} x={MAP_ORIGIN_X - 22} y={point.y + 4} textAnchor="middle">
                {y}
              </text>
            );
          })}
          <text x={MAP_ORIGIN_X - 18} y={MAP_ORIGIN_Y + 18} textAnchor="end" fill="#111827" fontSize="11" fontWeight="900">
            0,0
          </text>
        </g>

        {activeRoutesVisible && (
          <g>
            {displayVehicles
              .filter((vehicle) => (animatedRoutes[vehicle.id]?.length || 0) > 1)
              .map((vehicle) => (
                <path
                  key={vehicle.id}
                  d={buildOrthogonalPath(vehicle.id === 'v-auto-04' ? AUTO_03_ORIGINAL_ROUTE : animatedRoutes[vehicle.id])}
                  fill="none"
                  stroke={routeColorForVehicle(vehicle)}
                  strokeWidth={isMiniMap ? 3 : 5}
                  strokeLinecap="square"
                  strokeLinejoin="miter"
                  strokeDasharray={
                    vehicle.id === 'v-auto-04' && replanPhase !== 'normal'
                      ? '8 7'
                      : vehicle.id === BREAKDOWN_MOTO_02.id && breakdownPhase !== 'before'
                      ? '8 7'
                      : routeDashForVehicle(vehicle)
                  }
                  opacity={
                    vehicle.id === 'v-auto-04' && replanPhase !== 'normal'
                      ? 0.45
                      : vehicle.id === BREAKDOWN_MOTO_02.id && breakdownPhase !== 'before'
                      ? 0.45
                      : vehicle.id === REASSIGN_AUTO_04.id && breakdownPhase === 'before'
                      ? 0
                      : vehicle.status === 'disponible'
                      ? 0.35
                      : 0.9
                  }
                />
              ))}

            {(isReplanned || replanPhase === 'solution') && (
              <path
                d={buildOrthogonalPath(replanPhase === 'solution' ? AUTO_03_REPLANNED_ROUTE : REPLANNED_ROUTE_POINTS)}
                fill="none"
                stroke="#06b6d4"
                strokeWidth={isMiniMap ? 3 : 6}
                strokeLinecap="square"
                strokeLinejoin="miter"
              />
            )}

            {(breakdownPhase === 'reassigning' || breakdownPhase === 'reassigned') && (
              <path
                d={buildOrthogonalPath(AUTO_04_REASSIGNED_ROUTE)}
                fill="none"
                stroke="#0284c7"
                strokeWidth={isMiniMap ? 3 : 6}
                strokeLinecap="square"
                strokeLinejoin="miter"
              />
            )}
          </g>
        )}

        <g>
          {displayWarehouses.map((warehouse) => {
            const point = getWarehousePoint(warehouse);
            const svgPoint = gridToSvg(point.x, point.y);
            const isCentral = warehouse.type === 'central';

            return (
              <g key={warehouse.id} transform={`translate(${svgPoint.x}, ${svgPoint.y})`} filter="url(#mapShadow)">
                <rect
                  x="-14"
                  y="-14"
                  width="28"
                  height="28"
                  rx="6"
                  fill={isCentral ? '#082937' : '#15803d'}
                  stroke="#ffffff"
                  strokeWidth="2"
                />
                <Building2 x="-8" y="-8" width="16" height="16" color="#ffffff" />
                {!isMiniMap && (
                  <text x="0" y="28" textAnchor="middle" fill={isCentral ? '#082937' : '#15803d'} fontSize="11" fontWeight="800">
                    {warehouse.name}
                  </text>
                )}
              </g>
            );
          })}
        </g>

        {activeRoutesVisible && (
          <g>
            {!displayOrderIdsSet.has(REPLAN_CRITICAL_ORDER_ID) && (() => {
              const point = gridToSvg(38, 29);
              const isDelivered = animatedVehicleStates['v-auto-04']?.status === 'ENTREGANDO';

              return (
                <g transform={`translate(${point.x}, ${point.y})`}>
                  <circle r="10" fill={isDelivered ? '#16a34a' : '#f59e0b'} fillOpacity="0.25" />
                  <circle r="6.5" fill={isDelivered ? '#16a34a' : '#f59e0b'} stroke="#ffffff" strokeWidth="2" />
                  {!isMiniMap && (
                    <g transform="translate(0, 22)">
                      <rect
                        x="-38"
                        y="-9"
                        width="76"
                        height="18"
                        rx="4"
                        fill={isDelivered ? '#ecfdf5' : '#fff7ed'}
                        stroke={isDelivered ? '#16a34a' : '#f59e0b'}
                        strokeWidth="1"
                      />
                      {isDelivered ? (
                        <CheckCircle2 x="-33" y="-6" width="12" height="12" color="#15803d" />
                      ) : (
                        <Package x="-33" y="-6" width="12" height="12" color="#92400e" />
                      )}
                      <text
                        x="7"
                        y="4"
                        textAnchor="middle"
                        fontSize="9"
                        fontWeight="800"
                        fill={isDelivered ? '#15803d' : '#92400e'}
                      >
                        {REPLAN_CRITICAL_ORDER_ID}
                      </text>
                    </g>
                  )}
                </g>
              );
            })()}

            {!displayOrderIdsSet.has('PED-078') && (() => {
              const point = gridToSvg(PED_078_POINT.x, PED_078_POINT.y);
              const isReassigned = breakdownPhase === 'reassigning' || breakdownPhase === 'reassigned';
              const isDelivered = animatedVehicleStates[REASSIGN_AUTO_04.id]?.status === 'ENTREGANDO';
              const assignedLabel = isReassigned ? 'AUTO-04' : 'MOTO-02';

              return (
                <g transform={`translate(${point.x}, ${point.y})`}>
                  <circle r="10" fill={isDelivered ? '#16a34a' : isReassigned ? '#0284c7' : '#f59e0b'} fillOpacity="0.25" />
                  <circle r="6.5" fill={isDelivered ? '#16a34a' : isReassigned ? '#0284c7' : '#f59e0b'} stroke="#ffffff" strokeWidth="2" />
                  {!isMiniMap && (
                    <g transform="translate(0, 24)">
                      <rect
                        x="-43"
                        y="-9"
                        width="86"
                        height="30"
                        rx="4"
                        fill={isDelivered ? '#ecfdf5' : isReassigned ? '#eff6ff' : '#fff7ed'}
                        stroke={isDelivered ? '#16a34a' : isReassigned ? '#0284c7' : '#f59e0b'}
                        strokeWidth="1"
                      />
                      {isDelivered ? (
                        <CheckCircle2 x="-35" y="-6" width="12" height="12" color="#15803d" />
                      ) : (
                        <Package x="-35" y="-6" width="12" height="12" color={isReassigned ? '#075985' : '#92400e'} />
                      )}
                      <text
                        x="6"
                        y="4"
                        textAnchor="middle"
                        fontSize="9"
                        fontWeight="900"
                        fill={isDelivered ? '#15803d' : isReassigned ? '#075985' : '#92400e'}
                      >
                        PED-078
                      </text>
                      <text
                        x="0"
                        y="16"
                        textAnchor="middle"
                        fontSize="8"
                        fontWeight="800"
                        fill={isReassigned ? '#075985' : '#92400e'}
                      >
                        {assignedLabel}
                      </text>
                    </g>
                  )}
                </g>
              );
            })()}

            {displayOrders.map((order) => {
              const point = getOrderPoint(order);
              const svgPoint = gridToSvg(point.x, point.y);
              const status = order.status === 'entregado'
                ? 'verde'
                : calculateTrafficLightFromDeadline(order.deadlineAt, currentMapSimulationTime, trafficConfig);
              const meta = getTrafficLightMeta(status);
              const isDelivered = visualDeliveredOrderIdsSet.has(order.id) || order.status === 'entregado';
              const isSelected = selectedOrder?.id === order.id;
              const isHovered = hoveredOrder?.id === order.id;
              const markerColor = isDelivered ? '#16a34a' : meta.hexColor;

              return (
                <g
                  key={order.id}
                  transform={`translate(${svgPoint.x}, ${svgPoint.y})`}
                  className="cursor-pointer"
                  onMouseEnter={() => setHoveredOrder(order)}
                  onMouseLeave={() => setHoveredOrder(null)}
                  onClick={(event) => handleOrderClick(order, event)}
                >
                  <circle r={isSelected || isHovered ? 12 : 9} fill={markerColor} fillOpacity="0.22" />
                  <circle r={isSelected || isHovered ? 7 : 5.5} fill={markerColor} stroke="#ffffff" strokeWidth="2" />
                  {!isMiniMap && (
                    <g transform="translate(0, 20)">
                      <rect
                        x="-34"
                        y="-9"
                        width="68"
                        height="18"
                        rx="4"
                        fill={isDelivered ? '#ecfdf5' : '#ffffff'}
                        stroke={isDelivered ? '#16a34a' : '#cbd5e1'}
                        strokeWidth="1"
                      />
                      {isDelivered ? (
                        <CheckCircle2 x="-29" y="-6" width="12" height="12" color="#15803d" />
                      ) : (
                        <Package x="-29" y="-6" width="12" height="12" color="#334155" />
                      )}
                      <text
                        x="7"
                        y="4"
                        textAnchor="middle"
                        fontSize="9"
                        fontWeight="800"
                        fill={isDelivered ? '#15803d' : '#334155'}
                      >
                        {order.id}
                      </text>
                    </g>
                  )}
                </g>
              );
            })}
          </g>
        )}

        {showIncidents && activeRoutesVisible && (
          <g>
            {replanPhase !== 'normal' && (() => {
              const from = gridToSvg(REPLAN_BLOCKED_SEGMENT.from.x, REPLAN_BLOCKED_SEGMENT.from.y);
              const to = gridToSvg(REPLAN_BLOCKED_SEGMENT.to.x, REPLAN_BLOCKED_SEGMENT.to.y);
              const mid = gridToSvg(
                (REPLAN_BLOCKED_SEGMENT.from.x + REPLAN_BLOCKED_SEGMENT.to.x) / 2,
                REPLAN_BLOCKED_SEGMENT.from.y
              );

              return (
                <g>
                  <line
                    x1={from.x}
                    y1={from.y}
                    x2={to.x}
                    y2={to.y}
                    stroke="#dc2626"
                    strokeWidth="8"
                    strokeLinecap="square"
                    strokeDasharray="7 5"
                  />
                  <g transform={`translate(${mid.x}, ${mid.y})`} filter="url(#mapShadow)">
                    <rect x="-22" y="-16" width="44" height="32" rx="6" fill="#fff7ed" stroke="#ea580c" strokeWidth="2" />
                    <AlertTriangle x="-8" y="-10" width="16" height="16" color="#ea580c" />
                    <text x="0" y="11" textAnchor="middle" fontSize="8" fontWeight="900" fill="#9a3412">
                      BLOQUEO
                    </text>
                  </g>
                </g>
              );
            })()}

            {breakdownPhase !== 'before' && (() => {
              const point = gridToSvg(MOTO_02_BREAKDOWN_POINT.x, MOTO_02_BREAKDOWN_POINT.y);

              return (
                <g transform={`translate(${point.x}, ${point.y})`} filter="url(#mapShadow)">
                  <circle r="17" fill="#fff1f2" stroke="#e11d48" strokeWidth="2.5" />
                  <Wrench x="-8" y="-8" width="16" height="16" color="#e11d48" />
                  {!isMiniMap && (
                    <text x="0" y="30" textAnchor="middle" fontSize="9" fontWeight="900" fill="#be123c">
                      Averia Tipo 1
                    </text>
                  )}
                </g>
              );
            })()}

            {displayIncidents
              .filter((incident) => incident.id === 'inc-road-042' || incident.id === 'inc-breakdown-078')
              .map((incident) => {
              const point = getIncidentPoint(incident);
              const svgPoint = gridToSvg(point.x, point.y);
              const isBreakdown = incident.type === 'averia';

              return (
                <g key={incident.id} transform={`translate(${svgPoint.x}, ${svgPoint.y})`} filter="url(#mapShadow)">
                  <circle r="14" fill={isBreakdown ? '#fee2e2' : '#ffedd5'} stroke={isBreakdown ? '#e11d48' : '#f97316'} strokeWidth="2" />
                  {isBreakdown ? (
                    <Wrench x="-7" y="-7" width="14" height="14" color="#e11d48" />
                  ) : (
                    <AlertTriangle x="-7" y="-7" width="14" height="14" color="#f97316" />
                  )}
                </g>
              );
            })}
          </g>
        )}

        {showVehicles && activeRoutesVisible && (
          <g>
            {displayVehicles.map((vehicle) => {
              const point = getVisibleVehiclePoint(vehicle);
              const svgPoint = gridToSvg(point.x, point.y);
              const isSelected = selectedVehicle?.id === vehicle.id;
              const isHovered = hoveredVehicle?.id === vehicle.id;
              const color = routeColorForVehicle(vehicle);
              const visualStatus = animatedVehicleStates[vehicle.id]?.status || 'EN_ALMACEN';
              const statusMeta = getVisualStatusMeta(visualStatus);

              return (
                <g
                  key={vehicle.id}
                  transform={`translate(${svgPoint.x}, ${svgPoint.y})`}
                  className="cursor-pointer"
                  onMouseEnter={() => setHoveredVehicle(vehicle)}
                  onMouseLeave={() => setHoveredVehicle(null)}
                  onClick={(event) => handleVehicleClick(vehicle, event)}
                  filter="url(#mapShadow)"
                >
                  <circle r={isSelected || isHovered ? 15 : 12} fill="#ffffff" stroke={color} strokeWidth={isSelected || isHovered ? 3 : 2.5} />
                  {vehicle.type === 'auto' ? (
                    <Car x="-7" y="-7" width="14" height="14" color={color} />
                  ) : (
                    <Bike x="-7" y="-7" width="14" height="14" color={color} />
                  )}
                  {!isMiniMap && (
                    <g transform="translate(0, -34)">
                      <rect
                        x="-42"
                        y="-9"
                        width="84"
                        height="28"
                        rx="4"
                        fill={statusMeta.background}
                        stroke={statusMeta.border}
                        strokeWidth="1"
                      />
                      <text
                        x="0"
                        y="3"
                        textAnchor="middle"
                        fontSize="8.5"
                        fontWeight="800"
                        className={statusMeta.className}
                      >
                        {statusMeta.label}
                      </text>
                      <text
                        x="0"
                        y="14"
                        textAnchor="middle"
                        fontSize="8"
                        fontWeight="900"
                        fill={vehicle.id === REPLAN_AUTO_03.id ? '#0f172a' : '#64748b'}
                      >
                        {getVehicleDisplayName(vehicle)}
                      </text>
                    </g>
                  )}
                </g>
              );
            })}
          </g>
        )}
        </g>
      </svg>

      {!isMiniMap && replanPhase === 'problem' && activeRoutesVisible && (
        <div className="absolute top-4 right-4 bg-rose-50/95 backdrop-blur-md rounded-xl p-4 shadow-lg border border-rose-200 z-20 w-80">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-[13px] font-extrabold text-rose-900">Bloqueo detectado</h4>
              <p className="text-[11.5px] text-rose-800 mt-1">
                {REPLAN_EVENT_TIME_LABEL} - tramo (31,21) a (34,21).
              </p>
            </div>
          </div>
        </div>
      )}

      {!isMiniMap && replanPhase === 'replanning' && activeRoutesVisible && (
        <div className="absolute top-4 right-4 bg-amber-50/95 backdrop-blur-md rounded-xl p-4 shadow-lg border border-amber-200 z-20 w-80">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-[13px] font-extrabold text-amber-900">Replanificando ruta...</h4>
              <div className="mt-2 space-y-1 text-[11.5px] text-amber-900">
                <p><span className="font-semibold">Pedido crítico:</span> {REPLAN_CRITICAL_ORDER_ID}</p>
                <p><span className="font-semibold">Tiempo restante:</span> {REPLAN_CRITICAL_REMAINING_MINUTES} min</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {!isMiniMap && replanPhase === 'solution' && demoElapsedSeconds < 16 && activeRoutesVisible && (
        <div className="absolute top-4 right-4 bg-emerald-50/95 backdrop-blur-md rounded-xl p-4 shadow-lg border border-emerald-200 z-20 w-80">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-[13px] font-extrabold text-emerald-900">Ruta alternativa aplicada</h4>
              <p className="text-[11.5px] text-emerald-800 mt-1">
                AUTO-03 evita el bloqueo y continua hacia {REPLAN_CRITICAL_ORDER_ID}.
              </p>
            </div>
          </div>
        </div>
      )}

      {!isMiniMap && isDemandIncreaseVisible && activeRoutesVisible && (
        <div className="absolute top-4 right-4 bg-blue-50/95 backdrop-blur-md rounded-xl p-4 shadow-lg border border-blue-200 z-20 w-80">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-[13px] font-extrabold text-blue-900">Incremento de demanda</h4>
              <p className="text-[11.5px] text-blue-800 mt-1">
                Día 3 - se activan pedidos priorizados adicionales y la flota absorbe el volumen sin incidencia.
              </p>
            </div>
          </div>
        </div>
      )}

      {!isMiniMap && breakdownPhase === 'breakdown' && activeRoutesVisible && (
        <div className="absolute top-[168px] right-4 bg-rose-50/95 backdrop-blur-md rounded-xl p-4 shadow-lg border border-rose-200 z-20 w-80">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center shrink-0">
              <Wrench className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-[13px] font-extrabold text-rose-900">Averia Tipo 1</h4>
              <div className="mt-2 space-y-1 text-[11.5px] text-rose-900">
                <p><span className="font-semibold">Vehiculo:</span> MOTO-02</p>
                <p><span className="font-semibold">No disponible:</span> 2 h</p>
                <p className="text-rose-700">La calle permanece habilitada.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {!isMiniMap && breakdownPhase === 'reassigning' && activeRoutesVisible && (
        <div className="absolute top-[168px] right-4 bg-amber-50/95 backdrop-blur-md rounded-xl p-4 shadow-lg border border-amber-200 z-20 w-80">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-[13px] font-extrabold text-amber-900">Reasignando pedido</h4>
              <div className="mt-2 space-y-1 text-[11.5px] text-amber-900">
                <p><span className="font-semibold">PED-078:</span> MOTO-02 {'->'} AUTO-04</p>
                <p><span className="font-semibold">Motivo:</span> vehículo no disponible</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {!isMiniMap && breakdownPhase === 'reassigned' && demoElapsedSeconds < 36 && activeRoutesVisible && (
        <div className="absolute top-[168px] right-4 bg-blue-50/95 backdrop-blur-md rounded-xl p-4 shadow-lg border border-blue-200 z-20 w-80">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
              <Car className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-[13px] font-extrabold text-blue-900">AUTO-04 en nueva ruta</h4>
              <p className="text-[11.5px] text-blue-800 mt-1">
                PED-078 queda reasignado y el nuevo vehículo avanza hacia el cliente.
              </p>
            </div>
          </div>
        </div>
      )}

      {!isMiniMap && isOperationClosingVisible && activeRoutesVisible && (
        <div className="absolute top-4 right-4 bg-emerald-50/95 backdrop-blur-md rounded-xl p-4 shadow-lg border border-emerald-200 z-20 w-80">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
              <Flag className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-[13px] font-extrabold text-emerald-900">Cierre de operación</h4>
              <p className="text-[11.5px] text-emerald-800 mt-1">
                Día 5 - el tablero consolida entregas, incidencias atendidas y resultados finales.
              </p>
            </div>
          </div>
        </div>
      )}

      {!isMiniMap && (
        <div className="absolute bottom-4 right-4 flex flex-col gap-2 z-10">
          <button
            onClick={handleResetZoom}
            title="Centrar mapa"
            aria-label="Centrar mapa"
            className="w-9 h-9 bg-white/95 backdrop-blur-md hover:bg-white text-slate-700 rounded-lg shadow-md border border-slate-200/90 flex items-center justify-center transition-all hover:scale-105"
          >
            <Crosshair className="w-4 h-4" />
          </button>
          <div className="bg-white/95 backdrop-blur-md rounded-lg shadow-md border border-slate-200/90 overflow-hidden flex flex-col">
            <button
              onClick={handleZoomIn}
              title="Acercar"
              aria-label="Acercar mapa"
              className="w-9 h-9 hover:bg-slate-50 text-slate-700 flex items-center justify-center border-b border-slate-100 transition-colors"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              onClick={handleZoomOut}
              title="Alejar"
              aria-label="Alejar mapa"
              className="w-9 h-9 hover:bg-slate-50 text-slate-700 flex items-center justify-center transition-colors"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {hoveredOrder && !selectedOrder && !isMiniMap && (
        <div className="absolute z-50 pointer-events-none left-1/2 top-5 -translate-x-1/2">
          <div className="bg-slate-900/95 text-white rounded-xl shadow-2xl p-3.5 w-72 border border-slate-700/80 text-[11.5px] space-y-1.5">
            <div className="flex items-center justify-between border-b border-slate-700 pb-1.5">
              <span className="font-bold">Pedido #{hoveredOrder.id}</span>
              <span className={`px-2 py-0.5 rounded-full ${getTrafficLightMeta(calculateTrafficLightFromDeadline(hoveredOrder.deadlineAt, currentMapSimulationTime, trafficConfig)).badgeClass}`}>
                {getTrafficLightMeta(calculateTrafficLightFromDeadline(hoveredOrder.deadlineAt, currentMapSimulationTime, trafficConfig)).tag}
              </span>
            </div>
            <div className="flex justify-between gap-3">
              <span className="text-slate-400">Cliente</span>
              <span className="font-semibold text-right truncate">{hoveredOrder.clientName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Destino grid</span>
              <span className="font-mono">{`${getOrderPoint(hoveredOrder).x}, ${getOrderPoint(hoveredOrder).y}`}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Min. restantes</span>
              <span className="font-mono">{Math.max(0, getRemainingMinutes(hoveredOrder.deadlineAt, currentMapSimulationTime))}</span>
            </div>
          </div>
        </div>
      )}

      {hoveredVehicle && !selectedVehicle && !isMiniMap && (
        <div className="absolute z-50 pointer-events-none left-1/2 top-5 -translate-x-1/2">
          <div className="bg-slate-900/95 text-white rounded-xl shadow-2xl p-3.5 w-72 border border-slate-700/80 text-[11.5px] space-y-1.5">
            <div className="flex items-center justify-between border-b border-slate-700 pb-1.5">
              <span className="font-bold">{getVehicleDisplayName(hoveredVehicle)}</span>
              <span className="font-mono text-slate-300">{hoveredVehicle.plate}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Posicion grid</span>
              <span className="font-mono">{`${getVisibleVehiclePoint(hoveredVehicle).x.toFixed(1)}, ${getVisibleVehiclePoint(hoveredVehicle).y.toFixed(1)}`}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Estado visual</span>
              <span className="font-semibold">{getVisualStatusMeta(animatedVehicleStates[hoveredVehicle.id]?.status || 'EN_ALMACEN').label}</span>
            </div>
          </div>
        </div>
      )}

      {selectedVehicle && popupPos && !isMiniMap && (
        <div
          className="absolute z-40"
          style={{
            left: `${Math.min(Math.max(popupPos.x, 20), 560)}px`,
            top: `${Math.min(Math.max(popupPos.y, 30), 380)}px`,
          }}
          onClick={(event) => event.stopPropagation()}
        >
          <VehicleDetailCard
            vehicle={selectedVehicle}
            orders={displayOrders}
            onClose={() => {
              setSelectedVehicle(null);
              setPopupPos(null);
            }}
          />
        </div>
      )}

      {selectedOrderForDetail && popupPos && !isMiniMap && (
        <div
          className="absolute z-40"
          style={{
            left: `${Math.min(Math.max(popupPos.x, 20), 560)}px`,
            top: `${Math.min(Math.max(popupPos.y, 30), 360)}px`,
          }}
          onClick={(event) => event.stopPropagation()}
        >
          <OrderDetailCard
            order={selectedOrderForDetail}
            vehicle={displayVehicles.find((vehicle) => vehicle.id === selectedOrderForDetail.assignedVehicleId) || selectedVehicle}
            trafficConfig={trafficConfig}
            simulationTime={currentMapSimulationTime}
            onClose={() => {
              setSelectedOrder(null);
              setPopupPos(null);
            }}
          />
        </div>
      )}
    </div>
  );
};
