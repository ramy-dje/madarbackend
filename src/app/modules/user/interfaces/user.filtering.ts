// The filtering types of the user

export default interface UserFilteringInterface {
  name?: string;
  gender?: 'male' | 'female';
  role_id?: string;
  sorting_by_date_date?: '1' | '0' | '-1';
}
