import { IUser } from '../../models/user.interface';
import { IUsersRepository } from '../users-repository.interface';

const userMock = {
  id: 1,
  first_name: '',
  last_name: '',
  email: '',
  password: '',
  verified_email: true,
  admin: true,
};

class FakeUsersRepository implements IUsersRepository {
  async findByEmail(): Promise<IUser | null> {
    return null;
  }

  async findById(): Promise<IUser | null> {
    return userMock;
  }

  async create(): Promise<IUser> {
    return {
      id: 1,
      first_name: '',
      last_name: '',
      email: '',
      password: '',
      verified_email: true,
      admin: true,
    };
  }

  async update(): Promise<void> {
    return;
  }
}

export default FakeUsersRepository;
