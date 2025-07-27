import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { FormSubmission, FormSubmissionDocument } from './schemas/form-submission.schema';
import { CreateFormSubmissionDto } from './dto/create-form-submission.dto';
import { FormsService } from './forms.service';

@Injectable()
export class FormSubmissionsService {
  constructor(
    @InjectModel(FormSubmission.name) private formSubmissionModel: Model<FormSubmissionDocument>,
    private formsService: FormsService,
  ) {}

  async create(createFormSubmissionDto: CreateFormSubmissionDto): Promise<FormSubmission> {
    // Validate form exists
    await this.formsService.findOne(createFormSubmissionDto.formId);

    // Validate form data
    const validation = await this.formsService.validateFormData(
      createFormSubmissionDto.formId,
      createFormSubmissionDto.data,
    );

    if (!validation.valid) {
      throw new BadRequestException({
        message: 'Form validation failed',
        errors: validation.errors,
      });
    }

    const submission = new this.formSubmissionModel({
      ...createFormSubmissionDto,
      formId: new Types.ObjectId(createFormSubmissionDto.formId),
      userId: createFormSubmissionDto.userId ? new Types.ObjectId(createFormSubmissionDto.userId) : undefined,
    });

    return submission.save();
  }

  async findAll(formId?: string, query?: any): Promise<FormSubmission[]> {
    const filter: any = {};
    
    if (formId) {
      if (!Types.ObjectId.isValid(formId)) {
        throw new BadRequestException('Invalid form ID');
      }
      filter.formId = new Types.ObjectId(formId);
    }
    
    if (query?.status) {
      filter.status = query.status;
    }

    if (query?.userId) {
      if (!Types.ObjectId.isValid(query.userId)) {
        throw new BadRequestException('Invalid user ID');
      }
      filter.userId = new Types.ObjectId(query.userId);
    }

    return this.formSubmissionModel
      .find(filter)
      .populate('formId', 'name title')
      .populate('userId', 'name email')
      .sort({ createdAt: -1 })
      .exec();
  }

  async findOne(id: string): Promise<FormSubmission> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid submission ID');
    }

    const submission = await this.formSubmissionModel
      .findById(id)
      .populate('formId', 'name title fields')
      .populate('userId', 'name email')
      .exec();
    
    if (!submission) {
      throw new NotFoundException('Form submission not found');
    }
    
    return submission;
  }

  async updateStatus(id: string, status: string): Promise<FormSubmission> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid submission ID');
    }

    const validStatuses = ['submitted', 'reviewed', 'processed', 'archived'];
    if (!validStatuses.includes(status)) {
      throw new BadRequestException('Invalid status');
    }

    const updatedSubmission = await this.formSubmissionModel
      .findByIdAndUpdate(id, { status }, { new: true })
      .populate('formId', 'name title')
      .populate('userId', 'name email')
      .exec();
    
    if (!updatedSubmission) {
      throw new NotFoundException('Form submission not found');
    }
    
    return updatedSubmission;
  }

  async remove(id: string): Promise<void> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid submission ID');
    }

    const result = await this.formSubmissionModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException('Form submission not found');
    }
  }

  async getSubmissionsByDateRange(formId: string, startDate: Date, endDate: Date): Promise<FormSubmission[]> {
    if (!Types.ObjectId.isValid(formId)) {
      throw new BadRequestException('Invalid form ID');
    }

    return this.formSubmissionModel
      .find({
        formId: new Types.ObjectId(formId),
        createdAt: {
          $gte: startDate,
          $lte: endDate,
        },
      })
      .populate('userId', 'name email')
      .sort({ createdAt: -1 })
      .exec();
  }

  async getSubmissionStats(formId: string): Promise<any> {
    if (!Types.ObjectId.isValid(formId)) {
      throw new BadRequestException('Invalid form ID');
    }

    const stats = await this.formSubmissionModel.aggregate([
      { $match: { formId: new Types.ObjectId(formId) } },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          submitted: { $sum: { $cond: [{ $eq: ['$status', 'submitted'] }, 1, 0] } },
          reviewed: { $sum: { $cond: [{ $eq: ['$status', 'reviewed'] }, 1, 0] } },
          processed: { $sum: { $cond: [{ $eq: ['$status', 'processed'] }, 1, 0] } },
          archived: { $sum: { $cond: [{ $eq: ['$status', 'archived'] }, 1, 0] } },
        },
      },
    ]);

    return stats[0] || { total: 0, submitted: 0, reviewed: 0, processed: 0, archived: 0 };
  }
}