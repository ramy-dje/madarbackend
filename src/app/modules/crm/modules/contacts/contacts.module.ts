import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ContactSchema } from './schemas/contact.schema';
import { ContactsService } from './services/contacts.service';
import { ContactsController } from './controllers/contacts.controller';
import { IndustrySchema } from '../industry/schemas/industry.schema';
import { IndustryService } from '../industry/services/industry.service';
import { OccupationSchema } from '../occupation/schemas/occupation.schema';
import { OccupationService } from '../occupation/services/occupation.service';
import { UserSchema } from 'src/app/modules/user/schemas/user.schema';
import { UserModule } from 'src/app/modules/user/user.module';
import { AuthModule } from 'src/app/modules/auth/auth.module';
import { AuthService } from 'src/app/modules/auth/services/auth.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      // contact model
      {
        name: 'CRM_Contacts',
        schema: ContactSchema,
      },
      // crm industry
      {
        name: 'CRM_Industries',
        schema: IndustrySchema,
      },
      // crm occupation model
      {
        name: 'CRM_Occupations',
        schema: OccupationSchema,
      },
      // user schema model
      {
        name: 'Users',
        schema: UserSchema,
      },
    ]),
    // user module
    forwardRef(() => UserModule),
    // auth module
    forwardRef(() => AuthModule),
  ],
  providers: [AuthService, ContactsService, IndustryService, OccupationService],
  controllers: [ContactsController],
})
export class ContactsModule {}
