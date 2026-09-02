import type { SimulationFeedEvent, SimulationFeedEventType } from '../components/SimulationActivityFeed';

export type DemoScriptTone = 'normal' | 'highlight' | 'closing';

export interface DemoScriptDay {
  day: 1 | 2 | 3 | 4 | 5;
  title: string;
  summary: string;
  tone: DemoScriptTone;
  mapFocus: string;
}

export interface DemoScriptMoment {
  id: string;
  day: 1 | 2 | 3 | 4 | 5;
  time: string;
  elapsedSeconds: number;
  type: SimulationFeedEventType;
  message: string;
  tone: SimulationFeedEvent['tone'];
}

export const DEMO_SCRIPT_DAYS: DemoScriptDay[] = [
  {
    day: 1,
    title: 'Inicio normal y primeras entregas',
    summary: 'La flota sale desde los tres almacenes y el sistema valida entregas sin incidencias.',
    tone: 'normal',
    mapFocus: 'Auto, moto y bicicleta recorriendo rutas ortogonales.',
  },
  {
    day: 2,
    title: 'Pedido prioritario, bloqueo y replanificación',
    summary: 'PED-042 queda comprometido por un bloqueo y AUTO-03 toma una ruta alternativa.',
    tone: 'highlight',
    mapFocus: 'Bloqueo en (31,21) a (34,21), ruta anterior punteada y ruta nueva activa.',
  },
  {
    day: 3,
    title: 'Incremento de demanda',
    summary: 'Aumentan pedidos priorizados y la operación absorbe la carga con flota disponible.',
    tone: 'normal',
    mapFocus: 'Mayor actividad de pedidos, sin interrupciones graves.',
  },
  {
    day: 4,
    title: 'Averia y reasignacion',
    summary: 'MOTO-02 queda averiada, PED-078 pasa a AUTO-04 y la calle permanece habilitada.',
    tone: 'highlight',
    mapFocus: 'Averia Tipo 1, reasignacion visible y AUTO-04 en nueva ruta.',
  },
  {
    day: 5,
    title: 'Cierre de operación y resultados',
    summary: 'La simulación consolida entregas, costos, uso de flota e incidencias resueltas.',
    tone: 'closing',
    mapFocus: 'Operacion estabilizada y tablero listo para resultados.',
  },
];

export const DEMO_SCRIPT_MOMENTS: DemoScriptMoment[] = [
  {
    id: 'script-day-1-start',
    day: 1,
    time: '08:00',
    elapsedSeconds: 0.5,
    type: 'route_started',
    message: 'Día 1: inicio normal de operación con flota multimodal',
    tone: 'info',
  },
  {
    id: 'script-day-1-first-delivery',
    day: 1,
    time: '10:36',
    elapsedSeconds: 5,
    type: 'delivery',
    message: 'Día 1: primeras entregas completadas sin incidencia',
    tone: 'success',
  },
  {
    id: 'script-day-2-priority',
    day: 2,
    time: '14:18',
    elapsedSeconds: 6.5,
    type: 'order_registered',
    message: 'Día 2: PED-042 priorizado entra a monitoreo crítico',
    tone: 'warning',
  },
  {
    id: 'script-day-3-demand',
    day: 3,
    time: '09:10',
    elapsedSeconds: 16,
    type: 'demand_increase',
    message: 'Día 3: incremento de demanda, se activan pedidos priorizados adicionales',
    tone: 'info',
  },
  {
    id: 'script-day-3-normalized',
    day: 3,
    time: '16:45',
    elapsedSeconds: 18.5,
    type: 'delivery',
    message: 'Día 3: operación normalizada tras mayor volumen de entregas',
    tone: 'success',
  },
  {
    id: 'script-day-5-close',
    day: 5,
    time: '23:59',
    elapsedSeconds: 36,
    type: 'simulation_closed',
    message: 'Día 5: cierre de operación y consolidación de resultados',
    tone: 'success',
  },
];
