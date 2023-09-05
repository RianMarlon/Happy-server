export interface IUser {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  verified_email: boolean;
  admin: boolean;
}
