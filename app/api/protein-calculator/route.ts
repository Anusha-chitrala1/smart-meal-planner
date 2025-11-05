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

    // For mock tokens, create a mock user ID
    let userId: string;
    if (token.startsWith('mock-jwt-')) {
      // Extract user ID from mock token
      const parts = token.split('-');
      userId = parts[2];
    } else {
      // Verify real JWT
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as jwt.JwtPayload;
      userId = decoded.id;
    }

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

    // Save to user profile - skip for mock users
    if (!token.startsWith('mock-jwt-')) {
      await User.findByIdAndUpdate(userId, {
        proteinCalculator: {
          weight,
          activityLevel,
          goal,
          gender,
          recommendedProtein,
          lastCalculated: new Date()
        }
      });
    }

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

    // For mock tokens, create a mock user ID
    let userId: string;
    if (token.startsWith('mock-jwt-')) {
      // Extract user ID from mock token
      const parts = token.split('-');
      userId = parts[2];
    } else {
      // Verify real JWT
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as jwt.JwtPayload;
      userId = decoded.id;
    }

    // Get user's protein calculator data - return null for mock users
    let user = null;
    if (!token.startsWith('mock-jwt-')) {
      user = await User.findById(userId).select('proteinCalculator');
    }

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
