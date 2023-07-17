import { Inject, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Channel, ChannelMember, Message } from './chat.entity';
import { CreateChatDMDto, CreateChatDto } from './dto/create-chat.dto';
import { FindDMChannelDto, FindDMChannelResDto } from './dto/find-chat.dto';
import { permission, channelType } from './chat.enums';

@Injectable()
export class ChatService {
  private logger = new Logger('ChatService');

  constructor(
    @Inject('DATA_SOURCE') private dataSource,
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
    target_user_idx: number,
  ) {
    const { userIdx, channelType, message } = createChatDMDto;
    const socketClinetUserId = 0; // 당소. 나중에 client로부터 받아올 예정
    // let targetUser: number; // 귀소, 일단은 지금 유저 정보가 없어서 식별자 number 값으로 대체
    const targetUser = target_user_idx;
    const channelMember = await this.channelMemberRepository.findOne({
      where: { userIdx: userIdx, channelType: channelType },
    });

    if (channelMember) {
      // 존재하면 안 돼서 에러를 반환.
      throw new NotFoundException(
        `ChannelMember with userIdx ${userIdx} already exists`,
      );
    }
    // 1. chanel table 생성
    // 이거 용도, 한 채널을 생성한 뒤에 그 채널에 대한 두 가지의 채널멤버 튜플을 넣어야해서.
    const channelMaxId = await this.channelRepository
      .createQueryBuilder('channel')
      .select('MAX(channel.idx)', 'id')
      .getRawOne();
    let idx = 1;
    if (channelMaxId != null) idx = channelMaxId.id + 1;
    // 이렇게 넣으면 nullalbe 해지나?
    // console.log('[Debug] channelMaxId: ', channelMaxId);
    // console.log('[Debug] idx: ', idx);
    // console.log('[Debug] userIdx: ', userIdx);
    // console.log('[Debug] permission: ', permission.OWNER);
    // console.log('[Debug] channelType: ', channelType);
    this.logger.debug(`[Debug] channelType: ${channelType}`);
    const channel = await this.channelRepository.save({
      idx: idx,
      channelName: userIdx.toString() + targetUser.toString(),
      owner: userIdx,
      password: null,
    });

    // 2. chanel_member table 생성
    this.logger.debug(`[Debug] generatedChannelIdx: ${channel.idx}`);
    const generatedChannelIdx = channel.idx; // 그래서 저 maxId 랑 값이 같아야 함.
    // 채널 멤버 생성
    // TODO IDX 겹칠 때 예외처리 <- 할 필요가 있나...?
    const channelMember1 = await this.channelMemberRepository.save({
      idx: 1, // uuid
      channelIdx: generatedChannelIdx,
      userIdx: socketClinetUserId,
      permission: permission.OWNER,
      channelType: channelType,
      channel: channel,
    });
    const channelMember2 = await this.channelMemberRepository.save({
      idx: 2, // uuid
      channelIdx: generatedChannelIdx,
      userIdx: socketClinetUserId,
      permission: permission.OWNER,
      channelType: channelType,
      channel: channel,
    });
    // 지금 멤버가 채널 참조하고 있는데 number 로 통일 하고 싶은데 나중에 어차피 참조할 꺼니깐 잠시 놔 둠.

    // 2. message table 생성
    // msgDat
    const direct_message = await this.messageRepository.save({
      idx: 1, // uuid
      channelIdx: generatedChannelIdx,
      sender: socketClinetUserId, // 내가 대상한테 말하는 상황이라 가정하고 입력
      message: message,
      msgDate: new Date(),
    });

    return { channel, channelMember1, channelMember2, direct_message };
  }

  async findDMChannel(my_user: number, target_user: number) {
    // my_user 와 target_user 의 idx 가 존재하는
    // 채널 참여자 테이블을 찾는다.(idx는 채널 참여자 테이블의 userIdx)

    // const query = await this.dataSource
    //   .getRepository(ChannelMember)
    //   .createQueryBuilder('cm')
    //   .where('cm.userIdx = :my_user', { my_user: my_user })
    //   .select('cm.channelId', 'channelId')
    //   .getRawMany();
    // // 추가 구문이 필요하다. '채널 타입이 0인 것만 찾아야 한다.' 등
    // return query;

    const query = `
      SELECT *
      FROM channel_member
      WHERE ("userIdx" = $1 AND "channelId" IN (
          SELECT "channelId"
          FROM "channel_member"
          WHERE "userIdx" = $2 AND "channelType" = 0
      ))
    `;
    const parameters = [my_user, target_user];

    const pair_channelMembers: Promise<ChannelMember[]> =
      await this.channelMemberRepository.query(query, parameters);
    if ((await pair_channelMembers).length != 2) {
      throw new NotFoundException(
        `ChannelMember with userIdx ${my_user} and ${target_user} does not exist`,
      );
    }
    const chIdx: Promise<ChannelMember[]> = pair_channelMembers;

    return chIdx[0].channelId;
  }

  /*
  async findDMChannel(my_user : number, target_user : number) {
    // my_user 와 target_user 의 idx 가 존재하는
    // 채널 참여자 테이블을 찾는다.(idx는 채널 참여자 테이블의 userIdx)
    
    const userRepository = getRepository(User);
    const users = await userRepository.find({ name: 'John' });
    
    return this.channelMemberRepository.query(query, parameters);
  };
  */
  //db logic
  /*
    SELECT *
    FROM channel_member
    WHERE (userId = 'User1' AND channelId IN (
            SELECT channelId
            FROM channel_member
            WHERE userId = 'User2' AND channelType = 0
        ))
        OR (userId = 'User2' AND channelId IN (
            SELECT channelId
            FROM channel_member
            WHERE userId = 'User1' AND channelType = 0
        ));
*/
}

// 예시
// createBoard(createBoardDto: CreateBoardDto, user: User): Promise<Board> {
//   return this.boardRepository.createBoard(createBoardDto, user);
// }

// createChannelandInitDM(createChatDMDto:CreateChatDMDto, target_nickname: string, content: string) {
//   // 임의 ID 정수 값 넣기
//   // channelRepository.find({ where: { userNick = target_nickname } })
//   const { channelIdx, userIdx, channelType } = createChatDMDto;
//   // const { channelName, owner, password } = anythingDto(target_nickname, owner, password);
//   this.channelRepository.createChannel({ // 주입의 문제 있음.
//       channelName: target_nickname,
//       owner: userIdx,
//       password: null,
//   });
//   this.channelMemberRepository.createChannelMember(
//    );
//   this.messageRepository.createMessage();
//   // return
// }

// ------------------------------------------------------
// create(createChatDto: CreateChatDto) {
//   return 'This action adds a new chat';
// }

// findAll() {
//   return `This action returns all chat`;
// }

// findOne(id: number) {
//   return `This action returns a #${id} chat`;
// }

// update(id: number, updateChatDto: UpdateChatDto) {
//   return `This action updates a #${id} chat`;
// }

// remove(id: number) {
//   return `This action removes a #${id} chat`;
// }
