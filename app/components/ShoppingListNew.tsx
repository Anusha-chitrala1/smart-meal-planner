"use client"

import React, { useState, useEffect } from 'react';
import { ShoppingCart, Plus, Check, Trash2, CreditCard } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

interface ShoppingListItem {
  _id: string;
  ingredientName: string;
  amount: string;
  unit: string;
  checked: boolean;
  recipeTitle?: string;
  createdAt: string;
  updatedAt: string;
}

const ShoppingList: React.FC = () => {
  const { user } = useAuth();
  const [shoppingList, setShoppingList] = useState<ShoppingListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [newItem, setNewItem] = useState({ name: '', amount: '', unit: '' });
  const [showCheckout, setShowCheckout] = useState(false);

  useEffect(() => {
    if (user) {
      loadShoppingList();
    }
  }, [user]);

  const loadShoppingList = async () => {
    if (!user) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/shopping-list', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setShoppingList(data.data || []);
      }
    } catch (error) {
      console.error('Error loading shopping list:', error);
    } finally {
      setLoading(false);
    }
  };

  const addItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newItem.name.trim()) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/shopping-list', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          ingredientName: newItem.name.trim(),
          amount: newItem.amount.trim(),
          unit: newItem.unit.trim(),
          checked: false,
        }),
      });

      if (response.ok) {
        setNewItem({ name: '', amount: '', unit: '' });
        loadShoppingList();
      }
    } catch (error) {
      console.error('Error adding item:', error);
    }
  };

  const toggleItem = async (itemId: string, checked: boolean) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/shopping-list', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ id: itemId, checked }),
      });

      if (response.ok) {
        loadShoppingList();
      }
    } catch (error) {
      console.error('Error updating item:', error);
    }
  };

  const deleteItem = async (itemId: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/shopping-list?id=${itemId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        loadShoppingList();
      }
    } catch (error) {
      console.error('Error deleting item:', error);
    }
  };

  const generateFromMealPlan = async () => {
    if (!user) return;

    try {
      // For now, just show a message since meal plan integration would need more complex logic
      alert('Meal plan integration coming soon! Add ingredients manually for now.');
    } catch (error) {
      console.error('Error generating shopping list:', error);
      alert('Failed to generate shopping list from meal plan');
    }
  };

  const clearCompleted = async () => {
    try {
      const token = localStorage.getItem('token');
      const completedItems = shoppingList.filter(item => item.checked);

      for (const item of completedItems) {
        await fetch(`/api/shopping-list?id=${item._id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
      }

      loadShoppingList();
      alert('Completed items cleared successfully!');
    } catch (error) {
      console.error('Error clearing completed items:', error);
      alert('Failed to clear completed items. Please try again.');
    }
  };

  const proceedToCheckout = () => {
    const itemsToOrder = shoppingList.filter(item => !item.checked);
    if (itemsToOrder.length === 0) {
      alert('Please add items to your shopping list first.');
      return;
    }

    // For now, just show a message since checkout integration would need more work
    alert('Checkout functionality coming soon! Items: ' + itemsToOrder.map(item => item.ingredientName).join(', '));
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-green-50 flex items-center justify-center">
        <div className="text-center">
          <ShoppingCart className="mx-auto h-16 w-16 text-gray-400 mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Sign in to View Your Shopping List</h2>
          <p className="text-gray-600">Create an account to manage your shopping list and generate lists from your meal plans.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-green-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
            <div className="space-y-4">
              {[...Array(5)].map((_, index) => (
                <div key={index} className="bg-white rounded-lg p-4 shadow">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const completedItems = shoppingList.filter(item => item.checked);
  const pendingItems = shoppingList.filter(item => !item.checked);

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-green-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Shopping List</h1>
            <p className="text-gray-600 mt-2">Keep track of ingredients you need</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 mt-4 sm:mt-0">
            <button
              onClick={generateFromMealPlan}
              className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center space-x-2"
            >
              <Plus className="h-4 w-4" />
              <span>From Meal Plan</span>
            </button>
            {pendingItems.length > 0 && (
              <button
                onClick={proceedToCheckout}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center space-x-2"
              >
                <CreditCard className="h-4 w-4" />
                <span>Order Now</span>
              </button>
            )}
            {completedItems.length > 0 && (
              <button
                onClick={clearCompleted}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center space-x-2"
              >
                <Trash2 className="h-4 w-4" />
                <span>Clear Completed</span>
              </button>
            )}
          </div>
        </div>

        {/* Add Item Form */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Add New Item</h2>
          <form onSubmit={addItem} className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              placeholder="Item name"
              value={newItem.name}
              onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
              required
            />
            <input
              type="text"
              placeholder="Amount"
              value={newItem.amount}
              onChange={(e) => setNewItem({ ...newItem, amount: e.target.value })}
              className="w-24 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
            <input
              type="text"
              placeholder="Unit"
              value={newItem.unit}
              onChange={(e) => setNewItem({ ...newItem, unit: e.target.value })}
              className="w-24 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
            <button
              type="submit"
              className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-md font-medium transition-colors duration-200 flex items-center justify-center space-x-2"
            >
              <Plus className="h-4 w-4" />
              <span>Add</span>
            </button>
          </form>
        </div>

        {/* Shopping List */}
        <div className="space-y-6">
          {/* Pending Items */}
          {pendingItems.length > 0 && (
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              <div className="bg-orange-500 text-white px-6 py-3">
                <h3 className="text-lg font-semibold">To Buy ({pendingItems.length})</h3>
              </div>
              <div className="divide-y divide-gray-200">
                {pendingItems.map((item) => (
                  <div key={item._id} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors duration-200">
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => toggleItem(item._id, true)}
                        className="w-6 h-6 border-2 border-gray-300 rounded-md hover:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors duration-200"
                      >
                      </button>
                      <div>
                        <div className="font-medium text-gray-900">
                          {item.amount && item.unit ? `${item.amount} ${item.unit}` : ''} {item.ingredientName}
                        </div>
                        {item.recipeTitle && (
                          <div className="text-sm text-gray-500">From: {item.recipeTitle}</div>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => deleteItem(item._id)}
                      className="text-red-400 hover:text-red-600 p-2 transition-colors duration-200"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Completed Items */}
          {completedItems.length > 0 && (
            <div className="bg-white rounded-xl shadow-md overflow-hidden opacity-75">
              <div className="bg-green-500 text-white px-6 py-3">
                <h3 className="text-lg font-semibold">Completed ({completedItems.length})</h3>
              </div>
              <div className="divide-y divide-gray-200">
                {completedItems.map((item) => (
                  <div key={item._id} className="px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => toggleItem(item._id, false)}
                        className="w-6 h-6 bg-green-500 text-white rounded-md flex items-center justify-center hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors duration-200"
                      >
                        <Check className="h-4 w-4" />
                      </button>
                      <div>
                        <div className="font-medium text-gray-500 line-through">
                          {item.amount && item.unit ? `${item.amount} ${item.unit}` : ''} {item.ingredientName}
                        </div>
                        {item.recipeTitle && (
                          <div className="text-sm text-gray-400">From: {item.recipeTitle}</div>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => deleteItem(item._id)}
                      className="text-red-400 hover:text-red-600 p-2 transition-colors duration-200"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {shoppingList.length === 0 && (
            <div className="text-center py-12">
              <div className="bg-white rounded-xl shadow-md p-8 max-w-md mx-auto">
                <ShoppingCart className="mx-auto h-16 w-16 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Your shopping list is empty</h3>
                <p className="text-gray-600 mb-4">
                  Add items manually or generate a list from your weekly meal plan.
                </p>
                <button
                  onClick={generateFromMealPlan}
                  className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200"
                >
                  Generate from Meal Plan
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ShoppingList;
