import { z } from 'zod';

export const UpdateUserActivationValidationSchema = z
  .object({
    active: z.boolean(),
  })
  .strict();

export type UpdateUserActivationValidationSchemaType = z.infer<
  typeof UpdateUserActivationValidationSchema
>;
