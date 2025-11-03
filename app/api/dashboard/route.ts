import { NextRequest, NextResponse } from 'next/server';
import connectDB from '../../../lib/db';
import jwt from 'jsonwebtoken';
import Meal from '../../../lib/models/Meal';
import Order from '../../../lib/models/Order';
import WaterIntake from '../../../lib/models/WaterIntake';
import Exercise from '../../../lib/models/Exercise';
import UserGoals from '../../../lib/models/UserGoals';

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

    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || 'this-week';

    // Calculate date range based on period
    const now = new Date();
    let startDate: Date;

    switch (period) {
      case 'last-month':
        startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        break;
      case 'last-week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'this-week':
        startDate = new Date(now.getTime() - now.getDay() * 24 * 60 * 60 * 1000);
        break;
      case 'this-month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      default:
        startDate = new Date(now.getTime() - now.getDay() * 24 * 60 * 60 * 1000);
    }

    // Fetch meals within the period
    const meals = await Meal.find({
      userId: decoded.id,
      createdAt: { $gte: startDate }
    }).sort({ createdAt: -1 });

    // Fetch water intake within the period
    const waterData = await WaterIntake.find({
      userId: decoded.id,
      date: { $gte: startDate }
    }).sort({ date: 1 });

    // Fetch exercise data within the period
    const exerciseData = await Exercise.find({
      userId: decoded.id,
      date: { $gte: startDate }
    }).sort({ date: 1 });

    // Fetch user goals
    let goals = await UserGoals.findOne({ userId: decoded.id });
    if (!goals) {
      goals = new UserGoals({
        userId: decoded.id,
        calorieGoal: 2000,
        waterGoal: 2000,
        exerciseGoal: 150
      });
      await goals.save();
    }

    // Calculate stats
    const totalCalories = meals.reduce((sum: number, meal) => sum + meal.calories, 0);
    const totalWater = waterData.reduce((sum: number, entry) => sum + entry.amount, 0);
    const totalExerciseDuration = exerciseData.reduce((sum: number, entry) => sum + entry.duration, 0);
    const totalExerciseCalories = exerciseData.reduce((sum: number, entry) => sum + entry.caloriesBurned, 0);

    // Group data by date for graphs
    const calorieData = meals.reduce((acc: { [key: string]: number }, meal) => {
      const dateKey = new Date(meal.createdAt).toISOString().split('T')[0];
      acc[dateKey] = (acc[dateKey] || 0) + meal.calories;
      return acc;
    }, {});

    const waterDailyData = waterData.reduce((acc: { [key: string]: number }, entry) => {
      const dateKey = entry.date.toISOString().split('T')[0];
      acc[dateKey] = (acc[dateKey] || 0) + entry.amount;
      return acc;
    }, {});

    const exerciseDailyData = exerciseData.reduce((acc: { [key: string]: { duration: number; calories: number } }, entry) => {
      const dateKey = entry.date.toISOString().split('T')[0];
      if (!acc[dateKey]) {
        acc[dateKey] = { duration: 0, calories: 0 };
      }
      acc[dateKey].duration += entry.duration;
      acc[dateKey].calories += entry.caloriesBurned;
      return acc;
    }, {});

    const stats = {
      // Tracker data
      calorieTracker: {
        current: totalCalories,
        goal: goals.calorieGoal,
        dailyData: calorieData
      },
      waterTracker: {
        current: totalWater,
        goal: goals.waterGoal,
        dailyData: waterDailyData
      },
      exerciseTracker: {
        current: totalExerciseDuration,
        goal: goals.exerciseGoal,
        caloriesBurned: totalExerciseCalories,
        dailyData: exerciseDailyData
      },
      // Legacy data for backward compatibility
      totalMeals: meals.length,
      totalCalories,
      meals: meals.slice(0, 6),
      goals
    };

    return NextResponse.json({ success: true, data: stats });
  } catch (error) {
    console.error('Dashboard API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
