import { z } from 'zod';

export const ContactFilter_ValidationSchema = z
  .object({
    name: z.string().min(1).optional(),
    gender: z.enum(['male', 'female']).optional(),
    location_global: z.string().min(1).optional(),
    location_country: z.string().min(1).optional(),
    email: z.string().min(1).optional(),
    work_industry: z.string().min(1).optional(),
    work_company: z.string().min(1).optional(),
    work_occupation: z.string().min(1).optional(),
    phoneNumber: z.string().min(1).optional(),
    sorting_by_date_date: z.enum(['0', '-1', '1']).optional(),
  })
  .optional();

export type ContactFilter_ValidationSchemaType = z.infer<
  typeof ContactFilter_ValidationSchema
>;
