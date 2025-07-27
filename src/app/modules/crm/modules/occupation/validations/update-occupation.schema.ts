import { z } from 'zod';

export const Update_Occupation_ValidationSchema = z
  .object({
    name: z.string().min(2).optional(),
  })
  .strict();

export type Update_Occupation_ValidationSchemaType = z.infer<
  typeof Update_Occupation_ValidationSchema
>;
