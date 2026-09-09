import mongoose, { Schema, Document } from 'mongoose';

export type UserRole = 'CEO / Executive' | 'Project Manager' | 'Site Engineer' | 'Contractor / Viewer';

export interface IUser {
  name: string;
  email: string;
  password?: string;
  role: UserRole;
  avatar?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface IUserDocument extends IUser, Document {}

const UserSchema: Schema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: ['CEO / Executive', 'Project Manager', 'Site Engineer', 'Contractor / Viewer'],
      default: 'Site Engineer',
    },
    avatar: { type: String, default: '' },
  },
  { timestamps: true }
);

export default mongoose.models.User || mongoose.model<IUserDocument>('User', UserSchema);
