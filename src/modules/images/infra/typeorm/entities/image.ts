import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import Orphanage from '../../../../orphanages/infra/typeorm/entities/orphanage';

@Entity('images')
class Image {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column()
  path: string;

  @ManyToOne(() => Orphanage, (orphanage) => orphanage.images)
  @JoinColumn({ name: 'id_orphanage' })
  orphanage: Orphanage;
}

export default Image;
