// The System Permissions Type (Includes all the modules permissions)

export type SystemPermissions =
  // panel (subject) : actions
  | 'panel:access'

  // role (subject) : actions
  | 'role:create'
  | 'role:update'
  | 'role:delete'
  | 'role:read'

  // user (subject) : actions
  | 'user:read'
  | 'user:create'
  | 'user:update'
  | 'user:delete'
  | 'user:activation'
  | 'user_client:update'
  | 'user_client:read'

  // room (subject) : actions
  | 'room:create'
  | 'room:update'
  | 'room:delete'
  | 'room:force-delete'
  | 'room:recover'
  | 'room:read'

  // crm contacts (subject) : actions
  | 'crm_contacts:create'
  | 'crm_contacts:update'
  | 'crm_contacts:delete'
  | 'crm_contacts:read'

  // crm company (subject) : actions
  | 'crm_company:create'
  | 'crm_company:update'
  | 'crm_company:delete'
  | 'crm_company:read'

  // crm industry (subject) : actions
  | 'crm_industry:read'
  | 'crm_industry:create'
  | 'crm_industry:update'
  | 'crm_industry:delete'

  // crm occupation (subject) : actions
  | 'crm_occupation:read'
  | 'crm_occupation:create'
  | 'crm_occupation:update'
  | 'crm_occupation:delete'

  // crm category (subject) : actions
  | 'crm_category:read'
  | 'crm_category:create'
  | 'crm_category:update'
  | 'crm_category:delete'

  // floor (subject) : actions
  | 'floor:create'
  | 'floor:update'
  | 'floor:delete'
  | 'floor:read'

  // room_bed (subject) : actions
  | 'room_bed:create'
  | 'room_bed:update'
  | 'room_bed:delete'
  | 'room_bed:read'

  // room_type (subject) : actions
  | 'room_type:create'
  | 'room_type:update'
  | 'room_type:delete'
  | 'room_type:read'

  // room_category (subject) : actions
  | 'room_category:create'
  | 'room_category:update'
  | 'room_category:delete'
  | 'room_category:read'

  // room_feature (subject) : actions
  | 'room_feature:create'
  | 'room_feature:update'
  | 'room_feature:delete'
  | 'room_feature:read'

  // room_extra_services (subject) : actions
  | 'room_extra_services:create'
  | 'room_extra_services:update'
  | 'room_extra_services:delete'
  | 'room_extra_services:read'

  // room_include (subject) : actions
  | 'room_include:create'
  | 'room_include:update'
  | 'room_include:delete'
  | 'room_include:read'

  // reservation (subject) : actions
  | 'reservation:read'
  | 'reservation-client:read'
  | 'reservation:create'
  | 'reservation-status:update'
  | 'reservation:update'
  | 'reservation:delete'

  // food_menu (subject) : actions
  | 'food_menu:create'
  | 'food_menu:update'
  | 'food_menu:delete'
  | 'food_menu:read'

  // food_type (subject) : actions
  | 'food_type:create'
  | 'food_type:update'
  | 'food_type:delete'
  | 'food_type:read'

  // food_dish (subject) : actions
  | 'food_dish:create'
  | 'food_dish:update'
  | 'food_dish:delete'
  | 'food_dish:read'

  // food_ingredient (subject) : actions
  | 'food_ingredient:create'
  | 'food_ingredient:update'
  | 'food_ingredient:delete'
  | 'food_ingredient:read'

  // job_position (subject) : actions
  | 'job_position:create'
  | 'job_position:update'
  | 'job_position:delete'
  | 'job_position:read'

  // job_department (subject) : actions
  | 'job_department:create'
  | 'job_department:update'
  | 'job_department:delete'
  | 'job_department:read'

  // job_department (subject) : actions
  | 'job_department:create'
  | 'job_department:update'
  | 'job_department:delete'
  | 'job_department:read'

  // job_submission (subject) : actions
  | 'job_submission:create'
  | 'job_submission:update'
  | 'job_submission:delete'
  | 'job_submission:read'

  // destination (subject) : actions
  | 'destination:create'
  | 'destination:update'
  | 'destination:delete'
  | 'destination:read'

  // blog (subject) : actions
  | 'blog:create'
  | 'blog:update'
  | 'blog:delete'
  | 'blog:read'

  // blog_category (subject) : actions
  | 'blog_category:create'
  | 'blog_category:update'
  | 'blog_category:delete'
  | 'blog_category:read'

  // blog_tag (subject) : actions
  | 'blog_tag:create'
  | 'blog_tag:update'
  | 'blog_tag:delete'
  | 'blog_tag:read'

  // analytics (subject) : actions
  | 'analytics_rooms:read'
  | 'analytics_jobs:read'
  | 'analytics_crm_contacts:read'
  | 'analytics_crm_companies:read'
  | 'analytics_blogs:read'
  | 'analytics_destinations:read'
  | 'analytics_reservations:read'

  // file_manager (subject) : actions
  | 'file_manager:create'
  | 'file_manager:update'
  | 'file_manager:delete'
  | 'file_manager:read'
  | 'file_manager:read_all'
  | 'file_manager_analytics:read'

  // layout_config (subject) : actions
  | 'layout_config:create'
  | 'layout_config:update'
  | 'layout_config:delete'
  | 'layout_config:read';
