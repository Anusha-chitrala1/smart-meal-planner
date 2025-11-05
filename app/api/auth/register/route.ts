import { NextRequest, NextResponse } from "next/server";
import connectDB from "../../../../lib/db";
import User from "../../../../lib/models/User";
import sendEmail from "../../../../lib/utils/email";
import jwt from "jsonwebtoken";
import crypto from "crypto";

const generateToken = (id: string): string => {
  return jwt.sign({ id }, process.env.JWT_SECRET!, {
    expiresIn: process.env.JWT_EXPIRE || "7d",
  } as jwt.SignOptions);
};

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const { email, password, fullName } = await request.json();

    if (!email || !password || !fullName) {
      return NextResponse.json(
        { success: false, message: "All fields are required" },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { success: false, message: "Password must be at least 6 characters" },
        { status: 400 }
      );
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return NextResponse.json(
        { success: false, message: "User already exists" },
        { status: 400 }
      );
    }

    const user = await User.create({ email, password, fullName });

    // Generate and save verification token
    const verificationToken = user.generateEmailVerificationToken();
    await user.save({ validateBeforeSave: false });

    // Send email
    const verifyUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://192.168.1.64:3000'}/verify-email/${verificationToken}`;

    const message = `
Hi ${fullName},

Welcome to Smart Meal Planner! Please verify your email by clicking the link below:

${verifyUrl}

This link expires in 10 minutes.

If you didn't create an account, please ignore this email.

- Smart Meal Planner Team
    `;

    const htmlMessage = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #ea580c;">Welcome to Smart Meal Planner!</h2>
        <p>Hi ${fullName},</p>
        <p>Thank you for signing up! Please verify your email address by clicking the button below:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${verifyUrl}" style="background-color: #ea580c; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">Verify Email Address</a>
        </div>
        <p>Or copy and paste this link in your browser:</p>
        <p style="word-break: break-all; color: #666;">${verifyUrl}</p>
        <p style="color: #666; font-size: 14px;">This link expires in 10 minutes.</p>
        <p style="color: #666; font-size: 14px;">If you didn't create an account, please ignore this email.</p>
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
        <p style="color: #999; font-size: 12px;">Smart Meal Planner Team</p>
      </div>
    `;

    try {
      await sendEmail({
        email: user.email,
        subject: "Verify Your Email - Smart Meal Planner",
        message,
        html: htmlMessage,
      });
    } catch (emailError) {
      console.error("Email sending failed:", emailError);
      // Don't fail registration if email fails, just log it
    }

    return NextResponse.json({
      success: true,
      message: "Registration successful! Please check your email to verify your account before signing in.",
      data: {
        user: {
          id: user._id,
          email: user.email,
          fullName: user.fullName,
          isVerified: user.isVerified,
        },
        requiresVerification: true,
      },
    });
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { success: false, message: "Server error during registration" },
      { status: 500 }
    );
  }
}
