import { z } from 'zod';

export const UserFilter_ValidationSchema = z
  .object({
    name: z.string().min(1).optional(),
    gender: z.enum(['male', 'female']).optional(),
    role_id: z.string().min(1).optional(),
    sorting_by_date_date: z.enum(['0', '-1', '1']).optional(),
  })
  .optional();

export type UserFilter_ValidationSchemaType = z.infer<
  typeof UserFilter_ValidationSchema
>;
