"use client"

import React, { useState, useEffect } from 'react';
import { Calendar, TrendingUp, Users, ShoppingCart, ChefHat, Target, Award, Clock, Droplets, Activity, Calculator, Plus, Minus, Dumbbell, Heart, Zap, Save } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

interface DashboardStats {
  totalMeals: number;
  weeklyCalories: number;
  savedRecipes: number;
  completedPlans: number;
  waterIntake: number;
  caloriesBurned: number;
  protein: number;
  carbs: number;
  fat: number;
}

interface UserProfile {
  age: number;
  weight: number;
  height: number;
  gender: 'male' | 'female';
  bmi: number;
  bmr: number;
}

interface CalendarEvent {
  date: string;
  type: 'workout' | 'meal' | 'water';
  value: number;
  note?: string;
}

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalMeals: 0,
    weeklyCalories: 0,
    savedRecipes: 0,
    completedPlans: 0,
    waterIntake: 0,
    caloriesBurned: 0,
    protein: 0,
    carbs: 0,
    fat: 0
  });
  const [userProfile, setUserProfile] = useState<UserProfile>({
    age: 0,
    weight: 0,
    height: 0,
    gender: 'male',
    bmi: 0,
    bmr: 0
  });
  const [loading, setLoading] = useState(true);
  const [waterGlasses, setWaterGlasses] = useState(0);
  const [dailyCalorieGoal, setDailyCalorieGoal] = useState(2000);
  const [showCalculators, setShowCalculators] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [exerciseData, setExerciseData] = useState<any[]>([]);
  const [weeklyWorkouts, setWeeklyWorkouts] = useState<number[]>([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = document.cookie.split('; ').find(row => row.startsWith('token='))?.split('=')[1];
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

      // Fetch user profile
      const profileResponse = await fetch('/api/profile', { headers });
      if (profileResponse.ok) {
        const profileResult = await profileResponse.json();
        const profile = profileResult.data;
        const bmi = profile.weight / ((profile.height / 100) ** 2);
        const bmr = profile.gender === 'male' 
          ? 88.362 + (13.397 * profile.weight) + (4.799 * profile.height) - (5.677 * profile.age)
          : 447.593 + (9.247 * profile.weight) + (3.098 * profile.height) - (4.330 * profile.age);
        
        setUserProfile({ ...profile, bmi, bmr });
        setDailyCalorieGoal(Math.round(bmr * 1.2));
      }

      // Fetch meal plans for today's nutrition
      const today = new Date().toISOString().split('T')[0];
      const mealPlanResponse = await fetch('/api/meal-planner', { headers });
      if (mealPlanResponse.ok) {
        const mealPlanResult = await mealPlanResponse.json();
        const todaysPlan = mealPlanResult.data?.find((plan: any) => plan.date === today);
        if (todaysPlan) {
          setStats(prev => ({
            ...prev,
            weeklyCalories: todaysPlan.totalCalories || 0,
            protein: todaysPlan.totalProtein || 0,
            carbs: todaysPlan.totalCarbs || 0,
            fat: todaysPlan.totalFat || 0
          }));
        }
      }

      // Fetch recipes count
      const recipesResponse = await fetch('/api/recipes', { headers });
      if (recipesResponse.ok) {
        const recipesResult = await recipesResponse.json();
        setStats(prev => ({ ...prev, savedRecipes: recipesResult.data?.length || 0 }));
      }

      // Fetch water intake
      const waterResponse = await fetch('/api/water-tracker', { headers });
      if (waterResponse.ok) {
        const waterResult = await waterResponse.json();
        const todaysWater = waterResult.data?.find((entry: any) => entry.date === today);
        setWaterGlasses(todaysWater?.glasses || 0);
      }

      // Fetch exercise data
      const exerciseResponse = await fetch('/api/exercise-tracker', { headers });
      if (exerciseResponse.ok) {
        const exerciseResult = await exerciseResponse.json();
        const todaysExercise = exerciseResult.data?.filter((entry: any) => entry.date === today) || [];
        const totalCaloriesBurned = todaysExercise.reduce((sum: number, entry: any) => sum + (entry.caloriesBurned || 0), 0);
        setStats(prev => ({ ...prev, caloriesBurned: totalCaloriesBurned }));
        setExerciseData(exerciseResult.data || []);
        
        // Calculate weekly workouts
        const weekDays = [];
        for (let i = 6; i >= 0; i--) {
          const date = new Date();
          date.setDate(date.getDate() - i);
          const dateStr = date.toISOString().split('T')[0];
          const dayWorkouts = exerciseResult.data?.filter((entry: any) => entry.date === dateStr) || [];
          weekDays.push(dayWorkouts.length > 0 ? 1 : 0);
        }
        setWeeklyWorkouts(weekDays);
      }

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const addWaterGlass = () => {
    if (waterGlasses < 12) {
      setWaterGlasses(prev => prev + 1);
    }
  };

  const removeWaterGlass = () => {
    if (waterGlasses > 0) {
      setWaterGlasses(prev => prev - 1);
    }
  };

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentMonth);
    const firstDay = getFirstDayOfMonth(currentMonth);
    const days = [];
    
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-8"></div>);
    }
    
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
      const isToday = date.toDateString() === new Date().toDateString();
      const hasEvent = calendarEvents.some(event => event.date === date.toISOString().split('T')[0]);
      
      days.push(
        <div
          key={day}
          className={`h-8 w-8 flex items-center justify-center text-sm cursor-pointer rounded-full transition-colors ${
            isToday ? 'bg-orange-500 text-white' : hasEvent ? 'bg-green-100 text-green-800' : 'hover:bg-gray-100'
          }`}
          onClick={() => setSelectedDate(date)}
        >
          {day}
        </div>
      );
    }
    
    return days;
  };

  const getBMICategory = (bmi: number) => {
    if (bmi < 18.5) return { category: 'Underweight', color: 'text-blue-600', advice: 'Consider gaining healthy weight with nutrient-rich foods.' };
    if (bmi < 25) return { category: 'Normal', color: 'text-green-600', advice: 'Great! Maintain your healthy weight with balanced nutrition.' };
    if (bmi < 30) return { category: 'Overweight', color: 'text-yellow-600', advice: 'Consider a balanced diet and regular exercise.' };
    return { category: 'Obese', color: 'text-red-600', advice: 'Consult a healthcare provider for a personalized plan.' };
  };

  const getProteinAdvice = (protein: number) => {
    const target = userProfile.weight * 0.8;
    if (protein < target * 0.8) return { status: 'Low', color: 'text-red-600', advice: 'Increase protein intake with lean meats, eggs, or legumes.' };
    if (protein > target * 1.5) return { status: 'High', color: 'text-yellow-600', advice: 'Consider balancing with more carbs and vegetables.' };
    return { status: 'Good', color: 'text-green-600', advice: 'Perfect protein intake! Keep it up.' };
  };

  const getWaterAdvice = (glasses: number) => {
    if (glasses < 6) return { status: 'Low', color: 'text-red-600', advice: 'Drink more water! Aim for 8 glasses daily.' };
    if (glasses >= 8) return { status: 'Excellent', color: 'text-green-600', advice: 'Great hydration! You\'re doing amazing.' };
    return { status: 'Good', color: 'text-blue-600', advice: 'Almost there! 2 more glasses to reach your goal.' };
  };

  const saveProfileData = async () => {
    if (!userProfile.age || !userProfile.weight || !userProfile.height) {
      alert('Please fill in all fields before saving');
      return;
    }

    setSavingProfile(true);
    try {
      const token = document.cookie.split('; ').find(row => row.startsWith('token='))?.split('=')[1];
      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          age: userProfile.age,
          weight: userProfile.weight,
          height: userProfile.height,
          gender: userProfile.gender
        })
      });

      if (response.ok) {
        alert('Profile saved successfully!');
        await fetchDashboardData();
        setShowCalculators(false);
      } else {
        const result = await response.json();
        alert(result.message || 'Failed to save profile');
      }
    } catch (error) {
      console.error('Error saving profile:', error);
      alert('Error saving profile');
    } finally {
      setSavingProfile(false);
    }
  };

  // Auto-calculate BMI and BMR when values change
  useEffect(() => {
    if (userProfile.weight && userProfile.height && userProfile.age) {
      const bmi = userProfile.weight / ((userProfile.height / 100) ** 2);
      const bmr = userProfile.gender === 'male' 
        ? 88.362 + (13.397 * userProfile.weight) + (4.799 * userProfile.height) - (5.677 * userProfile.age)
        : 447.593 + (9.247 * userProfile.weight) + (3.098 * userProfile.height) - (4.330 * userProfile.age);
      
      setUserProfile(prev => ({ ...prev, bmi, bmr }));
    }
  }, [userProfile.age, userProfile.weight, userProfile.height, userProfile.gender]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-green-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-green-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Welcome back, {user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User'}!
          </h1>
          <p className="text-lg text-gray-600">Track your diet journey and achieve your health goals</p>
        </div>

        {/* Hero Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium">Daily Calories</p>
                <p className="text-3xl font-bold">{stats.weeklyCalories}</p>
                <div className="w-full bg-blue-400 rounded-full h-2 mt-2">
                  <div className="bg-white h-2 rounded-full" style={{width: `${Math.min((stats.weeklyCalories / dailyCalorieGoal) * 100, 100)}%`}}></div>
                </div>
                <p className="text-xs text-blue-100 mt-1">{dailyCalorieGoal - stats.weeklyCalories} left</p>
              </div>
              <Zap className="h-8 w-8 text-blue-200" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-cyan-500 to-blue-500 rounded-xl shadow-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-cyan-100 text-sm font-medium">Water Intake</p>
                <p className="text-3xl font-bold">{waterGlasses}/8</p>
                <div className="flex items-center space-x-2 mt-3">
                  <button onClick={removeWaterGlass} className="bg-white/20 hover:bg-white/30 rounded-full p-1">
                    <Minus className="h-4 w-4" />
                  </button>
                  <div className="flex space-x-1">
                    {[...Array(8)].map((_, i) => (
                      <div key={i} className={`w-3 h-6 rounded-full ${i < waterGlasses ? 'bg-white' : 'bg-white/30'}`}></div>
                    ))}
                  </div>
                  <button onClick={addWaterGlass} className="bg-white/20 hover:bg-white/30 rounded-full p-1">
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <Droplets className="h-8 w-8 text-cyan-200" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-orange-500 to-red-500 rounded-xl shadow-lg p-6 text-white relative overflow-hidden">
            <div className="relative z-10">
              <p className="text-orange-100 text-sm font-medium">Calories Burned</p>
              <p className="text-3xl font-bold">{stats.caloriesBurned}</p>
              <div className="w-full bg-orange-400 rounded-full h-2 mt-2">
                <div className="bg-white h-2 rounded-full" style={{width: `${Math.min((stats.caloriesBurned / 500) * 100, 100)}%`}}></div>
              </div>
              <p className="text-xs text-orange-100 mt-1">🔥 Great workout!</p>
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl shadow-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm font-medium">BMI Status</p>
                <p className="text-3xl font-bold">{userProfile.bmi ? userProfile.bmi.toFixed(1) : '0.0'}</p>
                <p className="text-sm text-green-100">{userProfile.bmi ? getBMICategory(userProfile.bmi).category : 'No data'}</p>
                <p className="text-xs text-green-100 mt-1">💪 Keep it up!</p>
              </div>
              <Heart className="h-8 w-8 text-green-200" />
            </div>
          </div>
        </div>

        {/* Main Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Nutrition Progress */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
              <Target className="h-6 w-6 text-orange-500 mr-2" />
              Daily Nutrition Progress
            </h3>
            <div className="space-y-6">
              <div className="relative">
                <div className="flex justify-between text-sm mb-2">
                  <span className="font-medium text-gray-700">Protein</span>
                  <span className="text-blue-600 font-semibold">{stats.protein}g / {userProfile.weight ? (userProfile.weight * 0.8).toFixed(0) : '0'}g</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-4 relative overflow-hidden">
                  <div className="bg-gradient-to-r from-blue-500 to-blue-600 h-4 rounded-full transition-all duration-500" style={{width: `${userProfile.weight ? Math.min((stats.protein / (userProfile.weight * 0.8)) * 100, 100) : 0}%`}}></div>
                  <div className="absolute inset-0 flex items-center justify-center text-xs font-medium text-white">
                    {userProfile.weight ? Math.round((stats.protein / (userProfile.weight * 0.8)) * 100) : 0}%
                  </div>
                </div>
              </div>
              <div className="relative">
                <div className="flex justify-between text-sm mb-2">
                  <span className="font-medium text-gray-700">Carbs</span>
                  <span className="text-green-600 font-semibold">{stats.carbs}g / 150g</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-4 relative overflow-hidden">
                  <div className="bg-gradient-to-r from-green-500 to-green-600 h-4 rounded-full transition-all duration-500" style={{width: `${Math.min((stats.carbs / 150) * 100, 100)}%`}}></div>
                  <div className="absolute inset-0 flex items-center justify-center text-xs font-medium text-white">
                    {Math.round((stats.carbs / 150) * 100)}%
                  </div>
                </div>
              </div>
              <div className="relative">
                <div className="flex justify-between text-sm mb-2">
                  <span className="font-medium text-gray-700">Fat</span>
                  <span className="text-purple-600 font-semibold">{stats.fat}g / 65g</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-4 relative overflow-hidden">
                  <div className="bg-gradient-to-r from-purple-500 to-purple-600 h-4 rounded-full transition-all duration-500" style={{width: `${Math.min((stats.fat / 65) * 100, 100)}%`}}></div>
                  <div className="absolute inset-0 flex items-center justify-center text-xs font-medium text-white">
                    {Math.round((stats.fat / 65) * 100)}%
                  </div>
                </div>
              </div>
            </div>
            
            {/* Health Insights */}
            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
                <p className="text-sm font-medium text-blue-900">💪 Protein Status</p>
                <p className={`text-xs mt-1 ${getProteinAdvice(stats.protein).color}`}>{getProteinAdvice(stats.protein).advice}</p>
              </div>
              <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg border border-green-200">
                <p className="text-sm font-medium text-green-900">❤️ BMI Status</p>
                <p className={`text-xs mt-1 ${userProfile.bmi ? getBMICategory(userProfile.bmi).color : 'text-gray-500'}`}>
                  {userProfile.bmi ? getBMICategory(userProfile.bmi).advice : 'Update your profile to see BMI advice'}
                </p>
              </div>
              <div className="bg-gradient-to-br from-cyan-50 to-cyan-100 p-4 rounded-lg border border-cyan-200">
                <p className="text-sm font-medium text-cyan-900">💧 Hydration</p>
                <p className={`text-xs mt-1 ${getWaterAdvice(waterGlasses).color}`}>{getWaterAdvice(waterGlasses).advice}</p>
              </div>
            </div>
          </div>

          {/* Interactive Calendar */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">Activity Calendar</h3>
              <Calendar className="h-5 w-5 text-orange-500" />
            </div>
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <button 
                  onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
                  className="p-1 hover:bg-gray-100 rounded"
                >
                  ←
                </button>
                <h4 className="font-semibold text-gray-900">
                  {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </h4>
                <button 
                  onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
                  className="p-1 hover:bg-gray-100 rounded"
                >
                  →
                </button>
              </div>
              <div className="grid grid-cols-7 gap-1 text-xs text-gray-500 mb-2">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                  <div key={day} className="text-center font-medium">{day}</div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-1">
                {renderCalendar()}
              </div>
            </div>
            <div className="space-y-2 text-xs">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                <span>Today</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-100 border border-green-300 rounded-full"></div>
                <span>Activity logged</span>
              </div>
            </div>
          </div>
        </div>

        {/* Exercise & Activity Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Exercise Tracker */}
          <div className="bg-white rounded-xl shadow-lg p-6 relative overflow-hidden">
            <div className="relative z-10">
              <div className="flex items-center mb-6">
                <Dumbbell className="h-6 w-6 text-orange-500 mr-2" />
                <h3 className="text-xl font-bold text-gray-900">Exercise Tracker</h3>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-gradient-to-br from-orange-50 to-red-50 p-4 rounded-lg border border-orange-200">
                  <div className="flex items-center space-x-2 mb-2">
                    <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                    <span className="text-sm font-medium text-gray-700">Duration</span>
                  </div>
                  <p className="text-2xl font-bold text-orange-600">
                    {exerciseData.filter(exercise => exercise.date === new Date().toISOString().split('T')[0])
                      .reduce((sum, exercise) => sum + (exercise.duration || 0), 0)} min
                  </p>
                  <p className="text-xs text-gray-500">Today's workout</p>
                </div>
                <div className="bg-gradient-to-br from-red-50 to-pink-50 p-4 rounded-lg border border-red-200">
                  <div className="flex items-center space-x-2 mb-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <span className="text-sm font-medium text-gray-700">Calories</span>
                  </div>
                  <p className="text-2xl font-bold text-red-600">{stats.caloriesBurned}</p>
                  <p className="text-xs text-gray-500">Burned today</p>
                </div>
              </div>
              
              <div className="space-y-3">
                {exerciseData.filter(exercise => exercise.date === new Date().toISOString().split('T')[0]).length > 0 ? (
                  exerciseData.filter(exercise => exercise.date === new Date().toISOString().split('T')[0]).map((exercise, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          {exercise.type === 'running' ? '🏃♂️' : exercise.type === 'weight_training' ? '🏋️♀️' : '💪'}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 capitalize">{exercise.type.replace('_', ' ')}</p>
                          <p className="text-xs text-gray-500">{exercise.duration} min • {exercise.caloriesBurned} cal</p>
                        </div>
                      </div>
                      <div className="text-green-600 font-semibold">✓</div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-4 text-gray-500">
                    <p>No exercises logged today</p>
                    <p className="text-xs">Start tracking your workouts!</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Weekly Progress Chart */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center mb-6">
              <TrendingUp className="h-6 w-6 text-green-500 mr-2" />
              <h3 className="text-xl font-bold text-gray-900">Weekly Progress</h3>
            </div>
            
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-600">Workout Days</span>
                  <span className="font-semibold text-green-600">{weeklyWorkouts.filter(day => day > 0).length}/7 days</span>
                </div>
                <div className="flex space-x-1">
                  {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, index) => (
                    <div key={day} className="flex-1 text-center">
                      <div className={`h-8 rounded-t ${weeklyWorkouts[index] ? 'bg-green-500' : 'bg-gray-200'}`}></div>
                      <p className="text-xs text-gray-500 mt-1">{day}</p>
                    </div>
                  ))}
                </div>
              </div>
              
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-600">Calories Burned</span>
                  <span className="font-semibold text-orange-600">
                    {exerciseData.filter(exercise => {
                      const exerciseDate = new Date(exercise.date);
                      const weekAgo = new Date();
                      weekAgo.setDate(weekAgo.getDate() - 7);
                      return exerciseDate >= weekAgo;
                    }).reduce((sum, exercise) => sum + (exercise.caloriesBurned || 0), 0)} cal
                  </span>
                </div>
                <div className="flex space-x-1">
                  {Array.from({ length: 7 }, (_, i) => {
                    const date = new Date();
                    date.setDate(date.getDate() - (6 - i));
                    const dateStr = date.toISOString().split('T')[0];
                    const dayExercises = exerciseData.filter(exercise => exercise.date === dateStr);
                    const calories = dayExercises.reduce((sum, exercise) => sum + (exercise.caloriesBurned || 0), 0);
                    return (
                      <div key={i} className="flex-1 text-center">
                        <div 
                          className={`rounded-t ${calories > 0 ? 'bg-orange-500' : 'bg-gray-200'}`}
                          style={{ height: `${Math.max((calories / 500) * 32, 4)}px` }}
                        ></div>
                        <p className="text-xs text-gray-500 mt-1">{calories}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
            <Zap className="h-6 w-6 text-orange-500 mr-2" />
            Quick Actions
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <button
              onClick={() => {
                localStorage.setItem('currentView', 'recipes');
                window.location.href = '/?view=recipes';
              }}
              className="bg-gradient-to-br from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white p-6 rounded-xl font-medium transition-all duration-200 flex flex-col items-center space-y-3 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            >
              <ChefHat className="h-8 w-8" />
              <span className="text-lg">Browse Recipes</span>
              <span className="text-xs opacity-80">Discover healthy meals</span>
            </button>
            <button
              onClick={() => {
                localStorage.setItem('currentView', 'meal-planner');
                window.location.href = '/?view=meal-planner';
              }}
              className="bg-gradient-to-br from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white p-6 rounded-xl font-medium transition-all duration-200 flex flex-col items-center space-y-3 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            >
              <Calendar className="h-8 w-8" />
              <span className="text-lg">Plan Meals</span>
              <span className="text-xs opacity-80">Schedule your diet</span>
            </button>
            <button
              onClick={() => setShowCalculators(true)}
              className="bg-gradient-to-br from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white p-6 rounded-xl font-medium transition-all duration-200 flex flex-col items-center space-y-3 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            >
              <Calculator className="h-8 w-8" />
              <span className="text-lg">Calculators</span>
              <span className="text-xs opacity-80">BMI & Protein tools</span>
            </button>
            <button
              onClick={() => {
                localStorage.setItem('currentView', 'support');
                window.location.href = '/?view=support';
              }}
              className="bg-gradient-to-br from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white p-6 rounded-xl font-medium transition-all duration-200 flex flex-col items-center space-y-3 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            >
              <Users className="h-8 w-8" />
              <span className="text-lg">Get Support</span>
              <span className="text-xs opacity-80">Expert guidance</span>
            </button>
          </div>
        </div>

        {/* Health Calculators Modal */}
        {showCalculators && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold">Health Calculators</h2>
                  <button
                    onClick={() => setShowCalculators(false)}
                    className="text-gray-500 hover:text-gray-700 text-2xl"
                  >
                    ×
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Update Profile</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Age</label>
                        <input
                          type="number"
                          value={userProfile.age}
                          onChange={(e) => setUserProfile(prev => ({...prev, age: Number(e.target.value)}))}
                          className="w-full p-2 border rounded"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Weight (kg)</label>
                        <input
                          type="number"
                          value={userProfile.weight}
                          onChange={(e) => setUserProfile(prev => ({...prev, weight: Number(e.target.value)}))}
                          className="w-full p-2 border rounded"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Height (cm)</label>
                        <input
                          type="number"
                          value={userProfile.height}
                          onChange={(e) => setUserProfile(prev => ({...prev, height: Number(e.target.value)}))}
                          className="w-full p-2 border rounded"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                        <select
                          value={userProfile.gender}
                          onChange={(e) => setUserProfile(prev => ({...prev, gender: e.target.value as 'male' | 'female'}))}
                          className="w-full p-2 border rounded"
                        >
                          <option value="male">Male</option>
                          <option value="female">Female</option>
                        </select>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Results</h3>
                    <div className="space-y-4">
                      <div className="p-4 bg-blue-50 rounded-lg">
                        <h4 className="font-medium text-blue-900">BMI</h4>
                        <p className="text-2xl font-bold text-blue-600">{userProfile.bmi ? userProfile.bmi.toFixed(1) : '0.0'}</p>
                        <p className={`text-sm ${userProfile.bmi ? getBMICategory(userProfile.bmi).color : 'text-gray-500'}`}>
                          {userProfile.bmi ? getBMICategory(userProfile.bmi).category : 'Enter data'}
                        </p>
                      </div>
                      <div className="p-4 bg-green-50 rounded-lg">
                        <h4 className="font-medium text-green-900">BMR (Calories/day)</h4>
                        <p className="text-2xl font-bold text-green-600">{userProfile.bmr ? userProfile.bmr.toFixed(0) : '0'}</p>
                        <p className="text-sm text-green-700">Base metabolic rate</p>
                      </div>
                      <div className="p-4 bg-purple-50 rounded-lg">
                        <h4 className="font-medium text-purple-900">Daily Protein Need</h4>
                        <p className="text-2xl font-bold text-purple-600">{userProfile.weight ? (userProfile.weight * 0.8).toFixed(0) : '0'}g</p>
                        <p className="text-sm text-purple-700">Recommended intake</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Save Button */}
                <div className="mt-6 flex justify-center">
                  <button
                    onClick={saveProfileData}
                    disabled={savingProfile || !userProfile.age || !userProfile.weight || !userProfile.height}
                    className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-3 rounded-lg font-medium transition-colors duration-200 flex items-center disabled:opacity-50"
                  >
                    <Save className="mr-2 h-5 w-5" />
                    {savingProfile ? 'Saving...' : 'Save to Profile'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;