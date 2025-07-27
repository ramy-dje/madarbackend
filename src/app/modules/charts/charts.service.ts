import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CreateChartDto } from './dto/create-chart.dto';
import { UpdateChartDto } from './dto/update-chart.dto';
import { Chart, ChartDocument } from './schemas/chart.schema';
import { Status } from 'src/app/shared/enums/status.enum';

@Injectable()
export class ChartsService {
  constructor(
    @InjectModel(Chart.name) private chartModel: Model<ChartDocument>,
  ) {}

  async create(createChartDto: CreateChartDto, userId?: string): Promise<Chart> {
    const chartData = {
      ...createChartDto,
      ...(userId && { author: new Types.ObjectId(userId) })
    };

    const createdChart = new this.chartModel(chartData);
    const savedChart = await createdChart.save();
    
    return this.chartModel
      .findById(savedChart._id)
      .populate('author', 'profileInfo.fullName profileInfo.email profileInfo.pic')
      .exec();
  }

  async findAll(query: any = {}): Promise<Chart[]> {
    return this.chartModel
      .find({ ...query, status: { $ne: Status.TRASH } })
      .populate('author', 'profileInfo.fullName profileInfo.email profileInfo.pic')
      .exec();
  }

  async findOne(id: string): Promise<Chart> {
    const chart = await this.chartModel
      .findOne({ _id: id, status: { $ne: Status.TRASH } })
      .populate('author', 'profileInfo.fullName profileInfo.email profileInfo.pic')
      .exec();
    if (!chart) {
      throw new NotFoundException(`Chart with ID ${id} not found`);
    }
    return chart;
  }

  async update(id: string, updateChartDto: UpdateChartDto, userId?: string): Promise<Chart> {
    const updateData = {
      ...updateChartDto,
      ...(userId && { author: new Types.ObjectId(userId) })
    };

    const updatedChart = await this.chartModel
      .findByIdAndUpdate(id, updateData, { new: true })
      .populate('author', 'profileInfo.fullName profileInfo.email profileInfo.pic')
      .exec();
    if (!updatedChart) {
      throw new NotFoundException(`Chart with ID ${id} not found`);
    }
    return updatedChart;
  }

  async remove(id: string): Promise<void> {
    const result = await this.chartModel
      .findByIdAndUpdate(id, { status: Status.TRASH }, { new: true })
      .exec();
    if (!result) {
      throw new NotFoundException(`Chart with ID ${id} not found`);
    }
  }

  async permanentlyDelete(id: string): Promise<void> {
    const chart = await this.chartModel.findById(id).exec();
    if (!chart) {
      throw new NotFoundException(`Chart with ID ${id} not found`);
    }
    
    if (chart.status !== Status.TRASH) {
      throw new BadRequestException('Chart must be in trash before it can be permanently deleted');
    }

    await this.chartModel.findByIdAndDelete(id).exec();
  }

  async restore(id: string): Promise<Chart> {
    const chart = await this.chartModel.findById(id).exec();
    if (!chart) {
      throw new NotFoundException(`Chart with ID ${id} not found`);
    }
    
    if (chart.status !== Status.TRASH) {
      throw new BadRequestException('Chart must be in trash to be restored');
    }

    const restoredChart = await this.chartModel
      .findByIdAndUpdate(id, { status: Status.DRAFT }, { new: true })
      .populate('author', 'profileInfo.fullName profileInfo.email profileInfo.pic')
      .exec();

    return restoredChart;
  }

  async findTrashed(): Promise<Chart[]> {
    return this.chartModel
      .find({ status: Status.TRASH })
      .populate('author', 'profileInfo.fullName profileInfo.email profileInfo.pic')
      .sort({ updatedAt: -1 })
      .exec();
  }
}
