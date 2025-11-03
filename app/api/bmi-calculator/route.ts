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

    const { height, weight, gender } = await request.json();

    // Validate input
    if (!height || !weight || !gender) {
      return NextResponse.json(
        { success: false, message: 'All fields are required' },
        { status: 400 }
      );
    }

    if (height <= 0 || weight <= 0) {
      return NextResponse.json(
        { success: false, message: 'Height and weight must be greater than 0' },
        { status: 400 }
      );
    }

    // Calculate BMI
    const heightInMeters = height / 100; // Convert cm to meters
    const bmi = Math.round((weight / (heightInMeters * heightInMeters)) * 10) / 10;

    // Determine BMI category
    let category = '';
    if (bmi < 18.5) category = 'Underweight';
    else if (bmi < 25) category = 'Normal';
    else if (bmi < 30) category = 'Overweight';
    else category = 'Obese';

    // Save to user profile
    await User.findByIdAndUpdate(decoded.id, {
      bmiCalculator: {
        height,
        weight,
        gender,
        bmi,
        category,
        lastCalculated: new Date()
      }
    });

    return NextResponse.json({
      success: true,
      data: {
        bmi,
        category,
        height,
        weight,
        gender
      }
    });
  } catch (error) {
    console.error('BMI calculator error:', error);
    return NextResponse.json(
      { success: false, message: 'Server error while calculating BMI' },
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

    // Get user's BMI calculator data
    const user = await User.findById(decoded.id).select('bmiCalculator');

    return NextResponse.json({
      success: true,
      data: user?.bmiCalculator || null
    });
  } catch (error) {
    console.error('Get BMI calculator error:', error);
    return NextResponse.json(
      { success: false, message: 'Server error while fetching BMI data' },
      { status: 500 }
    );
  }
}
