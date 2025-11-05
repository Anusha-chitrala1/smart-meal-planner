import { NextRequest, NextResponse } from 'next/server';
import connectDB from '../../../lib/db';
import jwt from 'jsonwebtoken';

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    let userId: string;

    if (token.startsWith('mock-jwt-')) {
      const parts = token.split('-');
      userId = parts[2];
    } else {
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as jwt.JwtPayload;
      userId = decoded.id;
    }

    // Mock water data for now
    const mockData = [
      { _id: '1', userId, date: new Date().toISOString().split('T')[0], glasses: 6, amount: 1500 },
      { _id: '2', userId, date: new Date(Date.now() - 86400000).toISOString().split('T')[0], glasses: 8, amount: 2000 }
    ];

    return NextResponse.json({
      success: true,
      data: mockData
    });

  } catch (error) {
    console.error('Error fetching water data:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    let userId: string;

    if (token.startsWith('mock-jwt-')) {
      const parts = token.split('-');
      userId = parts[2];
    } else {
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as jwt.JwtPayload;
      userId = decoded.id;
    }

    const { glasses, amount, date } = await request.json();

    const waterEntry = {
      _id: Date.now().toString(),
      userId,
      glasses: glasses || Math.floor(amount / 250),
      amount: amount || glasses * 250,
      date: date || new Date().toISOString().split('T')[0]
    };

    return NextResponse.json({
      success: true,
      data: waterEntry
    });

  } catch (error) {
    console.error('Error saving water data:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}