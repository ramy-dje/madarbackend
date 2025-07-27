import { z } from 'zod';

export const Create_Occupation_ValidationSchema = z
  .object({
    name: z.string().min(2),
  })
  .strict();

export type Create_Occupation_ValidationSchemaType = z.infer<
  typeof Create_Occupation_ValidationSchema
>;
