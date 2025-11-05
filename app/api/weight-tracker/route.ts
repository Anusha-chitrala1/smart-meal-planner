import { NextRequest, NextResponse } from 'next/server';
import connectDB from '../../../lib/db';
import jwt from 'jsonwebtoken';
import User from '../../../lib/models/User';

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

    const { weight, date } = await request.json();

    // Validate input
    if (!weight || !date) {
      return NextResponse.json(
        { success: false, message: 'Weight and date are required' },
        { status: 400 }
      );
    }

    if (weight <= 0 || weight > 500) {
      return NextResponse.json(
        { success: false, message: 'Weight must be between 0 and 500 kg' },
        { status: 400 }
      );
    }

    // Save weight entry to user profile
    const weightEntry = {
      weight,
      date: new Date(date),
      loggedAt: new Date()
    };

    await User.findByIdAndUpdate(decoded.id, {
      $push: { weightTracker: weightEntry }
    });

    return NextResponse.json({
      success: true,
      data: weightEntry
    });
  } catch (error) {
    console.error('Weight tracker error:', error);
    return NextResponse.json(
      { success: false, message: 'Server error while logging weight' },
      { status: 500 }
    );
  }
}

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

    // Get user's weight tracker data
    const user = await User.findById(decoded.id).select('weightTracker');

    return NextResponse.json({
      success: true,
      data: user?.weightTracker || []
    });
  } catch (error) {
    console.error('Get weight tracker error:', error);
    return NextResponse.json(
      { success: false, message: 'Server error while fetching weight data' },
      { status: 500 }
    );
  }
}
