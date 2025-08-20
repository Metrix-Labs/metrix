import { yup, validateYupSchema } from '@metrixlabs/utils';

const settingsSchema = yup.object({
  sizeOptimization: yup.boolean().required(),
  responsiveDimensions: yup.boolean().required(),
  autoOrientation: yup.boolean(),
});

export default validateYupSchema(settingsSchema);

export type Settings = yup.InferType<typeof settingsSchema>;
