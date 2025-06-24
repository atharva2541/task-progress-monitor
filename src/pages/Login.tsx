
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { CheckSquare, AlertCircle, Mail, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent
} from '@/components/ui/card';
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from '@/components/ui/form';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useToast } from '@/components/ui/use-toast';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

// Login form schema with email and password
const loginFormSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email address' }),
  password: z.string().min(1, { message: 'Password is required' })
});

// Forgot password email schema
const forgotPasswordSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email address' })
});

// Login page states
type LoginPageState = 'LOGIN' | 'FORGOT_PASSWORD';

const LoginPage = () => {
  const { signIn, resetPassword, user } = useSupabaseAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [error, setError] = useState<string | null>(null);
  const [loginState, setLoginState] = useState<LoginPageState>('LOGIN');
  const [loading, setLoading] = useState(false);

  // Form for login
  const loginForm = useForm<z.infer<typeof loginFormSchema>>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: { 
      email: '', 
      password: '' 
    },
  });

  // Form for forgot password
  const forgotPasswordForm = useForm<z.infer<typeof forgotPasswordSchema>>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: ''
    },
  });

  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  // Handle login submission
  const onLogin = async (values: z.infer<typeof loginFormSchema>) => {
    setError(null);
    setLoading(true);
    
    try {
      const { error } = await signIn(values.email, values.password);
      
      if (error) {
        setError(error.message || 'Invalid email or password');
      } else {
        toast({
          title: 'Login successful',
          description: 'Welcome to Audit Tracker!',
        });
        navigate('/');
      }
    } catch (err: any) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle forgot password submission
  const onForgotPassword = async (values: z.infer<typeof forgotPasswordSchema>) => {
    setError(null);
    setLoading(true);
    
    try {
      const { error } = await resetPassword(values.email);
      
      if (error) {
        setError(error.message);
      } else {
        toast({
          title: 'Password reset email sent',
          description: 'Please check your email for password reset instructions.',
        });
        setLoginState('LOGIN');
        forgotPasswordForm.reset();
      }
    } catch (err: any) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-50 to-audit-purple-50 p-4">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-8">
          <div className="rounded-full bg-audit-purple-100 p-4 shadow-md">
            <CheckSquare className="h-12 w-12 text-audit-purple-600" />
          </div>
        </div>
        
        <Card className="border-0 shadow-xl">
          <CardHeader className="space-y-2 text-center pb-6">
            <CardTitle className="text-2xl font-bold text-gray-800">Audit Tracker</CardTitle>
            <CardDescription className="text-gray-500">
              {loginState === 'LOGIN' && 'Enter your credentials to login'}
              {loginState === 'FORGOT_PASSWORD' && 'Enter your email to reset password'}
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            {error && (
              <Alert variant="destructive" className="mb-6">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            {/* Login Form */}
            {loginState === 'LOGIN' && (
              <>
                <Form {...loginForm}>
                  <form onSubmit={loginForm.handleSubmit(onLogin)} className="space-y-5">
                    <FormField
                      control={loginForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-700">Email</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Enter your email" 
                              type="email" 
                              className="bg-gray-50"
                              autoComplete="email"
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={loginForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-700">Password</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Enter your password" 
                              type="password" 
                              className="bg-gray-50"
                              autoComplete="current-password"
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <Button 
                      type="submit" 
                      className="w-full bg-audit-purple-600 hover:bg-audit-purple-700 transition-all py-6" 
                      disabled={loading}
                    >
                      {loading ? 'Signing In...' : 'Sign In'}
                    </Button>
                  </form>
                </Form>
                
                {/* Forgot Password Button */}
                <div className="mt-6">
                  <Button 
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={() => {
                      setLoginState('FORGOT_PASSWORD');
                      setError(null);
                      forgotPasswordForm.reset();
                    }}
                  >
                    <Mail className="mr-2 h-4 w-4" />
                    Forgot Password?
                  </Button>
                </div>
              </>
            )}
            
            {/* Forgot Password Form */}
            {loginState === 'FORGOT_PASSWORD' && (
              <Form {...forgotPasswordForm}>
                <form onSubmit={forgotPasswordForm.handleSubmit(onForgotPassword)} className="space-y-5">
                  <div className="mb-4">
                    <Alert>
                      <Mail className="h-4 w-4" />
                      <AlertTitle>Password Reset</AlertTitle>
                      <AlertDescription>
                        Enter your email address and we'll send you a link to reset your password.
                      </AlertDescription>
                    </Alert>
                  </div>
                  
                  <FormField
                    control={forgotPasswordForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-700">Email</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Enter your email" 
                            type="email" 
                            className="bg-gray-50"
                            autoComplete="email"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="pt-2 space-y-3">
                    <Button 
                      type="submit" 
                      className="w-full bg-audit-purple-600 hover:bg-audit-purple-700 transition-all py-6" 
                      disabled={loading}
                    >
                      <Mail className="mr-2 h-4 w-4" />
                      {loading ? 'Sending...' : 'Send Reset Link'}
                    </Button>
                    
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full"
                      onClick={() => {
                        setLoginState('LOGIN');
                        forgotPasswordForm.reset();
                        setError(null);
                      }}
                    >
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Back to Login
                    </Button>
                  </div>
                </form>
              </Form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default LoginPage;
