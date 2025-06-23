
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { CheckSquare, AlertCircle, Mail, ArrowLeft, KeyRound, LockKeyhole, Shield, ShieldCheck } from 'lucide-react';
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
  FormMessage,
  FormDescription 
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
import { Progress } from '@/components/ui/progress';

// Email form schema
const emailFormSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email address' })
});

// OTP validation schema
const otpFormSchema = z.object({
  otp: z.string().length(6, { message: 'OTP must be 6 digits' })
});

// Strong password schema with custom validation
const passwordSchema = z.string()
  .min(8, { message: 'Password must be at least 8 characters' })
  .refine((val) => /[A-Z]/.test(val), {
    message: 'Password must contain at least one uppercase letter',
  })
  .refine((val) => /[a-z]/.test(val), {
    message: 'Password must contain at least one lowercase letter',
  })
  .refine((val) => /[0-9]/.test(val), {
    message: 'Password must contain at least one number',
  })
  .refine((val) => /[^A-Za-z0-9]/.test(val), {
    message: 'Password must contain at least one special character',
  });

// Reset password form schema with strong password requirements
const resetFormSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email address' }),
  password: passwordSchema,
  confirmPassword: z.string().min(8, { message: 'Please confirm your password' })
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"]
});

// Login page states
type LoginPageState = 'EMAIL' | 'VERIFY_OTP' | 'RESET_PASSWORD' | 'FIRST_LOGIN';

const LoginPage = () => {
  const { user, requestOtp, verifyOtp, resetPassword, isLoading, isPasswordExpired, isFirstLogin, checkPasswordStrength } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [loginState, setLoginState] = useState<LoginPageState>('EMAIL');
  const [passwordStrength, setPasswordStrength] = useState(0);

  // Redirect if already authenticated
  useEffect(() => {
    if (user && !isPasswordExpired && !isFirstLogin) {
      navigate('/dashboard');
    }
  }, [user, isPasswordExpired, isFirstLogin, navigate]);

  // Form for email input
  const emailForm = useForm<z.infer<typeof emailFormSchema>>({
    resolver: zodResolver(emailFormSchema),
    defaultValues: { email: '' },
  });

  // Form for OTP verification
  const otpForm = useForm<z.infer<typeof otpFormSchema>>({
    resolver: zodResolver(otpFormSchema),
    defaultValues: { otp: '' },
  });

  // Form for password reset or first login
  const resetForm = useForm<z.infer<typeof resetFormSchema>>({
    resolver: zodResolver(resetFormSchema),
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: ''
    },
  });

  // Update password strength meter when password changes
  useEffect(() => {
    const subscription = resetForm.watch((value, { name }) => {
      if (name === 'password' && value.password) {
        const password = value.password as string;
        const strength = checkPasswordStrength(password);
        
        if (strength === 'weak') setPasswordStrength(33);
        else if (strength === 'medium') setPasswordStrength(66);
        else setPasswordStrength(100);
      }
    });
    
    return () => subscription.unsubscribe();
  }, [resetForm, checkPasswordStrength]);

  // Check if user needs to reset password or it's their first login
  useEffect(() => {
    if (isPasswordExpired) {
      setLoginState('RESET_PASSWORD');
    } else if (isFirstLogin) {
      setLoginState('FIRST_LOGIN');
    }
  }, [isPasswordExpired, isFirstLogin]);

  // Handle email submission
  const onEmailSubmit = async (values: z.infer<typeof emailFormSchema>) => {
    setError(null);
    setEmail(values.email);
    
    try {
      const success = await requestOtp(values.email);
      
      if (success) {
        setLoginState('VERIFY_OTP');
      } else {
        setError('Failed to send verification code. Please try again.');
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
          setLoginState('RESET_PASSWORD');
          resetForm.setValue('email', email);
          toast({
            title: 'Password Reset Required',
            description: 'Your password has expired. Please create a new one.',
          });
        } else if (result.isFirstLogin) {
          setLoginState('FIRST_LOGIN');
          resetForm.setValue('email', email);
          toast({
            title: 'Password Setup Required',
            description: 'This is your first login. Please set a new secure password.',
          });
        } else {
          toast({
            title: 'Login successful',
            description: 'Welcome to Audit Tracker!',
            variant: 'default',
          });
          navigate('/dashboard');
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
        navigate('/dashboard');
      } else {
        setError('Failed to update password. Please make sure it meets all requirements.');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    }
  };

  // Get password strength indicator color
  const getPasswordStrengthColor = (): string => {
    if (passwordStrength <= 33) return "bg-destructive";
    if (passwordStrength <= 66) return "bg-yellow-500";
    return "bg-green-500";
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
              {loginState === 'EMAIL' && 'Enter your email to receive a verification code'}
              {loginState === 'VERIFY_OTP' && 'Enter the verification code sent to your email'}
              {loginState === 'RESET_PASSWORD' && 'Create a new password'}
              {loginState === 'FIRST_LOGIN' && 'Set your new password for first time login'}
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
            
            {/* Email Form */}
            {loginState === 'EMAIL' && (
              <Form {...emailForm}>
                <form onSubmit={emailForm.handleSubmit(onEmailSubmit)} className="space-y-5">
                  <FormField
                    control={emailForm.control}
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
                    {isLoading ? 'Sending...' : 'Send Verification Code'}
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
                          {isLoading ? 'Verifying...' : 'Verify Code'}
                        </Button>
                        
                        <Button
                          type="button"
                          variant="outline"
                          className="w-full"
                          onClick={() => {
                            setLoginState('EMAIL');
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
                    onClick={async () => {
                      const success = await requestOtp(email);
                      if (success) {
                        toast({
                          title: 'Code Sent',
                          description: `A verification code has been sent to ${email}`,
                          variant: 'default',
                        });
                      }
                    }}
                    className="text-sm text-audit-purple-600 hover:text-audit-purple-800 hover:underline transition-colors"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Sending...' : "Didn't receive a code? Send again"}
                  </button>
                </div>
              </div>
            )}
            
            {/* Password Reset/First Login Form */}
            {(loginState === 'RESET_PASSWORD' || loginState === 'FIRST_LOGIN') && (
              <Form {...resetForm}>
                <form onSubmit={resetForm.handleSubmit(onResetPassword)} className="space-y-5">
                  <div className="mb-4">
                    <Alert>
                      <ShieldCheck className="h-4 w-4" />
                      <AlertTitle>
                        {loginState === 'FIRST_LOGIN' ? 'First Time Login' : 'Password Reset Required'}
                      </AlertTitle>
                      <AlertDescription>
                        {loginState === 'FIRST_LOGIN' 
                          ? 'You need to set a strong password for your account.'
                          : 'Your password has expired. Please set a new strong password.'
                        }
                      </AlertDescription>
                    </Alert>
                  </div>
                  
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
                        <FormDescription className="text-xs">
                          Password must be at least 8 characters and include uppercase, lowercase, number, and special character.
                        </FormDescription>
                        <div className="mt-2">
                          <div className="flex items-center gap-2">
                            <Progress value={passwordStrength} className={`h-2 ${getPasswordStrengthColor()}`} />
                            <span className="text-xs">
                              {passwordStrength <= 33 && <span className="text-destructive">Weak</span>}
                              {passwordStrength > 33 && passwordStrength <= 66 && <span className="text-yellow-600">Medium</span>}
                              {passwordStrength > 66 && <span className="text-green-600">Strong</span>}
                            </span>
                          </div>
                        </div>
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
                    disabled={isLoading || passwordStrength <= 33}
                  >
                    <Shield className="mr-2 h-4 w-4" />
                    {isLoading ? 'Updating...' : 'Update Password & Login'}
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
