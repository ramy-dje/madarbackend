import { LayoutType, DisplayStyle, NavigationStyle, WidgetType, ContentType } from '../../../shared/enums/layout-type.enum';

export const defaultLayoutConfigurations = {
  // Blog Layout with Right Sidebar
  blogWithSidebar: {
    name: "Blog Layout with Sidebar",
    description: "Default blog layout with right sidebar containing widgets",
    contentTypes: [
      {
        contentType: ContentType.BLOG_POST,
        layout: {
          layoutType: LayoutType.RIGHT_SIDEBAR,
          sidebar: {
            position: "right",
            width: "300px",
            sticky: true,
            showOnMobile: false,
            widgets: [
              {
                id: "recent-posts-widget",
                type: WidgetType.RECENT_POSTS,
                title: "Recent Posts",
                order: 1,
                active: true,
                settings: {
                  count: 5,
                  showThumbnail: true,
                  showDate: true
                }
              },
              {
                id: "categories-widget",
                type: WidgetType.CATEGORIES,
                title: "Categories",
                order: 2,
                active: true,
                settings: {
                  showCount: true,
                  hierarchical: true
                }
              },
              {
                id: "search-widget",
                type: WidgetType.SEARCH,
                title: "Search",
                order: 3,
                active: true,
                settings: {
                  placeholder: "Search posts...",
                  showButton: true
                }
              }
            ]
          }
        },
        isActive: true
      },
      {
        contentType: ContentType.BLOG_ARCHIVE,
        layout: {
          layoutType: LayoutType.RIGHT_SIDEBAR,
          displayStyle: DisplayStyle.GRID,
          navigationStyle: NavigationStyle.PAGINATION,
          sidebar: {
            position: "right",
            width: "300px",
            sticky: true,
            showOnMobile: false,
            widgets: [
              {
                id: "categories-widget",
                type: WidgetType.CATEGORIES,
                title: "Categories",
                order: 1,
                active: true,
                settings: {
                  showCount: true,
                  hierarchical: true
                }
              },
              {
                id: "tags-widget",
                type: WidgetType.TAGS,
                title: "Tags",
                order: 2,
                active: true,
                settings: {
                  showCount: true,
                  limit: 20
                }
              }
            ]
          }
        },
        isActive: true
      }
    ],
    isDefault: false,
    isActive: true
  },

  // Portfolio Grid Layout
  portfolioGrid: {
    name: "Portfolio Grid Layout",
    description: "Full-width portfolio layout with grid display",
    contentTypes: [
      {
        contentType: ContentType.PORTFOLIO,
        layout: {
          layoutType: LayoutType.FULL_WIDTH,
          displayStyle: DisplayStyle.GRID,
          navigationStyle: NavigationStyle.PAGINATION
        },
        isActive: true
      },
      {
        contentType: ContentType.PORTFOLIO_ARCHIVE,
        layout: {
          layoutType: LayoutType.FULL_WIDTH,
          displayStyle: DisplayStyle.GRID,
          navigationStyle: NavigationStyle.PAGINATION
        },
        isActive: true
      }
    ],
    isDefault: false,
    isActive: true
  },

  // Services Layout with Left Sidebar
  servicesWithSidebar: {
    name: "Services Layout with Left Sidebar",
    description: "Services layout with left sidebar for navigation",
    contentTypes: [
      {
        contentType: ContentType.SERVICES,
        layout: {
          layoutType: LayoutType.LEFT_SIDEBAR,
          sidebar: {
            position: "left",
            width: "250px",
            sticky: true,
            showOnMobile: true,
            widgets: [
              {
                id: "services-nav-widget",
                type: WidgetType.CATEGORIES,
                title: "Service Categories",
                order: 1,
                active: true,
                settings: {
                  showCount: true,
                  hierarchical: true
                }
              },
              {
                id: "contact-widget",
                type: WidgetType.BUTTON,
                title: "Contact Us",
                order: 2,
                active: true,
                settings: {
                  text: "Get Quote",
                  url: "/contact",
                  style: "primary"
                }
              }
            ]
          }
        },
        isActive: true
      }
    ],
    isDefault: false,
    isActive: true
  },

  // FAQ Layout
  faqLayout: {
    name: "FAQ Layout",
    description: "FAQ layout with search and categories",
    contentTypes: [
      {
        contentType: ContentType.FAQ,
        layout: {
          layoutType: LayoutType.RIGHT_SIDEBAR,
          sidebar: {
            position: "right",
            width: "280px",
            sticky: true,
            showOnMobile: false,
            widgets: [
              {
                id: "faq-search-widget",
                type: WidgetType.SEARCH,
                title: "Search FAQ",
                order: 1,
                active: true,
                settings: {
                  placeholder: "Search questions...",
                  showButton: true
                }
              },
              {
                id: "faq-categories-widget",
                type: WidgetType.CATEGORIES,
                title: "FAQ Categories",
                order: 2,
                active: true,
                settings: {
                  showCount: true,
                  hierarchical: false
                }
              }
            ]
          }
        },
        isActive: true
      }
    ],
    isDefault: false,
    isActive: true
  },

  // Tenders Layout
  tendersLayout: {
    name: "Tenders Layout",
    description: "Tenders layout with filters and search",
    contentTypes: [
      {
        contentType: ContentType.TENDERS,
        layout: {
          layoutType: LayoutType.LEFT_SIDEBAR,
          displayStyle: DisplayStyle.LIST,
          navigationStyle: NavigationStyle.PAGINATION,
          sidebar: {
            position: "left",
            width: "300px",
            sticky: true,
            showOnMobile: true,
            widgets: [
              {
                id: "tenders-search-widget",
                type: WidgetType.SEARCH,
                title: "Search Tenders",
                order: 1,
                active: true,
                settings: {
                  placeholder: "Search tenders...",
                  showButton: true
                }
              },
              {
                id: "tenders-categories-widget",
                type: WidgetType.CATEGORIES,
                title: "Tender Categories",
                order: 2,
                active: true,
                settings: {
                  showCount: true,
                  hierarchical: true
                }
              }
            ]
          }
        },
        isActive: true
      }
    ],
    isDefault: false,
    isActive: true
  }
};

// Widget templates for common use cases
export const commonWidgetTemplates = {
  recentPosts: {
    type: WidgetType.RECENT_POSTS,
    title: "Recent Posts",
    settings: {
      count: 5,
      showThumbnail: true,
      showDate: true,
      showExcerpt: false
    }
  },
  categories: {
    type: WidgetType.CATEGORIES,
    title: "Categories",
    settings: {
      showCount: true,
      hierarchical: true,
      limit: 10
    }
  },
  search: {
    type: WidgetType.SEARCH,
    title: "Search",
    settings: {
      placeholder: "Search...",
      showButton: true,
      searchIn: ["posts", "pages"]
    }
  },
  aboutUs: {
    type: WidgetType.ABOUT_US,
    title: "About Us",
    settings: {
      showLogo: true,
      showDescription: true,
      showSocialLinks: true
    }
  },
  newsletter: {
    type: WidgetType.NEWSLETTER,
    title: "Newsletter",
    settings: {
      title: "Subscribe",
      description: "Get updates in your inbox",
      buttonText: "Subscribe",
      showPrivacyPolicy: true
    }
  },
  socialLinks: {
    type: WidgetType.SOCIAL_LINKS,
    title: "Follow Us",
    settings: {
      platforms: ["facebook", "twitter", "instagram", "linkedin"],
      showIcons: true,
      showLabels: false
    }
  }
}; 