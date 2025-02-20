import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, RootFilterQuery } from 'mongoose';
import { Constants, Database } from 'src/config';
import { Room, RoomDocument, RoomParticipantDocument } from './room.schema';
import { UserDocument } from '../user/user.schema';
import { UserService } from '../user/user.service';
import { ParticipantResponse, RoomResponse } from './room.dto';
import { UserResponse } from '../user/user.dto';
import { RoomArrayDataResponse } from 'src/controllers/room/dto';
import { MessageResponse } from '../message/message.dto';

@Injectable()
export class RoomService {
  constructor(
    @InjectModel(Database.Collections.Room)
    private roomModel: Model<RoomDocument>,
    @InjectModel(Database.Collections.RoomParticipant)
    private roomParticipantModel: Model<RoomParticipantDocument>,
    private readonly userService: UserService,
  ) {}

  async findById(id: string) {
    return await this.roomModel.findById(id).exec();
  }

  async findOne(filters: RootFilterQuery<Room>) {
    return await this.roomModel.findOne(filters);
  }

  async findAll(filters: RootFilterQuery<Room>, page: number, limit: number) {
    const skip = (Number(page) - 1) * Number(limit);

    const rooms = await this.roomModel
      .find(filters)
      .skip(skip)
      .limit(limit)
      .exec();

    const count = await this.roomModel.countDocuments(filters);

    return {
      rooms,
      count,
    };
  }

  async findAllForUser(userId: string) {
    return await this.roomModel
      .find({ 'participants.userId': userId })
      .sort({ lastMessage: -1, createdAt: -1 });
  }

  async checkFoundById(id: string) {
    const room = await this.findById(id);
    if (!room) {
      throw new BadRequestException(`room with id (${id}) is not found`);
    }
    return room;
  }

  async generateRoomName(participants: UserDocument[]) {
    const names = participants.map((p) => p.name);
    return names.join(' - ');
  }

  async isAlreadyParticipant(room: RoomDocument, userId: string) {
    const participant = room.participants.find((p) => p.userId + '' === userId);
    return participant ? true : false;
  }

  async addParticipantToRoom(
    roomId: string,
    userId: string,
    role: Constants.ParticipantRoles,
  ) {
    let room = await this.checkFoundById(roomId);
    await this.userService.checkFoundById(userId);

    const isParticipant = await this.isAlreadyParticipant(room, userId);

    if (!isParticipant) {
      const participant = new this.roomParticipantModel({
        userId,
        role,
      });
      room.participants.push(participant);

      room = await room.save();
    }

    return room;
  }

  async removeParticipantFromRoom(roomId: string, userId: string) {
    const room = await this.checkFoundById(roomId);

    if (room.type === Constants.RoomTypes.Private) {
      throw new BadRequestException(
        `can't remove participant from a Private room`,
      );
    }

    room.participants = room.participants.filter(
      (p) => p.userId + '' !== userId + '',
    );

    return await room.save();
  }

  async update(room: RoomDocument, newRoomDate: Partial<Room>) {
    if (room.type !== Constants.RoomTypes.Private) {
      room.name = newRoomDate.name;
    }

    return await room.save();
  }

  async addParticipantsToRoom(
    roomId: string,
    participants: { userId: string; role: Constants.ParticipantRoles }[],
  ) {
    let room = await this.checkFoundById(roomId);

    if (room.type === Constants.RoomTypes.Private) {
      throw new BadRequestException(`can't add participants to a Private room`);
    }

    const users = await Promise.all(
      await participants.map((p) => this.userService.checkFoundById(p.userId)),
    );

    for (let i = 0; i < users.length; i++) {
      const u = users[i];
      room = await this.addParticipantToRoom(
        room._id + '',
        u._id + '',
        participants[i].role,
      );
    }

    return room;
  }

  async removeParticipantsFromRoom(roomId: string, participantIds: string[]) {
    let room = await this.checkFoundById(roomId);
    if (room.type === Constants.RoomTypes.Private) {
      throw new BadRequestException(
        `can't remove participants from a Private room`,
      );
    }

    const users = await Promise.all(
      await participantIds.map((pid) => this.userService.checkFoundById(pid)),
    );

    for (let i = 0; i < users.length; i++) {
      const u = users[i];
      room = await this.removeParticipantFromRoom(roomId, u._id + '');
    }

    return room;
  }

  async create(
    name: string | undefined,
    type: Constants.RoomTypes,
    participants: { userId: string; role: Constants.ParticipantRoles }[],
  ) {
    // get only 2 participants if the room is private
    if (type === Constants.RoomTypes.Private) {
      participants = participants.slice(0, 2);
    }

    const users = await Promise.all(
      await participants.map((p) => this.userService.checkFoundById(p.userId)),
    );

    if (type === Constants.RoomTypes.Private) {
      name = await this.generateRoomName(users);
    }

    if (!name) name = await this.generateRoomName(users);

    let room = await this.roomModel.create({
      name,
      type,
    });

    await room.save();

    for (let i = 0; i < users.length; i++) {
      const u = users[i];
      room = await this.addParticipantToRoom(
        room._id + '',
        u._id + '',
        type === Constants.RoomTypes.Private
          ? Constants.ParticipantRoles.Member
          : participants[i].role,
      );
    }

    return room;
  }

  async makeRoomResponse(room: Room) {
    const lastMessageResponse: MessageResponse | undefined = undefined;

    // if(room.lastMessage){
    //  const message = room.populate('lastMessage')
    //  const lastMessageResponse = await this.mae
    // }

    return new RoomResponse(room, lastMessageResponse);
  }

  async makeRoomsResponse(rooms: Room[]) {
    const roomsResponse: RoomResponse[] = [];
    for (let i = 0; i < rooms.length; i++) {
      const room = rooms[i];
      const roomResponse = await this.makeRoomResponse(room);
      roomsResponse.push(roomResponse);
    }
    return roomsResponse;
  }

  async getRoomParticipants(room: RoomDocument) {
    const participantsResponse: ParticipantResponse[] = [];
    for (let i = 0; i < room.participants.length; i++) {
      const user = await this.userService.checkFoundById(
        room.participants[i].userId + '',
      );

      const userResponse = await this.userService.makeUserResponse(user);

      const participantResponse = await this.makeParticipantResponse(
        userResponse,
        room.participants[i].role,
      );
      participantsResponse.push(participantResponse);
    }

    return participantsResponse;
  }

  async makeParticipantResponse(
    user: UserResponse,
    role: Constants.ParticipantRoles,
  ) {
    return new ParticipantResponse(user, role);
  }

  async makeRoomArrayDataResponse(
    totalCount: number,
    data: Array<RoomResponse>,
    page: number,
    limit: number,
  ) {
    return new RoomArrayDataResponse(totalCount, data, page, limit);
  }

  async delete(room: RoomDocument) {
    // TODO: delete all related data
    return await room.deleteOne();
  }
}
