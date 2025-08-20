import type { Core } from '@metrixlabs/types';

export const getService = (
	name: string,
	{ strapi }: { strapi: Core.Strapi } = { strapi: (globalThis as any).strapi }
) => {
	return strapi.service(`admin::${name}`);
};

export default {
	getService,
};
