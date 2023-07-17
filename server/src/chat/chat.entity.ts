import {
  BaseEntity,
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class Channel extends BaseEntity {
  @PrimaryGeneratedColumn()
  idx: number;

  @Column()
  channelName: string;

  // null 왜 가능함?
  @Column({ nullable: true })
  owner: number;

  // 근데 우리 비밀번호 컬럼 데이터에 저장할 때 비밀번호 암호화 처리해야함.
  @Column({ nullable: true }) // true 는 따로 표기 안해도 된다.
  password: string;

  @OneToMany(() => ChannelMember, (channelMember) => channelMember.channel)
  channelMembers: ChannelMember[];
}

@Entity()
export class ChannelMember extends BaseEntity {
  @PrimaryGeneratedColumn()
  idx: number;

  @Column({ nullable: false })
  channelIdx: number;

  @Column({ nullable: false })
  userIdx: number;

  @Column({ nullable: false })
  permission: number;

  @Column({ nullable: false })
  channelType: number;

  @Column()
  mutedTime: Date;

  @ManyToOne(() => Channel, (channel) => channel.channelMembers)
  channel: Channel;
}

@Entity()
export class Message extends BaseEntity {
  @PrimaryGeneratedColumn()
  idx: number;

  @Column({ nullable: false })
  channelIdx: number;

  @Column({ nullable: false })
  sender: number;

  @Column({ nullable: false })
  message: string;

  @Column({ nullable: false })
  msgDate: Date;
}
