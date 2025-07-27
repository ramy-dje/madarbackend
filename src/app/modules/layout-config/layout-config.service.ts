import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { LayoutConfig } from './schemas/layout-config.schema';
import { Widget } from './schemas/widget.schema';
import { CreateLayoutConfigDto } from './dto/create-layout-config.dto';
import { UpdateLayoutConfigDto } from './dto/update-layout-config.dto';
import { LayoutConfigQueryDto } from './dto/layout-config-query.dto';
import { LayoutType, ContentType, WidgetType } from '../../shared/enums/layout-type.enum';
import { LayoutPreviewData, WidgetTemplate } from '../../shared/interfaces/layout-config.interface';

@Injectable()
export class LayoutConfigService {
  constructor(
    @InjectModel(LayoutConfig.name) private layoutConfigModel: Model<LayoutConfig>,
    @InjectModel(Widget.name) private widgetModel: Model<Widget>,
  ) {}

  async create(createLayoutConfigDto: CreateLayoutConfigDto, authorId: Types.ObjectId): Promise<LayoutConfig> {
    // If this is set as default, unset other defaults
    if (createLayoutConfigDto.isDefault) {
      await this.layoutConfigModel.updateMany(
        { isDefault: true },
        { $set: { isDefault: false } }
      );
    }

    const layoutConfig = new this.layoutConfigModel({
      ...createLayoutConfigDto,
      author: authorId,
    });

    return layoutConfig.save();
  }

  async findAll(query: LayoutConfigQueryDto): Promise<{ data: LayoutConfig[]; total: number; page: number; limit: number }> {
    const { page = 1, limit = 10, search, isDefault, isActive, layoutType, contentType, author, sortBy = 'createdAt', sortOrder = 'desc' } = query;

    const filter: any = {};

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    if (isDefault !== undefined) filter.isDefault = isDefault;
    if (isActive !== undefined) filter.isActive = isActive;
    if (author) filter.author = new Types.ObjectId(author);

    if (layoutType || contentType) {
      filter['contentTypes'] = { $elemMatch: {} };
      if (layoutType) filter['contentTypes.$elemMatch.layout.layoutType'] = layoutType;
      if (contentType) filter['contentTypes.$elemMatch.contentType'] = contentType;
    }

    const total = await this.layoutConfigModel.countDocuments(filter);
    const data = await this.layoutConfigModel
      .find(filter)
      .populate('author', 'profileInfo.fullName profileInfo.username')
      .sort({ [sortBy]: sortOrder === 'desc' ? -1 : 1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .exec();

    return { data, total, page, limit };
  }

  async findOne(id: string): Promise<LayoutConfig> {
    const layoutConfig = await this.layoutConfigModel
      .findById(id)
      .populate('author', 'profileInfo.fullName profileInfo.username')
      .exec();

    if (!layoutConfig) {
      throw new NotFoundException(`Layout configuration with ID ${id} not found`);
    }

    return layoutConfig;
  }

  async findByContentType(contentType: string): Promise<LayoutConfig | null> {
    return this.layoutConfigModel
      .findOne({
        isActive: true,
        'contentTypes.contentType': contentType,
        'contentTypes.isActive': true,
      })
      .populate('author', 'profileInfo.fullName profileInfo.username')
      .exec();
  }

  async getDefaultLayout(): Promise<LayoutConfig | null> {
    return this.layoutConfigModel
      .findOne({ isDefault: true, isActive: true })
      .populate('author', 'profileInfo.fullName profileInfo.username')
      .exec();
  }

  async update(id: string, updateLayoutConfigDto: UpdateLayoutConfigDto, authorId: Types.ObjectId): Promise<LayoutConfig> {
    const layoutConfig = await this.layoutConfigModel.findById(id);
    if (!layoutConfig) {
      throw new NotFoundException(`Layout configuration with ID ${id} not found`);
    }

    // If this is set as default, unset other defaults
    if (updateLayoutConfigDto.isDefault) {
      await this.layoutConfigModel.updateMany(
        { _id: { $ne: id }, isDefault: true },
        { $set: { isDefault: false } }
      );
    }

    const updatedLayoutConfig = await this.layoutConfigModel
      .findByIdAndUpdate(
        id,
        { ...updateLayoutConfigDto, author: authorId },
        { new: true }
      )
      .populate('author', 'profileInfo.fullName profileInfo.username');

    return updatedLayoutConfig;
  }

  async remove(id: string): Promise<void> {
    const layoutConfig = await this.layoutConfigModel.findById(id);
    if (!layoutConfig) {
      throw new NotFoundException(`Layout configuration with ID ${id} not found`);
    }

    if (layoutConfig.isDefault) {
      throw new BadRequestException('Cannot delete the default layout configuration');
    }

    await this.layoutConfigModel.findByIdAndDelete(id);
  }

  async setDefault(id: string): Promise<LayoutConfig> {
    const layoutConfig = await this.layoutConfigModel.findById(id);
    if (!layoutConfig) {
      throw new NotFoundException(`Layout configuration with ID ${id} not found`);
    }

    // Unset other defaults
    await this.layoutConfigModel.updateMany(
      { _id: { $ne: id } },
      { $set: { isDefault: false } }
    );

    // Set this as default
    layoutConfig.isDefault = true;
    return layoutConfig.save();
  }

  async getLayoutPreview(contentType: string): Promise<LayoutPreviewData> {
    const layoutConfig = await this.findByContentType(contentType);
    if (!layoutConfig) {
      throw new NotFoundException(`No layout configuration found for content type: ${contentType}`);
    }

    const contentTypeConfig = layoutConfig.contentTypes.find(ct => ct.contentType === contentType);
    if (!contentTypeConfig) {
      throw new NotFoundException(`No layout configuration found for content type: ${contentType}`);
    }

    const { layout } = contentTypeConfig;
    const hasSidebar = layout.layoutType !== LayoutType.FULL_WIDTH;
    const sidebarPosition = layout.sidebar?.position;
    const widgetCount = layout.sidebar?.widgets?.length || 0;

    return {
      contentType,
      layoutType: layout.layoutType,
      displayStyle: layout.displayStyle,
      navigationStyle: layout.navigationStyle,
      hasSidebar,
      sidebarPosition,
      widgetCount,
    };
  }

  async getWidgetTemplates(): Promise<WidgetTemplate[]> {
    return [
      {
        type: WidgetType.RECENT_POSTS,
        name: 'Recent Posts',
        description: 'Display recent blog posts',
        defaultSettings: { count: 5, showThumbnail: true, showDate: true },
        icon: '📝',
        category: 'content',
      },
      {
        type: WidgetType.CATEGORIES,
        name: 'Categories',
        description: 'Display content categories',
        defaultSettings: { showCount: true, hierarchical: true },
        icon: '📂',
        category: 'navigation',
      },
      {
        type: WidgetType.TAGS,
        name: 'Tags',
        description: 'Display content tags',
        defaultSettings: { showCount: true, limit: 20 },
        icon: '🏷️',
        category: 'navigation',
      },
      {
        type: WidgetType.ABOUT_US,
        name: 'About Us',
        description: 'Display company information',
        defaultSettings: { showLogo: true, showDescription: true },
        icon: 'ℹ️',
        category: 'content',
      },
      {
        type: WidgetType.TEXT,
        name: 'Text Widget',
        description: 'Custom text content',
        defaultSettings: { content: '', allowHtml: false },
        icon: '📄',
        category: 'content',
      },
      {
        type: WidgetType.IMAGE,
        name: 'Image Widget',
        description: 'Display an image',
        defaultSettings: { imageUrl: '', altText: '', link: '' },
        icon: '🖼️',
        category: 'content',
      },
      {
        type: WidgetType.BUTTON,
        name: 'Button Widget',
        description: 'Display a call-to-action button',
        defaultSettings: { text: 'Click Here', url: '', style: 'primary' },
        icon: '🔘',
        category: 'utility',
      },
      {
        type: WidgetType.HTML,
        name: 'HTML Widget',
        description: 'Custom HTML content',
        defaultSettings: { html: '' },
        icon: '💻',
        category: 'custom',
      },
      {
        type: WidgetType.SHARE_BUTTONS,
        name: 'Share Buttons',
        description: 'Social media share buttons',
        defaultSettings: { platforms: ['facebook', 'twitter', 'linkedin'], showCount: true },
        icon: '📤',
        category: 'social',
      },
      {
        type: WidgetType.SEARCH,
        name: 'Search Widget',
        description: 'Content search functionality',
        defaultSettings: { placeholder: 'Search...', showButton: true },
        icon: '🔍',
        category: 'utility',
      },
      {
        type: WidgetType.NEWSLETTER,
        name: 'Newsletter Signup',
        description: 'Email newsletter subscription',
        defaultSettings: { title: 'Subscribe', description: 'Get updates', buttonText: 'Subscribe' },
        icon: '📧',
        category: 'utility',
      },
      {
        type: WidgetType.SOCIAL_LINKS,
        name: 'Social Links',
        description: 'Social media profile links',
        defaultSettings: { platforms: ['facebook', 'twitter', 'instagram', 'linkedin'] },
        icon: '🌐',
        category: 'social',
      },
    ];
  }

  async createWidget(widgetData: any, authorId: Types.ObjectId): Promise<Widget> {
    const widget = new this.widgetModel({
      ...widgetData,
      author: authorId,
    });

    return widget.save();
  }

  async getWidgets(): Promise<Widget[]> {
    return this.widgetModel
      .find()
      .populate('author', 'profileInfo.fullName profileInfo.username')
      .sort({ order: 1, createdAt: -1 })
      .exec();
  }

  async updateWidget(id: string, widgetData: any): Promise<Widget> {
    const widget = await this.widgetModel.findByIdAndUpdate(id, widgetData, { new: true });
    if (!widget) {
      throw new NotFoundException(`Widget with ID ${id} not found`);
    }
    return widget;
  }

  async deleteWidget(id: string): Promise<void> {
    const widget = await this.widgetModel.findByIdAndDelete(id);
    if (!widget) {
      throw new NotFoundException(`Widget with ID ${id} not found`);
    }
  }
} 