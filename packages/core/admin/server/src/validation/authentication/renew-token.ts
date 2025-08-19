import { yup, validateYupSchema } from '@metrix/utils';

const renewToken = yup.object().shape({ token: yup.string().required() }).required().noUnknown();

export default validateYupSchema(renewToken);
