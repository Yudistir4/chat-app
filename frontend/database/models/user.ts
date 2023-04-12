import { Document, model, models, Schema } from 'mongoose';

export interface User extends Document {
  username: string;
  name: string;
  email: string;
  image: string;
  emailVerified: null;
}

const userSchema = new Schema<User>({
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
    type: String,
    required: true,
  },
});

const UserModel = models.user || model<User>('user', userSchema);

export default UserModel;
