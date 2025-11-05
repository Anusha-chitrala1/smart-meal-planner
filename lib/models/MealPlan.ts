import mongoose, { Document, Schema } from 'mongoose';

export interface IMealPlan extends Document {
  _id: string;
  userId: string;
  date: string;
  meals: {
    breakfast: string[];
    lunch: string[];
    snack: string[];
    dinner: string[];
  };
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  createdAt: Date;
  updatedAt: Date;
}

const MealPlanSchema: Schema = new Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  date: {
    type: String,
    required: true
  },
  meals: {
    breakfast: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Meal'
    }],
    lunch: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Meal'
    }],
    snack: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Meal'
    }],
    dinner: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Meal'
    }]
  },
  totalCalories: {
    type: Number,
    default: 0
  },
  totalProtein: {
    type: Number,
    default: 0
  },
  totalCarbs: {
    type: Number,
    default: 0
  },
  totalFat: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Create compound index for userId and date
MealPlanSchema.index({ userId: 1, date: 1 }, { unique: true });

export default mongoose.models.MealPlan || mongoose.model<IMealPlan>('MealPlan', MealPlanSchema);