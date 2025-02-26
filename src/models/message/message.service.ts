import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ObjectId, RootFilterQuery, Types } from 'mongoose';
import { Constants, Database } from 'src/config';
import { Message, MessageDocument } from './message.schema';
import { MessageAttachmentDocument } from './message-attachment.schema';
import { MessageReadDocument } from './message-read.schema';
import { RoomService } from '../room/room.service';
import { UserService } from '../user/user.service';
import {
  MessageAttachmentInput,
  SendMessageInput,
  UpdateMessageInput,
} from 'src/gateway/chat/dto';
import { MessageResponse } from './message.dto';
import { User } from '../user/user.schema';
import { Room } from '../room/room.schema';

@Injectable()
export class MessageService {
  constructor(
    @InjectModel(Database.Collections.Message)
    private messageModel: Model<MessageDocument>,
    @InjectModel(Database.Collections.MessageAttachment)
    private messageAttachmentModel: Model<MessageAttachmentDocument>,
    @InjectModel(Database.Collections.MessageRead)
    private messageReadModel: Model<MessageReadDocument>,
    @Inject(forwardRef(() => RoomService))
    private readonly roomService: RoomService, // Use forwardRef
    private readonly userService: UserService,
  ) {}

  async findById(id: string | ObjectId) {
    if (id && Types.ObjectId.isValid(id + '')) {
      return await this.messageModel.findById(new Types.ObjectId(id + ''));
    }
    return undefined;
  }

  async createMessageAttachment(data: MessageAttachmentInput) {
    return await this.messageAttachmentModel.create({
      URL: data.URL,
      mimeType: data.mimeType,
    });
  }

  async findMessagesInRoom(
    roomId: string,
    lastMessageId: string | undefined,
    limit: number = 100,
  ) {
    const filters: RootFilterQuery<Message> = {};
    if (lastMessageId) {
      filters._id = { $lt: lastMessageId };
    }

    const messages = await this.messageModel
      .find({ roomId, ...filters })
      .limit(limit)
      .sort({ _id: -1 })
      .exec();

    const hasMore = messages.length === limit;

    return { messages, hasMore };
  }

  async create(senderId: string, data: SendMessageInput) {
    const [room, user, replyOnMessage] = await Promise.all([
      this.roomService.findById(data.roomId),
      this.userService.findById(senderId),
      this.findById(data.message.replyOn),
    ]);

    if (room && user) {
      const message = await this.messageModel.create({
        roomId: data.roomId,
        sender: user._id,
        content: data.message.content,
        attachments: await Promise.all(
          data.message.attachments.map((a) => this.createMessageAttachment(a)),
        ),
        replyOn: replyOnMessage?._id,
      });

      room.lastMessage = message._id;
      await room.save();
      return await message.save();
    }

    return undefined;
  }

  async updateForUser(data: UpdateMessageInput, userId: string) {
    const [message, replyOnMessage] = await Promise.all([
      this.findById(data.messageId),
      this.findById(data.message.replyOn),
    ]);

    if (message) {
      const isSender = await this.isSender(message, userId);

      if (isSender) {
        message.content = data.message.content;
        message.attachments = await Promise.all(
          data.message.attachments.map((a) => this.createMessageAttachment(a)),
        );
        message.replyOn = replyOnMessage?._id;
      }

      return await message.save();
    }

    return undefined;
  }

  async isSender(message: Message, userId: string) {
    return message.sender + '' === userId;
  }

  async isAlreadyRead(message: Message, userId: string) {
    const read = message.readBy.find((r) => r.readBy + '' === userId);
    return read ? true : false;
  }

  async markAsRead(room: Room, message: MessageDocument, userId: string) {
    if (message.sender + '' !== userId) {
      const isParticipant = this.roomService.isUserParticipant(room, userId);
      if (isParticipant) {
        const isAlreadyRead = await this.isAlreadyRead(message, userId);
        if (!isAlreadyRead) {
          const read = await this.messageReadModel.create({
            readBy: userId,
          });

          message.readBy.push(read);
          return message.save();
        }
      }
    }

    return message;
  }

  async makeMessageResponse(
    message: Message,
    participants: {
      user: User | undefined;
      role: Constants.ParticipantRoles;
    }[],
    userId: string | undefined,
  ) {
    const participant = participants.find(
      (p) => p.user._id + '' === message.sender + '',
    );

    const userResponse = await this.userService.makeUserResponse(
      participant.user,
    );

    let replyOnResponse: MessageResponse | undefined = undefined;

    const replyOn = await this.findById(message.replyOn);
    if (replyOn) {
      replyOnResponse = await this.makeMessageResponse(
        replyOn,
        participants,
        userId,
      );
    }

    return new MessageResponse(message, userResponse, replyOnResponse, userId);
  }

  async makeMessagesResponse(
    messages: Message[],
    roomId: string,
    userId: string | undefined,
  ) {
    const room = await this.roomService.findById(roomId + '');
    if (room) {
      const participants = await this.roomService.getRoomParticipants(room);

      const messagesResponse: MessageResponse[] = await Promise.all(
        messages.map((m) => this.makeMessageResponse(m, participants, userId)),
      );

      return messagesResponse;
    }
    return [];
  }

  async deleteForUser(message: MessageDocument, userId: string) {
    const isSender = await this.isSender(message, userId);
    if (isSender) {
      this.delete(message);
      return true;
    }

    return false;
  }

  private async delete(message: MessageDocument) {
    return message.deleteOne();
  }
}
