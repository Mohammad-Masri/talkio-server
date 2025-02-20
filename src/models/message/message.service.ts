import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Database } from 'src/config';
import { Message, MessageDocument } from './message.schema';
import { MessageAttachmentDocument } from './message-attachment.schema';
import { MessageReadDocument } from './message-read.schema';
import { RoomService } from '../room/room.service';
import { UserService } from '../user/user.service';
import { SendMessageInput } from 'src/gateway/chat/dto';
import { MessageResponse } from './message.dto';

@Injectable()
export class MessageService {
  constructor(
    @InjectModel(Database.Collections.Message)
    private messageModel: Model<MessageDocument>,
    @InjectModel(Database.Collections.MessageAttachment)
    private messageAttachmentModel: Model<MessageAttachmentDocument>,
    @InjectModel(Database.Collections.MessageRead)
    private messageReadModel: Model<MessageReadDocument>,
    private readonly roomService: RoomService,
    private readonly userService: UserService,
  ) {}

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

  async makeMessageResponse(message: Message) {
    return new MessageResponse(message);
  }
}
