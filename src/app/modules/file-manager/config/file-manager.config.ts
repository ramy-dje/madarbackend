import { Logger } from '@nestjs/common';
import { registerAs } from '@nestjs/config';
import { z } from 'zod';

// Define the Zod schema for validation
const fileManagerConfigSchema = z.object({
  apiUrl: z.string().url(),
  appId: z.string().min(1),
  appSecret: z.string().min(1),
  tokenExpiryBuffer: z.coerce.number().int().positive().default(300), // Default to 300 seconds
});

// Define the TypeScript interface based on the schema
export type FileManagerConfig = z.infer<typeof fileManagerConfigSchema>;

export default registerAs('fileManager', (): FileManagerConfig => {
  const logger = new Logger('FileManagerConfig');
  const config = {
    apiUrl: process.env.FILE_MANAGER_API_URL,
    appId: process.env.FILE_MANAGER_APP_ID,
    appSecret: process.env.FILE_MANAGER_APP_SECRET,
    tokenExpiryBuffer: process.env.FILE_MANAGER_TOKEN_EXPIRY_BUFFER,
  };

  // Validate the configuration using the Zod schema
  const validationResult = fileManagerConfigSchema.safeParse(config);

  if (!validationResult.success) {
    // Log the validation errors
    logger.error(
      '❌ Invalid File Manager Configuration:',
      validationResult.error.flatten().fieldErrors,
    );
    throw new Error('Invalid File Manager configuration.');
  }

  // Remove trailing slash from apiUrl if present
  if (validationResult.data.apiUrl.endsWith('/')) {
    validationResult.data.apiUrl = validationResult.data.apiUrl.slice(0, -1);
  }

  logger.log('✅ File Manager Configuration Loaded Successfully.');

  return validationResult.data;
});
