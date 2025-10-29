"use client"

import React, { useState, useEffect } from 'react';
import { ChefHat, Plus, Edit, Trash2 } from 'lucide-react';

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

const Meals: React.FC = () => {
  const [meals, setMeals] = useState<Meal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingMeal, setEditingMeal] = useState<Meal | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    protein: 0,
    carbs: 0,
    fat: 0,
    calories: 0,
    category: 'breakfast' as Meal['category'],
    ingredients: [] as string[],
  });

  useEffect(() => {
    fetchMeals();
  }, []);

  const fetchMeals = async () => {
    try {
      // Simulate fetching meals from localStorage (since backend is removed)
      const storedMeals = localStorage.getItem('meals');
      const data = storedMeals ? JSON.parse(storedMeals) : [];
      setMeals(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch meals');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Simulate saving meal to localStorage (since backend is removed)
      const storedMeals = localStorage.getItem('meals');
      const meals = storedMeals ? JSON.parse(storedMeals) : [];

      if (editingMeal) {
        // Update existing meal
        const updatedMeals = meals.map((meal: Meal) =>
          meal._id === editingMeal._id ? { ...formData, _id: editingMeal._id } : meal
        );
        localStorage.setItem('meals', JSON.stringify(updatedMeals));
      } else {
        // Add new meal
        const newMeal = { ...formData, _id: Date.now().toString() };
        meals.push(newMeal);
        localStorage.setItem('meals', JSON.stringify(meals));
      }

      await fetchMeals();
      setShowForm(false);
      setEditingMeal(null);
      resetForm();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save meal');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this meal?')) return;
    try {
      // Simulate deleting meal from localStorage (since backend is removed)
      const storedMeals = localStorage.getItem('meals');
      const meals = storedMeals ? JSON.parse(storedMeals) : [];
      const updatedMeals = meals.filter((meal: Meal) => meal._id !== id);
      localStorage.setItem('meals', JSON.stringify(updatedMeals));
      await fetchMeals();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete meal');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      protein: 0,
      carbs: 0,
      fat: 0,
      calories: 0,
      category: 'breakfast',
      ingredients: [],
    });
  };

  const startEdit = (meal: Meal) => {
    setEditingMeal(meal);
    setFormData({
      name: meal.name,
      protein: meal.protein,
      carbs: meal.carbs,
      fat: meal.fat,
      calories: meal.calories,
      category: meal.category,
      ingredients: meal.ingredients,
    });
    setShowForm(true);
  };

  if (loading) return <div className="text-center py-8">Loading meals...</div>;
  if (error) return <div className="text-center py-8 text-red-500">{error}</div>;

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-bold text-gray-800 flex items-center">
          <ChefHat className="mr-3 text-green-500" />
          Meal Planner
        </h2>
        <button
          onClick={() => {
            setShowForm(true);
            setEditingMeal(null);
            resetForm();
          }}
          className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg flex items-center"
        >
          <Plus className="mr-2" size={20} />
          Add Meal
        </button>
      </div>

      {showForm && (
        <div className="bg-white p-6 rounded-lg shadow-lg mb-8">
          <h3 className="text-xl font-semibold mb-4">
            {editingMeal ? 'Edit Meal' : 'Add New Meal'}
          </h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full p-2 border rounded"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value as Meal['category'] })}
                className="w-full p-2 border rounded"
              >
                <option value="breakfast">Breakfast</option>
                <option value="lunch">Lunch</option>
                <option value="dinner">Dinner</option>
                <option value="snack">Snack</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Protein (g)</label>
              <input
                type="number"
                value={formData.protein}
                onChange={(e) => setFormData({ ...formData, protein: Number(e.target.value) })}
                className="w-full p-2 border rounded"
                min="0"
                step="0.1"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Carbs (g)</label>
              <input
                type="number"
                value={formData.carbs}
                onChange={(e) => setFormData({ ...formData, carbs: Number(e.target.value) })}
                className="w-full p-2 border rounded"
                min="0"
                step="0.1"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fat (g)</label>
              <input
                type="number"
                value={formData.fat}
                onChange={(e) => setFormData({ ...formData, fat: Number(e.target.value) })}
                className="w-full p-2 border rounded"
                min="0"
                step="0.1"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Calories</label>
              <input
                type="number"
                value={formData.calories}
                onChange={(e) => setFormData({ ...formData, calories: Number(e.target.value) })}
                className="w-full p-2 border rounded"
                min="0"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Ingredients (comma-separated)</label>
              <input
                type="text"
                value={formData.ingredients.join(',')}
                onChange={(e) => setFormData({
                  ...formData,
                  ingredients: e.target.value.split(',').map(i => i.trim()).filter(i => i)
                })}
                className="w-full p-2 border rounded"
                placeholder="e.g. chicken, rice, vegetables"
              />
            </div>
            <div className="md:col-span-2 flex gap-2">
              <button type="submit" className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded">
                {editingMeal ? 'Update' : 'Add'} Meal
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setEditingMeal(null);
                  resetForm();
                }}
                className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {meals.map((meal) => (
          <div key={meal._id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-semibold text-gray-800">{meal.name}</h3>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                meal.category === 'breakfast' ? 'bg-yellow-100 text-yellow-800' :
                meal.category === 'lunch' ? 'bg-blue-100 text-blue-800' :
                meal.category === 'dinner' ? 'bg-purple-100 text-purple-800' :
                'bg-green-100 text-green-800'
              }`}>
                {meal.category}
              </span>
            </div>

            <div className="space-y-2 mb-4">
              <div className="flex justify-between">
                <span className="text-gray-600">Calories:</span>
                <span className="font-medium">{meal.calories}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Protein:</span>
                <span className="font-medium">{meal.protein}g</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Carbs:</span>
                <span className="font-medium">{meal.carbs}g</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Fat:</span>
                <span className="font-medium">{meal.fat}g</span>
              </div>
            </div>

            {meal.ingredients.length > 0 && (
              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-1">Ingredients:</p>
                <p className="text-sm">{meal.ingredients.join(', ')}</p>
              </div>
            )}

            <div className="flex gap-2">
              <button
                onClick={() => startEdit(meal)}
                className="flex-1 bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded flex items-center justify-center"
              >
                <Edit size={16} className="mr-1" />
                Edit
              </button>
              <button
                onClick={() => handleDelete(meal._id)}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded flex items-center justify-center"
              >
                <Trash2 size={16} className="mr-1" />
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {meals.length === 0 && (
        <div className="text-center py-12">
          <ChefHat className="mx-auto h-16 w-16 text-gray-400 mb-4" />
          <p className="text-gray-500 text-lg">No meals yet. Add your first meal!</p>
        </div>
      )}
    </div>
  );
};

export default Meals;
