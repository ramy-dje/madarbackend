import { Module } from '@nestjs/common';
import { ContactsModule } from './modules/contacts/contacts.module';
import { IndustryModule } from './modules/industry/industry.module';
import { OccupationModule } from './modules/occupation/occupation.module';
import { CRMService } from './services/crm.service';
import { MongooseModule } from '@nestjs/mongoose';
import { ContactSchema } from './modules/contacts/schemas/contact.schema';
import { CategoryModule } from './modules/category/category.module';
import { CompanyModule } from './modules/company/company.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      // contact model
      {
        name: 'CRM_Contacts',
        schema: ContactSchema,
      },
    ]),
    // import the industry module
    IndustryModule,
    // import the occupation module
    OccupationModule,
    // import the category module
    CategoryModule,
    // import the contacts module
    ContactsModule,
    // import the company company
    CompanyModule,
  ],
  providers: [CRMService],
  exports: [CRMService],
})
export class CRMModule {}
