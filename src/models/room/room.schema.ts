import { Schema, Document, Types } from 'mongoose';
import { Constants, Database } from 'src/config';

export class RoomParticipant {
  userId: Schema.Types.ObjectId;
  role: Constants.ParticipantRoles;
}

export type RoomParticipantDocument = RoomParticipant &
  Document<RoomParticipant>;

export const RoomParticipantSchema = new Schema(
  {
    userId: {
      type: Types.ObjectId,
      ref: Database.Collections.User,
      required: true,
    },
    role: {
      type: String,
      enum: Constants.ParticipantRoles,
      default: Constants.ParticipantRoles.Member,
    },
  },
  { timestamps: true },
);

export class Room {
  _id: Schema.Types.ObjectId;
  name: string;
  type: Constants.RoomTypes;
  lastMessage: Schema.Types.ObjectId;
  participants: RoomParticipantDocument[];
}

export type RoomDocument = Room & Document<Room>;

export const RoomSchema = new Schema(
  {
    name: { type: String, required: true },
    participants: { type: [RoomParticipantSchema], default: [] },
    type: { type: String, enum: Constants.RoomTypes, required: true },
    lastMessage: {
      type: Types.ObjectId,
      ref: Database.Collections.Message,
      default: null,
    },
  },
  { timestamps: true },
);
