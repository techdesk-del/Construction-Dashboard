import mongoose, { Schema, Document } from 'mongoose';
import { Activity as IActivity } from '@/types';

export interface IActivityDocument extends Omit<IActivity, 'id'>, Document {
  activityId: number;
}

const ActivitySchema: Schema = new Schema(
  {
    activityId: { type: Number, required: true, unique: true },
    phase: { type: String, required: true },
    name: { type: String, required: true },
    start: { type: String, required: true },
    end: { type: String, required: true },
    priority: { type: String, enum: ['High', 'Medium', 'Low'], default: 'Medium' },
    resp: { type: String, default: '' },
    dep: { type: String, default: '' },
    status: { type: String, enum: ['Completed', 'In Progress', 'Not Started'], default: 'Not Started' },
    pct: { type: Number, default: 0, min: 0, max: 100 },
    remarks: { type: String, default: '' },
  },
  { timestamps: true }
);

ActivitySchema.index({ phase: 1, status: 1 });
ActivitySchema.index({ start: 1, end: 1 });

export default mongoose.models.Activity || mongoose.model<IActivityDocument>('Activity', ActivitySchema);
