import { Inject, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Channel, ChannelMember, Message } from './chat.entity';
import { CreateChatDMDto, CreateChatDto } from './dto/create-chat.dto';
import { FindDMChannelDto, FindDMChannelResDto } from './dto/find-chat.dto';
import { permission, channelType } from './chat.enums';
import { User } from 'src/users/users.entity';

@Injectable()
export class ChatService {
  private logger = new Logger('ChatService');

  constructor(
    @Inject('MESSAGES_REPOSITORY')
    private messageRepository: Repository<Message>,
    @Inject('CHANNELS_REPOSITORY')
    private channelRepository: Repository<Channel>,
    @Inject('CHANNELMEMBERS_REPOSITORY')
    private channelMemberRepository: Repository<ChannelMember>,
  ) {}

  // async createChannel(createChannelDto: CreateChatDto){}

  // situation 1. DM 채팅방이 없을 때 행위자 user1 channelType 0 is DM
  async createDMChannel(
    createChatDMDto: CreateChatDMDto,
    owner: User,
    targetUser: User,
  ): Promise<CreateChatDto> {
    const { userIdx, channelType, message } = createChatDMDto;
    const targetNickname = targetUser.nickname;
    const targetIdx = targetUser.idx;
    const ownerNickname = owner.nickname;
    /* 이거 왜 필요함? 이전에 존재하는지 확인하는 거 아닌가? findDMChannel 에서 확인해야함.
    const channelMember = await this.channelMemberRepository.findOne({
      where: { userIdx: userIdx, channelType: channelType },
    });

    if (channelMember) {
      // 존재하면 안 돼서 에러를 반환.
      throw new NotFoundException(
        `ChannelMember with userIdx ${userIdx} already exists`,
      );
    }
    */
    // 1. chanel table 생성
    // 이거 용도, 한 채널을 생성한 뒤에 그 채널에 대한 두 가지의 채널멤버 튜플을 넣어야해서.

    // @PrimaryGeneratedColumn() 하면 Max를 찾을 필요가 없음. idx 자동 증가됨.
    // const channelMaxId = await this.channelRepository
    //   .createQueryBuilder('channel')
    //   .select('MAX(channel.idx)', 'id')
    //   .getRawOne();

    // let idx;
    // if (channelMaxId != null) idx = channelMaxId.id + 1;
    // else idx = 0;
    // 이렇게 넣으면 nullalbe 해지나?
    const channel = await this.channelRepository.save({
      channelName: `${ownerNickname}, ${targetNickname}`,
      owner: userIdx,
      password: null,
    });

    // 2. chanel_member table 생성
    // this.logger.debug(`[Debug] channelIdx: ${channel.idx}`);
    const channelIdx = channel.idx;
    // 채널 멤버 생성
    const channelOwner = await this.channelMemberRepository.save({
      channelIdx: channelIdx,
      userIdx: userIdx,
      permission: permission.OWNER,
      channelType: channelType,
      channel: channel,
    });
    const channelTarget = await this.channelMemberRepository.save({
      channelIdx: channelIdx,
      userIdx: targetIdx,
      permission: permission.OWNER,
      channelType: channelType,
      channel: channel,
    });
    // 지금 멤버가 채널 참조하고 있는데 number 로 통일 하고 싶은데 나중에 어차피 참조할 꺼니깐 잠시 놔 둠.

    // 2. message table 생성
    const directMessage = await this.messageRepository.save({
      channelIdx: channelIdx,
      sender: userIdx, // 내가 대상한테 말하는 상황이라 가정하고 입력
      message: message,
      msgDate: new Date(),
    });

    return { channel, channelOwner, channelTarget, directMessage };
  }

  async findDMChannel(my_user: number, targetUser: number): Promise<number> {
    // my_user 와 targetUser 의 idx 가 존재하는
    // 채널 참여자 테이블을 찾는다.(idx는 채널 참여자 테이블의 userIdx)
    const something = await this.channelMemberRepository
      .createQueryBuilder('cm')
      .where('"userIdx" = :targetUser AND "channelType" = 0', {
        targetUser: targetUser,
      })
      .getRawOne();
    console.log('debug 0:', something[0]);
    console.log('debug: ', something);
    const ourChannelId: number = something.cm_channelIdx;

    if (ourChannelId == null) {
      throw console.log('DM 채널이 존재하지 않습니다.');
    }
    console.log(`ourChannelId: ${ourChannelId}`);
    const channelId = await this.channelMemberRepository
      .createQueryBuilder('channel_member')
      .select()
      .where('"userIdx" = :my_user', { my_user: my_user })
      .andWhere('"channelIdx" = :ourChannelId', { ourChannelId: ourChannelId })
      .getRawOne();

    // if (channelId == null) {
    //   throw console.log("채널이 존재하지 않습니다.");
    // }
    console.log('debug: ', channelId);
    console.log('debug: ', channelId.channel_member_channelIdx);
    // const id = channelId;
    // const query = `
    //   SELECT *
    //   FROM channel_member
    //   WHERE ("userIdx" = $1 AND "channelId" IN (
    //       SELECT "channelId"
    //       FROM "channel_member"
    //       WHERE "userIdx" = $2 AND "channelType" = 0
    //   ))
    // `;
    // const parameters = [my_user, targetUser];

    // const pair_channelMembers: Promise<ChannelMember[]> = await this.channelMemberRepository.query(query, parameters);
    // if ((await pair_channelMembers).length != 2) {
    //   throw new NotFoundException(`ChannelMember with userIdx ${my_user} and ${targetUser} does not exist`);
    // }
    // const chIdx: Promise<ChannelMember[]> = pair_channelMembers;

    return channelId.channel_member_channelIdx;
  }
}
