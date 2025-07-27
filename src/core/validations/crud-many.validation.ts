import { z } from 'zod';

export const CRUDManyIDsValidationSchema = z
  .object({
    ids: z.array(z.string()),
  })
  .strict();

export type CRUDManyIDsValidationSchemaType = z.infer<
  typeof CRUDManyIDsValidationSchema
>;
