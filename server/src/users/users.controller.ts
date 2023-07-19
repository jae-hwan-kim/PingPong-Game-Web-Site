import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('signup')
  signUp(@Body() userCreadentailsDto: any): Promise<void> {
    console.log('userCreadentailsDto: ', userCreadentailsDto);
    return this.usersService.signUp(userCreadentailsDto);
  }
}
