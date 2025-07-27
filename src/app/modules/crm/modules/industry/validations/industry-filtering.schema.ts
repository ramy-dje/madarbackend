import { z } from 'zod';

export const IndustryFilter_ValidationSchema = z
  .object({
    name: z.string().min(1).optional(),
    sorting_by_date_date: z.enum(['0', '-1', '1']).optional(),
  })
  .optional();

export type IndustryFilter_ValidationSchemaType = z.infer<
  typeof IndustryFilter_ValidationSchema
>;
