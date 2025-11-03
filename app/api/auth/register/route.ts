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

      - Smart Meal Planner Team
    `;

    try {
      await sendEmail({
        email: user.email,
        subject: "Verify Your Email - Smart Meal Planner",
        message,
      });
    } catch (emailError) {
      console.error("Email sending failed:", emailError);
      // Don't fail registration if email fails, just log it
    }

    return NextResponse.json({
      success: true,
      message:
        "User registered successfully. Please check your email to verify your account.",
      data: {
        user: {
          id: user._id,
          email: user.email,
          fullName: user.fullName,
          isVerified: user.isVerified,
        },
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
