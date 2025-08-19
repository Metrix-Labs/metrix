import type { Struct } from '@metrix/types';

export interface ContentType extends Struct.ContentTypeSchema {
  isDisplayed: boolean;
  apiID: string;
}
