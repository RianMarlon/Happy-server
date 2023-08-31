import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToMany,
  JoinColumn,
} from 'typeorm';

import { IOrphanage } from '../../../domain/models/orphanage.interface';

import Image from '../../../../images/infra/typeorm/entities/image';

@Entity('orphanages')
class Orphanage implements IOrphanage {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column()
  name: string;

  @Column()
  latitude: number;

  @Column()
  longitude: number;

  @Column()
  about: string;

  @Column()
  whatsapp: string;

  @Column()
  instructions: string;

  @Column()
  open_from: number;

  @Column()
  open_until: number;

  @Column()
  open_on_weekends: boolean;

  @Column({ default: 0 })
  confirmed: boolean;

  @OneToMany(() => Image, (image) => image.orphanage, {
    cascade: ['insert', 'update'],
  })
  @JoinColumn({ name: 'id_orphanage' })
  images: Image[];
}

export default Orphanage;
