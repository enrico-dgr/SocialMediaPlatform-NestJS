import React, { useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { UserPlus, Mail, User } from 'lucide-react';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Alert from '../components/ui/Alert';
import {
  extractErrorMessage,
  createHttpError,
  type InputChangeHandler,
  type FormSubmitHandler,
  type ApiRequestError,
} from '../types/common';

const Register: React.FC = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    username: '',
    firstName: '',
    lastName: '',
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange: InputChangeHandler = useCallback((e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  }, []);

  const handleSubmit: FormSubmitHandler = useCallback(
    async (e) => {
      e.preventDefault();
      setError('');

      if (formData.password !== formData.confirmPassword) {
        setError('Passwords do not match');
        return;
      }

      if (formData.password.length < 6) {
        setError('Password must be at least 6 characters long');
        return;
      }

      setIsLoading(true);

      try {
        await register({
          email: formData.email,
          password: formData.password,
          username: formData.username,
          firstName: formData.firstName || undefined,
          lastName: formData.lastName || undefined,
        });
        navigate('/');
      } catch (error: unknown) {
        const typedError =
          typeof error === 'object' &&
          error !== null &&
          ('response' in error || 'code' in error)
            ? createHttpError(error as ApiRequestError)
            : error;
        setError(extractErrorMessage(typedError));
      } finally {
        setIsLoading(false);
      }
    },
    [formData, register, navigate],
  );

  return (
    <div className="min-h-screen bg-gradient-mesh from-secondary-50 via-white via-60% to-primary-100 relative overflow-hidden flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-80 h-80 bg-secondary-200/30 rounded-full blur-3xl animate-float"></div>
        <div
          className="absolute -bottom-40 -right-40 w-80 h-80 bg-primary-200/30 rounded-full blur-3xl animate-float"
          style={{ animationDelay: '1.5s' }}
        ></div>
        <div className="absolute top-1/3 right-1/3 w-96 h-96 bg-accent-100/20 rounded-full blur-3xl animate-pulse-soft"></div>
      </div>

      <div className="max-w-lg w-full relative z-10">
        <Card
          variant="glass"
          className="animate-fade-in-up shadow-strong backdrop-blur-xl border-white/30"
        >
          {/* Header */}
          <div className="text-center mb-8">
            <div className="mx-auto h-20 w-20 flex items-center justify-center rounded-3xl bg-gradient-to-br from-secondary-500 via-secondary-600 to-primary-600 mb-6 shadow-colored-lg animate-bounce-soft">
              <UserPlus className="h-10 w-10 text-white drop-shadow-lg" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-secondary-800 to-primary-800 bg-clip-text text-transparent mb-3">
              Join SocialApp
            </h1>
            <p className="text-gray-600 text-lg font-medium">
              Create your account and start connecting
            </p>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="mb-6">
              <Alert type="error" onClose={() => setError('')}>
                {error}
              </Alert>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                name="firstName"
                type="text"
                label="First Name"
                placeholder="John"
                value={formData.firstName}
                onChange={handleChange}
                leftIcon={<User className="h-5 w-5" />}
                helperText="Optional"
              />
              <Input
                name="lastName"
                type="text"
                label="Last Name"
                placeholder="Doe"
                value={formData.lastName}
                onChange={handleChange}
                leftIcon={<User className="h-5 w-5" />}
                helperText="Optional"
              />
            </div>

            {/* Username */}
            <Input
              name="username"
              type="text"
              label="Username"
              placeholder="johndoe"
              value={formData.username}
              onChange={handleChange}
              leftIcon={<User className="h-5 w-5" />}
              required
              helperText="This will be your unique identifier"
            />

            {/* Email */}
            <Input
              name="email"
              type="email"
              label="Email Address"
              placeholder="john@example.com"
              value={formData.email}
              onChange={handleChange}
              leftIcon={<Mail className="h-5 w-5" />}
              required
              autoComplete="email"
            />

            {/* Password Fields */}
            <div className="grid grid-cols-1 gap-4">
              <Input
                name="password"
                label="Password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
                isPassword
                required
                autoComplete="new-password"
                helperText="Minimum 6 characters"
              />
              <Input
                name="confirmPassword"
                label="Confirm Password"
                placeholder="Confirm your password"
                value={formData.confirmPassword}
                onChange={handleChange}
                isPassword
                required
                autoComplete="new-password"
              />
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              isLoading={isLoading}
              leftIcon={
                !isLoading ? <UserPlus className="h-5 w-5" /> : undefined
              }
            >
              {isLoading ? 'Creating account...' : 'Create account'}
            </Button>
          </form>

          {/* Footer */}
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <Link
                to="/login"
                className="font-medium text-primary-600 hover:text-primary-500 transition-colors"
              >
                Sign in here
              </Link>
            </p>
          </div>

          {/* Terms */}
          <div className="mt-6 p-5 bg-gradient-to-r from-secondary-50/80 to-primary-50/80 rounded-2xl border border-white/50 backdrop-blur-sm">
            <p className="text-sm text-gray-700 text-center font-medium">
              By creating an account, you agree to our{' '}
              <span className="text-primary-600 font-semibold hover:text-primary-700 cursor-pointer transition-colors">
                Terms of Service
              </span>{' '}
              and{' '}
              <span className="text-primary-600 font-semibold hover:text-primary-700 cursor-pointer transition-colors">
                Privacy Policy
              </span>
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Register;
