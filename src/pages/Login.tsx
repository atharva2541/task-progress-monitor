
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { CheckSquare, AlertCircle, Mail, ArrowLeft, KeyRound } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent, 
  CardFooter 
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
import { 
  InputOTP, 
  InputOTPGroup, 
  InputOTPSlot 
} from '@/components/ui/input-otp';

// Login form schema - just email for requesting OTP
const loginFormSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email address' })
});

// OTP validation schema
const otpFormSchema = z.object({
  otp: z.string().length(6, { message: 'OTP must be 6 digits' })
});

// Reset password form schema
const resetFormSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email address' }),
  password: z.string().min(8, { message: 'Password must be at least 8 characters' }),
  confirmPassword: z.string()
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"]
});

// Login page states
type LoginPageState = 'REQUEST_OTP' | 'VERIFY_OTP' | 'RESET_PASSWORD';

const LoginPage = () => {
  const { requestOtp, verifyOtp, resetPassword, isLoading, isPasswordExpired } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [loginState, setLoginState] = useState<LoginPageState>('REQUEST_OTP');

  // Form for requesting OTP
  const loginForm = useForm<z.infer<typeof loginFormSchema>>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: { email: '' },
  });

  // Form for OTP verification
  const otpForm = useForm<z.infer<typeof otpFormSchema>>({
    resolver: zodResolver(otpFormSchema),
    defaultValues: { otp: '' },
  });

  // Form for password reset
  const resetForm = useForm<z.infer<typeof resetFormSchema>>({
    resolver: zodResolver(resetFormSchema),
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: ''
    },
  });

  // Handle OTP request
  const onRequestOtp = async (values: z.infer<typeof loginFormSchema>) => {
    setError(null);
    
    try {
      const success = await requestOtp(values.email);
      
      if (success) {
        setEmail(values.email);
        setLoginState('VERIFY_OTP');
        toast({
          title: 'OTP Sent',
          description: `A verification code has been sent to ${values.email}`,
          variant: 'default',
        });
      } else {
        setError('Failed to send OTP. Please check your email address.');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    }
  };

  // Handle OTP verification
  const onVerifyOtp = async (values: z.infer<typeof otpFormSchema>) => {
    setError(null);
    
    try {
      const result = await verifyOtp(email, values.otp);
      
      if (result.success) {
        if (result.passwordExpired) {
          // Password is expired, redirect to reset password
          setLoginState('RESET_PASSWORD');
          resetForm.setValue('email', email);
          toast({
            title: 'Password Reset Required',
            description: 'Your password has expired. Please create a new one.',
          });
        } else {
          // Login successful, redirect to dashboard
          toast({
            title: 'Login successful',
            description: 'Welcome to Audit Tracker!',
            variant: 'default',
          });
          navigate('/');
        }
      } else {
        setError('Invalid OTP. Please try again.');
      }
    } catch (err) {
      setError('An error occurred during verification. Please try again.');
    }
  };

  // Handle password reset
  const onResetPassword = async (values: z.infer<typeof resetFormSchema>) => {
    setError(null);
    
    try {
      const success = await resetPassword(values.email, values.password);
      
      if (success) {
        toast({
          title: 'Password Updated',
          description: 'Your password has been successfully updated.',
          variant: 'default',
        });
        navigate('/');
      } else {
        setError('Failed to update password. Please try again.');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
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
              {loginState === 'REQUEST_OTP' && 'Enter your email to receive an OTP'}
              {loginState === 'VERIFY_OTP' && 'Enter the verification code sent to your email'}
              {loginState === 'RESET_PASSWORD' && 'Create a new password'}
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
            
            {/* Request OTP Form */}
            {loginState === 'REQUEST_OTP' && (
              <Form {...loginForm}>
                <form onSubmit={loginForm.handleSubmit(onRequestOtp)} className="space-y-5">
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
                  
                  <Button 
                    type="submit" 
                    className="w-full bg-audit-purple-600 hover:bg-audit-purple-700 transition-all py-6" 
                    disabled={isLoading}
                  >
                    <Mail className="mr-2 h-4 w-4" />
                    {isLoading ? 'Sending OTP...' : 'Send Verification Code'}
                  </Button>
                </form>
              </Form>
            )}
            
            {/* OTP Verification Form */}
            {loginState === 'VERIFY_OTP' && (
              <div className="space-y-6">
                <div>
                  <p className="text-sm text-center mb-4">{`We've sent a verification code to ${email}`}</p>
                  
                  <Form {...otpForm}>
                    <form onSubmit={otpForm.handleSubmit(onVerifyOtp)} className="space-y-5">
                      <FormField
                        control={otpForm.control}
                        name="otp"
                        render={({ field }) => (
                          <FormItem className="space-y-4">
                            <FormLabel className="text-gray-700">Verification Code</FormLabel>
                            <FormControl>
                              <div className="flex justify-center">
                                <InputOTP maxLength={6} {...field}>
                                  <InputOTPGroup>
                                    <InputOTPSlot index={0} />
                                    <InputOTPSlot index={1} />
                                    <InputOTPSlot index={2} />
                                    <InputOTPSlot index={3} />
                                    <InputOTPSlot index={4} />
                                    <InputOTPSlot index={5} />
                                  </InputOTPGroup>
                                </InputOTP>
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <div className="pt-2 space-y-3">
                        <Button 
                          type="submit" 
                          className="w-full bg-audit-purple-600 hover:bg-audit-purple-700 transition-all py-6" 
                          disabled={isLoading}
                        >
                          <KeyRound className="mr-2 h-4 w-4" />
                          {isLoading ? 'Verifying...' : 'Verify OTP'}
                        </Button>
                        
                        <Button
                          type="button"
                          variant="outline"
                          className="w-full"
                          onClick={() => {
                            setLoginState('REQUEST_OTP');
                            otpForm.reset();
                          }}
                        >
                          <ArrowLeft className="mr-2 h-4 w-4" />
                          Back
                        </Button>
                      </div>
                    </form>
                  </Form>
                </div>
                
                <div className="text-center">
                  <button 
                    type="button" 
                    onClick={() => {
                      loginForm.handleSubmit(onRequestOtp)();
                    }}
                    className="text-sm text-audit-purple-600 hover:text-audit-purple-800 hover:underline transition-colors"
                  >
                    Didn't receive a code? Send again
                  </button>
                </div>
              </div>
            )}
            
            {/* Reset Password Form */}
            {loginState === 'RESET_PASSWORD' && (
              <Form {...resetForm}>
                <form onSubmit={resetForm.handleSubmit(onResetPassword)} className="space-y-5">
                  <FormField
                    control={resetForm.control}
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
                            readOnly
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={resetForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-700">New Password</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Enter your new password" 
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
                    control={resetForm.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-700">Confirm Password</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Confirm your new password" 
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
                  
                  <Button 
                    type="submit" 
                    className="w-full bg-audit-purple-600 hover:bg-audit-purple-700 transition-all py-6" 
                    disabled={isLoading}
                  >
                    {isLoading ? 'Updating...' : 'Update Password'}
                  </Button>
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
