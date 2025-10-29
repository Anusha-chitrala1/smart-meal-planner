"use client"

import React, { useState, useEffect } from 'react';
import { X, MapPin, CreditCard, Truck, Clock, Plus } from 'lucide-react';

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

interface OrderCheckoutProps {
  selectedMeals: Meal[];
  onClose: () => void;
  onOrderPlaced: () => void;
}

const OrderCheckout: React.FC<OrderCheckoutProps> = ({ selectedMeals, onClose, onOrderPlaced }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'online'>('cod');

  const API_BASE = 'http://localhost:5000/api/orders';

  const calculateTotals = () => {
    const totalCalories = selectedMeals.reduce((sum, meal) => sum + meal.calories, 0);
    const totalPrice = selectedMeals.length * 10; // $10 per meal
    return { totalCalories, totalPrice };
  };

  const placeOrder = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setError('Please login first');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const mealIds = selectedMeals.map(meal => meal._id);
      const response = await fetch(API_BASE, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ meals: mealIds, paymentMethod }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to place order');

      onOrderPlaced();
      alert('Order placed successfully!');
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  const { totalCalories, totalPrice } = calculateTotals();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900">Checkout</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm">
              {error}
            </div>
          )}

          {/* Selected Meals */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Selected Meals ({selectedMeals.length})</h3>
            <div className="bg-gray-50 rounded-lg p-4 max-h-60 overflow-y-auto">
              {selectedMeals.map((meal) => (
                <div key={meal._id} className="flex justify-between items-center py-3 border-b border-gray-200 last:border-b-0">
                  <div>
                    <span className="font-medium">{meal.name}</span>
                    <span className={`ml-2 px-2 py-1 text-xs rounded-full ${
                      meal.category === 'breakfast' ? 'bg-yellow-100 text-yellow-800' :
                      meal.category === 'lunch' ? 'bg-blue-100 text-blue-800' :
                      meal.category === 'dinner' ? 'bg-purple-100 text-purple-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {meal.category}
                    </span>
                    <div className="text-sm text-gray-500 mt-1">
                      {meal.calories} cal • {meal.protein}g protein • {meal.carbs}g carbs • {meal.fat}g fat
                    </div>
                  </div>
                  <span className="font-medium">$10.00</span>
                </div>
              ))}
            </div>
          </div>

          {/* Payment Method */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Payment Method</h3>
            <div className="space-y-3">
              <label className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="cod"
                  checked={paymentMethod === 'cod'}
                  onChange={(e) => setPaymentMethod(e.target.value as 'cod')}
                  className="text-orange-500 focus:ring-orange-500"
                />
                <Truck className="h-5 w-5 text-gray-400" />
                <div>
                  <span className="font-medium">Cash on Delivery (COD)</span>
                  <p className="text-sm text-gray-500">Pay when your order is delivered</p>
                </div>
              </label>
              <label className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="online"
                  checked={paymentMethod === 'online'}
                  onChange={(e) => setPaymentMethod(e.target.value as 'online')}
                  className="text-orange-500 focus:ring-orange-500"
                />
                <CreditCard className="h-5 w-5 text-gray-400" />
                <div>
                  <span className="font-medium">Online Payment</span>
                  <p className="text-sm text-gray-500">Pay securely online</p>
                </div>
              </label>
            </div>
          </div>

          {/* Order Summary */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Order Summary</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Total Meals</span>
                <span>{selectedMeals.length}</span>
              </div>
              <div className="flex justify-between">
                <span>Total Calories</span>
                <span>{totalCalories}</span>
              </div>
              <div className="border-t border-gray-300 pt-2 flex justify-between font-semibold text-lg">
                <span>Total Price</span>
                <span>${totalPrice.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Place Order Button */}
          <button
            onClick={placeOrder}
            disabled={loading || selectedMeals.length === 0}
            className="w-full bg-green-500 hover:bg-green-600 disabled:bg-gray-300 text-white py-3 px-4 rounded-lg font-medium transition-colors duration-200 disabled:cursor-not-allowed"
          >
            {loading ? 'Placing Order...' : `Place Order - $${totalPrice.toFixed(2)}`}
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderCheckout;
