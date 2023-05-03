import { Model, Document, model, models, Schema, Types } from 'mongoose';
import { ConversationDocument } from './conversation';
import { UserDocument } from './user';

export interface MessageDocument extends Document {
  conversation: ConversationDocument['_id'] | string;
  sender: string | UserDocument;
  content: string;
  isRead: boolean;
  createdAt: Date;
}

const messageSchema = new Schema<MessageDocument>(
  {
    conversation: { type: Schema.Types.ObjectId, ref: 'Conversation' },
    sender: { type: Schema.Types.ObjectId, ref: 'User' },
    content: { type: String, required: true },
    isRead: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const Message: Model<MessageDocument> =
  models.Message || model<MessageDocument>('Message', messageSchema);

export default Message;
