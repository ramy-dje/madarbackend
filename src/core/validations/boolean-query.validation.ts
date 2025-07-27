import { z } from 'zod';

export const BooleanQueryValidationSchema = z
  .enum(['true', 'false'])
  .optional();

export type BooleanQueryValidationSchemaType = z.infer<
  typeof BooleanQueryValidationSchema
>;
