import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { CheckSquare, AlertCircle, Mail, ArrowLeft, KeyRound, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useToast } from '@/components/ui/use-toast';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';

// Email and password login form schema
const loginFormSchema = z.object({
  email: z.string().email({
    message: 'Please enter a valid email address'
  }),
  password: z.string().min(1, {
    message: 'Password is required'
  })
});

// OTP validation schema
const otpFormSchema = z.object({
  otp: z.string().length(6, {
    message: 'OTP must be 6 digits'
  })
});
const LoginPage = () => {
  const {
    login,
    verifyOtp,
    isLoading,
    isAwaitingOtp,
    currentEmail
  } = useAuth();
  const navigate = useNavigate();
  const {
    toast
  } = useToast();
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  // Form for email and password login
  const loginForm = useForm<z.infer<typeof loginFormSchema>>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: {
      email: '',
      password: ''
    }
  });

  // Form for OTP verification
  const otpForm = useForm<z.infer<typeof otpFormSchema>>({
    resolver: zodResolver(otpFormSchema),
    defaultValues: {
      otp: ''
    }
  });

  // Handle login submission
  const onLoginSubmit = async (values: z.infer<typeof loginFormSchema>) => {
    setError(null);
    try {
      const result = await login(values.email, values.password);
      if (!result.success) {
        setError(result.message || 'Login failed');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    }
  };

  // Handle OTP verification
  const onVerifyOtp = async (values: z.infer<typeof otpFormSchema>) => {
    setError(null);
    if (!currentEmail) {
      setError('Email not found. Please login again.');
      return;
    }
    try {
      const result = await verifyOtp(currentEmail, values.otp);
      if (result.success) {
        navigate('/');
      } else {
        setError(result.message || 'Invalid OTP. Please try again.');
      }
    } catch (err) {
      setError('An error occurred during verification. Please try again.');
    }
  };
  return <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-50 to-audit-purple-50 p-4">
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
              {!isAwaitingOtp ? 'Enter your email and password to login' : 'Enter the verification code sent to your email'}
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            {error && <Alert variant="destructive" className="mb-6">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>}
            
            {/* Login Form */}
            {!isAwaitingOtp && <Form {...loginForm}>
                <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-5">
                  <FormField control={loginForm.control} name="email" render={({
                field
              }) => <FormItem>
                        <FormLabel className="text-gray-700">Email</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter your email" type="email" className="bg-gray-50" autoComplete="email" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>} />
                  
                  <FormField control={loginForm.control} name="password" render={({
                field
              }) => <FormItem>
                        <FormLabel className="text-gray-700">Password</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input placeholder="Enter your password" type={showPassword ? "text" : "password"} className="bg-gray-50 pr-10" autoComplete="current-password" {...field} />
                            <Button type="button" variant="ghost" size="sm" className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent" onClick={() => setShowPassword(!showPassword)}>
                              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </Button>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>} />
                  
                  <Button type="submit" className="w-full bg-audit-purple-600 hover:bg-audit-purple-700 transition-all py-6" disabled={isLoading}>
                    <Mail className="mr-2 h-4 w-4" />
                    {isLoading ? 'Authenticating...' : 'Login'}
                  </Button>
                </form>
              </Form>}
            
            {/* OTP Verification Form */}
            {isAwaitingOtp && <div className="space-y-6">
                <div>
                  <p className="text-sm text-center mb-4">
                    {`We've sent a verification code to ${currentEmail}`}
                  </p>
                  
                  <Form {...otpForm}>
                    <form onSubmit={otpForm.handleSubmit(onVerifyOtp)} className="space-y-5">
                      <FormField control={otpForm.control} name="otp" render={({
                    field
                  }) => <FormItem className="space-y-4">
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
                          </FormItem>} />
                      
                      <div className="pt-2 space-y-3">
                        <Button type="submit" className="w-full bg-audit-purple-600 hover:bg-audit-purple-700 transition-all py-6" disabled={isLoading}>
                          <KeyRound className="mr-2 h-4 w-4" />
                          {isLoading ? 'Verifying...' : 'Verify & Login'}
                        </Button>
                        
                        <Button type="button" variant="outline" className="w-full" onClick={() => {
                      loginForm.reset();
                      otpForm.reset();
                      setError(null);
                    }}>
                          <ArrowLeft className="mr-2 h-4 w-4" />
                          Back to Login
                        </Button>
                      </div>
                    </form>
                  </Form>
                </div>
                
                <div className="text-center">
                  <p className="text-xs text-gray-500">
                    For testing: Use OTP <strong>123456</strong>
                  </p>
                </div>
              </div>}

            {/* Test Credentials Info */}
            
          </CardContent>
        </Card>
      </div>
    </div>;
};
export default LoginPage;