import { z } from 'zod';

export const Create_Category_ValidationSchema = z
  .object({
    name: z.string().min(2),
  })
  .strict();

export type Create_Category_ValidationSchemaType = z.infer<
  typeof Create_Category_ValidationSchema
>;
