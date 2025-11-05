import { NextRequest, NextResponse } from 'next/server';
import connectDB from '../../../lib/db';
import SupportTicket from '../../../lib/models/SupportTicket';
import sendEmail from '../../../lib/utils/email';
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
    const { subject, message, priority = 'medium', category = 'general', email, contactNumber } = await request.json();

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
      priority,
      category,
      userEmail: email || user.email,
      contactNumber,
      status: 'open'
    });

    // Send email notification to support team
    try {
      await sendEmail({
        email: 'anushachitrala01@gmail.com',
        subject: `New Support Ticket: ${subject}`,
        message: `
          New support ticket created:
          
          Subject: ${subject}
          Priority: ${priority}
          Category: ${category}
          User ID: ${user.id}
          User Email: ${email || user.email}
          Contact Number: ${contactNumber || 'Not provided'}
          
          Message:
          ${message}
          
          Ticket ID: ${ticket._id}
          
          Please respond to the user at: ${email || user.email}
        `
      });

      // Send confirmation email to user
      const userEmail = email || user.email;
      if (userEmail) {
        await sendEmail({
          email: userEmail,
          subject: `Support Ticket Created: ${subject}`,
          message: `
            Hi,
            
            Your support ticket has been created successfully.
            
            Ticket ID: ${ticket._id}
            Subject: ${subject}
            Status: Open
            
            We will respond to your inquiry within 24 hours.
            
            Thank you for contacting Smart Meal Planner Support!
            
            Best regards,
            Smart Meal Planner Team
            anushachitrala01@gmail.com
            +1 (555) 123-4567
          `
        });
      }
    } catch (emailError) {
      console.error('Failed to send support email:', emailError);
      // Don't fail the ticket creation if email fails
    }

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
