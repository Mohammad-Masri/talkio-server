import { ApiProperty } from '@nestjs/swagger';
import { Message } from './message.schema';
import { UserResponse } from '../user/user.dto';

export class MessageResponse {
  @ApiProperty()
  id: string;
  @ApiProperty()
  roomId: string;
  @ApiProperty({ nullable: true })
  content?: string;

  @ApiProperty({ type: UserResponse })
  sender: UserResponse | undefined;

  @ApiProperty()
  createdAt: Date;
  constructor(message: Message, sender: UserResponse | undefined) {
    this.id = message._id + '';
    this.roomId = message.roomId + '';
    this.content = message.content;
    this.sender = sender;
    this.createdAt = message.createdAt;
  }
}
