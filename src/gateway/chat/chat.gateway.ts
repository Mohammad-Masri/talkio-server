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
import { ChatEvents, RoomTypes } from 'src/config/constants';
import { ServerConfigService } from 'src/models/server-config/server-config.service';
import {
  AnswerPrivateCallInput,
  CandidateResponse,
  DeclinePrivateCallInput,
  PrivateCallDeclinedResponse,
  DeleteMessageResponse,
  JoinLeaveRoomInput,
  PrivateCallAnsweredResponse,
  PrivateCallReceivedResponse,
  ReadDeleteMessageInput,
  ReadMessageResponse,
  SendMessageInput,
  ShareCandidateInput,
  StartPrivateCallInput,
  StartStopTypingInput,
  StartStopTypingResponse,
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

    const room = await this.roomService.findById(body.roomId);

    if (room) {
      const participants = await this.roomService.getRoomParticipants(room);

      const message = await this.messageService.create(client.data.id, body);

      if (message) {
        const messageResponse = await this.messageService.makeMessageResponse(
          message,
          participants,
          client.data.id,
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

    const [room, message] = await Promise.all([
      await this.roomService.findById(body.roomId),
      this.messageService.findById(body.messageId),
    ]);

    if (room && message) {
      const userId = client.data.id;

      await this.messageService.markAsRead(room, message, userId);

      this.server
        .to(body.roomId)
        .emit(
          ChatEvents.Send.MessageReaded,
          new ReadMessageResponse(room._id + '', message._id + '', new Date()),
        );
    }
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

    const [room, message] = await Promise.all([
      await this.roomService.findById(body.roomId),
      this.messageService.findById(body.messageId),
    ]);

    if (room && message) {
      const updatedMessage = await this.messageService.updateForUser(
        body,
        client.data.id,
      );

      if (updatedMessage) {
        const participants = await this.roomService.getRoomParticipants(room);

        const messageResponse = await this.messageService.makeMessageResponse(
          updatedMessage,
          participants,
          client.data.id,
        );

        this.server
          .to(body.roomId)
          .emit(ChatEvents.Send.MessageUpdated, messageResponse);
      }
    }
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
    const userId = client.data.id;

    const [room, message] = await Promise.all([
      await this.roomService.findById(body.roomId),
      this.messageService.findById(body.messageId),
    ]);

    if (room && message) {
      const deleted = await this.messageService.deleteForUser(message, userId);

      if (deleted) {
        this.server
          .to(body.roomId)
          .emit(
            ChatEvents.Send.MessageDeleted,
            new DeleteMessageResponse(room._id + '', message._id + ''),
          );
      }
    }
  }

  @SubscribeMessage(ChatEvents.Receive.StartTyping)
  async startTyping(
    @MessageBody()
    body: StartStopTypingInput,
    @ConnectedSocket() client: Socket,
  ) {
    const valid = await this.validateDto(
      StartStopTypingInput,
      body,
      client,
      ChatEvents.Receive.StartTyping,
    );
    if (!valid) return;
    const userId = client.data.id;

    const [room, user] = await Promise.all([
      this.roomService.findById(body.roomId),
      this.userService.findById(userId),
    ]);

    if (room && user) {
      const userResponse = await this.userService.makeUserResponse(user);
      this.server
        .to(body.roomId)
        .emit(
          ChatEvents.Send.TypingStarted,
          new StartStopTypingResponse(room._id + '', userResponse),
        );
    }
  }

  @SubscribeMessage(ChatEvents.Receive.StopTyping)
  async stopTyping(
    @MessageBody()
    body: StartStopTypingInput,
    @ConnectedSocket() client: Socket,
  ) {
    const valid = await this.validateDto(
      StartStopTypingInput,
      body,
      client,
      ChatEvents.Receive.StopTyping,
    );
    if (!valid) return;
    const userId = client.data.id;

    const [room, user] = await Promise.all([
      this.roomService.findById(body.roomId),
      this.userService.findById(userId),
    ]);

    if (room && user) {
      const userResponse = await this.userService.makeUserResponse(user);
      this.server
        .to(body.roomId)
        .emit(
          ChatEvents.Send.TypingStopped,
          new StartStopTypingResponse(room._id + '', userResponse),
        );
    }
  }

  @SubscribeMessage(ChatEvents.Receive.StartPrivateCall)
  async startPrivateCall(
    @MessageBody()
    body: StartPrivateCallInput,
    @ConnectedSocket() client: Socket,
  ) {
    const valid = await this.validateDto(
      StartPrivateCallInput,
      body,
      client,
      ChatEvents.Receive.StartPrivateCall,
    );
    if (!valid) return;

    const room = await this.roomService.findById(body.roomId);

    if (!room || room?.type === RoomTypes.Group)
      return client.emit('error', {
        event: ChatEvents.Receive.StartPrivateCall,
        message: `can't start a ${RoomTypes.Private} call, the room is not found or the room is not a ${RoomTypes.Private} room, it's ${room?.type} `,
        errors: [],
      });

    client
      .to(body.roomId)
      .emit(
        ChatEvents.Send.PrivateCallReceived,
        new PrivateCallReceivedResponse(
          room._id + '',
          client.data.id,
          body.offer,
        ),
      );
  }

  @SubscribeMessage(ChatEvents.Receive.AnswerPrivateCall)
  async answerPrivateCall(
    @MessageBody()
    body: AnswerPrivateCallInput,
    @ConnectedSocket() client: Socket,
  ) {
    const valid = await this.validateDto(
      AnswerPrivateCallInput,
      body,
      client,
      ChatEvents.Receive.AnswerPrivateCall,
    );
    if (!valid) return;

    const room = await this.roomService.findById(body.roomId);

    if (!room || room?.type === RoomTypes.Group)
      return client.emit('error', {
        event: ChatEvents.Receive.AnswerPrivateCall,
        message: `can't answer the ${RoomTypes.Private} call, the room is not found or the room is not a ${RoomTypes.Private} room, it's ${room?.type} `,
        errors: [],
      });

    client
      .to(body.roomId)
      .emit(
        ChatEvents.Send.PrivateCallAnswered,
        new PrivateCallAnsweredResponse(
          room._id + '',
          client.data.id,
          body.answer,
        ),
      );
  }

  @SubscribeMessage(ChatEvents.Receive.DeclinePrivateCall)
  async declinePrivateCall(
    @MessageBody()
    body: DeclinePrivateCallInput,
    @ConnectedSocket() client: Socket,
  ) {
    const valid = await this.validateDto(
      DeclinePrivateCallInput,
      body,
      client,
      ChatEvents.Receive.DeclinePrivateCall,
    );
    if (!valid) return;

    const room = await this.roomService.findById(body.roomId);

    if (!room || room?.type === RoomTypes.Group)
      return client.emit('error', {
        event: ChatEvents.Receive.AnswerPrivateCall,
        message: `can't decline the ${RoomTypes.Private} call, the room is not found or the room is not a ${RoomTypes.Private} room, it's ${room?.type} `,
        errors: [],
      });

    client
      .to(body.roomId)
      .emit(
        ChatEvents.Send.PrivateCallDeclined,
        new PrivateCallDeclinedResponse(room._id + '', client.data.id),
      );
  }

  @SubscribeMessage(ChatEvents.Receive.ShareCandidate)
  async shareCandidate(
    @MessageBody()
    body: ShareCandidateInput,
    @ConnectedSocket() client: Socket,
  ) {
    const valid = await this.validateDto(
      ShareCandidateInput,
      body,
      client,
      ChatEvents.Receive.ShareCandidate,
    );
    if (!valid) return;

    const room = await this.roomService.findById(body.roomId);

    if (room) {
      client
        .to(body.roomId)
        .emit(
          ChatEvents.Send.CandidateReceived,
          new CandidateResponse(room._id + '', client.data.id, body.candidate),
        );
    }
  }
}
