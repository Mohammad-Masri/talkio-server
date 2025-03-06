import { CallStatuses } from 'src/config/constants';
import { ShortRoomResponse } from '../room/room.dto';
import { UserResponse } from '../user/user.dto';
import { Call } from './call.schema';

export class CallResponse {
  id: string;
  room: ShortRoomResponse;
  caller: UserResponse;
  status: CallStatuses;
  isYouCaller: boolean;
  createdAt: Date;

  constructor(
    call: Call,
    room: ShortRoomResponse,
    caller: UserResponse,
    userId: string | undefined,
  ) {
    this.id = call._id + '';
    this.room = room;
    this.caller = caller;
    this.isYouCaller = userId === caller.id ? true : false;
    this.status = call.status;
    this.createdAt = call.createdAt;
  }
}
