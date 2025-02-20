import { Schema, Types, Document } from 'mongoose';
import { Database } from 'src/config';

export class MessageRead {
  readBy: Schema.Types.ObjectId;
}

export type MessageReadDocument = MessageRead & Document<MessageRead>;

export const MessageReadSchema = new Schema(
  {
    readBy: {
      type: Types.ObjectId,
      ref: Database.Collections.User,
      required: true,
    },
  },
  { timestamps: true },
);
