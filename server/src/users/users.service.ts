import { Inject, Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Users } from './users.entity';
import { UserDto } from './dto/users.dto';

@Injectable()
export class UsersService {
  constructor(
    @Inject('USERS_REPOSITORY')
    private userRepository: Repository<Users>,
  ) {}
  async findUserIdxByNickname(nickname: string) {
    console.log('nickname: ', nickname);
    const user = await this.userRepository.findOne({
      where: [{ nickname: nickname }],
    });
    return user.idx;
  }
}
