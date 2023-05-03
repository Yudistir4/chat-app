import { Model, Document, model, models, Schema, Types } from 'mongoose';
import { MessageDocument } from './message';
import { UserDocument } from './user';

export interface ConversationDocument extends Document {
  participants: UserDocument[];
  lastMessage: MessageDocument['_id'] | null | MessageDocument;
  unReadMessages: number;
}

const conversationSchema = new Schema<ConversationDocument>(
  {
    participants: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    lastMessage: { type: Schema.Types.ObjectId, ref: 'Message', default: null },
  },
  { timestamps: true }
);

const Conversation: Model<ConversationDocument> =
  models.Conversation ||
  model<ConversationDocument>('Conversation', conversationSchema);

export default Conversation;
