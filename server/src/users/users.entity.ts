import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Users extends BaseEntity {
  @PrimaryGeneratedColumn()
  idx: number;

  @Column({ unique: true })
  intra: string;

  @Column({ unique: true })
  nickname: string;

  @Column({ default: 'https://cdn.intra.42.fr/users/medium_default.png' })
  imgUrl: string;

  @Column({ default: 0 })
  rankpoint: number;

  @Column({ default: 0 })
  rate: number;

  @Column({ default: true })
  isOnline: boolean;

  @Column({ default: true })
  available: boolean;
}
