"use client"

import React, { useState, useEffect } from 'react';
import { Calendar, Plus, Edit, Trash2, ChefHat, Clock, Target } from 'lucide-react';

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
  _id: string;
  date: string;
  meals: {
    breakfast: Meal[];
    lunch: Meal[];
    dinner: Meal[];
    snacks: Meal[];
  };
  totalCalories: number;
  totalProtein: number;
}

const MealPlanner: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [mealPlan, setMealPlan] = useState<MealPlan | null>(null);
  const [availableMeals, setAvailableMeals] = useState<Meal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAddMeal, setShowAddMeal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<'breakfast' | 'lunch' | 'dinner' | 'snacks'>('breakfast');

  useEffect(() => {
    fetchMealPlan();
    fetchAvailableMeals();
  }, [selectedDate]);

  const fetchMealPlan = async () => {
    try {
      const response = await fetch(`/api/meal-planner?date=${selectedDate}`);
      if (response.ok) {
        const result = await response.json();
        setMealPlan(result.data);
      } else {
        // Create empty meal plan if none exists
        setMealPlan({
          _id: '',
          date: selectedDate,
          meals: { breakfast: [], lunch: [], dinner: [], snacks: [] },
          totalCalories: 0,
          totalProtein: 0
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch meal plan');
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableMeals = async () => {
    try {
      const response = await fetch('/api/meals');
      if (response.ok) {
        const result = await response.json();
        setAvailableMeals(result.data || []);
      }
    } catch (err) {
      console.error('Failed to fetch available meals:', err);
    }
  };

  const addMealToPlan = async (mealId: string) => {
    try {
      const response = await fetch('/api/meal-planner', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: selectedDate,
          mealId,
          category: selectedCategory
        }),
      });

      if (response.ok) {
        await fetchMealPlan();
        setShowAddMeal(false);
      } else {
        setError('Failed to add meal to plan');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add meal to plan');
    }
  };

  const removeMealFromPlan = async (mealId: string, category: string) => {
    try {
      const response = await fetch('/api/meal-planner', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: selectedDate,
          mealId,
          category
        }),
      });

      if (response.ok) {
        await fetchMealPlan();
      } else {
        setError('Failed to remove meal from plan');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove meal from plan');
    }
  };

  const getMealsByCategory = (category: keyof MealPlan['meals']) => {
    return mealPlan?.meals[category] || [];
  };

  const calculateCategoryTotals = (meals: Meal[]) => {
    return meals.reduce((totals, meal) => ({
      calories: totals.calories + meal.calories,
      protein: totals.protein + meal.protein
    }), { calories: 0, protein: 0 });
  };

  if (loading) return <div className="text-center py-8">Loading meal planner...</div>;
  if (error) return <div className="text-center py-8 text-red-500">{error}</div>;

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-bold text-gray-800 flex items-center">
          <Calendar className="mr-3 text-blue-500" />
          Meal Planner
        </h2>
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="px-4 py-2 border rounded-lg"
        />
      </div>

      {/* Summary */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h3 className="text-xl font-semibold mb-4">Daily Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{mealPlan?.totalCalories || 0}</div>
            <div className="text-gray-600">Calories</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{mealPlan?.totalProtein || 0}g</div>
            <div className="text-gray-600">Protein</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">
              {mealPlan ? Object.values(mealPlan.meals).flat().reduce((sum, meal) => sum + meal.carbs, 0) : 0}g
            </div>
            <div className="text-gray-600">Carbs</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              {mealPlan ? Object.values(mealPlan.meals).flat().length : 0}
            </div>
            <div className="text-gray-600">Meals</div>
          </div>
        </div>
      </div>

      {/* Meal Categories */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {(['breakfast', 'lunch', 'dinner', 'snacks'] as const).map((category) => {
          const meals = getMealsByCategory(category);
          const totals = calculateCategoryTotals(meals);

          return (
            <div key={category} className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold capitalize flex items-center">
                  <ChefHat className="mr-2 text-orange-500" size={20} />
                  {category}
                </h3>
                <button
                  onClick={() => {
                    setSelectedCategory(category);
                    setShowAddMeal(true);
                  }}
                  className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded flex items-center text-sm"
                >
                  <Plus size={16} className="mr-1" />
                  Add
                </button>
              </div>

              {meals.length === 0 ? (
                <p className="text-gray-500 text-sm">No meals planned</p>
              ) : (
                <div className="space-y-3">
                  {meals.map((meal) => (
                    <div key={meal._id} className="flex justify-between items-center bg-gray-50 p-3 rounded">
                      <div>
                        <div className="font-medium">{meal.name}</div>
                        <div className="text-sm text-gray-600">
                          {meal.calories} cal • {meal.protein}g protein • {meal.carbs}g carbs • {meal.fat}g fat
                        </div>
                      </div>
                      <button
                        onClick={() => removeMealFromPlan(meal._id, category)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                  <div className="border-t pt-3 mt-3">
                    <div className="text-sm text-gray-600">
                      Total: {totals.calories} cal • {totals.protein}g protein • {meals.reduce((sum, meal) => sum + meal.carbs, 0)}g carbs • {meals.reduce((sum, meal) => sum + meal.fat, 0)}g fat
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Add Meal Modal */}
      {showAddMeal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">
                Add Meal to {selectedCategory}
              </h2>
              <button
                onClick={() => setShowAddMeal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {availableMeals
                  .filter(meal => meal.category === (selectedCategory === 'snacks' ? 'snack' : selectedCategory))
                  .map((meal) => (
                    <div
                      key={meal._id}
                      onClick={() => addMealToPlan(meal._id)}
                      className="border rounded-lg p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                    >
                      <h3 className="font-medium">{meal.name}</h3>
                      <div className="text-sm text-gray-600 mt-1">
                        {meal.calories} cal • {meal.protein}g protein • {meal.carbs}g carbs • {meal.fat}g fat
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {meal.ingredients.join(', ')}
                      </div>
                    </div>
                  ))}
              </div>

              {availableMeals.filter(meal => meal.category === (selectedCategory === 'snacks' ? 'snack' : selectedCategory)).length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  No meals available for this category. Create some recipes first!
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MealPlanner;
