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

    const { weight, activityLevel, goal, gender } = await request.json();

    // Validate input
    if (!weight || !activityLevel || !goal || !gender) {
      return NextResponse.json(
        { success: false, message: 'All fields are required' },
        { status: 400 }
      );
    }

    if (weight <= 0) {
      return NextResponse.json(
        { success: false, message: 'Weight must be greater than 0' },
        { status: 400 }
      );
    }

    // Calculate recommended protein
    const weightLbs = weight * 2.20462; // Convert kg to lbs
    const recommendedProtein = Math.round(weightLbs * parseFloat(goal));

    // Save to user profile
    await User.findByIdAndUpdate(decoded.id, {
      proteinCalculator: {
        weight,
        activityLevel,
        goal,
        gender,
        recommendedProtein,
        lastCalculated: new Date()
      }
    });

    return NextResponse.json({
      success: true,
      data: {
        recommendedProtein,
        weight,
        activityLevel,
        goal,
        gender
      }
    });
  } catch (error) {
    console.error('Protein calculator error:', error);
    return NextResponse.json(
      { success: false, message: 'Server error while calculating protein' },
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

    // Get user's protein calculator data
    const user = await User.findById(decoded.id).select('proteinCalculator');

    return NextResponse.json({
      success: true,
      data: user?.proteinCalculator || null
    });
  } catch (error) {
    console.error('Get protein calculator error:', error);
    return NextResponse.json(
      { success: false, message: 'Server error while fetching protein data' },
      { status: 500 }
    );
  }
}
