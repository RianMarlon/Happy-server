import { ICreateUser } from '../models/create-user.interface';
import { IUser } from '../models/user.interface';

export interface IUsersRepository {
  findByEmail(email: string): Promise<IUser | undefined>;
  findById(id: number): Promise<IUser | undefined>;
  create(userToCreate: ICreateUser): Promise<IUser>;
  update(userToUpdate: IUser): Promise<void>;
}
