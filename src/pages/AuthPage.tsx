
import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { CheckSquare, AlertCircle, Mail, ArrowLeft, Lock } from 'lucide-react';
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
import { supabase } from '@/integrations/supabase/client';

// Login form schema with email and password
const loginFormSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email address' }),
  password: z.string().min(1, { message: 'Password is required' })
});

// Forgot password email schema
const forgotPasswordSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email address' })
});

// Reset password schema
const resetPasswordSchema = z.object({
  password: z.string().min(6, { message: 'Password must be at least 6 characters' }),
  confirmPassword: z.string().min(6, { message: 'Please confirm your password' })
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"]
});

// Auth page states
type AuthPageState = 'LOGIN' | 'FORGOT_PASSWORD' | 'RESET_PASSWORD';

const AuthPage = () => {
  const { signIn, resetPassword, user } = useSupabaseAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [authState, setAuthState] = useState<AuthPageState>('LOGIN');
  const [loading, setLoading] = useState(false);

  // Check URL parameters to determine initial state
  useEffect(() => {
    const mode = searchParams.get('mode');
    if (mode === 'reset') {
      setAuthState('RESET_PASSWORD');
    }
  }, [searchParams]);

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

  // Form for reset password
  const resetPasswordForm = useForm<z.infer<typeof resetPasswordSchema>>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: '',
      confirmPassword: ''
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
        setAuthState('LOGIN');
        forgotPasswordForm.reset();
      }
    } catch (err: any) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle reset password submission
  const onResetPassword = async (values: z.infer<typeof resetPasswordSchema>) => {
    setError(null);
    setLoading(true);
    
    try {
      const { error } = await supabase.auth.updateUser({
        password: values.password
      });
      
      if (error) {
        setError(error.message);
      } else {
        toast({
          title: 'Password updated successfully',
          description: 'You can now login with your new password.',
        });
        navigate('/');
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
              {authState === 'LOGIN' && 'Enter your credentials to login'}
              {authState === 'FORGOT_PASSWORD' && 'Enter your email to reset password'}
              {authState === 'RESET_PASSWORD' && 'Set your new password'}
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
            {authState === 'LOGIN' && (
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
                      setAuthState('FORGOT_PASSWORD');
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
            {authState === 'FORGOT_PASSWORD' && (
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
                        setAuthState('LOGIN');
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

            {/* Reset Password Form */}
            {authState === 'RESET_PASSWORD' && (
              <Form {...resetPasswordForm}>
                <form onSubmit={resetPasswordForm.handleSubmit(onResetPassword)} className="space-y-5">
                  <div className="mb-4">
                    <Alert>
                      <Lock className="h-4 w-4" />
                      <AlertTitle>Set New Password</AlertTitle>
                      <AlertDescription>
                        Please enter your new password below.
                      </AlertDescription>
                    </Alert>
                  </div>
                  
                  <FormField
                    control={resetPasswordForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-700">New Password</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Enter new password" 
                            type="password" 
                            className="bg-gray-50"
                            autoComplete="new-password"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={resetPasswordForm.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-700">Confirm New Password</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Confirm new password" 
                            type="password" 
                            className="bg-gray-50"
                            autoComplete="new-password"
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
                      <Lock className="mr-2 h-4 w-4" />
                      {loading ? 'Updating...' : 'Update Password'}
                    </Button>
                    
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full"
                      onClick={() => {
                        setAuthState('LOGIN');
                        resetPasswordForm.reset();
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

export default AuthPage;
