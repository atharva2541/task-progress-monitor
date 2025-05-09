
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

const Index = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // If authenticated, redirect to dashboard, otherwise to login
    if (user) {
      navigate('/');
    } else {
      navigate('/login');
    }
  }, [user, navigate]);

  return null;
};

export default Index;
