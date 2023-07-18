import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Logger,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ChatService } from './chat.service';
import { CreateChatDMDto, CreateChatDto } from './dto/create-chat.dto';
import { FindDMChannelDto, FindDMChannelResDto } from './dto/find-chat.dto';
import { UsersService } from 'src/users/users.service';
import { User } from 'src/users/users.entity';
import { Message } from './chat.entity';
import { channelType } from './chat.enums';
import { FindTargetNickname } from './pipes/chat-validation.pipe';

@Controller('chat/')
export class ChatController {
  private logger = new Logger('ChatController');
  constructor(
    private readonly chatService: ChatService,
    private readonly usersService: UsersService,
  ) {}

  @Post('dm/:target_nickname')
  @UsePipes(ValidationPipe)
  createChannelandInitDM(
    @Param('target_nickname') target_nickname: FindTargetNickname,
    @Body('content') content: string,
  ): Promise<CreateChatDto> {

    /* wochae 기록
    // const nickname = createChatDMDto.target_nickname;
    // const user:User = this.userService.findOne(nickname);
    */
    /* jaekim 기록
    // user 를 그대로 보내주는 것도 괜찮을 것 같다. channelName 에 이름을 나열해야해서.
    // User 로 바꿔줘야함
    */
    const owner: any = {
      idx: 0,
      intra: 'jaekim',
      nickname: 'kingjaehwan',
    };
    const target: any = {
      idx: 1,
      intra: 'jujeon',
      nickname: target_nickname,
    };
    this.logger.log(content);
    try {
      const createChatDMDto = new CreateChatDMDto(
        owner.idx,
        channelType.PRIVATE,
        content,
      );
      return this.chatService.createDMChannel(createChatDMDto, owner, target);
    } catch (error) {
      this.logger.error(error);
    }
  }

  // @Get('dm/:target_nickname')
  // async findDMChannel(@Param('target_nickname') target_nickname: string) {
  //   // 일단 임시로 1은 나임을 알림,
  //   const my_user = 'jujeon'; // temporary variable, my_user_idx
  //   const my_user_idx = await this.usersService.findUserIdxByNickname(my_user); // my_user_idx
  //   const target_userIdx = await this.usersService.findUserIdxByNickname(
  //     target_nickname,
  //   ); // target_user_idx
  //   return this.chatService.findDMChannel(my_user_idx, target_userIdx); // parmas types are number
  // }
  // @Post('dm/:target_nickname')
  // createChannelandInitDM(@Param('target_nickname') target_nickname: string, @Body('content') content: string) {
  //   const createChatDMDto = new CreateChatDMDto(0, 0, content);
  //   return this.chatService.createDMChannel(createChatDMDto, target_nickname);
  // }
}
