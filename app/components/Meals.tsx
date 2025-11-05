"use client"

import React, { useState, useEffect } from 'react';
import { ChefHat, Plus, Edit, Trash2, Upload, Image as ImageIcon, Search, Filter, Heart, Clock, Users } from 'lucide-react';
import { healthyRecipes } from '../../lib/utils/healthyRecipes';

interface Meal {
  _id: string;
  name: string;
  protein: number;
  carbs: number;
  fat: number;
  calories: number;
  category: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  ingredients: string[];
  instructions?: string[];
  image?: string;
}

const Meals: React.FC = () => {
  const [meals, setMeals] = useState<Meal[]>([]);
  const [healthyMeals, setHealthyMeals] = useState(healthyRecipes);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingMeal, setEditingMeal] = useState<Meal | null>(null);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [formData, setFormData] = useState({
    name: '',
    protein: 0,
    carbs: 0,
    fat: 0,
    calories: 0,
    category: 'breakfast' as Meal['category'],
    ingredients: [] as string[],
    instructions: [] as string[],
    image: '',
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [filteredMeals, setFilteredMeals] = useState<Meal[]>([]);

  useEffect(() => {
    fetchMeals();
  }, []);

  useEffect(() => {
    let filtered = meals;
    
    if (searchTerm) {
      filtered = filtered.filter(meal => 
        meal.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        meal.ingredients.some(ingredient => 
          ingredient.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }
    
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(meal => meal.category === selectedCategory);
    }
    
    setFilteredMeals(filtered);
  }, [meals, searchTerm, selectedCategory]);

  const fetchMeals = async () => {
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
        setMeals(result.data || []);
      } else {
        setError('Failed to fetch meals');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch meals');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!formData.name.trim()) {
      setError('Recipe name is required');
      return;
    }

    try {
      const token = document.cookie.split('; ').find(row => row.startsWith('token='))?.split('=')[1];
      const method = editingMeal ? 'PUT' : 'POST';
      const url = editingMeal ? `/api/recipes/${editingMeal._id}` : '/api/recipes';

      const response = await fetch(url, {
        method,
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...formData,
          prepTime: 10,
          cookTime: 15,
          servings: 1,
          description: `Delicious ${formData.name}`,
          isHealthy: true
        }),
      });

      const result = await response.json();
      console.log('API Response:', result);
      console.log('Form data being sent:', {
        ...formData,
        imageLength: formData.image ? formData.image.length : 0
      });
      
      if (response.ok) {
        await fetchMeals();
        setShowForm(false);
        setEditingMeal(null);
        resetForm();
        alert(`Recipe ${editingMeal ? 'updated' : 'created'} successfully!`);
      } else {
        setError(result.error || 'Failed to save recipe');
      }
    } catch (err) {
      console.error('Submit error:', err);
      setError(err instanceof Error ? err.message : 'Failed to save recipe');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this meal?')) return;
    try {
      const token = document.cookie.split('; ').find(row => row.startsWith('token='))?.split('=')[1];
      const response = await fetch(`/api/recipes/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        await fetchMeals();
      } else {
        setError('Failed to delete meal');
      }
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
      instructions: [],
      image: '',
    });
    setSelectedImage(null);
    setImagePreview('');
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
      instructions: (meal as any).instructions || [],
      image: meal.image || '',
    });
    setImagePreview(meal.image || '');
    setShowForm(true);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log('Image upload triggered');
    const file = e.target.files?.[0];
    if (file) {
      console.log('File selected:', file.name, 'Size:', file.size, 'Type:', file.type);
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        console.log('Image converted to base64, length:', (reader.result as string).length);
        setImagePreview(reader.result as string);
        setFormData({ ...formData, image: reader.result as string });
      };
      reader.onerror = () => {
        console.error('Error reading file');
      };
      reader.readAsDataURL(file);
    } else {
      console.log('No file selected');
    }
  };

  const handleEditHealthyRecipe = (recipe: HealthyRecipe) => {
    // For now, just show an alert. In a real app, you'd have edit functionality
    alert(`Edit functionality for healthy recipes would be implemented here for: ${recipe.name}`);
  };

  const handleDeleteHealthyRecipe = (recipeId: string) => {
    // For now, just show an alert. In a real app, you'd have delete functionality
    alert(`Delete functionality for healthy recipes would be implemented here for recipe ID: ${recipeId}`);
  };

  if (loading) return <div className="text-center py-8">Loading meals...</div>;
  if (error) return <div className="text-center py-8 text-red-500">{error}</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-green-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2 flex items-center">
            <ChefHat className="mr-3 text-orange-500" />
            Recipes & Meals
          </h1>
          <p className="text-lg text-gray-600">Discover and create healthy recipes for your meal planning</p>
        </div>

        {/* Search and Filter Bar */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search recipes by name or ingredients..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>
            <div className="flex gap-4">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="all">All Categories</option>
                <option value="breakfast">Breakfast</option>
                <option value="lunch">Lunch</option>
                <option value="dinner">Dinner</option>
                <option value="snack">Snacks</option>
              </select>
              <button
                onClick={() => {
                  setShowForm(true);
                  setEditingMeal(null);
                  resetForm();
                }}
                className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white px-6 py-3 rounded-lg flex items-center font-medium transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                <Plus className="mr-2" size={20} />
                Add Recipe
              </button>
            </div>
          </div>
        </div>



        {/* Recipe Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
          {/* Custom Recipes */}
          {filteredMeals.map((meal) => (
            <div key={meal._id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <div className="relative">
                {meal.image ? (
                  <img 
                    src={meal.image} 
                    alt={meal.name}
                    className="w-full h-48 object-cover"
                  />
                ) : (
                  <div className="w-full h-48 bg-gradient-to-br from-orange-100 to-red-100 flex items-center justify-center">
                    <ChefHat className="h-16 w-16 text-orange-400" />
                  </div>
                )}
                <div className="absolute top-3 right-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    meal.category === 'breakfast' ? 'bg-yellow-100 text-yellow-800' :
                    meal.category === 'lunch' ? 'bg-blue-100 text-blue-800' :
                    meal.category === 'dinner' ? 'bg-purple-100 text-purple-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {meal.category}
                  </span>
                </div>
                <div className="absolute top-3 left-3">
                  <div className="bg-white/90 backdrop-blur-sm rounded-full p-1">
                    <Heart className="h-4 w-4 text-red-500" />
                  </div>
                </div>
              </div>
              
              <div className="p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-2">{meal.name}</h3>
                
                <div className="grid grid-cols-2 gap-2 mb-4 text-sm">
                  <div className="flex items-center space-x-1">
                    <span className="text-orange-500">🔥</span>
                    <span>{meal.calories} cal</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <span className="text-blue-500">💪</span>
                    <span>{meal.protein}g</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <span className="text-green-500">🌾</span>
                    <span>{meal.carbs}g</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <span className="text-purple-500">🥑</span>
                    <span>{meal.fat}g</span>
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => startEdit(meal)}
                      className="text-blue-600 hover:text-blue-800 p-2 rounded-full hover:bg-blue-50 transition-colors"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(meal._id)}
                      className="text-red-600 hover:text-red-800 p-2 rounded-full hover:bg-red-50 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="text-xs text-gray-500 flex items-center">
                    <Clock className="h-3 w-3 mr-1" />
                    <span>15 min</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
          
          {/* Healthy Recipes */}
          {healthyMeals.filter(recipe => 
            selectedCategory === 'all' || recipe.category === selectedCategory
          ).filter(recipe => 
            !searchTerm || recipe.name.toLowerCase().includes(searchTerm.toLowerCase())
          ).map((recipe) => (
            <div key={recipe.name} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <div className="relative">
                <img src={recipe.image} alt={recipe.name} className="w-full h-48 object-cover" />
                <div className="absolute top-3 right-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    recipe.category === 'breakfast' ? 'bg-yellow-100 text-yellow-800' :
                    recipe.category === 'lunch' ? 'bg-blue-100 text-blue-800' :
                    recipe.category === 'dinner' ? 'bg-purple-100 text-purple-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {recipe.category}
                  </span>
                </div>
                <div className="absolute top-3 left-3">
                  <div className="bg-green-500 text-white rounded-full px-2 py-1 text-xs font-medium">
                    Healthy
                  </div>
                </div>
              </div>
              
              <div className="p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-2">{recipe.name}</h3>
                
                <div className="grid grid-cols-2 gap-2 mb-4 text-sm">
                  <div className="flex items-center space-x-1">
                    <span className="text-orange-500">🔥</span>
                    <span>{recipe.calories} cal</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <span className="text-blue-500">💪</span>
                    <span>{recipe.protein}g</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <span className="text-green-500">🌾</span>
                    <span>{recipe.carbs}g</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <span className="text-purple-500">🥑</span>
                    <span>{recipe.fat}g</span>
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <button className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200">
                    View Recipe
                  </button>
                  <div className="text-xs text-gray-500 flex items-center">
                    <Users className="h-3 w-3 mr-1" />
                    <span>4 servings</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredMeals.length === 0 && healthyMeals.filter(recipe => 
          selectedCategory === 'all' || recipe.category === selectedCategory
        ).filter(recipe => 
          !searchTerm || recipe.name.toLowerCase().includes(searchTerm.toLowerCase())
        ).length === 0 && (
          <div className="text-center py-12">
            <ChefHat className="mx-auto h-16 w-16 text-gray-400 mb-4" />
            <p className="text-gray-500 text-lg mb-2">No recipes found</p>
            <p className="text-gray-400">Try adjusting your search or filters</p>
          </div>
        )}

      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-gray-900">
                  {editingMeal ? 'Edit Recipe' : 'Add New Recipe'}
                </h3>
                <button
                  onClick={() => {
                    setShowForm(false);
                    setEditingMeal(null);
                    resetForm();
                    setError('');
                  }}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ×
                </button>
              </div>
              
              {error && (
                <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                  {error}
                </div>
              )}
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
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Instructions (one per line)</label>
              <textarea
                value={formData.instructions.join('\n')}
                onChange={(e) => setFormData({
                  ...formData,
                  instructions: e.target.value.split('\n').map(i => i.trim()).filter(i => i)
                })}
                className="w-full p-2 border rounded h-24"
                placeholder="1. Prepare ingredients\n2. Cook as needed\n3. Serve hot"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Recipe Image</label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 hover:border-orange-400 transition-colors">
                <div className="flex items-center justify-center space-x-4">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                    id="image-upload"
                  />
                  <label
                    htmlFor="image-upload"
                    className="flex items-center px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-lg cursor-pointer transition-colors duration-200 shadow-md hover:shadow-lg"
                  >
                    <Upload className="mr-2 h-5 w-5" />
                    {imagePreview ? 'Change Image' : 'Upload Image'}
                  </label>
                  {imagePreview && (
                    <div className="flex items-center space-x-2">
                      <ImageIcon className="h-5 w-5 text-green-500" />
                      <span className="text-sm text-green-600 font-medium">Image uploaded successfully!</span>
                    </div>
                  )}
                </div>
                {imagePreview && (
                  <div className="mt-4 flex justify-center">
                    <div className="relative inline-block">
                      <img src={imagePreview} alt="Recipe preview" className="w-40 h-40 object-cover rounded-lg border-2 border-orange-200 shadow-md" />
                      <button
                        type="button"
                        onClick={() => {
                          console.log('Removing image');
                          setImagePreview('');
                          setSelectedImage(null);
                          setFormData({...formData, image: ''});
                        }}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-7 h-7 flex items-center justify-center text-sm hover:bg-red-600 transition-colors duration-200 shadow-md"
                      >
                        ×
                      </button>
                    </div>
                  </div>
                )}
                {!imagePreview && (
                  <p className="text-center text-gray-500 text-sm mt-2">Click to upload a recipe image (JPG, PNG, GIF)</p>
                )}
              </div>
            </div>
              <div className="md:col-span-2 flex gap-4">
                <button type="submit" className="flex-1 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200">
                  {editingMeal ? 'Update Recipe' : 'Add Recipe'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingMeal(null);
                    resetForm();
                  }}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                >
                  Cancel
                </button>
              </div>
            </form>
            </div>
          </div>
        </div>
      )}


      </div>
    </div>
  );
};

export default Meals;
