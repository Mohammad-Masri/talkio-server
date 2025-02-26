import { Constants } from 'src/config';
import { Room } from './room.schema';
import { ApiProperty } from '@nestjs/swagger';
import { UserResponse } from '../user/user.dto';
import { MessageResponse } from '../message/message.dto';
import { RoomTypes } from 'src/config/constants';

export class ShortRoomResponse {
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

  constructor(
    room: Room,
    lastMessage: MessageResponse | undefined,
    roomName: string | undefined,
  ) {
    this.id = room._id + '';
    this.name = room.type === RoomTypes.Private ? roomName : room.name;
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

export class FullRoomResponse extends ShortRoomResponse {
  @ApiProperty({ type: ParticipantResponse, isArray: true })
  participants: ParticipantResponse[];

  constructor(
    room: Room,
    lastMessage: MessageResponse | undefined,
    roomName: string | undefined,
    participants: ParticipantResponse[],
  ) {
    super(room, lastMessage, roomName);
    this.participants = participants;
  }
}
