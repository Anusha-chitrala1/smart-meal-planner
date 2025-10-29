import { useState, useEffect } from 'react';

interface User {
  id: string;
  email: string;
  user_metadata?: {
    full_name?: string;
  };
}

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in on mount
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        setUser(userData);
      } catch (error) {
        localStorage.removeItem('user');
        setUser(null);
      }
    }
    setLoading(false);
  }, []);

  const signOut = async () => {
    localStorage.removeItem('user');
    setUser(null);
  };

  const signIn = (userData: User) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  return {
    user,
    loading,
    signOut,
    signIn
  };
};
