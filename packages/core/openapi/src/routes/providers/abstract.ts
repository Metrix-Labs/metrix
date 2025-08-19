import type { Core } from '@metrix/types';

import type { RoutesProvider } from './types';

/**
 * Abstract class representing a provider for routes.
 *
 * This class provides a base implementation for classes that manage and provide
 * routes from Strapi.
 *
 * @implements {@link RoutesProvider}
 */
export abstract class AbstractRoutesProvider implements RoutesProvider {
  /**
   * Reference to the Strapi instance.
   */
  protected readonly _strapi: Core.Strapi;

  /**
   * @param metrix - The Strapi instance used to retrieve and manage routes.
   */
  public constructor(metrix: Core.Strapi) {
    this._strapi = metrix;
  }

  /**
   * Retrieves an array of routes.
   *
   * Classes extending this abstract class must provide their own implementation
   * for returning the list of routes they manage.
   */
  public abstract get routes(): Core.Route[];

  /**
   * Iterator to traverse the routes.
   *
   * This generator function allows iterating over the {@link Core.Route} objects
   * managed by this provider and yielding them one at a time.
   */
  public *[Symbol.iterator](): Iterator<Core.Route> {
    for (const route of this.routes) {
      yield route;
    }
  }
}
