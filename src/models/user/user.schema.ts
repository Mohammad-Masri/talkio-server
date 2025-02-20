import { Schema, Document } from 'mongoose';

export class User {
  _id: Schema.Types.ObjectId;
  username: string;
  name: string;
  avatarURL: string | undefined;
  isOnline: boolean;
  lastSeen: Date | undefined;
}

export type UserDocument = User & Document<User>;

export const UserSchema = new Schema(
  {
    username: { type: String, required: true },
    name: { type: String, required: true },
    avatarURL: { type: String, required: false },
    isOnline: { type: Boolean, default: false },
    lastSeen: { type: Date, default: null, nullable: true },
  },
  { timestamps: true },
);
