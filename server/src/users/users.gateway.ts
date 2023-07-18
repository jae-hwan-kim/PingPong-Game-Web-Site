import { Bind, Inject, Logger } from '@nestjs/common';
import {
  SubscribeMessage,
  WebSocketGateway,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketServer,
  MessageBody,
} from '@nestjs/websockets';
import { Server } from 'socket.io';
import { ChannelMember } from 'src/chat/chat.entity';

@WebSocketGateway({
  // cors: {
  //   origin: 'localhost:3000',
  // },
  // transports: ['polling', 'websocket'],
  namespace: 'user',
})
export class UsersGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  constructor(@Inject('DATA_SOURCE') private readonly dataSource) {}
  @WebSocketServer()
  server: Server;

  private logger: Logger = new Logger('UsersGateway');

  afterInit() {
    this.logger.log('UsersGateway Initialized!');
    this.server.on('connection', (socket) => {
      console.log('Users : ', socket.id, 'Connected');
    });
  }

  handleConnection(client: any, ...args: any[]) {
    this.logger.log(`Users : ${client.id} connected`);
  }

  handleDisconnect(client: any) {
    this.logger.log(`Users : ${client.id} disconnected`);
  }

  @Bind(MessageBody())
  @SubscribeMessage('profile')
  async getProfile(target_nickname) {
    console.log(target_nickname);

    const query = await this.dataSource
      .getRepository(ChannelMember)
      .createQueryBuilder('cm')
      .where('cm.userIdx = :my_user', { my_user: 0 })
      .select('cm.channelId')
      .getRawOne();
    // 추가 구문이 필요하다. '채널 타입이 0인 것만 찾아야 한다.' 등
    this.server.emit('profile', query);
    // db 가져오기
  }
}
// export class eventsGateway implements OnGatewayInit, OnGatewayConnection {
//   @WebSocketServer()
//   server: Server; // npm install socket.io

//   private logger: Logger = new Logger('AppGateway');
//   afterInit() {
//     this.logger.log('Initialized!');

//     this.server.on('connection', (socket) => {
//       console.log(socket.id, 'Connected');
//     });
//   }

//   handleConnection(client: any, ...args: any[]) {
//     this.logger.log(`Client connected: ${client.id}`);
//   }

//   @SubscribeMessage('message')
//   handleMessage(client: any, payload: any): string {
//     return 'Hello world!';
//   }

//   @Bind(MessageBody())
//   @SubscribeMessage('events')
//   handleEvent(data: string) {
//     console.log('data : ', data);
//     return data;
//   }

//   // @SubscribeMessage('events')
//   // handleEvent(@MessageBody() data: unknown): WsResponse<unknown> {
//   //   console.log('data : ', data);
//   //   const event = 'events';
//   //   return { event, data };
//   // }

//   @Bind(MessageBody())
//   @SubscribeMessage('events')
//   onEvent(data) {
//     console.log('data : ', data);
//     const event = 'events';
//     const response = [1, 2, 3];

//     return from(response).pipe(map((data) => ({ event, data })));
//   }

//   @Bind(MessageBody('id'))
//   @SubscribeMessage('events')
//   handleEventId(id) {
//     console.log('id : ', id);
//     return id;
//   }
// }
