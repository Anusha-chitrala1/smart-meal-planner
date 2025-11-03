import { NextRequest, NextResponse } from 'next/server';
import connectDB from '../../../lib/db';
import jwt from 'jsonwebtoken';
import Exercise from '../../../lib/models/Exercise';

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

    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || 'this-week';

    // Calculate date range based on period
    const now = new Date();
    let startDate: Date;

    switch (period) {
      case 'last-month':
        startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        break;
      case 'last-week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'this-week':
        startDate = new Date(now.getTime() - now.getDay() * 24 * 60 * 60 * 1000);
        break;
      case 'this-month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      default:
        startDate = new Date(now.getTime() - now.getDay() * 24 * 60 * 60 * 1000);
    }

    // Fetch exercise data
    const exerciseData = await Exercise.find({
      userId: decoded.id,
      date: { $gte: startDate }
    }).sort({ date: 1 });

    // Group by date for daily totals
    const dailyTotals = exerciseData.reduce((acc: { [key: string]: { duration: number; calories: number } }, entry) => {
      const dateKey = entry.date.toISOString().split('T')[0];
      if (!acc[dateKey]) {
        acc[dateKey] = { duration: 0, calories: 0 };
      }
      acc[dateKey].duration += entry.duration;
      acc[dateKey].calories += entry.caloriesBurned;
      return acc;
    }, {});

    const totalDuration = Object.values(dailyTotals).reduce((sum: number, day: { duration: number; calories: number }) => sum + day.duration, 0);
    const totalCalories = Object.values(dailyTotals).reduce((sum: number, day: { duration: number; calories: number }) => sum + day.calories, 0);

    return NextResponse.json({
      success: true,
      data: {
        totalDuration,
        totalCalories,
        dailyTotals,
        entries: exerciseData
      }
    });
  } catch (error) {
    console.error('Exercise tracker API error:', error);
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

    const { type, duration, caloriesBurned, date, notes } = await request.json();

    if (!type || !duration || duration <= 0) {
      return NextResponse.json({ error: 'Type and valid duration are required' }, { status: 400 });
    }

    const exerciseEntry = new Exercise({
      userId: decoded.id,
      type,
      duration: parseInt(duration),
      caloriesBurned: parseInt(caloriesBurned) || 0,
      date: date ? new Date(date) : new Date(),
      notes
    });

    await exerciseEntry.save();

    return NextResponse.json({
      success: true,
      data: exerciseEntry
    });
  } catch (error) {
    console.error('Exercise tracker POST error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
