import { Schema, Document } from 'mongoose';
import { Database } from 'src/config';
import { CallStatuses } from 'src/config/constants';

export class Call {
  _id: Schema.Types.ObjectId;
  roomId: Schema.Types.ObjectId;
  callerId: Schema.Types.ObjectId;
  status: CallStatuses;
  createdAt: Date;
}

export type CallDocument = Call & Document<Call>;

export const CallSchema = new Schema(
  {
    roomId: {
      type: Schema.Types.ObjectId,
      ref: Database.Collections.Room,
    },

    callerId: {
      type: Schema.Types.ObjectId,
      ref: Database.Collections.User,
    },
    status: {
      type: String,
      enum: CallStatuses,
      default: CallStatuses.Ringing,
    },
  },
  { timestamps: true },
);
