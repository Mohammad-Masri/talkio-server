import { Type } from 'class-transformer';
import {
  IsArray,
  IsNotEmpty,
  IsNotEmptyObject,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

export class JoinLeaveRoomInput {
  @IsString()
  @IsNotEmpty()
  roomId: string;
}

export class MessageAttachmentInput {
  @IsString()
  @IsNotEmpty()
  URL: string;

  @IsString()
  @IsNotEmpty()
  mimeType: string;
}

export class MessageInput {
  @IsString()
  @IsOptional()
  replyOn?: string;

  @IsString()
  @IsOptional()
  content?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MessageAttachmentInput)
  attachments: MessageAttachmentInput[];
}

export class SendMessageInput {
  @IsString()
  @IsNotEmpty()
  roomId: string;

  @IsNotEmptyObject()
  @ValidateNested({ each: true })
  @Type(() => MessageInput)
  message: MessageInput;
}

export class UpdateMessageInput {
  @IsString()
  @IsNotEmpty()
  roomId: string;

  @IsString()
  @IsNotEmpty()
  messageId: string;

  @IsNotEmptyObject()
  message: MessageInput;
}

export class ReadDeleteMessageInput {
  @IsString()
  @IsNotEmpty()
  roomId: string;

  @IsString()
  @IsNotEmpty()
  messageId: string;
}
