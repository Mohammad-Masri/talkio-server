import { Controller, Get, Param, Query, Req, UseGuards } from '@nestjs/common';
import {
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { Request } from 'express';
import { AuthorizedRequest } from 'src/common/global.dto';
import { JWTAuthGuard } from 'src/guards/jwt-authentication.guard';
import { MessageResponse } from 'src/models/message/message.dto';
import { MessageService } from 'src/models/message/message.service';
import { RoomResponse } from 'src/models/room/room.dto';
import { RoomService } from 'src/models/room/room.service';
import { FindRoomMessagesDto, MessagesResponse } from './dto';

@Controller('/rooms')
@ApiTags('User Room')
@UseGuards(JWTAuthGuard)
export class RoomController {
  constructor(
    private readonly roomService: RoomService,
    private readonly messageService: MessageService,
  ) {}

  @Get('/')
  @ApiOperation({ summary: 'get rooms' })
  @ApiOkResponse({
    description: 'Rooms fetched successfully',
    type: Object,
  })
  async fetchRooms(@Req() req: AuthorizedRequest & Request) {
    const userId = req.context.id;

    const rooms = await this.roomService.findAllForUser(userId);

    const roomsResponse = await this.roomService.makeRoomsResponse(
      rooms,
      userId,
    );

    return roomsResponse;
  }

  @Get('/:id')
  @ApiOperation({ summary: 'get room details' })
  @ApiParam({
    name: 'id',
    type: String,
    description: 'ID',
  })
  @ApiOkResponse({
    description: 'Room fetched successfully',
    type: RoomResponse,
  })
  @ApiNotFoundResponse({ description: 'Room not found' })
  async fetchRoomDetails(
    @Param('id') id: string,
    @Req() req: AuthorizedRequest & Request,
  ) {
    const userId = req.context.id;

    const room = await this.roomService.checkFoundById(id);
    return await this.roomService.makeRoomResponse(room, userId);
  }

  @Get('/:id/messages')
  @ApiOperation({ summary: 'get room messages' })
  @ApiParam({
    name: 'id',
    type: String,
    description: 'Room ID',
  })
  @ApiOkResponse({
    description: 'Messages fetched successfully',
    type: MessageResponse,
    isArray: true,
  })
  @ApiNotFoundResponse({ description: 'Room not found' })
  async getMessages(
    @Param('id') id: string,
    @Req() req: AuthorizedRequest & Request,
    @Query() query: FindRoomMessagesDto,
  ) {
    const userId = req.context.id;

    const room = await this.roomService.checkFoundById(id);

    const { messages, hasMore } = await this.messageService.findMessagesInRoom(
      room._id + '',
      query.lastMessageId,
      query.page,
      query.limit,
    );

    const messagesResponse = await this.messageService.makeMessagesResponse(
      messages,
      room._id + '',
    );
    return new MessagesResponse(messagesResponse, hasMore);
  }
}
