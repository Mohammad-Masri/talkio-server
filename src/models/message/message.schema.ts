import { Schema, Types, Document } from 'mongoose';
import { MessageReadDocument, MessageReadSchema } from './message-read.schema';
import {
  MessageAttachmentDocument,
  MessageAttachmentSchema,
} from './message-attachment.schema';
import { Database } from 'src/config';

export class Message {
  _id: Schema.Types.ObjectId;
  roomId: Schema.Types.ObjectId;
  sender: Types.ObjectId;
  content: string | undefined;
  attachments: MessageAttachmentDocument[];
  readBy: MessageReadDocument[];
  createdAt: Date;
  updatedAt: Date;
}

export type MessageDocument = Message & Document<Message>;

export const MessageSchema = new Schema(
  {
    roomId: {
      type: Types.ObjectId,
      ref: Database.Collections.Room,
      required: true,
    },
    sender: {
      type: Types.ObjectId,
      ref: Database.Collections.User,
      required: true,
    },
    content: {
      type: String,
      required: false,
    },
    attachments: {
      type: [MessageAttachmentSchema],
      required: true,
      default: [],
    },
    readBy: {
      type: [MessageReadSchema],
      required: true,
      default: [],
    },
  },
  { timestamps: true },
);
