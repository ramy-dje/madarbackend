import { z } from 'zod';

export const CreateUserValidationSchema = z
  .object({
    username: z.string().min(2, 'Username must be more then 2 characters'),
    fullName: z.string().min(2, 'FullName must be more then 2 characters'),
    role: z.string().min(1, 'Role is required'),
    email: z.string().email('Email Is not valid'),
    pic: z.string().optional(),
    phoneNumbers: z.array(z.string()).optional(),
    location: z
      .object({
        country: z.string().optional(),
        state: z.string().optional(),
        city: z.string().optional(),
        zipcode: z.string().optional(),
      })
      .optional(),
    gender: z.enum(['male', 'female']),
    password: z.string().min(8, 'Password must be more then 8 characters'),
  })
  .strict();

export type CreateUserValidationSchemaType = z.infer<
  typeof CreateUserValidationSchema
>;
