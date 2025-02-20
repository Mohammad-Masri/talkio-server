import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsIn, IsOptional, IsString } from 'class-validator';
import { ArrayDataResponse, FindAllDto } from 'src/common/global.dto';
import { Constants } from 'src/config';
import { RoomResponse } from 'src/models/room/room.dto';

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

export class RoomArrayDataResponse extends ArrayDataResponse<RoomResponse> {
  @ApiProperty({ type: RoomResponse, isArray: true })
  data: RoomResponse[];
  constructor(
    totalCount: number,
    data: Array<RoomResponse>,
    page: number,
    limit: number,
  ) {
    super(totalCount, data, page, limit);
    this.data = data;
  }
}
