import { z } from 'zod';

export const Create_Contact_ValidationSchema = z
  .object({
    personalInfo: z.object({
      firstName: z.string().min(1, 'firstName must be at least 1 character'),
      lastName: z.string().min(1, 'firstName must be at least 1 character'),
      pic: z.string(),
      location: z
        .object({
          country: z.string().optional(),
          address: z.string().optional(),
          state: z.string().optional(),
          city: z.string().optional(),
          zipcode: z.string().optional(),
        })
        .optional(),
      gender: z.enum(['male', 'female']),
    }),
    // bio
    bio: z.string(),
    // emails
    emails: z.array(z.string().email('Email Is not valid')),
    // phone numbers
    phoneNumbers: z.object({
      mobile: z.array(z.string()),
      fax: z.array(z.string()),
      whatsapp: z.array(z.string()),
      viber: z.array(z.string()),
    }),

    // social media accounts
    socialMedia: z.object({
      facebook: z.array(z.string()),
      instagram: z.array(z.string()),
      telegram: z.array(z.string()),
      youtube: z.array(z.string()),
      linkedin: z.array(z.string()),
      twitter: z.array(z.string()),
      tiktok: z.array(z.string()),
      pinterest: z.array(z.string()),
      snapchat: z.array(z.string()),
      reddit: z.array(z.string()),
      twitch: z.array(z.string()),
      other: z.array(z.string()),
    }),

    // work
    work: z.object({
      occupation: z.string(),
      company: z.string(),
      industry: z.string(),
    }),

    // access (user id)
    access: z.string().or(z.null()).optional(),

    // resource
    resource: z.string(),
  })
  .strict();

export type Create_Contact_ValidationSchemaType = z.infer<
  typeof Create_Contact_ValidationSchema
>;
