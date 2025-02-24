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
  @ApiProperty({ nullable: true })
  replyOn: ReplyOnMessageResponse | undefined;
  @ApiProperty({ nullable: true })
  content?: string;

  @ApiProperty({ type: MessageAttachmentResponse, isArray: true })
  attachments: MessageAttachmentResponse[];

  @ApiProperty({ type: UserResponse })
  sender: UserResponse | undefined;

  @ApiProperty()
  createdAt: Date;
  @ApiProperty()
  updatedAt: Date;

  constructor(
    message: Message,
    sender: UserResponse | undefined,
    replyOn: Message | undefined,
  ) {
    this.id = message._id + '';
    this.roomId = message.roomId + '';
    if (replyOn) {
      this.replyOn = new ReplyOnMessageResponse(replyOn);
    }
    this.attachments = message.attachments.map(
      (a) => new MessageAttachmentResponse(a),
    );
    this.content = message.content;
    this.sender = sender;
    this.createdAt = message.createdAt;
    this.updatedAt = message.updatedAt;
  }
}
