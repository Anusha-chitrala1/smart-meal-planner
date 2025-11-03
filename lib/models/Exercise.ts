import mongoose, { Document, Schema } from 'mongoose';

export interface IExercise extends Document {
  userId: string;
  type: string; // e.g., 'running', 'weightlifting', 'yoga', etc.
  duration: number; // in minutes
  caloriesBurned: number;
  date: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ExerciseSchema: Schema = new Schema({
  userId: {
    type: String,
    required: true,
    index: true
  },
  type: {
    type: String,
    required: true
  },
  duration: {
    type: Number,
    required: true,
    min: 0
  },
  caloriesBurned: {
    type: Number,
    required: true,
    min: 0
  },
  date: {
    type: Date,
    required: true,
    default: Date.now
  },
  notes: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

// Index for efficient queries
ExerciseSchema.index({ userId: 1, date: -1 });

export default mongoose.models.Exercise || mongoose.model<IExercise>('Exercise', ExerciseSchema);
