import { IsNotEmpty } from 'class-validator';
import { Message } from '../chat.entity';

export class RespondMessageDto {
  messages: Message[];
  channelName: string;
}
export class FindDMChannelDto {
  @IsNotEmpty()
  my_nickname: string;

  @IsNotEmpty()
  target_nickname: string;
}

export class FindDMChannelResDto {
  constructor(my_userIdx: number, target_userIdx: number) {
    this.my_userIdx = my_userIdx;
    this.target_userIdx = target_userIdx;
  }
  my_userIdx: number;
  target_userIdx: number;
}
