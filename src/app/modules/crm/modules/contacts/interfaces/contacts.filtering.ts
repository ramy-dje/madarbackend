// The filtering types of the crm contact

export default interface ContactFilteringInterface {
  // personal info
  name?: string;
  gender?: 'male' | 'female';
  // location
  location_global?: string;
  location_country?: string;
  // email
  email?: string;
  // work
  work_industry?: string;
  work_company?: string;
  work_occupation?: string;
  // phoneNumber
  phoneNumber?: string;
  // ordering
  sorting_by_date_date?: '1' | '0' | '-1';
}
