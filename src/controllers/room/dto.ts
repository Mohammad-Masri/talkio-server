import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsIn,
  IsMongoId,
  IsOptional,
  IsString,
  ValidateIf,
} from 'class-validator';
import { ArrayDataResponse, FindAllDto } from 'src/common/global.dto';
import { Constants } from 'src/config';
import { MessageResponse } from 'src/models/message/message.dto';
import { ShortRoomResponse } from 'src/models/room/room.dto';

class ParticipantInput {
  @ApiProperty()
  userId: string;
  @ApiProperty({ enum: Constants.ParticipantRoles })
  role: Constants.ParticipantRoles;
}

export class CreateRoomBody {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  name: string | undefined;

  @ApiProperty({
    required: true,
    enum: Constants.RoomTypes,
  })
  @IsIn([...Object.values(Constants.RoomTypes)])
  type: Constants.RoomTypes;

  @ApiProperty({ type: ParticipantInput, isArray: true, required: true })
  @IsArray()
  participants: ParticipantInput[];
}

export class UpdateRoomBody {
  @ApiProperty({ required: true })
  @IsString()
  name: string;
}

export class AddRoomParticipantsBody {
  @ApiProperty({ type: ParticipantInput, isArray: true, required: true })
  @IsArray()
  participants: ParticipantInput[];
}

export class RemoveRoomParticipantsBody {
  @ApiProperty({ type: String, isArray: true, required: true })
  @IsArray()
  participantIds: string[];
}

export class FindAllRoomsDto extends FindAllDto {}

export class FindRoomMessagesDto extends FindAllDto {
  @ApiProperty({ nullable: true, required: false })
  @IsOptional()
  @IsString()
  @ValidateIf((o) => o.lastMessageId !== '')
  @IsMongoId()
  lastMessageId?: string;
}

export class RoomArrayDataResponse extends ArrayDataResponse<ShortRoomResponse> {
  @ApiProperty({ type: ShortRoomResponse, isArray: true })
  data: ShortRoomResponse[];
  constructor(
    totalCount: number,
    data: Array<ShortRoomResponse>,
    page: number,
    limit: number,
  ) {
    super(totalCount, data, page, limit);
    this.data = data;
  }
}

export class MessagesResponse {
  @ApiProperty({ type: MessageResponse, isArray: true })
  data: MessageResponse[];

  @ApiProperty({ type: Boolean })
  hasMore: boolean;
  constructor(messages: MessageResponse[], hasMore: boolean) {
    this.data = messages;
    this.hasMore = hasMore;
  }
}
