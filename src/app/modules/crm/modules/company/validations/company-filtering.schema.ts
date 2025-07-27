import { z } from 'zod';

// The company filtering zod validation schema

export const CompanyFilter_ValidationSchema = z
  .object({
    name: z.string().min(1).optional(),
    location_global: z.string().min(1).optional(),
    location_country: z.string().min(1).optional(),
    email: z.string().min(1).optional(),
    category: z.string().min(1).optional(),
    industry: z.string().min(1).optional(),
    phoneNumber: z.string().min(1).optional(),
    identification: z.string().min(1).optional(),
    company_size: z
      .enum([
        '1',
        '1-10',
        '11-50',
        '51-200',
        '201-500',
        '501-1000',
        '1001-5000',
        '5001-10,000',
        '10,001',
      ])
      .optional(),
    sorting_by_date_date: z.enum(['0', '-1', '1']).optional(),
  })
  .optional();

export type CompanyFilter_ValidationSchemaType = z.infer<
  typeof CompanyFilter_ValidationSchema
>;
