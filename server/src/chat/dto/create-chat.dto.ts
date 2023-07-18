import { IsNotEmpty } from 'class-validator';
import { channelType } from '../chat.enums';
import { Channel, ChannelMember, Message } from '../chat.entity';

export class CreateChatDto {
  channel: Channel;
  channelOwner: ChannelMember;
  channelTarget: ChannelMember;
  directMessage: Message;
}
export class CreateChatDMDto {
  constructor(userIdx: number, channelType: number, message: string) {
    if (userIdx == null || channelType == null || message == null) {
      throw new Error('CreateChatDMDto Error');
    }
    this.userIdx = userIdx;
    this.channelType = channelType;
    this.message = message;
  }

  // 주석한 이유 : 새로 생성할 건데 어떻게 channelIdx가 존재? -> 소캣 통신이나 Rest 를 사용할텐데, 우리가 발급하는 것 아닌가?
  @IsNotEmpty()
  channelIdx: number;

  @IsNotEmpty()
  userIdx: number;

  // 주석 처리 한 이유 : 어차피 DM 생성하는 거라면 dto에 넣을 필요 없이 서버 단에서 DB에 0을 넣어주면 됨.
  // 주석 해제 한 이유 : DM이 존재할 수도 있어서 쉽게 찾으려고.
  @IsNotEmpty()
  channelType: channelType;

  @IsNotEmpty()
  message: string;
}
