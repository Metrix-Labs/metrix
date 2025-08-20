import type { Core } from '@metrixlabs/types';

import type { Timer } from '../utils';

export interface ContextRegistries {}

export interface TimeStats {
  startTime: number;
  endTime: number;
  elapsedTime: number;
}

export interface Stats {
  time: TimeStats;
}

export interface ContextOutput<T> {
  data: T;
  stats: Stats;
}

export interface Context<T = unknown> {
  routes: Core.Route[];
  metrix: Core.Strapi;
  timer: Timer;
  registries: ContextRegistries;
  output: ContextOutput<T>;
}

export type PartialContext<T> = Partial<Pick<Context<T>, 'timer' | 'registries'>> &
  Required<Pick<Context<T>, 'metrix' | 'routes'>>;

export interface ContextFactory<T> {
  create(context: PartialContext<T>, defaultValue: T): Context<T>;
}
