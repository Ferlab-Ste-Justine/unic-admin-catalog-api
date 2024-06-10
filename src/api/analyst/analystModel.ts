import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';
import { z } from 'zod';

import { commonValidations } from '@/common/utils/commonValidation';

extendZodWithOpenApi(z);

export type Analyst = z.infer<typeof AnalystSchema>;
export const AnalystSchema = z.object({
  id: z.number().optional(),
  last_update: z.date().optional(),
  name: z.string(),
});

export const GetAnalystSchema = z.object({
  params: z.object({ id: commonValidations.id }),
});

export const GetAnalystsSchema = z.object({
  query: z.object({
    name: z.string().optional(),
  }),
});

export const CreateAnalystSchema = z.object({
  body: z.object({
    name: z.string(),
  }),
});

export const UpdateAnalystSchema = z.object({
  params: z.object({ id: commonValidations.id }),
  body: z.object({
    name: z.string(),
  }),
});

export const DeleteAnalystSchema = z.object({
  params: z.object({ id: commonValidations.id }),
});
