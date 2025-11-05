import mongoose, { Document, Schema } from 'mongoose';

export interface IMeal extends Document {
  _id: string;
  userId: string;
  name: string;
  description?: string;
  protein: number;
  carbs: number;
  fat: number;
  calories: number;
  category: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  ingredients: string[];
  instructions?: string[];
  image?: string;
  prepTime?: number;
  cookTime?: number;
  servings?: number;
  isHealthy?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const MealSchema: Schema = new Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: [true, 'Please add a meal name'],
    maxlength: [100, 'Name can not be more than 100 characters']
  },
  description: {
    type: String,
    required: false
  },
  protein: {
    type: Number,
    required: [true, 'Please add protein amount'],
    min: [0, 'Protein cannot be negative']
  },
  carbs: {
    type: Number,
    required: [true, 'Please add carbs amount'],
    min: [0, 'Carbs cannot be negative']
  },
  fat: {
    type: Number,
    required: [true, 'Please add fat amount'],
    min: [0, 'Fat cannot be negative']
  },
  calories: {
    type: Number,
    required: [true, 'Please add calories'],
    min: [0, 'Calories cannot be negative']
  },
  category: {
    type: String,
    required: [true, 'Please add a category'],
    enum: ['breakfast', 'lunch', 'dinner', 'snack']
  },
  ingredients: [{
    type: String,
    required: true
  }],
  image: {
    type: String,
    required: false
  },
  instructions: [{
    type: String,
    required: false
  }],
  prepTime: {
    type: Number,
    required: false,
    min: [0, 'Prep time cannot be negative']
  },
  cookTime: {
    type: Number,
    required: false,
    min: [0, 'Cook time cannot be negative']
  },
  servings: {
    type: Number,
    required: false,
    min: [1, 'Servings must be at least 1']
  },
  isHealthy: {
    type: Boolean,
    required: false,
    default: false
  }
}, {
  timestamps: true
});

export default mongoose.models.Meal || mongoose.model<IMeal>('Meal', MealSchema);
