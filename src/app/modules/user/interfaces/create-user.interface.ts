// Create user type (interface)

export interface CreateUserInterface {
  username: string;
  fullName: string;
  email: string;
  pic: string;
  phoneNumbers?: string[];
  location: {
    country?: string;
    state?: string;
    city?: string;
    zipcode?: string;
  };
  gender: 'male' | 'female';
  oauth: boolean;
  oauthProvider?: string;
  password: string;
}
