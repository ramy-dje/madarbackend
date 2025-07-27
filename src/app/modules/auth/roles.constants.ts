import { SystemPermissions } from 'src/core/interfaces/system-permissions.interface';

// The Default Roles Permissions

const DefaultSystemRoles: {
  name: string;
  color: string;
  permissions: SystemPermissions[];
}[] = [
  {
    name: 'Admin',
    color: '#339966',
    permissions: [
      // access the dashboard
      'panel:access',

      // account specific permissions
      'user_client:read',
      'user_client:update',
      'reservation-client:read',

      // user
      'user:read',
      'user:create',
      'user:update',
      'user:delete',
      'user:activation',

      // role
      'role:read',
      'role:create',
      'role:update',
      'role:delete',

      // room
      'room:create',
      'room:update',
      'room:delete',
      'room:read',
      'room:force-delete',
      'room:recover',
      // floor
      'floor:create',
      'floor:update',
      'floor:delete',
      'floor:read',

      // crm contacts (subject) : actions
      'crm_contacts:read',
      'crm_contacts:create',
      'crm_contacts:update',
      'crm_contacts:delete',
      // crm company (subject) : actions
      'crm_company:read',
      'crm_company:create',
      'crm_company:update',
      'crm_company:delete',
      // crm category (subject) : actions
      'crm_category:read',
      'crm_category:create',
      'crm_category:update',
      'crm_category:delete',
      // crm industry (subject) : actions
      'crm_industry:read',
      'crm_industry:create',
      'crm_industry:update',
      'crm_industry:delete',
      // crm occupation (subject) : actions
      'crm_occupation:read',
      'crm_occupation:create',
      'crm_occupation:update',
      'crm_occupation:delete',

      // room_bed
      'room_bed:create',
      'room_bed:update',
      'room_bed:delete',
      'room_bed:read',
      // room_type
      'room_type:create',
      'room_type:update',
      'room_type:delete',
      'room_type:read',
      // room_category
      'room_category:create',
      'room_category:update',
      'room_category:delete',
      'room_category:read',
      // room_feature
      'room_feature:create',
      'room_feature:update',
      'room_feature:delete',
      'room_feature:read',
      // room_extra_services
      'room_extra_services:create',
      'room_extra_services:update',
      'room_extra_services:delete',
      'room_extra_services:read',
      // room_include
      'room_include:create',
      'room_include:update',
      'room_include:delete',
      'room_include:read',
      // reservation
      'reservation:read',
      'reservation-client:read',
      'reservation:create',
      'reservation-status:update',
      'reservation:update',
      'reservation:delete',
      // food_menu
      'food_menu:create',
      'food_menu:update',
      'food_menu:delete',
      'food_menu:read',
      // food_type
      'food_type:create',
      'food_type:update',
      'food_type:delete',
      'food_type:read',
      // food_dish
      'food_dish:create',
      'food_dish:update',
      'food_dish:delete',
      'food_dish:read',
      // food_ingredient
      'food_ingredient:create',
      'food_ingredient:update',
      'food_ingredient:delete',
      'food_ingredient:read',
      // job_position
      'job_position:create',
      'job_position:update',
      'job_position:delete',
      'job_position:read',
      // job_department
      'job_department:create',
      'job_department:update',
      'job_department:delete',
      'job_department:read',
      // job_department
      'job_department:create',
      'job_department:update',
      'job_department:delete',
      'job_department:read',
      // job_submission
      'job_submission:create',
      'job_submission:update',
      'job_submission:delete',
      'job_submission:read',
      // destination
      'destination:create',
      'destination:update',
      'destination:delete',
      'destination:read',
      // blog
      'blog:create',
      'blog:update',
      'blog:delete',
      'blog:read',
      // blog_category
      'blog_category:create',
      'blog_category:update',
      'blog_category:delete',
      'blog_category:read',
      // blog_tag
      'blog_tag:create',
      'blog_tag:update',
      'blog_tag:delete',
      'blog_tag:read',

      // analytics (subject) : actions
      'analytics_rooms:read',
      'analytics_jobs:read',
      'analytics_crm_contacts:read',
      'analytics_crm_companies:read',
      'analytics_blogs:read',
      'analytics_destinations:read',
      'analytics_reservations:read',
    ],
  },
  {
    color: '#3366cc',
    name: 'Manager',
    permissions: [
      // access the dashboard
      'panel:access',

      // account specific permissions
      'user_client:read',
      'user_client:update',
      'reservation-client:read',
      // user
      'user:read',

      // role
      'role:read',

      // room
      'room:create',
      'room:update',
      'room:delete',
      'room:read',
      'room:force-delete',
      'room:recover',
      // floor
      'floor:create',
      'floor:update',
      'floor:delete',
      'floor:read',
      // room_bed
      'room_bed:create',
      'room_bed:update',
      'room_bed:delete',
      'room_bed:read',
      // room_type
      'room_type:create',
      'room_type:update',
      'room_type:delete',
      'room_type:read',
      // room_category
      'room_category:create',
      'room_category:update',
      'room_category:delete',
      'room_category:read',
      // room_feature
      'room_feature:create',
      'room_feature:update',
      'room_feature:delete',
      'room_feature:read',
      // room_extra_services
      'room_extra_services:create',
      'room_extra_services:update',
      'room_extra_services:delete',
      'room_extra_services:read',
      // room_include
      'room_include:create',
      'room_include:update',
      'room_include:delete',
      'room_include:read',
      // reservation
      'reservation:read',
      'reservation-client:read',
      'reservation:create',
      'reservation-status:update',
      'reservation:update',
      'reservation:delete',
      // food_menu
      'food_menu:create',
      'food_menu:update',
      'food_menu:delete',
      'food_menu:read',
      // food_type
      'food_type:create',
      'food_type:update',
      'food_type:delete',
      'food_type:read',
      // food_dish
      'food_dish:create',
      'food_dish:update',
      'food_dish:delete',
      'food_dish:read',
      // food_ingredient
      'food_ingredient:create',
      'food_ingredient:update',
      'food_ingredient:delete',
      'food_ingredient:read',
      // job_position
      'job_position:create',
      'job_position:update',
      'job_position:delete',
      'job_position:read',
      // job_department
      'job_department:create',
      'job_department:update',
      'job_department:delete',
      'job_department:read',
      // job_department
      'job_department:create',
      'job_department:update',
      'job_department:delete',
      'job_department:read',
      // job_submission
      'job_submission:create',
      'job_submission:update',
      'job_submission:delete',
      'job_submission:read',
      // destination
      'destination:create',
      'destination:update',
      'destination:delete',
      'destination:read',
      // blog
      'blog:create',
      'blog:update',
      'blog:delete',
      'blog:read',
      // blog_category
      'blog_category:create',
      'blog_category:update',
      'blog_category:delete',
      'blog_category:read',
      // blog_tag
      'blog_tag:create',
      'blog_tag:update',
      'blog_tag:delete',
      'blog_tag:read',

      // crm contacts (subject) : actions
      'crm_contacts:read',
      'crm_contacts:create',
      'crm_contacts:update',
      'crm_contacts:delete',
      // crm company (subject) : actions
      'crm_company:read',
      'crm_company:create',
      'crm_company:update',
      'crm_company:delete',
      // crm category (subject) : actions
      'crm_category:read',
      'crm_category:create',
      'crm_category:update',
      'crm_category:delete',
      // crm industry (subject) : actions
      'crm_industry:read',
      'crm_industry:create',
      'crm_industry:update',
      'crm_industry:delete',
      // crm occupation (subject) : actions
      'crm_occupation:read',
      'crm_occupation:create',
      'crm_occupation:update',
      'crm_occupation:delete',

      // analytics (subject) : actions
      'analytics_rooms:read',
      'analytics_jobs:read',
      'analytics_crm_contacts:read',
      'analytics_crm_companies:read',
      'analytics_blogs:read',
      'analytics_destinations:read',
      'analytics_reservations:read',
    ],
  },
  {
    name: 'User',
    color: '#ccccff',
    permissions: [
      // account specific permissions
      'user_client:read',
      'user_client:update',
      'reservation-client:read',
    ],
  },
];

export { DefaultSystemRoles };
