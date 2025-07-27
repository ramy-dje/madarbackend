import { CompanySizeType } from './company.interface';

// The filtering types of the crm company

export default interface CompanyFilteringInterface {
  // name
  name?: string;
  // location
  location_global?: string;
  location_country?: string;
  // email
  email?: string;

  category?: string;
  industry?: string;

  // phoneNumber
  phoneNumber?: string;

  // identification (TIN/CRN/TAX Code/Statistical Code)
  identification?: string;

  // size
  company_size?: CompanySizeType;

  // ordering
  sorting_by_date_date?: '1' | '0' | '-1';
}
