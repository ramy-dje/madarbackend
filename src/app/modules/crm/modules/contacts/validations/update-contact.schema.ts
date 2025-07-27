import { z } from 'zod';

export const Update_Contact_ValidationSchema = z
  .object({
    personalInfo: z
      .object({
        firstName: z
          .string()
          .min(1, 'firstName must be at least 1 character')
          .optional(),
        lastName: z
          .string()
          .min(1, 'firstName must be at least 1 character')
          .optional(),
        pic: z.string().optional(),
        location: z
          .object({
            country: z.string().optional(),
            state: z.string().optional(),
            address: z.string().optional(),
            city: z.string().optional(),
            zipcode: z.string().optional(),
          })
          .optional(),
        gender: z.enum(['male', 'female']).optional(),
      })
      .optional(),
    // bio
    bio: z.string().optional(),
    // emails
    emails: z.array(z.string().email('Email Is not valid')).optional(),
    // phone numbers
    phoneNumbers: z
      .object({
        mobile: z.array(z.string()).optional(),
        fax: z.array(z.string()).optional(),
        whatsapp: z.array(z.string()).optional(),
        viber: z.array(z.string()).optional(),
      })
      .optional(),

    // social media accounts
    socialMedia: z
      .object({
        facebook: z.array(z.string()).optional(),
        instagram: z.array(z.string()).optional(),
        telegram: z.array(z.string()).optional(),
        youtube: z.array(z.string()).optional(),
        linkedin: z.array(z.string()).optional(),
        twitter: z.array(z.string()).optional(),
        tiktok: z.array(z.string()).optional(),
        pinterest: z.array(z.string()).optional(),
        snapchat: z.array(z.string()).optional(),
        reddit: z.array(z.string()).optional(),
        twitch: z.array(z.string()).optional(),
        other: z.array(z.string()).optional(),
      })
      .optional(),

    // work
    work: z
      .object({
        occupation: z.string().optional(),
        company: z.string().optional(),
        industry: z.string().optional(),
      })
      .optional(),

    // access (user id)
    access: z.string().optional().or(z.null()),

    // resource
    resource: z.string().optional(),
  })
  .strict();

export type Update_Contact_ValidationSchemaType = z.infer<
  typeof Update_Contact_ValidationSchema
>;
