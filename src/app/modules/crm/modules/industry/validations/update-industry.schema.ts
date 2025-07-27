import { z } from 'zod';

export const Update_Industry_ValidationSchema = z
  .object({
    name: z.string().min(2).optional(),
  })
  .strict();

export type Update_Industry_ValidationSchemaType = z.infer<
  typeof Update_Industry_ValidationSchema
>;
