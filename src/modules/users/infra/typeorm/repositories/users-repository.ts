import { Repository } from 'typeorm';

import { dataSource } from '../../../../../shared/infra/typeorm';

import { ICreateUser } from '../../../domain/models/create-user.interface';
import { IUser } from '../../../domain/models/user.interface';
import { IUsersRepository } from '../../../domain/repositories/users-repository.interface';
import User from '../entities/user';

class UsersRepository implements IUsersRepository {
  private repository: Repository<User>;

  constructor() {
    this.repository = dataSource.getRepository(User);
  }

  async findByEmail(email: string): Promise<User | null> {
    return await this.repository.findOne({
      where: {
        email: email.toLowerCase(),
      },
    });
  }

  async findById(id: number): Promise<User | null> {
    return await this.repository.findOne({
      where: {
        id,
      },
    });
  }

  async create(userToCreate: ICreateUser): Promise<IUser> {
    const userCreated = this.repository.create(userToCreate);
    await this.repository.save(userCreated);

    return userCreated;
  }

  async update(id: number, userToUpdate: IUser): Promise<void> {
    const userUpdated = this.repository.create({
      ...userToUpdate,
      id,
    });
    await this.repository.save(userUpdated);
  }
}

export default UsersRepository;
