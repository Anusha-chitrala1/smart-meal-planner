"use client"

import React, { useState, useEffect } from 'react';
import { Calendar, Plus, Edit, Trash2, Clock, Users, Utensils, ChevronLeft, ChevronRight, Save, Target, TrendingUp } from 'lucide-react';

interface Meal {
  _id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  category: 'breakfast' | 'lunch' | 'snack' | 'dinner';
  ingredients: string[];
  image?: string;
}

interface MealPlan {
  _id: string;
  date: string;
  meals: {
    breakfast: Meal[];
    lunch: Meal[];
    snack: Meal[];
    dinner: Meal[];
  };
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
}

const MealPlannerNew: React.FC = () => {
  const [mealPlans, setMealPlans] = useState<MealPlan[]>([]);
  const [availableMeals, setAvailableMeals] = useState<Meal[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const [showMealModal, setShowMealModal] = useState(false);
  const [selectedMealType, setSelectedMealType] = useState<'breakfast' | 'lunch' | 'snack' | 'dinner'>('breakfast');

  useEffect(() => {
    fetchMealPlans();
    loadAvailableMeals();
  }, []);

  const loadAvailableMeals = async () => {
    try {
      const token = document.cookie.split('; ').find(row => row.startsWith('token='))?.split('=')[1];
      const response = await fetch('/api/recipes', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const result = await response.json();
        setAvailableMeals(result.data || []);
      }
    } catch (error) {
      console.error('Error fetching meals:', error);
      setAvailableMeals([]);
    }
  };

  const fetchMealPlans = async () => {
    try {
      const token = document.cookie.split('; ').find(row => row.startsWith('token='))?.split('=')[1];
      const response = await fetch('/api/meal-planner', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const result = await response.json();
        setMealPlans(result.data || []);
      }
    } catch (error) {
      console.error('Error fetching meal plans:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCurrentMealPlan = (): MealPlan => {
    const existing = mealPlans.find(plan => plan.date === selectedDate);
    if (existing) return existing;

    return {
      _id: `temp-${selectedDate}`,
      date: selectedDate,
      meals: {
        breakfast: [],
        lunch: [],
        snack: [],
        dinner: []
      },
      totalCalories: 0,
      totalProtein: 0,
      totalCarbs: 0,
      totalFat: 0
    };
  };

  const addMealToPlan = async (meal: Meal) => {
    const currentPlan = getCurrentMealPlan();
    const updatedMeals = {
      ...currentPlan.meals,
      [selectedMealType]: [...currentPlan.meals[selectedMealType], meal]
    };

    const totals = calculateTotals(updatedMeals);
    const updatedPlan: MealPlan = {
      ...currentPlan,
      meals: updatedMeals,
      ...totals
    };

    try {
      const token = document.cookie.split('; ').find(row => row.startsWith('token='))?.split('=')[1];
      const response = await fetch('/api/meal-planner', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          date: selectedDate,
          mealType: selectedMealType,
          mealId: meal._id,
          meal: meal
        })
      });

      if (response.ok) {
        setMealPlans(prev => {
          const existing = prev.find(p => p.date === selectedDate);
          if (existing) {
            return prev.map(p => p.date === selectedDate ? updatedPlan : p);
          } else {
            return [...prev, updatedPlan];
          }
        });
      }
    } catch (error) {
      console.error('Error adding meal to plan:', error);
    }

    setShowMealModal(false);
  };

  const removeMealFromPlan = async (mealType: keyof MealPlan['meals'], mealIndex: number) => {
    const currentPlan = getCurrentMealPlan();
    const mealToRemove = currentPlan.meals[mealType][mealIndex];
    
    try {
      const token = document.cookie.split('; ').find(row => row.startsWith('token='))?.split('=')[1];
      
      // Update local state immediately for better UX
      const updatedMeals = {
        ...currentPlan.meals,
        [mealType]: currentPlan.meals[mealType].filter((_, index) => index !== mealIndex)
      };

      const totals = calculateTotals(updatedMeals);
      const updatedPlan: MealPlan = {
        ...currentPlan,
        meals: updatedMeals,
        ...totals
      };

      setMealPlans(prev => {
        const existing = prev.find(p => p.date === selectedDate);
        if (existing) {
          return prev.map(p => p.date === selectedDate ? updatedPlan : p);
        } else {
          return [...prev, updatedPlan];
        }
      });

      // Make API call to persist the change
      await fetch('/api/meal-planner', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          date: selectedDate,
          mealType,
          mealId: mealToRemove._id
        })
      });

    } catch (error) {
      console.error('Error removing meal from plan:', error);
    }
  };

  const calculateTotals = (meals: MealPlan['meals']) => {
    const allMeals = [...meals.breakfast, ...meals.lunch, ...meals.snack, ...meals.dinner];
    return {
      totalCalories: allMeals.reduce((sum, meal) => sum + meal.calories, 0),
      totalProtein: allMeals.reduce((sum, meal) => sum + meal.protein, 0),
      totalCarbs: allMeals.reduce((sum, meal) => sum + meal.carbs, 0),
      totalFat: allMeals.reduce((sum, meal) => sum + meal.fat, 0)
    };
  };

  const getMealsByCategory = (category: 'breakfast' | 'lunch' | 'snack' | 'dinner') => {
    return availableMeals.filter(meal => meal.category === category);
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
      days.push(<div key={`empty-${i}`} className="h-12"></div>);
    }
    
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
      const dateStr = date.toISOString().split('T')[0];
      const isSelected = dateStr === selectedDate;
      const isToday = dateStr === new Date().toISOString().split('T')[0];
      const hasPlan = mealPlans.some(plan => plan.date === dateStr);
      
      days.push(
        <div
          key={day}
          className={`h-12 p-1 cursor-pointer rounded-lg transition-all duration-200 ${
            isSelected 
              ? 'bg-orange-500 text-white shadow-lg' 
              : isToday 
                ? 'bg-orange-100 text-orange-800 border-2 border-orange-300' 
                : hasPlan 
                  ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                  : 'hover:bg-gray-100'
          }`}
          onClick={() => setSelectedDate(dateStr)}
        >
          <div className="text-sm font-medium">{day}</div>
          {hasPlan && (
            <div className="flex space-x-1 mt-1">
              <div className="w-1 h-1 bg-green-500 rounded-full"></div>
              <div className="w-1 h-1 bg-blue-500 rounded-full"></div>
              <div className="w-1 h-1 bg-purple-500 rounded-full"></div>
            </div>
          )}
        </div>
      );
    }
    
    return days;
  };

  const currentPlan = getCurrentMealPlan();

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
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Meal Planner</h1>
          <p className="text-lg text-gray-600">Plan your meals with our interactive calendar</p>
        </div>

        {/* Daily Nutrition Summary - Moved to top */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900 flex items-center">
              <Target className="h-5 w-5 text-green-500 mr-2" />
              Daily Nutrition - {new Date(selectedDate).toLocaleDateString()}
            </h3>
            <div className="text-2xl font-bold text-orange-600">{currentPlan.totalCalories} cal</div>
          </div>
          
          <div className="grid grid-cols-4 gap-4">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-blue-600">{currentPlan.totalProtein}g</div>
              <div className="text-sm text-blue-700">Protein</div>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-green-600">{currentPlan.totalCarbs}g</div>
              <div className="text-sm text-green-700">Carbs</div>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-purple-600">{currentPlan.totalFat}g</div>
              <div className="text-sm text-purple-700">Fat</div>
            </div>
            <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-orange-600">{currentPlan.totalCalories}</div>
              <div className="text-sm text-orange-700">Calories</div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Calendar Section */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                  <Calendar className="h-6 w-6 text-orange-500 mr-2" />
                  {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </h2>
                <div className="flex space-x-2">
                  <button 
                    onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <button 
                    onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </div>
              </div>
              
              <div className="grid grid-cols-7 gap-2 mb-4">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                  <div key={day} className="text-center font-semibold text-gray-600 py-2">{day}</div>
                ))}
              </div>
              
              <div className="grid grid-cols-7 gap-2">
                {renderCalendar()}
              </div>
              
              <div className="flex items-center space-x-6 mt-6 text-sm">
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-orange-500 rounded"></div>
                  <span>Selected</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-orange-100 border-2 border-orange-300 rounded"></div>
                  <span>Today</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-green-100 rounded"></div>
                  <span>Has meals</span>
                </div>
              </div>
            </div>
          </div>

          {/* Meal Planning Section */}
          <div className="space-y-6">
            {(['breakfast', 'lunch', 'dinner', 'snack'] as const).map((mealType) => (
              <div key={mealType} className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-bold text-gray-900 capitalize flex items-center">
                    <Utensils className="h-5 w-5 mr-2 text-orange-500" />
                    {mealType}
                  </h3>
                  <button
                    onClick={() => {
                      setSelectedMealType(mealType);
                      setShowMealModal(true);
                    }}
                    className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white p-2 rounded-full transition-all duration-200 shadow-lg hover:shadow-xl"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>

                <div className="space-y-3">
                  {currentPlan.meals[mealType].length === 0 ? (
                    <div className="text-gray-500 text-center py-6 border-2 border-dashed border-gray-200 rounded-lg">
                      <Utensils className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                      <p>No meals planned for {mealType}</p>
                      <p className="text-sm">Click + to add meals</p>
                    </div>
                  ) : (
                    currentPlan.meals[mealType].map((meal, index) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            {meal.image && (
                              <img src={meal.image} alt={meal.name} className="w-16 h-16 object-cover rounded-lg mb-2" />
                            )}
                            <h4 className="font-medium text-gray-900 mb-2">{meal.name}</h4>
                            <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
                              <div>🔥 {meal.calories} cal</div>
                              <div>💪 {meal.protein}g protein</div>
                              <div>🌾 {meal.carbs}g carbs</div>
                              <div>🥑 {meal.fat}g fat</div>
                            </div>
                          </div>
                          <div className="flex space-x-1">
                            <button
                              onClick={() => {
                                console.log('Edit meal:', meal);
                              }}
                              className="text-blue-600 hover:text-blue-800 p-1 rounded-full hover:bg-blue-50 transition-colors"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => removeMealFromPlan(mealType, index)}
                              className="text-red-600 hover:text-red-800 p-1 rounded-full hover:bg-red-50 transition-colors"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Meal Type Totals */}
                {currentPlan.meals[mealType].length > 0 && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="grid grid-cols-4 gap-2 text-sm">
                      <div className="text-center">
                        <div className="font-medium text-orange-600">
                          {currentPlan.meals[mealType].reduce((sum, meal) => sum + meal.calories, 0)}
                        </div>
                        <div className="text-gray-600">cal</div>
                      </div>
                      <div className="text-center">
                        <div className="font-medium text-blue-600">
                          {currentPlan.meals[mealType].reduce((sum, meal) => sum + meal.protein, 0)}g
                        </div>
                        <div className="text-gray-600">protein</div>
                      </div>
                      <div className="text-center">
                        <div className="font-medium text-green-600">
                          {currentPlan.meals[mealType].reduce((sum, meal) => sum + meal.carbs, 0)}g
                        </div>
                        <div className="text-gray-600">carbs</div>
                      </div>
                      <div className="text-center">
                        <div className="font-medium text-purple-600">
                          {currentPlan.meals[mealType].reduce((sum, meal) => sum + meal.fat, 0)}g
                        </div>
                        <div className="text-gray-600">fat</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Add Meal Modal */}
        {showMealModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl max-w-4xl w-full max-h-[80vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold">Add {selectedMealType} Meal</h2>
                  <button
                    onClick={() => setShowMealModal(false)}
                    className="text-gray-500 hover:text-gray-700 text-2xl"
                  >
                    ×
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {getMealsByCategory(selectedMealType).map((meal) => (
                    <div key={meal._id} className="border border-gray-200 rounded-lg p-4 hover:border-orange-300 cursor-pointer transition-all duration-200 hover:shadow-lg"
                         onClick={() => addMealToPlan(meal)}>
                      <div className="flex flex-col">
                        {meal.image && (
                          <img 
                            src={meal.image} 
                            alt={meal.name}
                            className="w-full h-32 object-cover rounded mb-3"
                          />
                        )}
                        <h3 className="font-medium text-gray-900 mb-2">{meal.name}</h3>
                        <div className="grid grid-cols-2 gap-2 text-sm text-gray-600 mb-3">
                          <div>🔥 {meal.calories} cal</div>
                          <div>💪 {meal.protein}g</div>
                          <div>🌾 {meal.carbs}g</div>
                          <div>🥑 {meal.fat}g</div>
                        </div>
                        <div className="text-xs text-gray-500">
                          {meal.ingredients.slice(0, 3).join(', ')}
                          {meal.ingredients.length > 3 && '...'}
                        </div>
                        <button className="mt-3 bg-gradient-to-r from-orange-500 to-red-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:from-orange-600 hover:to-red-600 transition-all duration-200">
                          Add to Plan
                        </button>
                      </div>
                    </div>
                  ))}
                  {getMealsByCategory(selectedMealType).length === 0 && (
                    <div className="col-span-full text-center py-8 text-gray-500">
                      <Utensils className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                      <p>No {selectedMealType} recipes available.</p>
                      <p className="text-sm">Add some recipes first!</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MealPlannerNew;