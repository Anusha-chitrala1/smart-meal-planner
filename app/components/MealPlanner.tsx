"use client"

import React, { useState, useEffect } from 'react';
import { Calendar, Plus, Edit, Trash2, ShoppingCart, Clock, Users, Save } from 'lucide-react';

interface Meal {
  _id: string;
  name: string;
  protein: number;
  carbs: number;
  fat: number;
  calories: number;
  category: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  ingredients: string[];
}

interface MealPlan {
  id: string;
  date: string;
  meals: {
    breakfast?: Meal;
    lunch?: Meal;
    dinner?: Meal;
    snacks?: Meal[];
  };
  totalCalories: number;
  totalProtein: number;
}

const MealPlanner = () => {
  const [mealPlans, setMealPlans] = useState<MealPlan[]>([]);
  const [meals, setMeals] = useState<Meal[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [currentPlan, setCurrentPlan] = useState<MealPlan | null>(null);
  const [showMealSelector, setShowMealSelector] = useState(false);
  const [selectedMealType, setSelectedMealType] = useState<'breakfast' | 'lunch' | 'dinner' | 'snacks'>('breakfast');
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState<Meal[]>([]);

  useEffect(() => {
    fetchMeals();
    loadMealPlans();
  }, []);

  useEffect(() => {
    const plan = mealPlans.find(p => p.date === selectedDate);
    setCurrentPlan(plan || null);
  }, [selectedDate, mealPlans]);

  const fetchMeals = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers: Record<string, string> = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch('/api/meals', { headers });
      if (response.ok) {
        const data = await response.json();
        const mealsData = Array.isArray(data.data) ? data.data : [];
        setMeals(mealsData);
      } else {
        console.error('Error fetching meals');
      }
    } catch (error) {
      console.error('Error fetching meals:', error);
    }
  };

  const loadMealPlans = async () => {
    // For now, load from localStorage. In production, this would be from API
    const savedPlans = localStorage.getItem('mealPlans');
    if (savedPlans) {
      setMealPlans(JSON.parse(savedPlans));
    }
    setLoading(false);
  };

  const saveMealPlans = async (plans: MealPlan[]) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Please login to save meal plans');
        return;
      }

      // Save to localStorage for now, but also send to backend
      localStorage.setItem('mealPlans', JSON.stringify(plans));
      setMealPlans(plans);

      // TODO: Implement backend API for saving meal plans
      // const response = await fetch('/api/meal-plans', {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //     'Authorization': `Bearer ${token}`,
      //   },
      //   body: JSON.stringify({ plans }),
      // });

      alert('Meal plan saved successfully!');
    } catch (error) {
      console.error('Error saving meal plans:', error);
      alert('Failed to save meal plan');
    }
  };

  const addMealToPlan = (meal: Meal, mealType: 'breakfast' | 'lunch' | 'dinner' | 'snacks') => {
    const existingPlan = mealPlans.find(p => p.date === selectedDate);
    let updatedPlans: MealPlan[];

    if (existingPlan) {
      const updatedPlan = { ...existingPlan };
      if (mealType === 'snacks') {
        updatedPlan.meals.snacks = [...(updatedPlan.meals.snacks || []), meal];
      } else {
        updatedPlan.meals[mealType] = meal;
      }
      // Recalculate totals
      updatedPlan.totalCalories = calculateTotalCalories(updatedPlan.meals);
      updatedPlan.totalProtein = calculateTotalProtein(updatedPlan.meals);
      updatedPlans = mealPlans.map(p => p.date === selectedDate ? updatedPlan : p);
    } else {
      const newPlan: MealPlan = {
        id: Date.now().toString(),
        date: selectedDate,
        meals: mealType === 'snacks' ? { snacks: [meal] } : { [mealType]: meal },
        totalCalories: meal.calories,
        totalProtein: meal.protein,
      };
      updatedPlans = [...mealPlans, newPlan];
    }

    saveMealPlans(updatedPlans);
    setShowMealSelector(false);
  };

  const removeMealFromPlan = (mealType: 'breakfast' | 'lunch' | 'dinner' | 'snacks', mealIndex?: number) => {
    if (!currentPlan) return;

    const updatedPlan = { ...currentPlan };
    if (mealType === 'snacks' && mealIndex !== undefined) {
      updatedPlan.meals.snacks = updatedPlan.meals.snacks?.filter((_, index) => index !== mealIndex);
    } else {
      delete updatedPlan.meals[mealType];
    }

    // Recalculate totals
    updatedPlan.totalCalories = calculateTotalCalories(updatedPlan.meals);
    updatedPlan.totalProtein = calculateTotalProtein(updatedPlan.meals);

    const updatedPlans = mealPlans.map(p => p.date === selectedDate ? updatedPlan : p);
    saveMealPlans(updatedPlans);
  };

  const calculateTotalCalories = (meals: MealPlan['meals']) => {
    let total = 0;
    if (meals.breakfast) total += meals.breakfast.calories;
    if (meals.lunch) total += meals.lunch.calories;
    if (meals.dinner) total += meals.dinner.calories;
    if (meals.snacks) total += meals.snacks.reduce((sum, snack) => sum + snack.calories, 0);
    return total;
  };

  const calculateTotalProtein = (meals: MealPlan['meals']) => {
    let total = 0;
    if (meals.breakfast) total += meals.breakfast.protein;
    if (meals.lunch) total += meals.lunch.protein;
    if (meals.dinner) total += meals.dinner.protein;
    if (meals.snacks) total += meals.snacks.reduce((sum, snack) => sum + snack.protein, 0);
    return total;
  };

  const addToCart = (meal: Meal) => {
    setCart(prev => [...prev, meal]);
    alert(`${meal.name} added to cart!`);
  };

  const getMealsByCategory = (category: string) => {
    return meals.filter(meal => meal.category === category);
  };

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
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Meal Planner</h1>
          <p className="text-lg text-gray-600">Plan your meals for the week</p>
        </div>

        {/* Date Selector */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex items-center space-x-4">
            <Calendar className="h-6 w-6 text-orange-500" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
            <div className="flex-1">
              <h2 className="text-xl font-semibold text-gray-900">
                {new Date(selectedDate).toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </h2>
            </div>
            {cart.length > 0 && (
              <button
                onClick={() => {
                  const event = new CustomEvent('navigateToView', { detail: 'shopping' });
                  window.dispatchEvent(event);
                }}
                className="flex items-center space-x-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md transition-colors duration-200"
              >
                <ShoppingCart className="h-5 w-5" />
                <span>Cart ({cart.length})</span>
              </button>
            )}
          </div>
        </div>

        {/* Meal Plan Display */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Meal Slots */}
          <div className="lg:col-span-2 space-y-6">
            {(['breakfast', 'lunch', 'dinner'] as const).map((mealType) => (
              <div key={mealType} className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-semibold text-gray-900 capitalize">{mealType}</h3>
                  <button
                    onClick={() => {
                      setSelectedMealType(mealType);
                      setShowMealSelector(true);
                    }}
                    className="flex items-center space-x-2 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-md transition-colors duration-200"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Add Meal</span>
                  </button>
                </div>

                {currentPlan?.meals[mealType] ? (
                  <div className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-semibold text-gray-900">{currentPlan.meals[mealType].name}</h4>
                        <p className="text-sm text-gray-600 mt-1">
                          {currentPlan.meals[mealType].calories} cal • {currentPlan.meals[mealType].protein}g protein
                        </p>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => addToCart(currentPlan.meals[mealType]!)}
                          className="p-2 text-green-600 hover:bg-green-50 rounded-md transition-colors duration-200"
                          title="Add to cart"
                        >
                          <ShoppingCart className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => removeMealFromPlan(mealType)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors duration-200"
                          title="Remove meal"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                    <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No {mealType} planned for this day</p>
                  </div>
                )}
              </div>
            ))}

            {/* Snacks */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold text-gray-900">Snacks</h3>
                <button
                  onClick={() => {
                    setSelectedMealType('snacks');
                    setShowMealSelector(true);
                  }}
                  className="flex items-center space-x-2 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-md transition-colors duration-200"
                >
                  <Plus className="h-4 w-4" />
                  <span>Add Snack</span>
                </button>
              </div>

              {currentPlan?.meals.snacks && currentPlan.meals.snacks.length > 0 ? (
                <div className="space-y-3">
                  {currentPlan.meals.snacks.map((snack, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-semibold text-gray-900">{snack.name}</h4>
                          <p className="text-sm text-gray-600 mt-1">
                            {snack.calories} cal • {snack.protein}g protein
                          </p>
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => addToCart(snack)}
                            className="p-2 text-green-600 hover:bg-green-50 rounded-md transition-colors duration-200"
                            title="Add to cart"
                          >
                            <ShoppingCart className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => removeMealFromPlan('snacks', index)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors duration-200"
                            title="Remove snack"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                  <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No snacks planned for this day</p>
                </div>
              )}
            </div>
          </div>

          {/* Daily Summary */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Daily Summary</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Total Calories</span>
                  <span className="font-semibold text-lg">{currentPlan?.totalCalories || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Total Protein</span>
                  <span className="font-semibold text-lg">{currentPlan?.totalProtein || 0}g</span>
                </div>
                <div className="pt-4 border-t border-gray-200">
                  <div className="text-sm text-gray-500">
                    Recommended: 2,000-2,500 calories, 50-150g protein
                  </div>
                </div>
              </div>
            </div>

            {/* Save Plan Button */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <button
                onClick={() => saveMealPlans(mealPlans)}
                className="w-full bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors duration-200 flex items-center justify-center"
              >
                <Save className="h-5 w-5 mr-2" />
                Save Meal Plan
              </button>
              <p className="text-sm text-gray-500 mt-2 text-center">
                Save your meal plan to access it later
              </p>
            </div>

            {/* Quick Stats */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Meals Planned</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Breakfast</span>
                  <span className={currentPlan?.meals.breakfast ? 'text-green-600' : 'text-gray-400'}>
                    {currentPlan?.meals.breakfast ? '✓' : '○'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Lunch</span>
                  <span className={currentPlan?.meals.lunch ? 'text-green-600' : 'text-gray-400'}>
                    {currentPlan?.meals.lunch ? '✓' : '○'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Dinner</span>
                  <span className={currentPlan?.meals.dinner ? 'text-green-600' : 'text-gray-400'}>
                    {currentPlan?.meals.dinner ? '✓' : '○'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Snacks</span>
                  <span className={currentPlan?.meals.snacks?.length ? 'text-green-600' : 'text-gray-400'}>
                    {currentPlan?.meals.snacks?.length || 0}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Meal Selector Modal */}
        {showMealSelector && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold text-gray-900">
                    Select {selectedMealType === 'snacks' ? 'a Snack' : `a ${selectedMealType}`}
                  </h2>
                  <button
                    onClick={() => setShowMealSelector(false)}
                    className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
                  >
                    ✕
                  </button>
                </div>
              </div>

              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {meals.map((meal) => (
                    <div
                      key={meal._id}
                      className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                      onClick={() => addMealToPlan(meal, selectedMealType)}
                    >
                      <h3 className="font-semibold text-gray-900 mb-2">{meal.name}</h3>
                      <div className="text-sm text-gray-600 space-y-1">
                        <p>{meal.calories} calories</p>
                        <p>{meal.protein}g protein • {meal.carbs}g carbs • {meal.fat}g fat</p>
                        <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                          meal.category === 'breakfast' ? 'bg-yellow-100 text-yellow-800' :
                          meal.category === 'lunch' ? 'bg-blue-100 text-blue-800' :
                          meal.category === 'dinner' ? 'bg-purple-100 text-purple-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {meal.category}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MealPlanner;
