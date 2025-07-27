import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Form, FormDocument } from './schemas/form.schema';
import { CreateFormDto } from './dto/create-form.dto';
import { UpdateFormDto } from './dto/update-form.dto';
import { AuthenticatedUserRequestInterInterface } from '../auth/interfaces/authenticated-user-request.interface';
import { Status } from 'src/app/shared/enums/status.enum';

@Injectable()
export class FormsService {
  constructor(
    @InjectModel(Form.name) private formModel: Model<FormDocument>,
  ) {}

  async create(createFormDto: CreateFormDto, userId?: string): Promise<Form> {
    // Check if form with the same name already exists
    const existingForm = await this.formModel.findOne({ name: createFormDto.name });
    if (existingForm) {
      throw new BadRequestException('Form with this name already exists');
    }

    const formData = {
      ...createFormDto,
      ...(userId && { author: new Types.ObjectId(userId) })
    };

    const createdForm = new this.formModel(formData);
    const savedForm = await createdForm.save();
    
    return this.formModel
      .findById(savedForm._id)
      .populate('author', 'profileInfo.fullName profileInfo.email profileInfo.pic')
      .exec();
  }

  async findAll(query?: any): Promise<Form[]> {
    const filter = {};
    
    if (query?.active !== undefined) {
      filter['active'] = query.active === 'true';
    }
    
    if (query?.search) {
      filter['$or'] = [
        { name: { $regex: query.search, $options: 'i' } },
        { title: { $regex: query.search, $options: 'i' } },
        { description: { $regex: query.search, $options: 'i' } },
      ];
    }

    return this.formModel
      .find({ ...filter, status: { $ne: Status.TRASH } })
      .populate('author', 'profileInfo.fullName profileInfo.email profileInfo.pic')
      .sort({ createdAt: -1 })
      .exec();
  }

  async findOne(id: string): Promise<Form> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid form ID');
    }

    const form = await this.formModel
      .findOne({ _id: id, status: { $ne: Status.TRASH } })
      .populate('author', 'name email')
      .exec();
    
    if (!form) {
      throw new NotFoundException('Form not found');
    }
    
    return form;
  }

  async findByName(name: string): Promise<Form> {
    const form = await this.formModel
      .findOne({ name, active: true })
      .populate('author', 'name email')
      .exec();
    
    if (!form) {
      throw new NotFoundException('Form not found');
    }
    
    return form;
  }

  async update(id: string, updateFormDto: UpdateFormDto, userId?: string): Promise<Form> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid form ID');
    }

    // If updating name, check for duplicates
    if (updateFormDto.name) {
      const existingForm = await this.formModel.findOne({ 
        name: updateFormDto.name, 
        _id: { $ne: id } 
      });
      if (existingForm) {
        throw new BadRequestException('Form with this name already exists');
      }
    }

    const updateData = {
      ...updateFormDto,
      ...(userId && { author: new Types.ObjectId(userId) })
    };

    const updatedForm = await this.formModel
      .findByIdAndUpdate(id, updateData, { new: true })
      .populate('author', 'profileInfo.fullName profileInfo.email profileInfo.pic')
      .exec();
    
    if (!updatedForm) {
      throw new NotFoundException('Form not found');
    }
    
    return updatedForm;
  }

  async remove(id: string): Promise<void> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid form ID');
    }

    const result = await this.formModel
      .findByIdAndUpdate(id, { status: Status.TRASH }, { new: true })
      .exec();
    if (!result) {
      throw new NotFoundException('Form not found');
    }
  }

  async permanentlyDelete(id: string): Promise<void> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid form ID');
    }

    const form = await this.formModel.findById(id).exec();
    if (!form) {
      throw new NotFoundException('Form not found');
    }
    
    if (form.status !== Status.TRASH) {
      throw new BadRequestException('Form must be in trash before it can be permanently deleted');
    }

    await this.formModel.findByIdAndDelete(id).exec();
  }

  async restore(id: string): Promise<Form> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid form ID');
    }

    const form = await this.formModel.findById(id).exec();
    if (!form) {
      throw new NotFoundException('Form not found');
    }
    
    if (form.status !== Status.TRASH) {
      throw new BadRequestException('Form must be in trash to be restored');
    }

    const restoredForm = await this.formModel
      .findByIdAndUpdate(id, { status: Status.DRAFT }, { new: true })
      .populate('author', 'name email')
      .exec();

    return restoredForm;
  }

  async findTrashed(): Promise<Form[]> {
    return this.formModel
      .find({ status: Status.TRASH })
      .populate('author', 'name email')
      .sort({ updatedAt: -1 })
      .exec();
  }

  async duplicate(id: string, newName: string): Promise<Form> {
    const originalForm = await this.formModel.findById(id);
    if (!originalForm) throw new NotFoundException('Form not found');

    const duplicatedForm = {
      ...originalForm.toObject(),
      name: newName,
      title: `${originalForm.title} (Copy)`,
      _id: undefined,
      createdAt: undefined,
      updatedAt: undefined,
    };

    return this.create(duplicatedForm);
  }

  async validateFormData(formId: string, data: Record<string, any>): Promise<{ valid: boolean; errors: string[] }> {
    const form = await this.findOne(formId);
    const errors: string[] = [];

    for (const field of form.fields) {
      const value = data[field.name];
      const validation = field.validation;

      if (!validation) continue;

      // Required validation
      if (validation.required && (!value || value === '')) {
        errors.push(`${field.label || field.name} is required`);
        continue;
      }

      if (value !== undefined && value !== null && value !== '') {
        // Min/Max validation for numbers
        if (field.type === 'number' && typeof value === 'number') {
          if (validation.min !== undefined && value < validation.min) {
            errors.push(`${field.label || field.name} must be at least ${validation.min}`);
          }
          if (validation.max !== undefined && value > validation.max) {
            errors.push(`${field.label || field.name} must be at most ${validation.max}`);
          }
        }

        // String length validation
        if (typeof value === 'string') {
          if (validation.minLength && value.length < validation.minLength) {
            errors.push(`${field.label || field.name} must be at least ${validation.minLength} characters`);
          }
          if (validation.maxLength && value.length > validation.maxLength) {
            errors.push(`${field.label || field.name} must be at most ${validation.maxLength} characters`);
          }
        }

        // Pattern validation
        if (validation.pattern && typeof value === 'string') {
          const regex = new RegExp(validation.pattern);
          if (!regex.test(value)) {
            errors.push(`${field.label || field.name} format is invalid`);
          }
        }

        // Email validation
        if (validation.email && typeof value === 'string') {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(value)) {
            errors.push(`${field.label || field.name} must be a valid email`);
          }
        }

        // URL validation
        if (validation.url && typeof value === 'string') {
          try {
            new URL(value);
          } catch {
            errors.push(`${field.label || field.name} must be a valid URL`);
          }
        }
      }
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }
}
