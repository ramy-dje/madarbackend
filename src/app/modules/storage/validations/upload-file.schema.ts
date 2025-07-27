import { z } from 'zod';

// 10MB
const max_size = 1024 * 1024 * 10;

export const UploadFileValidationSchema = z
  .object({
    size: z.number().max(max_size),
    name: z.string().min(1),
    usage: z.enum(['cv', 'csv-data', 'text-data']),
    type: z.enum(['application/pdf', 'text/plain', 'text/csv']),
  })
  .required();

export type UploadFileValidationSchemaType = z.infer<
  typeof UploadFileValidationSchema
>;
