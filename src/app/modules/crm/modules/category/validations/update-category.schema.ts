import { z } from 'zod';

export const Update_Category_ValidationSchema = z
  .object({
    name: z.string().min(2).optional(),
  })
  .strict();

export type Update_Category_ValidationSchemaType = z.infer<
  typeof Update_Category_ValidationSchema
>;
