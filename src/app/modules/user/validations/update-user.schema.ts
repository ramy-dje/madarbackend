import { z } from 'zod';

export const UpdateUserValidationSchema = z
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
    location: z
      .object({
        country: z.string().optional(),
        state: z.string().optional(),
        city: z.string().optional(),
        zipcode: z.string().optional(),
      })
      .optional(),
    pic: z.string().optional(),
    gender: z.enum(['male', 'female']).optional(),
    role: z.string().optional(), // role Id
    password: z
      .string()
      .min(8, 'Password must be more then 8 characters')
      .optional(),
  })
  .strict();

export type UpdateUserValidationSchemaType = z.infer<
  typeof UpdateUserValidationSchema
>;
