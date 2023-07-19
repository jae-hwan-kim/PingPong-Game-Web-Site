import { Inject, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Channel, ChannelMember, Message } from './chat.entity';
import { CreateChatDMDto, CreateChatDto } from './dto/create-chat.dto';
import {
  FindDMChannelDto,
  FindDMChannelResDto,
  RespondMessageDto,
} from './dto/find-chat.dto';
import { permission, channelType } from './chat.enums';
import { Users } from 'src/users/users.entity';

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
    owner: Users,
    targetUser: Users,
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
      sender: userIdx,
      message: message,
      msgDate: new Date(),
    });

    return { channel, channelOwner, channelTarget, directMessage };
  }

  async findDMChannel(
    owner: Users,
    target: Users,
  ): Promise<RespondMessageDto | boolean> {
    // owner 와 target 의 idx 가 존재하는
    // 채널 참여자 테이블을 찾는다.(idx는 채널 참여자 테이블의 userIdx)
    // TODO: 여러 사람과 DM 을 할 경우 문제가 생길 수 있을 것 같다.
    // console.log('[debug] owner: ', owner);
    // console.log('[debug] target: ', target);

    const myChannel = await this.channelMemberRepository
      .createQueryBuilder('cm')
      .where('"userIdx" = :target AND "channelType" = 0', {
        target: target.idx,
      })
      .getRawOne();
    // console.log('[debug] myChannel[0]: ', myChannel[0]);
    // console.log('[debug] myChannel: ', myChannel);
    const ourChannelIdx: number = myChannel.cm_channelIdx;

    if (ourChannelIdx == null) {
      this.logger.log('No DM Channel');
      return false;
    }
    console.log(`[debug] ourChannelIdx: ${ourChannelIdx}`);
    const channelIdx = await this.channelMemberRepository
      .createQueryBuilder('channel_member')
      .select()
      .where('"userIdx" = :owner', { owner: owner.idx })
      .andWhere('"channelIdx" = :ourChannelIdx', {
        ourChannelIdx: ourChannelIdx,
      })
      .getRawOne();
    if (channelIdx == null) {
      this.logger.log('No DM Channel');
      return false;
    }
    // 채널아이디가 channelIdx 인 메세지들 컬럼 배열과 채널 이름 보내기
    const messages = await this.getAllMessages();
    const channelName = 'jaekim, jujeon';
    return { messages, channelName };
  }

  async getAllMessages(): Promise<Message[]> {
    return this.messageRepository.find();
  }
}

// const pair_channelMembers: Promise<ChannelMember[]> = await this.channelMemberRepository.query(query, parameters);
// if ((await pair_channelMembers).length != 2) {
//   throw new NotFoundException(`ChannelMember with userIdx ${owner} and ${target} does not exist`);
// }
// const chIdx: Promise<ChannelMember[]> = pair_channelMembers;
