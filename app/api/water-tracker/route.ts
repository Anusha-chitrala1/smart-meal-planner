import { NextRequest, NextResponse } from 'next/server';
import connectDB from '../../../lib/db';
import jwt from 'jsonwebtoken';
import WaterIntake from '../../../lib/models/WaterIntake';

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

    // Fetch water intake data
    const waterData = await WaterIntake.find({
      userId: decoded.id,
      date: { $gte: startDate }
    }).sort({ date: 1 });

    // Group by date for daily totals
    const dailyTotals = waterData.reduce((acc: { [key: string]: number }, entry) => {
      const dateKey = entry.date.toISOString().split('T')[0];
      acc[dateKey] = (acc[dateKey] || 0) + entry.amount;
      return acc;
    }, {});

    const totalWater = Object.values(dailyTotals).reduce((sum: number, amount: number) => sum + amount, 0);

    return NextResponse.json({
      success: true,
      data: {
        totalWater,
        dailyTotals,
        entries: waterData
      }
    });
  } catch (error) {
    console.error('Water tracker API error:', error);
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

    const { amount, date } = await request.json();

    if (!amount || amount <= 0) {
      return NextResponse.json({ error: 'Valid amount is required' }, { status: 400 });
    }

    const waterEntry = new WaterIntake({
      userId: decoded.id,
      amount: parseInt(amount),
      date: date ? new Date(date) : new Date()
    });

    await waterEntry.save();

    return NextResponse.json({
      success: true,
      data: waterEntry
    });
  } catch (error) {
    console.error('Water tracker POST error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
