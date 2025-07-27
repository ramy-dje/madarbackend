import { z } from 'zod';

export const Create_Industry_ValidationSchema = z
  .object({
    name: z.string().min(2),
  })
  .strict();

export type Create_Industry_ValidationSchemaType = z.infer<
  typeof Create_Industry_ValidationSchema
>;
