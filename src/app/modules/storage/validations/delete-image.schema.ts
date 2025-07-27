import { z } from 'zod';

export const DeleteImageValidationSchema = z
  .object({
    public_url: z.string().url(),
  })
  .required();

export type DeleteImageValidationSchemaType = z.infer<
  typeof DeleteImageValidationSchema
>;
