import { z } from 'zod';

export const PaginationQueryValidationSchema = z
  .object({
    page: z
      .string()
      .transform((val) => {
        if (isNaN(Number(val))) throw Error(); // throw an error if this string isn't number
        return Number(val);
      })
      .optional(),
    size: z
      .string()
      .transform((val) => {
        if (isNaN(Number(val))) throw Error(); // throw an error if this string isn't number
        return Number(val);
      })
      .optional(),
  })
  .optional();

export type PaginationQueryValidationSchemaType = z.infer<
  typeof PaginationQueryValidationSchema
>;
