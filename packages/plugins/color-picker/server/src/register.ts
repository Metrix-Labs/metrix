export const register = ({ metrix }: any) => {
  metrix.customFields.register({
    name: 'color',
    plugin: 'color-picker',
    type: 'string',
  });
};
