import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ObjectId, RootFilterQuery, Types } from 'mongoose';
import { Database } from 'src/config';
import { Call, CallDocument } from './call.schema';
import { CallStatuses } from 'src/config/constants';
import { UserService } from '../user/user.service';
import { RoomService } from '../room/room.service';
import { CallResponse } from './call.dto';

@Injectable()
export class CallService {
  constructor(
    @InjectModel(Database.Collections.Call)
    private callModel: Model<CallDocument>,
    private userService: UserService,
    private roomService: RoomService,
  ) {}

  async findById(id: string | ObjectId) {
    if (id && Types.ObjectId.isValid(id + '')) {
      return await this.callModel.findById(id).exec();
    }
    return undefined;
  }

  async findOne(filters: RootFilterQuery<Call>) {
    return await this.callModel.findOne(filters);
  }

  async findAll(filters: RootFilterQuery<Call>, page: number, limit: number) {
    const skip = (Number(page) - 1) * Number(limit);

    const calls = await this.callModel
      .find(filters)
      .skip(skip)
      .limit(limit)
      .exec();

    const count = await this.callModel.countDocuments(filters);

    return {
      calls,
      count,
    };
  }

  async checkFoundById(id: string) {
    const call = await this.findById(id);
    if (!call) {
      throw new BadRequestException(`call with id (${id}) is not found`);
    }
    return call;
  }

  async create(call: Partial<Call>) {
    const haveCall = await this.isThereCallAtRoom(call.roomId + '');
    if (haveCall) return;
    return await this.callModel.create(call);
  }

  async setCallStatus(call: CallDocument, status: CallStatuses) {
    call.status = status;
    return await call.save();
  }

  async isThereCallAtRoom(roomId: string) {
    const calls = await this.callModel.find({
      roomId,
      status: { $in: [CallStatuses.Ringing, CallStatuses.Ongoing] },
    });

    return calls.length !== 0 ? true : false;
  }

  async makeCallResponse(call: Call, userId: string | undefined) {
    const [room, user] = await Promise.all([
      this.roomService.findById(call.roomId + ''),
      this.userService.findById(call.callerId + ''),
    ]);

    const [roomResponse, userResponse] = await Promise.all([
      this.roomService.makeRoomResponse(room, userId, false),
      this.userService.makeUserResponse(user),
    ]);
    return new CallResponse(call, roomResponse, userResponse, userId);
  }
}
