import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import connectDB from '../../../lib/db';
import ShoppingListItem from '../../../lib/models/ShoppingList';
import User from '../../../lib/models/User';

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, message: 'Not authorized, no token' },
        { status: 401 }
      );
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as jwt.JwtPayload;

    await connectDB();
    const user = await User.findById(decoded.id);
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 401 }
      );
    }

    const shoppingList = await ShoppingListItem.find({ userId: user._id }).sort({ createdAt: -1 });

    return NextResponse.json({
      success: true,
      data: shoppingList
    });
  } catch (error) {
    console.error('Error fetching shopping list:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch shopping list' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, message: 'Not authorized, no token' },
        { status: 401 }
      );
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as jwt.JwtPayload;

    await connectDB();
    const user = await User.findById(decoded.id);
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { ingredientName, amount, unit, checked, recipeTitle } = body;

    const newItem = new ShoppingListItem({
      userId: user._id,
      ingredientName,
      amount: amount || '',
      unit: unit || '',
      checked: checked || false,
      recipeTitle: recipeTitle || ''
    });

    await newItem.save();

    return NextResponse.json({
      success: true,
      data: newItem
    });
  } catch (error) {
    console.error('Error creating shopping list item:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to create shopping list item' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, message: 'Not authorized, no token' },
        { status: 401 }
      );
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as jwt.JwtPayload;

    await connectDB();
    const user = await User.findById(decoded.id);
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { id, checked } = body;

    const updatedItem = await ShoppingListItem.findOneAndUpdate(
      { _id: id, userId: user._id },
      { checked },
      { new: true }
    );

    if (!updatedItem) {
      return NextResponse.json(
        { success: false, message: 'Item not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: updatedItem
    });
  } catch (error) {
    console.error('Error updating shopping list item:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to update shopping list item' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, message: 'Not authorized, no token' },
        { status: 401 }
      );
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as jwt.JwtPayload;

    await connectDB();
    const user = await User.findById(decoded.id);
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 401 }
      );
    }

    const url = new URL(request.url);
    const id = url.searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, message: 'Item ID required' },
        { status: 400 }
      );
    }

    const deletedItem = await ShoppingListItem.findOneAndDelete({
      _id: id,
      userId: user._id
    });

    if (!deletedItem) {
      return NextResponse.json(
        { success: false, message: 'Item not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Item deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting shopping list item:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to delete shopping list item' },
      { status: 500 }
    );
  }
}
