import { ICreateUser } from '../models/create-user.interface';
import { IUser } from '../models/user.interface';

export interface IUsersRepository {
  findByEmail(email: string): Promise<IUser | null>;
  findById(id: number): Promise<IUser | null>;
  create(userToCreate: ICreateUser): Promise<IUser>;
  update(id: number, userToUpdate: Partial<IUser>): Promise<void>;
}
