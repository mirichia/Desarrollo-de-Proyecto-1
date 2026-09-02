import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  SIMULATION_SCENARIO,
  SimulationEvent,
  SimulationIncident,
  SimulationOrder,
  SimulationScenario,
  SimulationVehicle,
} from '../data/simulationMock';
import { SimulationStats } from '../types';

export type MockSimulationStatus = 'idle' | 'running' | 'replanning' | 'finished';

export interface MockSimulationState {
  simulationStatus: MockSimulationStatus;
  simulationTime: Date;
  simulationClockLabel: string;
  simulationDay: number;
  realElapsedTime: string;
  progress: number;
  vehicles: SimulationVehicle[];
  orders: SimulationOrder[];
  incidents: SimulationIncident[];
  activeEvents: SimulationEvent[];
  metrics: SimulationStats;
}

export interface MockSimulationControls {
  start: () => void;
  pause: () => void;
  resume: () => void;
  triggerReplanning: () => void;
  finish: () => void;
  reset: () => void;
}

export interface UseMockSimulationResult extends MockSimulationState, MockSimulationControls {}

const SIMULATION_DAYS = 5;
const MINUTES_PER_DAY = 24 * 60;
const TOTAL_SIMULATION_MINUTES = SIMULATION_DAYS * MINUTES_PER_DAY;
const OFFICIAL_REAL_DURATION_MINUTES = 45;
const REAL_TICK_MS_PER_SIMULATED_MINUTE =
  (OFFICIAL_REAL_DURATION_MINUTES * 60 * 1000) / TOTAL_SIMULATION_MINUTES;

const DEBUG_CLOCK_ENABLED = false;
const DEBUG_REAL_TICK_MS = 60;
const TICK_MS = DEBUG_CLOCK_ENABLED ? DEBUG_REAL_TICK_MS : REAL_TICK_MS_PER_SIMULATED_MINUTE;
const SIMULATION_START_HOUR = 8;

const pad2 = (value: number) => String(value).padStart(2, '0');

const addMinutes = (date: Date, minutes: number) => {
  const next = new Date(date);
  next.setMinutes(next.getMinutes() + minutes);
  return next;
};

const diffMinutes = (from: Date, to: Date) => {
  return Math.max(0, Math.floor((to.getTime() - from.getTime()) / 60000));
};

const formatClock = (date: Date) => `${pad2(date.getHours())}:${pad2(date.getMinutes())}`;

const formatRealElapsed = (seconds: number) => {
  const hh = Math.floor(seconds / 3600);
  const mm = Math.floor((seconds % 3600) / 60);
  const ss = seconds % 60;
  return `${pad2(hh)}:${pad2(mm)}:${pad2(ss)}`;
};

const getInitialSimulationTime = (scenario: SimulationScenario) => {
  const start = new Date(scenario.configuration.startsAt);
  start.setHours(SIMULATION_START_HOUR, 0, 0, 0);
  return start;
};

const getSimulationDay = (startTime: Date, currentTime: Date) => {
  return Math.min(SIMULATION_DAYS, Math.floor(diffMinutes(startTime, currentTime) / MINUTES_PER_DAY) + 1);
};

const getProgress = (startTime: Date, currentTime: Date) => {
  return Math.min(100, (diffMinutes(startTime, currentTime) / TOTAL_SIMULATION_MINUTES) * 100);
};

const getElapsedRealSeconds = (progress: number) => {
  const totalRealSeconds = OFFICIAL_REAL_DURATION_MINUTES * 60;
  return Math.floor((progress / 100) * totalRealSeconds);
};

const updateOrders = (orders: SimulationOrder[], currentTime: Date) => {
  return orders.map((order) => {
    const deadline = new Date(order.deadline);
    const minutesRemaining = Math.floor((deadline.getTime() - currentTime.getTime()) / 60000);

    if (order.status === 'delivered' || order.status === 'failed') {
      return order;
    }

    if (minutesRemaining <= 0) {
      return {
        ...order,
        risk: 'rojo' as const,
        status: 'failed' as const,
      };
    }

    if (minutesRemaining <= 15) {
      return {
        ...order,
        risk: 'rojo' as const,
      };
    }

    if (minutesRemaining <= 45) {
      return {
        ...order,
        risk: 'ambar' as const,
      };
    }

    return {
      ...order,
      risk: 'verde' as const,
    };
  });
};

const updateIncidents = (incidents: SimulationIncident[], currentTime: Date) => {
  return incidents.map((incident) => {
    const startsAt = new Date(incident.startsAt);

    if (currentTime >= startsAt && incident.status === 'scheduled') {
      return {
        ...incident,
        status: 'active' as const,
      };
    }

    return incident;
  });
};

const updateVehicles = (
  vehicles: SimulationVehicle[],
  incidents: SimulationIncident[],
  events: SimulationEvent[]
) => {
  const brokenVehicleIds = new Set(
    incidents
      .filter((incident) => incident.type === 'vehicle_breakdown' && incident.status === 'active')
      .flatMap((incident) => incident.affectedVehicleIds)
  );
  const replannedRouteIds = new Set(
    events
      .filter((event) => event.type === 'route_replanned')
      .flatMap((event) => {
        const routeIds = event.payload.affectedRouteIds;
        return Array.isArray(routeIds) ? routeIds.filter((routeId): routeId is string => typeof routeId === 'string') : [];
      })
  );

  return vehicles.map((vehicle) => {
    if (brokenVehicleIds.has(vehicle.id)) {
      return {
        ...vehicle,
        status: 'broken' as const,
      };
    }

    if (vehicle.routeId && replannedRouteIds.has(vehicle.routeId)) {
      return {
        ...vehicle,
        status: 'assigned' as const,
      };
    }

    return vehicle;
  });
};

const applyEvents = (
  events: SimulationEvent[],
  processedEventKeys: Set<string>,
  currentTime: Date
) => {
  const newlyActiveEvents: SimulationEvent[] = [];

  for (const event of events) {
    const eventKey = `${event.simulationTime}:${event.type}`;
    const eventTime = new Date(event.simulationTime);

    if (!processedEventKeys.has(eventKey) && currentTime >= eventTime) {
      processedEventKeys.add(eventKey);
      newlyActiveEvents.push(event);
    }
  }

  return newlyActiveEvents;
};

const buildMetrics = (
  scenario: SimulationScenario,
  status: MockSimulationStatus,
  simulationTime: Date,
  simulationDay: number,
  progress: number,
  realElapsedTime: string,
  orders: SimulationOrder[],
  vehicles: SimulationVehicle[]
): SimulationStats => {
  const deliveredOrders = orders.filter((order) => order.status === 'delivered').length;
  const failedOrders = orders.filter((order) => order.status === 'failed').length;
  const atRiskOrders = orders.filter((order) => order.risk === 'rojo' && order.status !== 'delivered').length;
  const pendingOrders = orders.length - deliveredOrders - failedOrders;
  const activeVehicles = vehicles.filter((vehicle) => vehicle.status === 'assigned' || vehicle.status === 'in_route').length;

  return {
    simulatedDateTime:
      status === 'idle' && progress === 0
        ? '--'
        : `Dia ${simulationDay} ${formatClock(simulationTime)}`,
    realElapsedTime: status === 'idle' && progress === 0 ? '--' : realElapsedTime,
    totalOrders: scenario.orders.length,
    deliveredOrders,
    pendingOrders,
    atRiskOrders,
    activeVehicles,
    currentDay: simulationDay,
    dayProgress: progress,
  };
};

export function useMockSimulation(
  scenario: SimulationScenario = SIMULATION_SCENARIO
): UseMockSimulationResult {
  const startTime = useMemo(() => getInitialSimulationTime(scenario), [scenario]);
  const processedEventKeysRef = useRef<Set<string>>(new Set());

  const [simulationStatus, setSimulationStatus] = useState<MockSimulationStatus>('idle');
  const [simulationTime, setSimulationTime] = useState<Date>(startTime);
  const [vehicles, setVehicles] = useState<SimulationVehicle[]>(scenario.vehicles);
  const [orders, setOrders] = useState<SimulationOrder[]>(scenario.orders);
  const [incidents, setIncidents] = useState<SimulationIncident[]>(scenario.incidents);
  const [activeEvents, setActiveEvents] = useState<SimulationEvent[]>([]);

  const simulationDay = getSimulationDay(startTime, simulationTime);
  const progress = getProgress(startTime, simulationTime);
  const realElapsedTime = formatRealElapsed(getElapsedRealSeconds(progress));
  const simulationClockLabel = `Dia ${simulationDay} ${formatClock(simulationTime)}`;

  const reset = useCallback(() => {
    processedEventKeysRef.current = new Set();
    setSimulationStatus('idle');
    setSimulationTime(startTime);
    setVehicles(scenario.vehicles);
    setOrders(scenario.orders);
    setIncidents(scenario.incidents);
    setActiveEvents([]);
  }, [scenario, startTime]);

  const start = useCallback(() => {
    processedEventKeysRef.current = new Set();
    setSimulationStatus('running');
    setSimulationTime(startTime);
    setVehicles(scenario.vehicles);
    setOrders(scenario.orders);
    setIncidents(scenario.incidents);
    setActiveEvents([]);
  }, [scenario, startTime]);

  const pause = useCallback(() => {
    setSimulationStatus((current) => current === 'running' ? 'idle' : current);
  }, []);

  const resume = useCallback(() => {
    setSimulationStatus((current) => current === 'idle' && progress > 0 && progress < 100 ? 'running' : current);
  }, [progress]);

  const triggerReplanning = useCallback(() => {
    setSimulationStatus((current) => current === 'finished' ? current : 'replanning');
  }, []);

  const finish = useCallback(() => {
    setSimulationTime(addMinutes(startTime, TOTAL_SIMULATION_MINUTES));
    setSimulationStatus('finished');
  }, [startTime]);

  useEffect(() => {
    if (simulationStatus !== 'running' && simulationStatus !== 'replanning') {
      return;
    }

    const intervalId = window.setInterval(() => {
      setSimulationTime((currentTime) => {
        const nextTime = addMinutes(currentTime, 1);
        const nextProgress = getProgress(startTime, nextTime);

        const newEvents = applyEvents(
          scenario.events,
          processedEventKeysRef.current,
          nextTime
        );

        if (newEvents.length > 0) {
          setActiveEvents((currentEvents) => [...currentEvents, ...newEvents]);
        }

        setOrders((currentOrders) => updateOrders(currentOrders, nextTime));
        setIncidents((currentIncidents) => {
          const updatedIncidents = updateIncidents(currentIncidents, nextTime);
          setVehicles((currentVehicles) => updateVehicles(currentVehicles, updatedIncidents, newEvents));
          return updatedIncidents;
        });

        if (newEvents.some((event) => event.type === 'route_replanned')) {
          setSimulationStatus('replanning');
        }

        if (nextProgress >= 100) {
          setSimulationStatus('finished');
          return addMinutes(startTime, TOTAL_SIMULATION_MINUTES);
        }

        return nextTime;
      });
    }, TICK_MS);

    return () => window.clearInterval(intervalId);
  }, [scenario, simulationStatus, startTime]);

  const metrics = buildMetrics(
    scenario,
    simulationStatus,
    simulationTime,
    simulationDay,
    progress,
    realElapsedTime,
    orders,
    vehicles
  );

  return {
    simulationStatus,
    simulationTime,
    simulationClockLabel,
    simulationDay,
    realElapsedTime,
    progress,
    vehicles,
    orders,
    incidents,
    activeEvents,
    metrics,
    start,
    pause,
    resume,
    triggerReplanning,
    finish,
    reset,
  };
}
