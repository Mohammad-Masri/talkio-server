import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsNotEmpty,
  IsNotEmptyObject,
  IsObject,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { CallResponse } from 'src/models/call/call.dto';
import { UserResponse } from 'src/models/user/user.dto';

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

export class ReadMessageResponse {
  @ApiProperty()
  roomId: string;
  @ApiProperty()
  messageId: string;

  @ApiProperty()
  readAt: Date;

  constructor(roomId: string, messageId: string, readAt: Date) {
    this.roomId = roomId;
    this.messageId = messageId;
    this.readAt = readAt;
  }
}

export class DeleteMessageResponse {
  @ApiProperty()
  roomId: string;
  @ApiProperty()
  messageId: string;

  constructor(roomId: string, messageId: string) {
    this.roomId = roomId;
    this.messageId = messageId;
  }
}

export class StartStopTypingInput {
  @IsString()
  @IsNotEmpty()
  roomId: string;
}

export class StartStopTypingResponse {
  @ApiProperty()
  roomId: string;
  @ApiProperty({ type: UserResponse })
  user: UserResponse;

  constructor(roomId: string, user: UserResponse) {
    this.roomId = roomId;
    this.user = user;
  }
}

export class SendCallOfferInput {
  @IsString()
  @IsNotEmpty()
  roomId: string;

  @IsObject()
  offer: any;
}

export class CallInitializedResponse {
  @ApiProperty()
  roomId: string;

  @ApiProperty({ type: CallResponse })
  call: CallResponse;

  constructor(roomId: string, call: CallResponse) {
    this.roomId = roomId;
    this.call = call;
  }
}

export class CallOfferResponse {
  @ApiProperty()
  roomId: string;
  @ApiProperty()
  from: string;
  @ApiProperty({ type: Object })
  offer: any;
  @ApiProperty({ type: CallResponse })
  call: CallResponse;

  constructor(roomId: string, from: string, offer: any, call: CallResponse) {
    this.roomId = roomId;
    this.from = from;
    this.offer = offer;
    this.call = call;
  }
}

export class AnswerCallOfferInput {
  @IsString()
  @IsNotEmpty()
  roomId: string;

  @IsObject()
  answer: any;
}

export class DeclineCallOfferInput {
  @IsString()
  @IsNotEmpty()
  roomId: string;
}

export class AnswerCallOfferResponse {
  @ApiProperty()
  roomId: string;
  @ApiProperty()
  from: string;
  @ApiProperty({ type: Object })
  answer: any;

  constructor(roomId: string, from: string, answer: any) {
    this.roomId = roomId;
    this.from = from;
    this.answer = answer;
  }
}

export class DeclineCallOfferResponse {
  @ApiProperty()
  roomId: string;
  @ApiProperty()
  from: string;

  constructor(roomId: string, from: string) {
    this.roomId = roomId;
    this.from = from;
  }
}

export class ShareCandidateInput {
  @IsString()
  @IsNotEmpty()
  roomId: string;

  @IsObject()
  candidate: any;
}

export class CandidateResponse {
  @ApiProperty()
  roomId: string;
  @ApiProperty()
  from: string;
  @ApiProperty({ type: Object })
  candidate: any;

  constructor(roomId: string, from: string, candidate: any) {
    this.roomId = roomId;
    this.from = from;
    this.candidate = candidate;
  }
}
