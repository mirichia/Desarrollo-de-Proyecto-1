import { TrafficLightConfig, TrafficLightStatus } from '../types';

export interface DynamicTrafficLightConfig {
  greenThreshold: number;
  amberThreshold: number;
}

type SupportedTrafficLightConfig = DynamicTrafficLightConfig | TrafficLightConfig;

export const trafficLightConfig: DynamicTrafficLightConfig = {
  greenThreshold: 45,
  amberThreshold: 15,
};

export const DEFAULT_TRAFFIC_CONFIG: TrafficLightConfig = {
  verdeMinutes: trafficLightConfig.greenThreshold,
  ambarMinutes: trafficLightConfig.amberThreshold,
  rojoMinutes: 0,
};

const normalizeTrafficLightConfig = (
  config: SupportedTrafficLightConfig = trafficLightConfig
): DynamicTrafficLightConfig => {
  if ('greenThreshold' in config && 'amberThreshold' in config) {
    return config;
  }

  return {
    greenThreshold: config.verdeMinutes,
    amberThreshold: config.ambarMinutes,
  };
};

export function calculateTrafficLightStatus(
  remainingMinutes: number,
  config: SupportedTrafficLightConfig = trafficLightConfig
): TrafficLightStatus {
  const normalizedConfig = normalizeTrafficLightConfig(config);

  if (remainingMinutes > normalizedConfig.greenThreshold) {
    return 'verde';
  }

  if (remainingMinutes > normalizedConfig.amberThreshold) {
    return 'ambar';
  }

  return 'rojo';
}

const parseLocalDateTime = (value: string): Date | null => {
  const normalized = value.trim().replace(/\s+/g, ' ');
  const match = normalized.match(/^(\d{2})\/(\d{2})\/(\d{4})\s+(\d{1,2}):(\d{2})(?:\s*(am|pm))?$/i);

  if (!match) return null;

  const [, day, month, year, rawHours, minutes, meridiem] = match;
  let hours = Number(rawHours);

  if (meridiem?.toLowerCase() === 'pm' && hours < 12) hours += 12;
  if (meridiem?.toLowerCase() === 'am' && hours === 12) hours = 0;

  return new Date(Number(year), Number(month) - 1, Number(day), hours, Number(minutes), 0, 0);
};

export function getRemainingMinutes(deadlineAt: string, simulationTime: Date): number {
  const deadline = parseLocalDateTime(deadlineAt);

  if (!deadline) return 0;

  return Math.floor((deadline.getTime() - simulationTime.getTime()) / 60000);
}

export function calculateTrafficLightFromDeadline(
  deadlineAt: string,
  simulationTime: Date,
  config: SupportedTrafficLightConfig = trafficLightConfig
): TrafficLightStatus {
  return calculateTrafficLightStatus(getRemainingMinutes(deadlineAt, simulationTime), config);
}

export function getTrafficLightMeta(status: TrafficLightStatus) {
  switch (status) {
    case 'verde':
      return {
        label: 'Verde',
        tag: 'VERDE',
        description: 'Margen suficiente',
        badgeClass: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
        dotClass: 'bg-emerald-500',
        hexColor: '#10b981',
        textClass: 'text-emerald-700',
      };
    case 'ambar':
      return {
        label: 'Ambar',
        tag: 'AMBAR',
        description: 'Proximo al plazo',
        badgeClass: 'bg-amber-50 text-amber-700 border border-amber-200',
        dotClass: 'bg-amber-500',
        hexColor: '#f59e0b',
        textClass: 'text-amber-700',
      };
    case 'rojo':
      return {
        label: 'Rojo',
        tag: 'ROJO',
        description: 'Critico',
        badgeClass: 'bg-rose-50 text-rose-700 border border-rose-200',
        dotClass: 'bg-rose-500',
        hexColor: '#ef4444',
        textClass: 'text-rose-700',
      };
  }
}
