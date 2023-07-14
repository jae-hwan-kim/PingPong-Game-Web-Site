import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { DatabaseModule } from 'src/database/database.module';
import { chatProviders } from 'src/chat/chat.providers';
import { usersProviders } from './users.providers';
import { ChatModule } from 'src/chat/chat.module';

@Module({
  imports: [ChatModule, DatabaseModule],
  controllers: [UsersController],
  providers: [UsersService, ...usersProviders, ...chatProviders],
  exports: [UsersService, ...usersProviders, ...chatProviders],
})
export class UsersModule {}
