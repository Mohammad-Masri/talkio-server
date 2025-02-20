import { ApiProperty } from '@nestjs/swagger';
import { Message } from './message.schema';

export class MessageResponse {
  @ApiProperty()
  id: string;
  @ApiProperty()
  roomId: string;
  @ApiProperty({ nullable: true })
  content?: string;

  @ApiProperty()
  createdAt: Date;
  constructor(message: Message) {
    this.id = message._id + '';
    this.roomId = message.roomId + '';
    this.content = message.content;
    this.createdAt = message.createdAt;
  }
}
