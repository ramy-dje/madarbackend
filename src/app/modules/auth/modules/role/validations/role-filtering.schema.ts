import { z } from 'zod';

export const RoleFilter_ValidationSchema = z
  .object({
    name: z.string().min(1).optional(),
    sorting_by_date_date: z.enum(['0', '-1', '1']).optional(),
  })
  .optional();

export type RoleFilter_ValidationSchemaType = z.infer<
  typeof RoleFilter_ValidationSchema
>;
