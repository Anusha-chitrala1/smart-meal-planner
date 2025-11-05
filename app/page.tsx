"use client"

import React, { useState, useEffect } from 'react';
import Meals from './components/Meals';
import Auth from './components/Auth';
import ForgotPassword from './components/ForgotPassword';
import Support from './components/Support';
import OrderHistory from './components/OrderHistory';
import Navigation from './components/Navigation';
import Dashboard from './components/Dashboard';
import Recipes from './components/Recipes';
import MealPlannerNew from './components/MealPlannerNew';
import ProfilePage from './components/ProfilePage';

import { useAuth } from './hooks/useAuth';

export default function Home() {
  const [currentView, setCurrentView] = useState('auth');
  const { user, loading } = useAuth();

  useEffect(() => {
    // Load current view from localStorage on mount
    const savedView = localStorage.getItem('currentView');
    if (savedView) {
      setCurrentView(savedView);
    }

    // Check URL parameters for view
    const urlParams = new URLSearchParams(window.location.search);
    const viewParam = urlParams.get('view');
    if (viewParam) {
      setCurrentView(viewParam);
      // Clean up URL
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, []);

  useEffect(() => {
    // Save current view to localStorage whenever it changes
    localStorage.setItem('currentView', currentView);
  }, [currentView]);

  useEffect(() => {
    // If user is logged in and on auth page, redirect to dashboard
    if (!loading && user && currentView === 'auth') {
      setCurrentView('dashboard');
    }
    // If user is not logged in and not on auth pages, redirect to auth
    if (!loading && !user && currentView !== 'auth' && currentView !== 'forgot') {
      setCurrentView('auth');
    }
  }, [user, loading, currentView]);

  const renderCurrentView = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard />;
      case 'recipes':
        return <Recipes />;
      case 'meal-planner':
        return <MealPlannerNew />;
      case 'home':
        return <Meals />;
      case 'shopping':
        return <Meals />; // Using Meals component for now, can be replaced with shopping list
      case 'auth':
        return <Auth onForgotPassword={() => setCurrentView('forgot')} />;
      case 'forgot':
        return <ForgotPassword onBack={() => setCurrentView('auth')} />;
      case 'support':
        return <Support />;
      case 'orders':
        return <OrderHistory />;
      case 'profile':
        return <ProfilePage />;

      default:
        return <Dashboard />;
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
    <div className="min-h-screen">
      {currentView !== 'auth' && currentView !== 'forgot' && user && (
        <Navigation currentView={currentView} onViewChange={setCurrentView} />
      )}
      {renderCurrentView()}
    </div>
  );
}
