import pluginPkg from '../../package.json';

const pluginId = pluginPkg.name.replace(/^metrix-plugin-/i, '');

export default pluginId;
