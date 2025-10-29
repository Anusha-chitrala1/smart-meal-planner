"use client"

import React, { useState, useEffect } from 'react';
import { ChefHat, Calendar, ShoppingCart, Package, MessageCircle, TrendingUp, Users, DollarSign } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

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

interface Order {
  _id: string;
  meals: Meal[];
  totalCalories: number;
  totalPrice: number;
  paymentMethod: string;
  status: string;
  createdAt: string;
}

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [meals, setMeals] = useState<Meal[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalMeals: 0,
    totalOrders: 0,
    totalCalories: 0,
    totalSpent: 0
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers: Record<string, string> = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      // Fetch meals
      const mealsResponse = await fetch('http://localhost:5000/api/meals');
      const mealsData = await mealsResponse.json();
      setMeals(mealsData);

      // Fetch orders if user is logged in
      if (token) {
        const ordersResponse = await fetch('http://localhost:5000/api/orders', {
          headers
        });
        if (ordersResponse.ok) {
          const ordersData = await ordersResponse.json();
          setOrders(ordersData);
        }
      }

      // Calculate stats
      const totalMeals = mealsData.length;
      const totalOrders = orders.length;
      const totalCalories = mealsData.reduce((sum: number, meal: Meal) => sum + meal.calories, 0);
      const totalSpent = orders.reduce((sum: number, order: Order) => sum + order.totalPrice, 0);

      setStats({
        totalMeals,
        totalOrders,
        totalCalories,
        totalSpent
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
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
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Welcome back, {user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User'}!
          </h1>
          <p className="text-lg text-gray-600">Here&apos;s your meal planning dashboard</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center">
              <div className="p-3 bg-orange-100 rounded-full">
                <ChefHat className="h-6 w-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Meals</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalMeals}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-full">
                <Package className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Orders</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalOrders}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-full">
                <TrendingUp className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Calories</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalCalories}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 rounded-full">
                <DollarSign className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Spent</p>
                <p className="text-2xl font-bold text-gray-900">${stats.totalSpent.toFixed(2)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button className="flex items-center justify-center p-4 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors duration-200">
              <ChefHat className="h-5 w-5 mr-2" />
              Create New Meal
            </button>
            <button className="flex items-center justify-center p-4 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors duration-200">
              <Calendar className="h-5 w-5 mr-2" />
              Plan Meal Schedule
            </button>
            <button className="flex items-center justify-center p-4 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors duration-200">
              <ShoppingCart className="h-5 w-5 mr-2" />
              Generate Shopping List
            </button>
          </div>
        </div>

        {/* Recent Meals */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Recent Meals</h2>
          {meals.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {meals.slice(0, 6).map((meal) => (
                <div key={meal._id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-gray-900">{meal.name}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      meal.category === 'breakfast' ? 'bg-yellow-100 text-yellow-800' :
                      meal.category === 'lunch' ? 'bg-blue-100 text-blue-800' :
                      meal.category === 'dinner' ? 'bg-purple-100 text-purple-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {meal.category}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600">
                    <p>{meal.calories} calories</p>
                    <p>{meal.protein}g protein • {meal.carbs}g carbs • {meal.fat}g fat</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">No meals created yet. Start by adding your first meal!</p>
          )}
        </div>

        {/* Recent Orders */}
        {user && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Recent Orders</h2>
            {orders.length > 0 ? (
              <div className="space-y-4">
                {orders.slice(0, 5).map((order) => (
                  <div key={order._id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="font-semibold text-gray-900">Order #{order._id.slice(-8)}</p>
                        <p className="text-sm text-gray-600">{new Date(order.createdAt).toLocaleDateString()}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900">${order.totalPrice.toFixed(2)}</p>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          order.status === 'completed' ? 'bg-green-100 text-green-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {order.status}
                        </span>
                      </div>
                    </div>
                    <div className="text-sm text-gray-600">
                      <p>{order.meals.length} meals • {order.totalCalories} calories • {order.paymentMethod.toUpperCase()}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">No orders yet. Place your first order!</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
