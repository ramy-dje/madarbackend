// Update user type (interface)

export interface UpdateUserProfileInterface {
  username: string;
  fullName: string;
  pic: string;
  phoneNumbers?: string[];
  location?: {
    country?: string;
    state?: string;
    city?: string;
    zipcode?: string;
  };
  gender?: 'male' | 'female';
  password?: string;
}

// Update user type (interface)
export interface UpdateUserInterface {
  username: string;
  fullName: string;
  role: string;
  pic: string;
  phoneNumbers?: string[];
  location?: {
    country?: string;
    state?: string;
    city?: string;
    zipcode?: string;
  };
  gender?: 'male' | 'female';
  password?: string;
}
