import { z } from 'zod';

// update company zod validation schema
export const Update_Company_ValidationSchema = z
  .object({
    info: z
      .object({
        name: z.string().min(1).optional(),

        logo: z.string().optional(),

        size: z
          .enum([
            '1',
            '1-10',
            '11-50',
            '51-200',
            '201-500',
            '501-1000',
            '1001-5000',
            '5001-10,000',
            '10,001',
          ])
          .optional(),

        description: z.string().optional(),

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
      .strict()
      .optional(),

    // emails
    emails: z.array(z.string().email('Email Is not valid')).optional(),

    // phone numbers
    phoneNumbers: z
      .object({
        mobile: z.array(z.string()).optional(),
        fax: z.array(z.string()).optional(),
        whatsapp: z.array(z.string()).optional(),
        direct_line: z.array(z.string()).optional(),
        viber: z.array(z.string()).optional(),
      })
      .strict()
      .optional(),

    // identification
    identificationDetails: z
      .object({
        TIN: z.string().optional(),
        CRN: z.string().optional(),
        TAX_Code: z.string().optional(),
        Statistical_Code: z.string().optional(),
      })
      .strict()
      .optional(),

    // social media accounts
    socialMedia: z
      .object({
        website: z.array(z.string()).optional(),
        linkedin: z.array(z.string()).optional(),
        facebook: z.array(z.string()).optional(),
        instagram: z.array(z.string()).optional(),
        youtube: z.array(z.string()).optional(),
        other: z.array(z.string()).optional(),
      })
      .strict()
      .optional(),

    // work & department info
    category: z.string().optional(),
    industry: z.string().optional(),

    // resource
    resource: z.string().optional(),
  })
  .strict();

export type Update_Company_ValidationSchemaType = z.infer<
  typeof Update_Company_ValidationSchema
>;
