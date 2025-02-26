import { ApiProperty } from '@nestjs/swagger';
import { Message } from './message.schema';
import { UserResponse } from '../user/user.dto';
import { MessageAttachment } from './message-attachment.schema';

export class ReplyOnMessageResponse {
  @ApiProperty()
  id: string;

  @ApiProperty({ nullable: true })
  content?: string;

  constructor(message: Message) {
    this.id = message._id + '';
    this.content = message.content;
  }
}

export class MessageAttachmentResponse {
  @ApiProperty()
  id: string;

  @ApiProperty()
  URL: string;

  @ApiProperty()
  mimeType: string;

  constructor(attachment: MessageAttachment) {
    this.id = attachment._id + '';
    this.URL = attachment.URL;
    this.mimeType = attachment.mimeType;
  }
}

export class MessageResponse {
  @ApiProperty()
  id: string;
  @ApiProperty()
  roomId: string;
  @ApiProperty({ type: MessageResponse, nullable: true })
  replyOn: MessageResponse | undefined;
  @ApiProperty({ nullable: true })
  content?: string;

  @ApiProperty({ type: MessageAttachmentResponse, isArray: true })
  attachments: MessageAttachmentResponse[];

  @ApiProperty({ type: UserResponse })
  sender: UserResponse | undefined;

  @ApiProperty({ type: Boolean })
  readedByMe: boolean;

  @ApiProperty({ nullable: true })
  readAt: Date | undefined;

  @ApiProperty()
  createdAt: Date;
  @ApiProperty()
  updatedAt: Date;

  constructor(
    message: Message,
    sender: UserResponse | undefined,
    replyOn: MessageResponse | undefined,
    userId: string | undefined,
  ) {
    this.id = message._id + '';
    this.roomId = message.roomId + '';
    this.replyOn = replyOn;
    this.attachments = message.attachments.map(
      (a) => new MessageAttachmentResponse(a),
    );
    this.content = message.content;
    this.sender = sender;
    const read = message.readBy.filter((r) => r.readBy + '' !== sender.id);
    if (read.length) {
      this.readAt = read[0].createdAt;
    }

    this.readedByMe = message.readBy.find((r) => r.readBy + '' === userId)
      ? true
      : false;

    this.createdAt = message.createdAt;
    this.updatedAt = message.updatedAt;
  }
}
