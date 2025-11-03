import mongoose, { Document, Schema } from 'mongoose';

export interface IShoppingListItem extends Document {
  _id: string;
  userId: string;
  ingredientName: string;
  amount: string;
  unit: string;
  checked: boolean;
  recipeTitle?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ShoppingListItemSchema: Schema = new Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Please add a user ID']
  },
  ingredientName: {
    type: String,
    required: [true, 'Please add an ingredient name'],
    maxlength: [200, 'Ingredient name can not be more than 200 characters']
  },
  amount: {
    type: String,
    default: ''
  },
  unit: {
    type: String,
    default: ''
  },
  checked: {
    type: Boolean,
    default: false
  },
  recipeTitle: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

export default mongoose.models.ShoppingListItem || mongoose.model<IShoppingListItem>('ShoppingListItem', ShoppingListItemSchema);
