// forms.module.ts
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { FormsController } from './forms.controller';
import { FormsService } from './forms.service';
import { Form, FormSchema } from './schemas/form.schema';
import { FormSubmission, FormSubmissionSchema } from './schemas/form-submission.schema';
import { FormSubmissionsController } from './form-submissions.controller';
import { FormSubmissionsService } from './form-submissions.service';
import { UserSchema } from '../user/schemas/user.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Form.name, schema: FormSchema },
      { name: FormSubmission.name, schema: FormSubmissionSchema },
      { name: 'Users', schema: UserSchema },
    ]),
  ],
  controllers: [FormsController, FormSubmissionsController],
  providers: [FormsService, FormSubmissionsService],
  exports: [FormsService, FormSubmissionsService],
})
export class FormsModule {}