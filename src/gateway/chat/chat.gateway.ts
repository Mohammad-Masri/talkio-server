import { JwtService } from '@nestjs/jwt';
import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatEvents } from 'src/config/constants';
import { ServerConfigService } from 'src/models/server-config/server-config.service';
import {
  JoinLeaveRoomInput,
  ReadDeleteMessageInput,
  SendMessageInput,
  UpdateMessageInput,
} from './dto';
import { plainToInstance } from 'class-transformer';
import { validate, ValidationError } from 'class-validator';
import { RoomService } from 'src/models/room/room.service';
import { MessageService } from 'src/models/message/message.service';
import { UserService } from 'src/models/user/user.service';

@WebSocketGateway({ cors: { origin: '*' }, namespace: '/gateway/chat' })
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(
    private readonly jwtService: JwtService,
    private readonly serverConfigService: ServerConfigService,
    private readonly roomService: RoomService,
    private readonly messageService: MessageService,
    private readonly userService: UserService,
  ) {}

  private async getValidationErrors(
    errors: ValidationError[],
  ): Promise<string[]> {
    let errorMessages: string[] = [];

    for (let i = 0; i < errors.length; i++) {
      const error = errors[i];
      if (error.children) {
        const childrenErrors = await this.getValidationErrors(error.children);
        errorMessages = [...errorMessages, ...childrenErrors];
      }

      if (error.constraints) {
        Object.keys(error.constraints).map((k) =>
          errorMessages.push(error.constraints[k]),
        );
      }
    }

    return errorMessages;
  }

  private async validateDto<T>(
    dtoClass: new () => T,
    data: any,
    client: Socket,
    event: string,
  ) {
    const object = plainToInstance(dtoClass, data);

    const errors = await validate(object as object);

    if (errors.length) {
      const errorMessages = await this.getValidationErrors(errors);

      client.emit('error', {
        event,
        message: 'Invalid data',
        errors: errorMessages,
      });
      return false;
    }

    return true;
  }

  async handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
    const token =
      client.handshake.headers.authorization?.split(' ')[1] ||
      client.handshake.auth?.token;

    if (!token) {
      client.emit(
        'error',
        'Authorization failed!, there is no token in the Authorization header',
      );
      client.disconnect();
    }

    const JWT_SECRET_KEY =
      this.serverConfigService.get<string>('JWT_SECRET_KEY') ||
      'JWT_SECRET_KEY';

    try {
      const payload = await this.jwtService.verify(token, {
        secret: JWT_SECRET_KEY,
      });
      client.data = payload;

      this.server.emit(ChatEvents.Send.UserConnected, {
        id: client.data.id,
      });

      const rooms = await this.roomService.findAllForUser(payload.id);
      const roomIds = rooms.map((r) => r._id + '');

      client.join(roomIds);
      roomIds.map((roomId) =>
        client.emit(ChatEvents.Send.RoomJoined, { roomId }),
      );

      this.userService.setOnline(client.data.id, true);
    } catch (error: any) {
      client.emit('error', `Authorization failed!, ${error.message}`);
      client.disconnect();
    }
  }

  async handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);

    this.server.emit(ChatEvents.Send.UserDisconnected, {
      id: client.data.id,
    });

    this.userService.setOnline(client.data.id, false);
  }

  @SubscribeMessage(ChatEvents.Receive.JoinRoom)
  async handleJoinRoom(
    @MessageBody() body: JoinLeaveRoomInput,
    @ConnectedSocket() client: Socket,
  ) {
    const valid = await this.validateDto(
      JoinLeaveRoomInput,
      body,
      client,
      ChatEvents.Receive.JoinRoom,
    );
    if (!valid) return;

    client.join(body.roomId);
    client.emit(ChatEvents.Send.RoomJoined, { roomId: body.roomId });
  }

  @SubscribeMessage(ChatEvents.Receive.LeaveRoom)
  async handleLeaveRoom(
    @MessageBody() body: JoinLeaveRoomInput,
    @ConnectedSocket() client: Socket,
  ) {
    const valid = await this.validateDto(
      JoinLeaveRoomInput,
      body,
      client,
      ChatEvents.Receive.LeaveRoom,
    );
    if (!valid) return;

    client.leave(body.roomId);
    client.emit(ChatEvents.Send.RoomLeaved);
  }

  @SubscribeMessage(ChatEvents.Receive.SendMessage)
  async sendMessage(
    @MessageBody()
    body: SendMessageInput,
    @ConnectedSocket() client: Socket,
  ) {
    const valid = await this.validateDto(
      SendMessageInput,
      body,
      client,
      ChatEvents.Receive.SendMessage,
    );
    if (!valid) return;

    console.log(client.data);

    const room = await this.roomService.findById(body.roomId);

    if (room) {
      const participants = await this.roomService.getRoomParticipants(room);

      const message = await this.messageService.create(client.data.id, body);

      if (message) {
        const messageResponse = await this.messageService.makeMessageResponse(
          message,
          participants,
        );
        this.server
          .to(body.roomId)
          .emit(ChatEvents.Send.MessageReceived, messageResponse);
      }
    }
  }

  @SubscribeMessage(ChatEvents.Receive.ReadMessage)
  async readMessage(
    @MessageBody()
    body: ReadDeleteMessageInput,
    @ConnectedSocket() client: Socket,
  ) {
    const valid = await this.validateDto(
      ReadDeleteMessageInput,
      body,
      client,
      ChatEvents.Receive.ReadMessage,
    );
    if (!valid) return;

    this.server.to(body.roomId).emit(ChatEvents.Send.MessageReaded, body);
  }

  @SubscribeMessage(ChatEvents.Receive.UpdateMessage)
  async updateMessage(
    @MessageBody()
    body: UpdateMessageInput,
    @ConnectedSocket() client: Socket,
  ) {
    const valid = await this.validateDto(
      UpdateMessageInput,
      body,
      client,
      ChatEvents.Receive.UpdateMessage,
    );
    if (!valid) return;

    this.server.to(body.roomId).emit(ChatEvents.Send.MessageUpdated, body);
  }

  @SubscribeMessage(ChatEvents.Receive.DeleteMessage)
  async deleteMessage(
    @MessageBody()
    body: ReadDeleteMessageInput,
    @ConnectedSocket() client: Socket,
  ) {
    const valid = await this.validateDto(
      ReadDeleteMessageInput,
      body,
      client,
      ChatEvents.Receive.DeleteMessage,
    );
    if (!valid) return;

    this.server.to(body.roomId).emit(ChatEvents.Send.MessageDeleted, body);
  }
}
