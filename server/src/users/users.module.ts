import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { UsersGateway } from './users.gateway';
import { ChatModule } from 'src/chat/chat.module';
import { DatabaseModule } from 'src/database/database.module';

@Module({
  imports: [ChatModule, DatabaseModule],
  controllers: [UsersController],
  providers: [UsersService, UsersGateway],
})
export class UsersModule {}
