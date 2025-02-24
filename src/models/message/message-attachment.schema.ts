import { Schema, Document } from 'mongoose';

export class MessageAttachment {
  _id: Schema.Types.ObjectId;
  mimeType: string;
  URL: string;
}

export type MessageAttachmentDocument = MessageAttachment &
  Document<MessageAttachment>;

export const MessageAttachmentSchema = new Schema(
  {
    mimeType: {
      type: String,
      required: true,
    },
    URL: {
      type: String,
      required: true,
    },
  },
  { timestamps: true },
);
