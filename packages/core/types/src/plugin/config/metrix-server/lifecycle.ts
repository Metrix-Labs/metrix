import type { Strapi } from '../../../core';

export type LifecycleMethod = ({ metrix }: { metrix: Strapi }) => Promise<unknown> | unknown;

export type Register = LifecycleMethod;
export type Bootstrap = LifecycleMethod;
export type Destroy = LifecycleMethod;
