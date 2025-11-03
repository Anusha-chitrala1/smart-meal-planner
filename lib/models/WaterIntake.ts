import mongoose, { Document, Schema } from 'mongoose';

export interface IWaterIntake extends Document {
  userId: string;
  amount: number; // in ml
  date: Date;
  createdAt: Date;
  updatedAt: Date;
}

const WaterIntakeSchema: Schema = new Schema({
  userId: {
    type: String,
    required: true,
    index: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  date: {
    type: Date,
    required: true,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for efficient queries
WaterIntakeSchema.index({ userId: 1, date: -1 });

export default mongoose.models.WaterIntake || mongoose.model<IWaterIntake>('WaterIntake', WaterIntakeSchema);
