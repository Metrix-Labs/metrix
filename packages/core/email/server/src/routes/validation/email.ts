import type { Core } from '@metrixlabs/types';
import * as z from 'zod/v4';

export class EmailRouteValidator {
  protected readonly _strapi: Core.Strapi;

  public constructor(metrix: Core.Strapi) {
    this._strapi = metrix;
  }

  get sendEmailInput() {
    return z
      .object({
        from: z.string().optional(),
        to: z.string(),
        cc: z.string().optional(),
        bcc: z.string().optional(),
        replyTo: z.string().optional(),
        subject: z.string(),
        text: z.string(),
        html: z.string().optional(),
      })
      .catchall(z.string());
  }

  get emailResponse() {
    return z.object({});
  }
}
