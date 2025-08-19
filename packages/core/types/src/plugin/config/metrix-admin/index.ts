// TODO
// Interface for the plugin metrix-admin file
export interface AdminInput {
  register: unknown;
  bootstrap?: unknown;
  registerTrads: ({ locales }: { locales: string[] }) => Promise<unknown>;
}
