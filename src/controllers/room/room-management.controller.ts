import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { CheckSecretKey } from 'src/guards/check-secret-key.guard';
import { RoomService } from 'src/models/room/room.service';
import {
  AddRoomParticipantsBody,
  CreateRoomBody,
  FindAllRoomsDto,
  RemoveRoomParticipantsBody,
  RoomArrayDataResponse,
  UpdateRoomBody,
} from './dto';
import { ParticipantResponse, RoomResponse } from 'src/models/room/room.dto';
import { RootFilterQuery } from 'mongoose';
import { Room } from 'src/models/room/room.schema';

@Controller('/management/rooms')
@ApiTags('Room Management')
@UseGuards(CheckSecretKey)
export class RoomManagementController {
  constructor(private readonly roomService: RoomService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new room' })
  @ApiCreatedResponse({
    description: 'The room has been successfully created.',
    type: RoomResponse,
  })
  @ApiBadRequestResponse({ description: 'Invalid input data' })
  async createNewRoom(@Body() body: CreateRoomBody) {
    const room = await this.roomService.create(
      body.name,
      body.type,
      body.participants,
    );

    return await this.roomService.makeRoomResponse(room, undefined);
  }

  @Get('/')
  @ApiOperation({ summary: 'get rooms' })
  @ApiOkResponse({
    description: 'Rooms fetched successfully',
    type: RoomArrayDataResponse,
  })
  async fetchRooms(@Query() query: FindAllRoomsDto) {
    const { q } = query;

    const filters: RootFilterQuery<Room> = {};
    if (q) {
      filters.$or = [
        {
          name: { $regex: q, $options: 'i' },
        },
      ];
    }

    const { count, rooms } = await this.roomService.findAll(
      filters,
      query.page,
      query.limit,
    );

    const roomsResponse = await this.roomService.makeRoomsResponse(
      rooms,
      undefined,
    );

    return await this.roomService.makeRoomArrayDataResponse(
      count,
      roomsResponse,
      query.page,
      query.limit,
    );
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
  async fetchRoomDetails(@Param('id') id: string) {
    const room = await this.roomService.checkFoundById(id);
    return await this.roomService.makeRoomResponse(room, undefined);
  }

  @Get('/:id/participants')
  @ApiOperation({ summary: 'get room participants details' })
  @ApiParam({
    name: 'id',
    type: String,
    description: 'ID',
  })
  @ApiOkResponse({
    description: 'Room fetched successfully',
    type: ParticipantResponse,
    isArray: true,
  })
  @ApiNotFoundResponse({ description: 'Room not found' })
  async fetchRoomParticipantsDetails(@Param('id') id: string) {
    const room = await this.roomService.checkFoundById(id);
    return await this.roomService.getRoomParticipants(room);
  }

  @Put('/:id')
  @ApiOperation({ summary: 'update room details' })
  @ApiParam({
    name: 'id',
    type: String,
    description: 'ID',
  })
  @ApiOkResponse({
    description: 'room details updated successfully',
    type: RoomResponse,
  })
  @ApiNotFoundResponse({ description: 'Room not found' })
  async updateRoomDetails(
    @Param('id') id: string,
    @Body() body: UpdateRoomBody,
  ) {
    let room: any = await this.roomService.checkFoundById(id);

    room = await this.roomService.update(room, { name: body.name });

    return await this.roomService.makeRoomResponse(room, undefined);
  }

  @Put('/:id/participants/add')
  @ApiOperation({ summary: 'add participants to room' })
  @ApiParam({
    name: 'id',
    type: String,
    description: 'ID',
  })
  @ApiOkResponse({
    description: 'Participants have been added successfully',
    type: ParticipantResponse,
    isArray: true,
  })
  @ApiNotFoundResponse({ description: 'Room not found' })
  async addParticipantsToRoom(
    @Param('id') id: string,
    @Body() body: AddRoomParticipantsBody,
  ) {
    const room = await this.roomService.addParticipantsToRoom(
      id,
      body.participants,
    );

    return await this.roomService.getRoomParticipants(room);
  }

  @Put('/:id/participants/remove')
  @ApiOperation({ summary: 'remove participants from room' })
  @ApiParam({
    name: 'id',
    type: String,
    description: 'ID',
  })
  @ApiOkResponse({
    description: 'Participants have been removed successfully',
    type: ParticipantResponse,
    isArray: true,
  })
  @ApiNotFoundResponse({ description: 'Room not found' })
  async removeParticipantsFromRoom(
    @Param('id') id: string,
    @Body() body: RemoveRoomParticipantsBody,
  ) {
    const room = await this.roomService.removeParticipantsFromRoom(
      id,
      body.participantIds,
    );
    return await this.roomService.getRoomParticipants(room);
  }

  @Delete('/:id')
  @ApiOperation({ summary: 'delete room' })
  @ApiParam({
    name: 'id',
    type: String,
    description: 'ID',
  })
  @ApiOkResponse({
    description: 'Room deleted successfully',
    type: RoomResponse,
  })
  @ApiNotFoundResponse({ description: 'Room not found' })
  async deleteRoom(@Param('id') id: string) {
    const room = await this.roomService.checkFoundById(id);
    await this.roomService.delete(room);
    return await this.roomService.makeRoomResponse(room, undefined);
  }
}
