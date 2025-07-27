# SEO Setup Guide for Madar CMS

This guide explains how to configure and use the new robust SEO system implemented in Madar CMS.

## 🚀 Features Implemented

### ✅ Core SEO Infrastructure
- **Comprehensive SEO Service**: Centralized SEO management with automatic meta tag generation
- **Slug Generation Service**: Automatic URL-friendly slug creation with duplicate handling
- **Structured Data**: JSON-LD schema.org markup for all content types
- **Social Media Tags**: Open Graph and Twitter Card support
- **Breadcrumb Navigation**: Automatic breadcrumb generation
- **Sitemap Generation**: XML sitemap with content type filtering
- **Robots.txt**: Configurable robots.txt endpoint

### ✅ Content Type Support
- **Posts**: Blog articles with multilingual support
- **Services**: Service pages with structured data
- **Portfolio**: Portfolio items with creative work markup
- **FAQ**: FAQ pages with FAQ schema
- **Tenders**: Tender pages with business markup
- **Categories**: Category pages with taxonomy support

## 🔧 Configuration

### Environment Variables

Add these SEO-related environment variables to your `.env` file:

```env
# SEO Configuration
SEO_DEFAULT_LANGUAGE=en
SEO_SUPPORTED_LANGUAGES=en,ar,fr
SEO_SITE_NAME=Madar CMS
SEO_SITE_URL=https://madar.com
SEO_DEFAULT_ROBOTS=index, follow
SEO_ROBOTS_TXT=User-agent: *\nAllow: /\nDisallow: /admin/\nDisallow: /api/\nSitemap: https://madar.com/api/seo/sitemap.xml
SEO_SITEMAP_ENABLED=true
SEO_STRUCTURED_DATA_ENABLED=true
SEO_DEFAULT_OG_IMAGE=https://madar.com/images/default-og-image.jpg
SEO_LOGO_URL=https://madar.com/images/logo.png
SEO_TWITTER_SITE=@madarcms
SEO_TWITTER_CREATOR=@madarcms
```

### Configuration Options

| Variable | Description | Default |
|----------|-------------|---------|
| `SEO_DEFAULT_LANGUAGE` | Default language for content | `en` |
| `SEO_SUPPORTED_LANGUAGES` | Comma-separated list of supported languages | `en,ar,fr` |
| `SEO_SITE_NAME` | Your website name | `Madar CMS` |
| `SEO_SITE_URL` | Your website URL | `https://madar.com` |
| `SEO_DEFAULT_ROBOTS` | Default robots meta tag | `index, follow` |
| `SEO_ROBOTS_TXT` | Robots.txt content | See example above |
| `SEO_SITEMAP_ENABLED` | Enable sitemap generation | `true` |
| `SEO_STRUCTURED_DATA_ENABLED` | Enable JSON-LD structured data | `true` |
| `SEO_DEFAULT_OG_IMAGE` | Default Open Graph image | `null` |
| `SEO_LOGO_URL` | Your website logo URL | `null` |
| `SEO_TWITTER_SITE` | Twitter site handle | `null` |
| `SEO_TWITTER_CREATOR` | Twitter creator handle | `null` |

## 📡 API Endpoints

### SEO Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/seo/robots.txt` | GET | Serve robots.txt |
| `/api/seo/sitemap.xml` | GET | Generate complete sitemap |
| `/api/seo/sitemap/:type.xml` | GET | Generate sitemap for specific content type |
| `/api/seo/config` | GET | Get SEO configuration |
| `/api/seo/validate` | GET | Validate SEO data for content |

### Content Endpoints with SEO

All content endpoints now support slug-based routing:

| Content Type | Slug Endpoint | Example |
|--------------|---------------|---------|
| Services | `/api/services/slug/:slug` | `/api/services/slug/web-development` |
| Portfolio | `/api/portfolio/slug/:slug` | `/api/portfolio/slug/ecommerce-project` |
| Posts | `/api/v1/posts/slug/:slug` | `/api/v1/posts/slug/getting-started-with-seo` |
| FAQ | `/api/v1/faq/slug/:slug` | `/api/v1/faq/slug/frequently-asked-questions` |
| Tenders | `/api/v1/tenders/slug/:slug` | `/api/v1/tenders/slug/website-development-tender` |

## 📝 Usage Examples

### Creating Content with SEO

```typescript
// Create a service with automatic SEO generation
const serviceData = {
  title: "Web Development Services",
  content: "Professional web development services...",
  // slug will be auto-generated: "web-development-services"
  // seo will be auto-generated with meta tags, social tags, and structured data
};

const service = await servicesService.create(serviceData, userId);
```

### Manual SEO Configuration

```typescript
// Create content with custom SEO
const serviceData = {
  title: "Web Development Services",
  content: "Professional web development services...",
  slug: "custom-web-dev-slug",
  seo: {
    metaTags: {
      title: "Custom SEO Title",
      description: "Custom meta description",
      keywords: ["web development", "programming", "custom"],
      robots: "index, follow",
    },
    socialTags: {
      ogTitle: "Custom OG Title",
      ogDescription: "Custom OG description",
      ogImage: "https://example.com/custom-image.jpg",
    },
  },
};
```

### Accessing SEO Data

```typescript
// Get service with complete SEO data
const service = await servicesService.findBySlug("web-development-services");

// Access SEO data
console.log(service.seo.metaTags.title);
console.log(service.seo.socialTags.ogImage);
console.log(service.seo.structuredData);
console.log(service.seo.breadcrumbs);
```

## 🔍 SEO Validation

The system automatically validates SEO data and provides feedback:

```typescript
// Validate SEO data
const validation = seoService.validateSeoData(seoData);

if (!validation.isValid) {
  console.log("SEO Errors:", validation.errors);
  console.log("SEO Warnings:", validation.warnings);
  console.log("SEO Suggestions:", validation.suggestions);
}
```

## 🗺️ Sitemap Generation

### Complete Sitemap
```
GET /api/seo/sitemap.xml
```

### Content Type Sitemaps
```
GET /api/seo/sitemap/posts.xml
GET /api/seo/sitemap/services.xml
GET /api/seo/sitemap/portfolio.xml
GET /api/seo/sitemap/faq.xml
GET /api/seo/sitemap/tenders.xml
GET /api/seo/sitemap/categories.xml
```

## 🏗️ Architecture

### Core Services

1. **SeoService**: Main SEO service handling meta tags, social tags, structured data, and breadcrumbs
2. **SlugService**: URL-friendly slug generation with duplicate handling
3. **SitemapService**: XML sitemap generation for all content types

### Content Integration

All content types now include:
- **Slug field**: URL-friendly identifier
- **SEO object**: Complete SEO data structure
- **Automatic generation**: SEO data generated automatically if not provided
- **Slug-based routing**: Content accessible via slug URLs

### Database Schema

Each content type now has:
```typescript
{
  slug: string; // Required, unique
  seo: {
    metaTags: {
      title: string;
      description: string;
      keywords: string[];
      canonicalUrl: string;
      robots: string;
      author?: string;
      language?: string;
    };
    socialTags: {
      ogTitle: string;
      ogDescription: string;
      ogImage: string;
      ogType: string;
      ogUrl: string;
      // ... more social tags
    };
    structuredData?: object; // JSON-LD schema.org markup
    breadcrumbs?: Array<{
      name: string;
      url: string;
      position: number;
    }>;
    alternateLanguages?: Record<string, string>;
  };
}
```

## 🚀 Next Steps

### Phase 2 Features (Future Implementation)
- **SEO Analytics**: Track SEO performance metrics
- **Keyword Tracking**: Monitor keyword rankings
- **Search Console Integration**: Google Search Console API integration
- **Image Optimization**: Automatic image optimization for social media
- **RSS Feeds**: Generate RSS feeds for content
- **Advanced Caching**: SEO-specific caching strategies
- **Breadcrumb Management**: Advanced breadcrumb customization
- **Canonical URL Management**: Advanced canonical URL handling

### Performance Optimizations
- **Caching**: Implement Redis caching for SEO data
- **CDN Integration**: Serve sitemaps and robots.txt via CDN
- **Compression**: Gzip compression for sitemaps
- **Lazy Loading**: Optimize image loading for social media

## 📚 Best Practices

1. **Always provide unique slugs** for better URL structure
2. **Use descriptive titles** for better SEO performance
3. **Include relevant keywords** in meta descriptions
4. **Optimize images** for social media sharing
5. **Regularly update sitemaps** for search engine crawling
6. **Monitor SEO validation** for content quality
7. **Use structured data** for rich search results
8. **Implement breadcrumbs** for better navigation

## 🔧 Troubleshooting

### Common Issues

1. **Slug conflicts**: The system automatically handles duplicates by appending numbers
2. **Missing SEO data**: SEO data is generated automatically if not provided
3. **Invalid slugs**: Use the slug validation service to check slug format
4. **Sitemap errors**: Check that content has proper status and slugs

### Validation

Use the SEO validation endpoint to check content:
```
GET /api/seo/validate?content={"type":"service","title":"Test","slug":"test"}
```

This will return validation results with errors, warnings, and suggestions. 