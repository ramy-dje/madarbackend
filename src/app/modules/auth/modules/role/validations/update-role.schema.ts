import { z } from 'zod';

export const Update_Role_ValidationSchema = z
  .object({
    name: z.string().min(2).optional(),
    permissions: z.array(z.string()).optional(),
    color: z.string().optional(),
  })
  .strict();

export type Update_Role_ValidationSchemaType = z.infer<
  typeof Update_Role_ValidationSchema
>;
