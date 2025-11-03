import { NextRequest, NextResponse } from 'next/server';
import connectDB from '../../../lib/db';
import SupportTicket from '../../../lib/models/SupportTicket';
import { authMiddleware } from '../../../middleware';

export async function GET(request: NextRequest) {
  try {
    const authResult = await authMiddleware(request);
    if (authResult instanceof NextResponse) {
      return authResult; // Return error response if not authenticated
    }

    await connectDB();

    const user = authResult; // User from middleware

    const tickets = await SupportTicket.find({ userId: user.id }).sort({ createdAt: -1 });

    return NextResponse.json({
      success: true,
      count: tickets.length,
      data: tickets
    });
  } catch (error) {
    console.error('Get support tickets error:', error);
    return NextResponse.json(
      { success: false, message: 'Server error while fetching support tickets' },
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
    const { subject, message } = await request.json();

    // Validate input
    if (!subject || !message) {
      return NextResponse.json(
        { success: false, message: 'Subject and message are required' },
        { status: 400 }
      );
    }

    if (subject.length > 200 || message.length > 2000) {
      return NextResponse.json(
        { success: false, message: 'Subject or message too long' },
        { status: 400 }
      );
    }

    const ticket = await SupportTicket.create({
      userId: user.id,
      subject,
      message,
    });

    return NextResponse.json({
      success: true,
      data: ticket
    }, { status: 201 });
  } catch (error) {
    console.error('Create support ticket error:', error);
    return NextResponse.json(
      { success: false, message: 'Server error while creating support ticket' },
      { status: 500 }
    );
  }
}
