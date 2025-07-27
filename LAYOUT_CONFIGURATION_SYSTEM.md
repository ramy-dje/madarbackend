# Layout Configuration System

A comprehensive layout management system for configuring different content type layouts with sidebar widgets and display options.

## 🏗️ Architecture Overview

The layout configuration system allows you to:
- Configure layouts for different content types (blog, portfolio, services, etc.)
- Manage sidebar widgets with drag-and-drop functionality
- Set display styles (grid, list, masonry)
- Configure navigation styles (pagination, infinite scroll)
- Preview layouts before applying them

## 📁 Module Structure

```
src/app/modules/layout-config/
├── dto/
│   ├── create-layout-config.dto.ts
│   ├── update-layout-config.dto.ts
│   └── layout-config-query.dto.ts
├── schemas/
│   ├── layout-config.schema.ts
│   └── widget.schema.ts
├── layout-config.controller.ts
├── layout-config.service.ts
└── layout-config.module.ts
```

## 🎯 Features

### Layout Types
- **Full Width**: Content spans the full width of the container
- **Left Sidebar**: Sidebar positioned on the left side
- **Right Sidebar**: Sidebar positioned on the right side

### Display Styles
- **Grid**: Posts arranged in a grid layout
- **List**: Posts displayed in a vertical list
- **Masonry**: Pinterest-style masonry layout

### Navigation Styles
- **Pagination**: Traditional page numbers
- **Infinite Scroll**: Load more posts automatically

### Content Types Supported
- Blog Posts (`blog-post`)
- Blog Archive (`blog-archive`)
- Blog Category (`blog-category`)
- Portfolio (`portfolio`)
- Portfolio Archive (`portfolio-archive`)
- Portfolio Category (`portfolio-category`)
- Services (`services`)
- Services Archive (`services-archive`)
- Services Category (`services-category`)
- Tenders (`tenders`)
- Tenders Archive (`tenders-archive`)
- Tenders Category (`tenders-category`)
- FAQ (`faq`)
- FAQ Archive (`faq-archive`)
- FAQ Category (`faq-category`)

## 🧩 Widget System

### Available Widgets

#### Content Widgets
- **Recent Posts**: Display recent blog posts
- **About Us**: Display company information
- **Text Widget**: Custom text content
- **Image Widget**: Display an image

#### Navigation Widgets
- **Categories**: Display content categories
- **Tags**: Display content tags
- **Search**: Content search functionality

#### Social Widgets
- **Share Buttons**: Social media share buttons
- **Social Links**: Social media profile links

#### Utility Widgets
- **Button Widget**: Call-to-action button
- **Newsletter Signup**: Email newsletter subscription
- **HTML Widget**: Custom HTML content

#### Custom Widgets
- **Custom HTML**: Fully customizable HTML content

### Widget Configuration
Each widget supports:
- Custom title
- Order/position
- Active/inactive state
- Custom settings (widget-specific)
- Responsive behavior

## 🚀 API Endpoints

### Layout Configuration Management

#### Create Layout Configuration
```http
POST /api/layout-config
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Blog Layout",
  "description": "Default blog layout with sidebar",
  "contentTypes": [
    {
      "contentType": "blog-post",
      "layout": {
        "layoutType": "right-sidebar",
        "displayStyle": "list",
        "sidebar": {
          "position": "right",
          "width": "300px",
          "sticky": true,
          "showOnMobile": false,
          "widgets": [
            {
              "id": "recent-posts-1",
              "type": "recent-posts",
              "title": "Recent Posts",
              "order": 1,
              "active": true,
              "settings": {
                "count": 5,
                "showThumbnail": true,
                "showDate": true
              }
            }
          ]
        }
      },
      "isActive": true
    }
  ],
  "isDefault": false,
  "isActive": true
}
```

#### Get All Layout Configurations
```http
GET /api/layout-config?page=1&limit=10&search=blog&isActive=true
Authorization: Bearer <token>
```

#### Get Layout Configuration by ID
```http
GET /api/layout-config/:id
Authorization: Bearer <token>
```

#### Update Layout Configuration
```http
PATCH /api/layout-config/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Updated Blog Layout",
  "contentTypes": [...]
}
```

#### Delete Layout Configuration
```http
DELETE /api/layout-config/:id
Authorization: Bearer <token>
```

#### Set Default Layout
```http
PATCH /api/layout-config/:id/set-default
Authorization: Bearer <token>
```

### Content Type Specific Endpoints

#### Get Layout by Content Type
```http
GET /api/layout-config/content-type/:contentType
Authorization: Bearer <token>
```

#### Get Layout Preview
```http
GET /api/layout-config/preview/:contentType
Authorization: Bearer <token>
```

### Widget Management

#### Get Widget Templates
```http
GET /api/layout-config/widget-templates
Authorization: Bearer <token>
```

#### Get All Widgets
```http
GET /api/layout-config/widgets
Authorization: Bearer <token>
```

#### Create Widget
```http
POST /api/layout-config/widgets
Authorization: Bearer <token>
Content-Type: application/json

{
  "type": "recent-posts",
  "title": "Recent Posts",
  "order": 1,
  "active": true,
  "settings": {
    "count": 5,
    "showThumbnail": true,
    "showDate": true
  }
}
```

#### Update Widget
```http
PATCH /api/layout-config/widgets/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Updated Widget Title",
  "settings": {
    "count": 10
  }
}
```

#### Delete Widget
```http
DELETE /api/layout-config/widgets/:id
Authorization: Bearer <token>
```

## 📊 Database Schema

### Layout Configuration Schema
```typescript
{
  name: string;
  description?: string;
  contentTypes: ContentTypeLayoutConfig[];
  isDefault: boolean;
  isActive: boolean;
  author: ObjectId;
  createdAt: Date;
  updatedAt: Date;
}
```

### Widget Schema
```typescript
{
  id: string;
  type: WidgetType;
  title: string;
  order: number;
  active: boolean;
  settings: Record<string, any>;
  author?: ObjectId;
  createdAt: Date;
  updatedAt: Date;
}
```

## 🔐 Permissions

The layout configuration system uses the following permissions:
- `layout_config:create` - Create layout configurations
- `layout_config:read` - Read layout configurations
- `layout_config:update` - Update layout configurations
- `layout_config:delete` - Delete layout configurations

## 🎨 Frontend Integration

### Layout Preview Data
The system provides preview data for frontend rendering:

```typescript
{
  contentType: string;
  layoutType: LayoutType;
  displayStyle?: DisplayStyle;
  navigationStyle?: NavigationStyle;
  hasSidebar: boolean;
  sidebarPosition?: 'left' | 'right';
  widgetCount: number;
}
```

### Widget Templates
Pre-defined widget templates with default settings:

```typescript
{
  type: WidgetType;
  name: string;
  description: string;
  defaultSettings: Record<string, any>;
  icon?: string;
  category: 'content' | 'navigation' | 'social' | 'utility' | 'custom';
}
```

## 🔧 Usage Examples

### Creating a Blog Layout with Sidebar
```typescript
const blogLayout = {
  name: "Blog Layout with Sidebar",
  contentTypes: [
    {
      contentType: "blog-post",
      layout: {
        layoutType: "right-sidebar",
        sidebar: {
          position: "right",
          width: "300px",
          sticky: true,
          widgets: [
            {
              id: "recent-posts",
              type: "recent-posts",
              title: "Recent Posts",
              order: 1,
              active: true,
              settings: { count: 5, showThumbnail: true }
            },
            {
              id: "categories",
              type: "categories",
              title: "Categories",
              order: 2,
              active: true,
              settings: { showCount: true }
            }
          ]
        }
      },
      isActive: true
    }
  ]
};
```

### Creating a Portfolio Grid Layout
```typescript
const portfolioLayout = {
  name: "Portfolio Grid Layout",
  contentTypes: [
    {
      contentType: "portfolio",
      layout: {
        layoutType: "full-width",
        displayStyle: "grid",
        navigationStyle: "pagination"
      },
      isActive: true
    }
  ]
};
```

## 🚀 Next Steps

### Phase 2 Features
- **Layout Templates**: Pre-built layout templates
- **Responsive Breakpoints**: Mobile-specific layouts
- **Theme Integration**: Integration with theme system
- **Layout Analytics**: Track layout performance
- **A/B Testing**: Test different layouts
- **Layout Import/Export**: Share layouts between projects

### Performance Optimizations
- **Layout Caching**: Cache layout configurations
- **Widget Lazy Loading**: Load widgets on demand
- **CDN Integration**: Serve layout assets via CDN
- **Database Indexing**: Optimize layout queries

## 📝 Notes

- Layout configurations are content-type specific
- Only one default layout can exist at a time
- Widgets can be reordered within sidebars
- Layout previews are generated dynamically
- All layout changes require appropriate permissions
- Widget settings are validated against templates 