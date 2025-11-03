import mongoose, { Document, Schema } from 'mongoose';

export interface IUserGoals extends Document {
  userId: string;
  calorieGoal: number; // daily calorie goal
  waterGoal: number; // daily water goal in ml
  exerciseGoal: number; // weekly exercise goal in minutes
  createdAt: Date;
  updatedAt: Date;
}

const UserGoalsSchema: Schema = new Schema({
  userId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  calorieGoal: {
    type: Number,
    required: true,
    min: 0,
    default: 2000
  },
  waterGoal: {
    type: Number,
    required: true,
    min: 0,
    default: 2000 // 2 liters
  },
  exerciseGoal: {
    type: Number,
    required: true,
    min: 0,
    default: 150 // 150 minutes per week
  }
}, {
  timestamps: true
});

export default mongoose.models.UserGoals || mongoose.model<IUserGoals>('UserGoals', UserGoalsSchema);
