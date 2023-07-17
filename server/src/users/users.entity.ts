import {
  BaseEntity,
  Column,
  Entity,
  PrimaryGeneratedColumn,
  RemoveOptions,
  SaveOptions,
  Unique,
} from 'typeorm';

@Entity()
export class User extends BaseEntity {
  @PrimaryGeneratedColumn()
  idx: number;

  @Column({ unique: true })
  intra: string;

  @Column({ unique: true })
  nickname: string;
}
