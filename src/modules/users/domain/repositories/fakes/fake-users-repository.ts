import { IUser } from '../../models/user.interface';
import { IUsersRepository } from '../users-repository.interface';

class FakeUsersRepository implements IUsersRepository {
  async findByEmail(): Promise<IUser | undefined> {
    return;
  }

  async findById(): Promise<IUser | undefined> {
    return;
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
