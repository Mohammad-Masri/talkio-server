import { Constants } from 'src/config';
import { Room } from './room.schema';
import { ApiProperty } from '@nestjs/swagger';
import { UserResponse } from '../user/user.dto';
import { MessageResponse } from '../message/message.dto';

export class RoomResponse {
  @ApiProperty()
  id: string;
  @ApiProperty()
  name: string;
  @ApiProperty({ enum: Constants.RoomTypes })
  type: Constants.RoomTypes;
  @ApiProperty({ type: Number })
  participantsCount: number;
  @ApiProperty({ type: MessageResponse, nullable: true })
  lastMessage: MessageResponse | undefined;

  constructor(room: Room, lastMessage: MessageResponse | undefined) {
    this.id = room._id + '';
    this.name = room.name;
    this.type = room.type;
    this.participantsCount = room.participants.length;

    this.lastMessage = lastMessage;
  }
}

export class ParticipantResponse {
  @ApiProperty({ type: UserResponse })
  user: UserResponse;
  @ApiProperty({ enum: Constants.ParticipantRoles })
  role: Constants.ParticipantRoles;

  constructor(user: UserResponse, role: Constants.ParticipantRoles) {
    this.user = user;
    this.role = role;
  }
}
