
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

const Index = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    console.log("Index: Checking user authentication state:", !!user);
    // If authenticated, redirect to dashboard, otherwise to login
    if (user) {
      console.log("Index: User is authenticated, navigating to dashboard");
      navigate('/');
    } else {
      console.log("Index: User is not authenticated, navigating to login");
      navigate('/login');
    }
  }, [user, navigate]);

  return null;
};

export default Index;
