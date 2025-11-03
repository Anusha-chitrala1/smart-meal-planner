import { NextRequest, NextResponse } from 'next/server';
import connectDB from '../../../lib/db';
import Order from '../../../lib/models/Order';
import Meal from '../../../lib/models/Meal';
import { authMiddleware } from '../../../middleware';

export async function GET(request: NextRequest) {
  try {
    const authResult = await authMiddleware(request);
    if (authResult instanceof NextResponse) {
      return authResult; // Return error response if not authenticated
    }

    await connectDB();

    const user = authResult; // User from middleware

    const orders = await Order.find({ userId: user.id }).sort({ createdAt: -1 });

    return NextResponse.json({
      success: true,
      count: orders.length,
      data: orders
    });
  } catch (error) {
    console.error('Get orders error:', error);
    return NextResponse.json(
      { success: false, message: 'Server error while fetching orders' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const authResult = await authMiddleware(request);
    if (authResult instanceof NextResponse) {
      return authResult; // Return error response if not authenticated
    }

    await connectDB();

    const user = authResult; // User from middleware
    const { meals: mealIds, paymentMethod } = await request.json();

    // Validate input
    if (!mealIds || !Array.isArray(mealIds) || mealIds.length === 0) {
      return NextResponse.json(
        { success: false, message: 'At least one meal is required' },
        { status: 400 }
      );
    }

    if (!paymentMethod || !['cod', 'online'].includes(paymentMethod)) {
      return NextResponse.json(
        { success: false, message: 'Valid payment method is required' },
        { status: 400 }
      );
    }

    // Fetch meal details
    const meals = await Meal.find({ _id: { $in: mealIds } });

    if (meals.length !== mealIds.length) {
      return NextResponse.json(
        { success: false, message: 'One or more meals not found' },
        { status: 400 }
      );
    }

    // Calculate totals
    const totalCalories = meals.reduce((sum, meal) => sum + meal.calories, 0);
    const totalPrice = meals.length * 10; // $10 per meal

    // Create order
    const order = await Order.create({
      userId: user.id,
      meals: meals.map(meal => ({
        _id: meal._id,
        name: meal.name,
        protein: meal.protein,
        carbs: meal.carbs,
        fat: meal.fat,
        calories: meal.calories,
        category: meal.category,
        ingredients: meal.ingredients,
      })),
      totalCalories,
      totalPrice,
      paymentMethod,
    });

    return NextResponse.json({
      success: true,
      data: order
    }, { status: 201 });
  } catch (error) {
    console.error('Create order error:', error);
    return NextResponse.json(
      { success: false, message: 'Server error while creating order' },
      { status: 500 }
    );
  }
}
