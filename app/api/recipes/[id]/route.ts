import { NextRequest, NextResponse } from 'next/server';
import connectDB from '../../../../lib/db';
import Meal from '../../../../lib/models/Meal';
import jwt from 'jsonwebtoken';

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectDB();

    // Verify user authentication
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    let userId: string;

    if (token.startsWith('mock-jwt-')) {
      const parts = token.split('-');
      userId = parts[2];
    } else {
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as jwt.JwtPayload;
      userId = decoded.id;
    }

    const recipeData = await request.json();
    const { id } = params;

    // Check if this is a temp ID (client-side generated)
    if (id.startsWith('temp-')) {
      return NextResponse.json({ error: 'Cannot update temporary recipe. Please create a new one.' }, { status: 400 });
    }

    // Validate ObjectId format
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return NextResponse.json({ error: 'Invalid recipe ID format' }, { status: 400 });
    }

    // Update recipe in database
    const updatedRecipe = await Meal.findOneAndUpdate(
      { _id: id, userId },
      { ...recipeData, userId },
      { new: true, runValidators: true }
    );

    if (!updatedRecipe) {
      return NextResponse.json({ error: 'Recipe not found' }, { status: 404 });
    }

    return NextResponse.json({ 
      success: true, 
      data: updatedRecipe 
    });
  } catch (error) {
    console.error('Update recipe API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectDB();

    // Verify user authentication
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    let userId: string;

    if (token.startsWith('mock-jwt-')) {
      const parts = token.split('-');
      userId = parts[2];
    } else {
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as jwt.JwtPayload;
      userId = decoded.id;
    }

    const { id } = params;

    // Check if this is a temp ID (client-side generated)
    if (id.startsWith('temp-')) {
      return NextResponse.json({ error: 'Cannot delete temporary recipe' }, { status: 400 });
    }

    // Validate ObjectId format
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return NextResponse.json({ error: 'Invalid recipe ID format' }, { status: 400 });
    }

    // Delete recipe from database
    const deletedRecipe = await Meal.findOneAndDelete({ _id: id, userId });

    if (!deletedRecipe) {
      return NextResponse.json({ error: 'Recipe not found' }, { status: 404 });
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Recipe deleted successfully' 
    });
  } catch (error) {
    console.error('Delete recipe API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}