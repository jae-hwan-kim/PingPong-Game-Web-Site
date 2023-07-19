import {
  ConflictException,
  Inject,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { Users } from './users.entity';
import { UserDto } from './dto/users.dto';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @Inject('USERS_REPOSITORY')
    private usersRepository: Repository<Users>,
  ) {}

  async findUserIdxByNickname(intra: string): Promise<Users> {
    // console.log('nickname: ', nickname);
    return await this.usersRepository.findOneBy({ intra });
  }

  // async 가 필요한가?
  async signUp(userCreadentailsDto: CreateUserDto): Promise<void> {
    // return await this.createUser(userCreadentailsDto);
    return this.createUser(userCreadentailsDto);
  }

  async createUser(userCreadentailsDto: CreateUserDto): Promise<void> {
    const { intra, nickname } = userCreadentailsDto;

    const user = this.usersRepository.create({ intra, nickname });
    try {
      await this.usersRepository.save(user);
    } catch (error) {
      throw new InternalServerErrorException();
      // console.log('error', error);
    }
  }
}
