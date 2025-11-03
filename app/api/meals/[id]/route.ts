import { NextRequest, NextResponse } from 'next/server';
import connectDB from '../../../../lib/db';
import Meal from '../../../../lib/models/Meal';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    await connectDB();

    const resolvedParams = await params;
    const meal = await Meal.findById(resolvedParams.id);

    if (!meal) {
      return NextResponse.json(
        { success: false, message: 'Meal not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: meal
    });
  } catch (error) {
    console.error('Get meal error:', error);
    return NextResponse.json(
      { success: false, message: 'Server error while fetching meal' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    await connectDB();

    const resolvedParams = await params;
    const body = await request.json();

    // Validate nutritional values if provided
    const { protein, carbs, fat, calories, category, ingredients } = body;

    if (protein !== undefined && protein < 0) {
      return NextResponse.json(
        { success: false, message: 'Protein cannot be negative' },
        { status: 400 }
      );
    }

    if (carbs !== undefined && carbs < 0) {
      return NextResponse.json(
        { success: false, message: 'Carbs cannot be negative' },
        { status: 400 }
      );
    }

    if (fat !== undefined && fat < 0) {
      return NextResponse.json(
        { success: false, message: 'Fat cannot be negative' },
        { status: 400 }
      );
    }

    if (calories !== undefined && calories < 0) {
      return NextResponse.json(
        { success: false, message: 'Calories cannot be negative' },
        { status: 400 }
      );
    }

    if (category && !['breakfast', 'lunch', 'dinner', 'snack'].includes(category)) {
      return NextResponse.json(
        { success: false, message: 'Invalid category' },
        { status: 400 }
      );
    }

    if (ingredients && (!Array.isArray(ingredients) || ingredients.length === 0)) {
      return NextResponse.json(
        { success: false, message: 'At least one ingredient is required' },
        { status: 400 }
      );
    }

    const meal = await Meal.findByIdAndUpdate(resolvedParams.id, body, {
      new: true,
      runValidators: true
    });

    if (!meal) {
      return NextResponse.json(
        { success: false, message: 'Meal not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: meal
    });
  } catch (error) {
    console.error('Update meal error:', error);
    return NextResponse.json(
      { success: false, message: 'Server error while updating meal' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    await connectDB();

    const resolvedParams = await params;
    const meal = await Meal.findById(resolvedParams.id);

    if (!meal) {
      return NextResponse.json(
        { success: false, message: 'Meal not found' },
        { status: 404 }
      );
    }

    await Meal.findByIdAndDelete(resolvedParams.id);

    return NextResponse.json({
      success: true,
      message: 'Meal deleted successfully'
    });
  } catch (error) {
    console.error('Delete meal error:', error);
    return NextResponse.json(
      { success: false, message: 'Server error while deleting meal' },
      { status: 500 }
    );
  }
}
