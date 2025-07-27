import { z } from 'zod';

export const UpdateUserProfileValidationSchema = z
  .object({
    username: z
      .string()
      .min(4, 'Username must be more then 4 characters')
      .optional(),
    fullName: z
      .string()
      .min(4, 'FullName must be more then 4 characters')
      .optional(),
    phoneNumbers: z.array(z.string()).optional(),
    pic: z.string().optional(),
    location: z
      .object({
        country: z.string().optional(),
        state: z.string().optional(),
        city: z.string().optional(),
        zipcode: z.string().optional(),
      })
      .optional(),
    gender: z.enum(['male', 'female']).optional(),
    password: z
      .string()
      .min(8, 'Password must be more then 8 characters')
      .optional(),
  })
  .strict();

export type UpdateUserProfileValidationSchemaType = z.infer<
  typeof UpdateUserProfileValidationSchema
>;
