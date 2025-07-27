import { z } from 'zod';

// 5MB
const max_size = 1024 * 1024 * 5;

export const UploadImageValidationSchema = z
  .object({
    size: z.number().max(max_size),
    name: z.string().min(1),
    usage: z.enum([
      'profile',
      'contact-profile',
      'company-logo',
      'room-gallery',
      'room-image',
      'blog-image',
      'destination-image',
      'dish-image',
    ]),
    type: z.enum(['image/jpg', 'image/jpeg', 'image/png', 'image/webp']),
  })
  .required();

export type UploadImageValidationSchemaType = z.infer<
  typeof UploadImageValidationSchema
>;
