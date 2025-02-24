import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, RootFilterQuery } from 'mongoose';
import { Constants, Database } from 'src/config';
import { Message, MessageDocument } from './message.schema';
import { MessageAttachmentDocument } from './message-attachment.schema';
import { MessageReadDocument } from './message-read.schema';
import { RoomService } from '../room/room.service';
import { UserService } from '../user/user.service';
import { SendMessageInput } from 'src/gateway/chat/dto';
import { MessageResponse } from './message.dto';
import { User } from '../user/user.schema';

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

  async findById(id: string | undefined) {
    if (id) {
      return await this.messageModel.findById(id);
    }
    return undefined;
  }

  async findMessagesInRoom(
    roomId: string,
    lastMessageId: string | undefined,
    page: number = 1,
    limit: number = 100,
  ) {
    const filters: RootFilterQuery<Message> = {};
    if (lastMessageId) {
      filters._id = { $lt: lastMessageId };
    }

    const skip = (Number(page) - 1) * Number(limit);

    const messages = await this.messageModel
      .find({ roomId, ...filters })
      .skip(skip)
      .limit(limit)
      .sort({ _id: -1 })
      .exec();

    const hasMore = messages.length === limit;

    return { messages, hasMore };
  }

  async create(senderId: string, data: SendMessageInput) {
    const [room, user] = await Promise.all([
      this.roomService.findById(data.roomId),
      this.userService.findById(senderId),
    ]);

    if (room && user) {
      const message = await this.messageModel.create({
        roomId: data.roomId,
        sender: user._id,
        content: data.message.content,
        attachments: data.message.attachments,
      });

      room.lastMessage = message._id;
      await room.save();
      return await message.save();
    }

    return undefined;
  }

  async makeMessageResponse(
    message: Message,
    participants: {
      user: User | undefined;
      role: Constants.ParticipantRoles;
    }[],
  ) {
    const participant = participants.find(
      (p) => p.user._id + '' === message.sender + '',
    );

    const userResponse = await this.userService.makeUserResponse(
      participant.user,
    );

    return new MessageResponse(message, userResponse);
  }

  async makeMessagesResponse(messages: Message[], roomId: string) {
    const room = await this.roomService.findById(roomId + '');
    if (room) {
      const participants = await this.roomService.getRoomParticipants(room);

      const messagesResponse: MessageResponse[] = await Promise.all(
        messages.map((m) => this.makeMessageResponse(m, participants)),
      );

      return messagesResponse;
    }
    return [];
  }
}
