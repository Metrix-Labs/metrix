import type { PropertyPath } from 'lodash';
import type { Router, Controller, Service, Policy, Middleware, Strapi } from '.';
import type { ContentType } from '../schema';

export interface Module {
  bootstrap: ({ metrix }: { metrix: Strapi }) => void | Promise<void>;
  destroy: ({ metrix }: { metrix: Strapi }) => void | Promise<void>;
  register: ({ metrix }: { metrix: Strapi }) => void | Promise<void>;
  config<T = unknown>(key: PropertyPath, defaultVal?: T): T; // TODO: this mirrors ConfigProvider.get, we should use it directly
  routes: Record<string, Router>;
  controllers: Record<string, Controller>;
  services: Record<string, Service>;
  policies: Record<string, Policy>;
  middlewares: Record<string, Middleware>;
  contentTypes: Record<string, { schema: ContentType }>;

  controller<T extends Controller>(name: string): T;
  service<T extends Service>(name: string): T;
}
