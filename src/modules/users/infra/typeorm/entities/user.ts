import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { IUser } from '../../../domain/models/user.interface';

@Entity('users')
export default class User implements IUser {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column()
  first_name: string;

  @Column()
  last_name: string;

  @Column()
  email: string;

  @Column()
  password: string;

  @Column({ default: 0 })
  verified_email: boolean;

  @Column({ default: 0 })
  admin: boolean;
}
