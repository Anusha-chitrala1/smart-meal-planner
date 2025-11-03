import { NextRequest, NextResponse } from 'next/server';
import connectDB from '../../../lib/db';
import jwt from 'jsonwebtoken';
import UserGoals from '../../../lib/models/UserGoals';

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    // Verify user authentication
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as jwt.JwtPayload;

    // Fetch user goals
    let goals = await UserGoals.findOne({ userId: decoded.id });

    // If no goals exist, create default goals
    if (!goals) {
      goals = new UserGoals({
        userId: decoded.id,
        calorieGoal: 2000,
        waterGoal: 2000, // 2 liters
        exerciseGoal: 150 // 150 minutes per week
      });
      await goals.save();
    }

    return NextResponse.json({
      success: true,
      data: goals
    });
  } catch (error) {
    console.error('Goals API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    // Verify user authentication
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as jwt.JwtPayload;

    const { calorieGoal, waterGoal, exerciseGoal } = await request.json();

    // Validate inputs
    if (calorieGoal !== undefined && (calorieGoal < 0 || calorieGoal > 10000)) {
      return NextResponse.json({ error: 'Invalid calorie goal' }, { status: 400 });
    }
    if (waterGoal !== undefined && (waterGoal < 0 || waterGoal > 10000)) {
      return NextResponse.json({ error: 'Invalid water goal' }, { status: 400 });
    }
    if (exerciseGoal !== undefined && (exerciseGoal < 0 || exerciseGoal > 10000)) {
      return NextResponse.json({ error: 'Invalid exercise goal' }, { status: 400 });
    }

    // Update or create goals
    const goals = await UserGoals.findOneAndUpdate(
      { userId: decoded.id },
      {
        calorieGoal: calorieGoal !== undefined ? parseInt(calorieGoal) : undefined,
        waterGoal: waterGoal !== undefined ? parseInt(waterGoal) : undefined,
        exerciseGoal: exerciseGoal !== undefined ? parseInt(exerciseGoal) : undefined
      },
      { new: true, upsert: true }
    );

    return NextResponse.json({
      success: true,
      data: goals
    });
  } catch (error) {
    console.error('Goals POST error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
