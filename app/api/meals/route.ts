import { NextRequest, NextResponse } from 'next/server';
import connectDB from '../../../lib/db';
import Meal from '../../../lib/models/Meal';

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const isHealthy = searchParams.get('isHealthy');

    let query = {};
    if (isHealthy === 'true') {
      query = { isHealthy: true };
    }

    const meals = await Meal.find(query).sort({ createdAt: -1 });

    return NextResponse.json({
      success: true,
      count: meals.length,
      data: meals
    });
  } catch (error) {
    console.error('Get meals error:', error);
    return NextResponse.json(
      { success: false, message: 'Server error while fetching meals' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();

    // Validate required fields
    const { name, protein, carbs, fat, calories, category, ingredients } = body;

    if (!name || !protein || !carbs || !fat || !calories || !category || !ingredients) {
      return NextResponse.json(
        { success: false, message: 'All fields are required' },
        { status: 400 }
      );
    }

    if (protein < 0 || carbs < 0 || fat < 0 || calories < 0) {
      return NextResponse.json(
        { success: false, message: 'Nutritional values cannot be negative' },
        { status: 400 }
      );
    }

    if (!['breakfast', 'lunch', 'dinner', 'snack'].includes(category)) {
      return NextResponse.json(
        { success: false, message: 'Invalid category' },
        { status: 400 }
      );
    }

    if (!Array.isArray(ingredients) || ingredients.length === 0) {
      return NextResponse.json(
        { success: false, message: 'At least one ingredient is required' },
        { status: 400 }
      );
    }

    const meal = await Meal.create(body);

    return NextResponse.json({
      success: true,
      data: meal
    }, { status: 201 });
  } catch (error) {
    console.error('Create meal error:', error);
    return NextResponse.json(
      { success: false, message: 'Server error while creating meal' },
      { status: 500 }
    );
  }
}
