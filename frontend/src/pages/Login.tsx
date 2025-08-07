import React, { useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LogIn, Mail } from 'lucide-react';
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

const Login: React.FC = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { login } = useAuth();
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
      setIsLoading(true);

      try {
        console.log('Attempting login with:', { email: formData.email });
        await login(formData.email, formData.password);
        navigate('/');
      } catch (error: unknown) {
        console.error('Login error:', error);
        // Convert Axios/API errors to typed HTTP errors
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
    [formData.email, formData.password, login, navigate],
  );

  return (
    <div className="min-h-screen bg-gradient-mesh from-primary-50 via-white via-60% to-secondary-100 relative overflow-hidden flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary-200/30 rounded-full blur-3xl animate-float"></div>
        <div
          className="absolute -bottom-40 -left-40 w-80 h-80 bg-secondary-200/30 rounded-full blur-3xl animate-float"
          style={{ animationDelay: '1s' }}
        ></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-accent-100/20 rounded-full blur-3xl animate-pulse-soft"></div>
      </div>

      <div className="max-w-md w-full relative z-10">
        <Card
          variant="glass"
          className="animate-fade-in-up shadow-strong backdrop-blur-xl border-white/30"
        >
          {/* Header */}
          <div className="text-center mb-8">
            <div className="mx-auto h-20 w-20 flex items-center justify-center rounded-3xl bg-gradient-to-br from-primary-500 via-primary-600 to-secondary-600 mb-6 shadow-colored-lg animate-bounce-soft">
              <LogIn className="h-10 w-10 text-white drop-shadow-lg" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-primary-800 to-secondary-800 bg-clip-text text-transparent mb-3">
              Welcome back
            </h1>
            <p className="text-gray-600 text-lg font-medium">
              Sign in to your account to continue
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
            <Input
              name="email"
              type="email"
              label="Email address"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleChange}
              leftIcon={<Mail className="h-5 w-5" />}
              variant="outlined"
              size="lg"
              required
              autoComplete="email"
            />

            <Input
              name="password"
              label="Password"
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleChange}
              isPassword
              variant="outlined"
              size="lg"
              required
              autoComplete="current-password"
            />

            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              isLoading={isLoading}
              leftIcon={!isLoading ? <LogIn className="h-5 w-5" /> : undefined}
              className="shadow-colored-lg hover:shadow-glow-lg transform hover:scale-[1.02] active:scale-[0.98] font-bold text-lg py-4"
            >
              {isLoading ? 'Signing in...' : 'Sign in to your account'}
            </Button>
          </form>

          {/* Footer */}
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-600">
              Don't have an account?{' '}
              <Link
                to="/register"
                className="font-semibold text-primary-600 hover:text-primary-500 transition-all duration-200 hover:scale-105 inline-block"
              >
                Create one here
              </Link>
            </p>
          </div>

          {/* Demo hint */}
          <div className="mt-6 space-y-4">
            <div className="p-5 bg-gradient-to-r from-primary-50/80 to-secondary-50/80 rounded-2xl border border-white/50 backdrop-blur-sm">
              <p className="text-sm text-gray-700 text-center font-medium">
                <span className="inline-block animate-bounce-soft mr-2">
                  💡
                </span>
                <strong>Demo Tip:</strong> You can register a new account or use
                any existing credentials
              </p>
            </div>

            {/* Development Helper */}
            {process.env.NODE_ENV === 'development' && (
              <div className="p-4 bg-gradient-to-r from-yellow-50/80 to-orange-50/80 rounded-2xl border border-orange-200/50 backdrop-blur-sm">
                <p className="text-xs text-orange-800 text-center font-medium mb-2">
                  <span className="inline-block mr-1">⚙️</span>
                  <strong>Development:</strong> Make sure the backend is running
                </p>
                <div className="text-xs text-orange-700 space-y-1">
                  <p>
                    • Backend:{' '}
                    <code className="bg-white/50 px-1 rounded">
                      npm run start:dev
                    </code>{' '}
                    on port 3000
                  </p>
                  <p>
                    • First time? Create an account or use test credentials if
                    available
                  </p>
                </div>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Login;
