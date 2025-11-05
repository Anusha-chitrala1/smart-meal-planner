import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import connectDB from './lib/db';
import User from './lib/models/User';

export const runtime = 'nodejs';

export async function authMiddleware(request: NextRequest): Promise<NextResponse | { id: string; email: string; fullName: string }> {
  try {
    // Get token from Authorization header
    const authHeader = request.headers.get('authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, message: 'Not authorized, no token' },
        { status: 401 }
      );
    }

    const token = authHeader.split(' ')[1];

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as jwt.JwtPayload;

    // Connect to database and get user
    await connectDB();
    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 401 }
      );
    }

    return {
      id: user._id.toString(),
      email: user.email,
      fullName: user.fullName
    };
  } catch (error) {
    console.error('Auth middleware error:', error);
    return NextResponse.json(
      { success: false, message: 'Not authorized, token failed' },
      { status: 401 }
    );
  }
}

export async function middleware(request: NextRequest) {
  // Get the pathname of the request (e.g. /api/auth/login)
  const path = request.nextUrl.pathname;

  // Define protected routes
  const protectedRoutes = [
    '/api/orders',
    '/api/support',
    '/api/bmi-calculator',
    '/api/protein-calculator',
    '/api/exercise-tracker',
    '/api/water-tracker',
    '/api/goals',
    '/api/meal-planner',
    '/api/profile',
    '/api/shopping-list'
  ];

  // Check if the current path is protected
  const isProtectedRoute = protectedRoutes.some(route => path.startsWith(route));

  if (isProtectedRoute) {
    const authResult = await authMiddleware(request);
    if (authResult instanceof NextResponse) {
      return authResult; // Return error response if not authenticated
    }

    // Add user to request headers for use in API routes
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-user-id', authResult.id);
    requestHeaders.set('x-user-email', authResult.email);

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/api/:path*',
};
