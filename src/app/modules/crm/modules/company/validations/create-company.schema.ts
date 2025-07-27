import { z } from 'zod';

// create company zod validation schema
export const Create_Company_ValidationSchema = z
  .object({
    info: z
      .object({
        name: z.string().min(1),

        logo: z.string(),

        size: z.enum([
          '1',
          '1-10',
          '11-50',
          '51-200',
          '201-500',
          '501-1000',
          '1001-5000',
          '5001-10,000',
          '10,001',
        ]),

        description: z.string(),

        location: z
          .object({
            country: z.string().optional(),
            state: z.string().optional(),
            city: z.string().optional(),
            zipcode: z.string().optional(),
            region: z.string().optional(),
            address: z.string().optional(),
          })
          .optional(),
      })
      .strict(),

    // emails
    emails: z.array(z.string().email('Email Is not valid')),

    // phone numbers
    phoneNumbers: z
      .object({
        mobile: z.array(z.string()),
        fax: z.array(z.string()),
        whatsapp: z.array(z.string()),
        direct_line: z.array(z.string()),
        viber: z.array(z.string()),
      })
      .strict(),

    // identification
    identificationDetails: z
      .object({
        TIN: z.string(),
        CRN: z.string(),
        TAX_Code: z.string(),
        Statistical_Code: z.string(),
      })
      .strict(),

    // social media accounts
    socialMedia: z
      .object({
        website: z.array(z.string()),
        linkedin: z.array(z.string()),
        facebook: z.array(z.string()),
        instagram: z.array(z.string()),
        youtube: z.array(z.string()),
        other: z.array(z.string()),
      })
      .strict(),

    // work & department info
    category: z.string(),
    industry: z.string(),

    // resource
    resource: z.string(),
  })
  .strict();

export type Create_Company_ValidationSchemaType = z.infer<
  typeof Create_Company_ValidationSchema
>;
