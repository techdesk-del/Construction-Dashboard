import mongoose, { Schema, Document } from 'mongoose';
import { MaterialItem as IMaterialItem } from '@/types';

export interface IMaterialDocument extends Omit<IMaterialItem, 'id'>, Document {
  materialId: number;
}

const MaterialSchema: Schema = new Schema(
  {
    materialId: { type: Number, required: true, unique: true },
    name: { type: String, required: true },
    mat: { 
      type: String, 
      enum: ['Delivered', 'To be Delivered', 'Selection Pending', 'Partial'], 
      default: 'To be Delivered' 
    },
    work: { 
      type: String, 
      enum: ['Pending', 'In Progress', 'Complete', 'Not Started'], 
      default: 'Pending' 
    },
    resp: { type: String, default: '' },
    deadline: { type: String, required: true },
    phase: { type: String, default: '' },
    notes: { type: String, default: '' },
  },
  { timestamps: true }
);

MaterialSchema.index({ mat: 1, work: 1 });
MaterialSchema.index({ deadline: 1 });

export default mongoose.models.Material || mongoose.model<IMaterialDocument>('Material', MaterialSchema);
