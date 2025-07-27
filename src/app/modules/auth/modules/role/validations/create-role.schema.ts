import { z } from 'zod';

export const Create_Role_ValidationSchema = z
  .object({
    name: z.string().min(2),
    permissions: z.array(z.string()),
    color: z.string(),
  })
  .strict();

export type Create_Role_ValidationSchemaType = z.infer<
  typeof Create_Role_ValidationSchema
>;
