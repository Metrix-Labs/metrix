import type * as Core from '../../../core';

// TODO Replace when we have WithStrapiCallback accessible
export type Controller = ({ metrix }: { metrix: Core.Strapi }) => Core.Controller;

export interface Controllers {
  [key: string]: Controller;
}
