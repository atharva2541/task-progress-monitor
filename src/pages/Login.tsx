
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { CheckSquare, AlertCircle, Mail, ArrowLeft, KeyRound, LockKeyhole, UserCircle, LogIn, Shield, ShieldCheck, ShieldX } from 'lucide-react';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';

// Initial login form schema with email and password
const loginFormSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email address' }),
  password: z.string().min(1, { message: 'Password is required' })
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

// Direct login schema
const directLoginSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email address' }),
});

// Login page states
type LoginPageState = 'LOGIN' | 'REQUEST_OTP' | 'VERIFY_OTP' | 'RESET_PASSWORD' | 'FIRST_LOGIN';

const LoginPage = () => {
  const { requestOtp, verifyOtp, resetPassword, directLogin, isLoading, isPasswordExpired, isFirstLogin, checkPasswordStrength } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [loginState, setLoginState] = useState<LoginPageState>('LOGIN');
  const [loginMode, setLoginMode] = useState<'otp' | 'direct'>('direct');
  const [passwordStrength, setPasswordStrength] = useState(0);

  // Form for initial login
  const loginForm = useForm<z.infer<typeof loginFormSchema>>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: { 
      email: '', 
      password: '' 
    },
  });

  // Form for direct login
  const directLoginForm = useForm<z.infer<typeof directLoginSchema>>({
    resolver: zodResolver(directLoginSchema),
    defaultValues: { 
      email: '' 
    },
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

  // Handle initial login submission
  const onLogin = async (values: z.infer<typeof loginFormSchema>) => {
    setError(null);
    setEmail(values.email);
    
    try {
      // In a real app, validate password against server first
      // For demo, we're just checking if the user exists before sending OTP
      const success = await requestOtp(values.email);
      
      if (success) {
        setLoginState('VERIFY_OTP');
      } else {
        setError('User not found. Please check your email address.');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    }
  };

  // Handle direct login (test mode)
  const onDirectLogin = async (values: z.infer<typeof directLoginSchema>) => {
    setError(null);
    setEmail(values.email);
    
    try {
      const success = await directLogin(values.email);
      
      if (success) {
        toast({
          title: 'Login successful',
          description: 'Welcome to Audit Tracker! (Test Mode)',
          variant: 'default',
        });
        navigate('/');
      } else {
        setError('User not found. Please check your email address.');
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
        } else if (result.isFirstLogin) {
          // First login, needs to set a new password
          setLoginState('FIRST_LOGIN');
          resetForm.setValue('email', email);
          toast({
            title: 'Password Setup Required',
            description: 'This is your first login. Please set a new secure password.',
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
        setError('Failed to update password. Please make sure it meets all requirements.');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    }
  };

  // Handle first login password setup - uses the same flow as reset password
  const onSetInitialPassword = async (values: z.infer<typeof resetFormSchema>) => {
    return onResetPassword(values);
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
              {loginState === 'LOGIN' && 'Enter your credentials to login'}
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
            
            {/* Login Tabs */}
            {loginState === 'LOGIN' && (
              <Tabs defaultValue="direct" onValueChange={(val) => setLoginMode(val as 'otp' | 'direct')}>
                <TabsList className="grid w-full grid-cols-2 mb-6">
                  <TabsTrigger value="direct">Direct Login (Test)</TabsTrigger>
                  <TabsTrigger value="otp">OTP Login</TabsTrigger>
                </TabsList>
                
                {/* Direct Login Form */}
                <TabsContent value="direct">
                  <Form {...directLoginForm}>
                    <form onSubmit={directLoginForm.handleSubmit(onDirectLogin)} className="space-y-5">
                      <FormField
                        control={directLoginForm.control}
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
                      
                      <div className="text-sm text-gray-500 mt-2 mb-4 p-2 bg-amber-50 border border-amber-200 rounded-md">
                        <p>You can use these test accounts:</p>
                        <ul className="list-disc pl-5 mt-1">
                          <li>admin@example.com (Admin)</li>
                          <li>maker@example.com (Maker)</li>
                          <li>checker1@example.com (Checker 1)</li>
                          <li>checker2@example.com (Checker 2)</li>
                        </ul>
                      </div>
                      
                      <Button 
                        type="submit" 
                        className="w-full bg-audit-purple-600 hover:bg-audit-purple-700 transition-all py-6" 
                        disabled={isLoading}
                      >
                        <UserCircle className="mr-2 h-4 w-4" />
                        {isLoading ? 'Logging in...' : 'Direct Login (Testing)'}
                      </Button>
                    </form>
                  </Form>
                </TabsContent>
                
                {/* OTP Login Form */}
                <TabsContent value="otp">
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
                        disabled={isLoading}
                      >
                        <LockKeyhole className="mr-2 h-4 w-4" />
                        {isLoading ? 'Authenticating...' : 'Sign In with OTP'}
                      </Button>
                    </form>
                  </Form>
                </TabsContent>
              </Tabs>
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
                            setLoginState('LOGIN');
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
                          title: 'OTP Sent',
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
            
            {/* First Time Login Password Form */}
            {loginState === 'FIRST_LOGIN' && (
              <Form {...resetForm}>
                <form onSubmit={resetForm.handleSubmit(onSetInitialPassword)} className="space-y-5">
                  <div className="mb-4">
                    <Alert>
                      <ShieldCheck className="h-4 w-4" />
                      <AlertTitle>First Time Login</AlertTitle>
                      <AlertDescription>
                        You need to set a strong password for your account.
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
                    {isLoading ? 'Setting Password...' : 'Set Password & Login'}
                  </Button>
                </form>
              </Form>
            )}
            
            {/* Reset Password Form */}
            {loginState === 'RESET_PASSWORD' && (
              <Form {...resetForm}>
                <form onSubmit={resetForm.handleSubmit(onResetPassword)} className="space-y-5">
                  <div className="mb-4">
                    <Alert>
                      <ShieldCheck className="h-4 w-4" />
                      <AlertTitle>Password Reset Required</AlertTitle>
                      <AlertDescription>
                        Your password has expired. Please set a new strong password.
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
