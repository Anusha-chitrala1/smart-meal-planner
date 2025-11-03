import { NextRequest, NextResponse } from 'next/server';
import connectDB from '../../../../lib/db';
import User from '../../../../lib/models/User';
import sendEmail from '../../../../lib/utils/email';

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { success: false, message: 'Email is required' },
        { status: 400 }
      );
    }

    const user = await User.findOne({ email });

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }

    // Generate reset token
    const resetToken = user.generatePasswordResetToken();
    await user.save();

    // Send email
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
    const message = `
      Hi ${user.fullName},

      You requested a password reset for your Smart Meal Planner account.

      Please click the link below to reset your password:

      ${resetUrl}

      This link will expire in 10 minutes.

      If you didn't request this, please ignore this email.

      Best regards,
      Smart Meal Planner Team
    `;

    try {
      await sendEmail({
        email: user.email,
        subject: 'Password Reset - Smart Meal Planner',
        message,
      });

      return NextResponse.json({
        success: true,
        message: 'Password reset email sent'
      });
    } catch (error) {
      console.error('Email sending failed:', error);
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;
      await user.save();

      return NextResponse.json(
        { success: false, message: 'Email could not be sent' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json(
      { success: false, message: 'Server error during password reset request' },
      { status: 500 }
    );
  }
}
