import mongoose, { Document, Schema } from 'mongoose';

export interface IOrder extends Document {
  _id: string;
  userId: string;
  meals: Array<{
    _id: string;
    name: string;
    protein: number;
    carbs: number;
    fat: number;
    calories: number;
    category: string;
    ingredients: string[];
  }>;
  totalCalories: number;
  totalPrice: number;
  paymentMethod: 'cod' | 'online';
  status: 'pending' | 'completed' | 'cancelled';
  createdAt: Date;
  updatedAt: Date;
}

const OrderSchema: Schema = new Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Please add a user ID']
  },
  meals: [{
    _id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Meal',
      required: true
    },
    name: {
      type: String,
      required: true
    },
    protein: {
      type: Number,
      required: true
    },
    carbs: {
      type: Number,
      required: true
    },
    fat: {
      type: Number,
      required: true
    },
    calories: {
      type: Number,
      required: true
    },
    category: {
      type: String,
      required: true
    },
    ingredients: [{
      type: String,
      required: true
    }]
  }],
  totalCalories: {
    type: Number,
    required: [true, 'Please add total calories'],
    min: [0, 'Total calories cannot be negative']
  },
  totalPrice: {
    type: Number,
    required: [true, 'Please add total price'],
    min: [0, 'Total price cannot be negative']
  },
  paymentMethod: {
    type: String,
    required: [true, 'Please add payment method'],
    enum: ['cod', 'online']
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'cancelled'],
    default: 'pending'
  }
}, {
  timestamps: true
});

export default mongoose.models.Order || mongoose.model<IOrder>('Order', OrderSchema);
