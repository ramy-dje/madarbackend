import { z } from 'zod';

export const ServerUserTokensValidationSchema = z
  .object({
    access_token: z.string(),
    refresh_token: z.string(),
  })
  .required();

export type ServerUserTokensValidationSchemaType = z.infer<
  typeof ServerUserTokensValidationSchema
>;
