import { Model, Document, model, models, Schema } from 'mongoose';

export interface UserDocument extends Document {
  username: string;
  name: string;
  email: string;
  image: string;
  emailVerified: null;
}

const userSchema = new Schema<UserDocument>({
  username: {
    type: String,
  },
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  image: {
    type: String,
    required: true,
  },
  emailVerified: {
    type: Boolean,
  },
});

const User: Model<UserDocument> =
  models.User || model<UserDocument>('User', userSchema);

export default User;
