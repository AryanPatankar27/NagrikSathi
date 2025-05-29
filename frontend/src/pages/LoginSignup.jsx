import React, { useState, useEffect } from "react";
import { Eye, EyeOff, LoaderCircle, User } from "lucide-react";

// Configure your API URL here
const API_URL = 'http://localhost:5000/api';

const LoginSignup = () => {
  const [form, setForm] = useState({ email: '', password: '' });
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Check if user is already logged in
  useEffect(() => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    
    if (token && user) {
      console.log('User already logged in:', JSON.parse(user));
    }
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (error) setError('');
    if (success) setSuccess('');
  };

  const validateForm = () => {
    if (!form.email || !form.password) {
      setError('Please fill in all fields');
      return false;
    }
    
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return false;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email)) {
      setError('Please enter a valid email address');
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setError('');
    setSuccess('');
    setLoading(true);
    
    try {
      const endpoint = isLogin ? '/auth/login' : '/auth/signup';
      const url = `${API_URL}${endpoint}`;
      
      const requestBody = {
        email: form.email.toLowerCase().trim(),
        password: form.password
      };
      
      const response = await fetch(url, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });
      
      const data = await response.json();
      console.log('Response:', data);
      
      if (!response.ok) {
        const errorMessage = data.message || data.msg || data.error || 'Something went wrong';
        setError(errorMessage);
        return;
      }
      
      if (data.success) {
        if (isLogin) {
          localStorage.setItem('token', data.token);
          localStorage.setItem('user', JSON.stringify(data.user));
          
          setSuccess('Login successful! Redirecting...');
          
          if (window.axios) {
            window.axios.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
          }
          
          setTimeout(() => {
            window.location.href = '/home';
          }, 1500);
          
        } else {
          setSuccess('Signup successful! You can now log in.');
          setTimeout(() => {
            setIsLogin(true);
            setForm({ email: '', password: '' });
            setSuccess('');
          }, 2000);
        }
      } else {
        setError(data.message || 'Something went wrong');
      }
      
    } catch (error) {
      console.error('Request error:', error);
      setError('Network error. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    if (window.axios) {
      delete window.axios.defaults.headers.common['Authorization'];
    }
    setSuccess('Logged out successfully');
    window.location.reload();
  };

  // Check if user is logged in
  const isLoggedIn = localStorage.getItem('token') && localStorage.getItem('user');
  const currentUser = isLoggedIn ? JSON.parse(localStorage.getItem('user')) : null;

  // If user is already logged in, show logged in state
  if (isLoggedIn && currentUser && currentUser.role === 'user') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background font-sans">
        <div className="w-full max-w-md bg-white/80 rounded-xl shadow-lg p-8 text-center">
          <div className="mb-6">
            <User size={48} className="mx-auto text-blue-600 mb-4" />
            <h2 className="text-2xl font-semibold mb-2">Welcome Back!</h2>
            <p className="text-gray-600">You are logged in as:</p>
            <p className="font-medium text-lg">{currentUser.email}</p>
            <p className="text-sm text-gray-500 capitalize">Role: {currentUser.role}</p>
          </div>
          
          <div className="space-y-4">
            <button
              onClick={() => window.location.href = '/home'}
              className="w-full bg-blue-600 text-white rounded px-4 py-3 font-medium hover:bg-blue-700 transition"
            >
              Go to Home
            </button>
            
            <button
              onClick={handleLogout}
              className="w-full bg-gray-500 text-white rounded px-4 py-3 font-medium hover:bg-gray-600 transition"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background font-sans">
      <div className="w-full max-w-md bg-white/80 rounded-xl shadow-lg p-8">
        <div className="text-center mb-6">
          <User size={48} className="mx-auto text-blue-600 mb-4" />
          <h2 className="text-2xl font-semibold">
            {isLogin ? 'Welcome Back' : 'Create Account'}
          </h2>
          <p className="text-gray-600 mt-2">
            {isLogin ? 'Sign in to your account' : 'Fill in your details to get started'}
          </p>
        </div>

        <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium text-gray-700">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              name="email"
              placeholder="Enter your email"
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              value={form.email}
              onChange={handleChange}
              required
              autoComplete="email"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-medium text-gray-700">
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Enter your password"
                className="w-full border border-gray-300 rounded-lg px-4 py-3 pr-12 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                value={form.password}
                onChange={handleChange}
                required
                minLength={6}
                autoComplete={isLogin ? 'current-password' : 'new-password'}
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            {!isLogin && (
              <p className="text-xs text-gray-500">Password must be at least 6 characters long</p>
            )}
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white rounded-lg px-4 py-3 font-medium hover:bg-blue-700 transition disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            disabled={loading}
          >
            {loading && <LoaderCircle className="animate-spin" size={20} />}
            {loading ? (isLogin ? 'Signing in...' : 'Creating account...') : (isLogin ? 'Sign In' : 'Create Account')}
          </button>
        </form>

        {/* Error and Success Messages */}
        {error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600 text-center">{error}</p>
          </div>
        )}
        
        {success && (
          <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-sm text-green-600 text-center">{success}</p>
          </div>
        )}

        {/* Toggle between Login and Signup */}
        <div className="mt-6 text-sm text-center">
          {isLogin ? (
            <>
              Don't have an account?{' '}
              <button 
                className="text-blue-600 hover:text-blue-700 underline font-medium" 
                onClick={() => { 
                  setIsLogin(false); 
                  setError(''); 
                  setSuccess(''); 
                  setForm({ email: '', password: '' });
                }}
              >
                Create one here
              </button>
            </>
          ) : (
            <>
              Already have an account?{' '}
              <button 
                className="text-blue-600 hover:text-blue-700 underline font-medium" 
                onClick={() => { 
                  setIsLogin(true); 
                  setError(''); 
                  setSuccess(''); 
                  setForm({ email: '', password: '' });
                }}
              >
                Sign in here
              </button>
            </>
          )}
        </div>

        {/* Admin Login Link */}
        <div className="mt-6 text-center">
          <a 
            href="/admin-login" 
            className="text-sm text-gray-500 hover:text-gray-700 underline"
          >
            Admin Login
          </a>
        </div>
      </div>
    </div>
  );
};

export default LoginSignup;