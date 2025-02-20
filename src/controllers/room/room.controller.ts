import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { AuthorizedRequest } from 'src/common/global.dto';
import { JWTAuthGuard } from 'src/guards/jwt-authentication.guard';
import { RoomService } from 'src/models/room/room.service';

@Controller('/rooms')
@ApiTags('User Room')
@UseGuards(JWTAuthGuard)
export class RoomController {
  constructor(private readonly roomService: RoomService) {}

  @Get('/')
  @ApiOperation({ summary: 'get rooms' })
  @ApiOkResponse({
    description: 'Rooms fetched successfully',
    type: Object,
  })
  async fetchRooms(@Req() req: AuthorizedRequest & Request) {
    const userId = req.context.id;

    const rooms = await this.roomService.findAllForUser(userId);

    const roomsResponse = await this.roomService.makeRoomsResponse(rooms);

    return roomsResponse;
  }
}
