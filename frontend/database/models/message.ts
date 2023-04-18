import { Model, Document, model, models, Schema, Types } from 'mongoose';
import { ConversationDocument } from './conversation';
import { UserDocument } from './user';
import { Timestamp } from 'mongodb';

export interface MessageDocument extends Document {
  conversation: ConversationDocument['_id'] | string; // ID percakapan yang terkait dengan pesan
  sender: string | UserDocument; // ID pengirim pesan
  content: string; // Isi pesan
  createdAt: Date;
}

const messageSchema = new Schema<MessageDocument>(
  {
    conversation: { type: Schema.Types.ObjectId, ref: 'Conversation' },
    sender: { type: Schema.Types.ObjectId, ref: 'User' },
    content: { type: String, required: true },
  },
  { timestamps: true }
);

const Message: Model<MessageDocument> =
  models.Message || model<MessageDocument>('Message', messageSchema);

export default Message;
