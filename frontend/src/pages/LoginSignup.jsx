import React, { useState, useEffect } from "react";
import { Eye, EyeOff, LoaderCircle, User, Shield, Mail, Lock } from "lucide-react";

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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-2xl border border-blue-100 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-8 py-6 text-center">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4">
                <User size={32} className="text-blue-600" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Welcome Back!</h2>
              <p className="text-blue-100 text-sm">You're successfully logged in</p>
            </div>
            
            <div className="p-8 text-center">
              <div className="mb-6">
                <p className="text-gray-600 text-sm mb-2">Logged in as:</p>
                <p className="font-semibold text-lg text-gray-800">{currentUser.email}</p>
                <div className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-medium mt-2">
                  <Shield size={12} />
                  <span className="capitalize">{currentUser.role}</span>
                </div>
              </div>
              
              <div className="space-y-3">
                <button
                  onClick={() => window.location.href = '/home'}
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl px-6 py-3 font-semibold hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  Go to Dashboard
                </button>
                
                <button
                  onClick={handleLogout}
                  className="w-full bg-gray-100 text-gray-700 rounded-xl px-6 py-3 font-medium hover:bg-gray-200 transition-all duration-200 border border-gray-200"
                >
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-2xl border border-blue-100 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-8 py-6 text-center">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4">
              <User size={32} className="text-blue-600" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">
              {isLogin ? 'Welcome Back' : 'Join Us Today'}
            </h2>
            <p className="text-blue-100 text-sm">
              {isLogin ? 'Sign in to access your account' : 'Create your account to get started'}
            </p>
          </div>

          {/* Form */}
          <div className="px-8 py-8">
            <div className="space-y-6">
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <Mail size={16} className="text-blue-600" />
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  name="email"
                  placeholder="Enter your email address"
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-200 text-gray-700"
                  value={form.email}
                  onChange={handleChange}
                  required
                  autoComplete="email"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <Lock size={16} className="text-blue-600" />
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder="Enter your password"
                    className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 pr-12 focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-200 text-gray-700"
                    value={form.password}
                    onChange={handleChange}
                    required
                    minLength={6}
                    autoComplete={isLogin ? 'current-password' : 'new-password'}
                  />
                  <button
                    type="button"
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-blue-600 transition-colors duration-200"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                {!isLogin && (
                  <p className="text-xs text-gray-500 flex items-center gap-1">
                    <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
                    Password must be at least 6 characters long
                  </p>
                )}
              </div>

              <button
                type="submit"
                onClick={handleSubmit}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl px-6 py-3 font-semibold hover:from-blue-700 hover:to-blue-800 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:transform-none disabled:shadow-lg"
                disabled={loading}
              >
                {loading && <LoaderCircle className="animate-spin" size={20} />}
                {loading ? (isLogin ? 'Signing in...' : 'Creating account...') : (isLogin ? 'Sign In' : 'Create Account')}
              </button>
            </div>

            {/* Error and Success Messages */}
            {error && (
              <div className="mt-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-lg">
                <p className="text-sm text-red-700 font-medium">{error}</p>
              </div>
            )}
            
            {success && (
              <div className="mt-6 p-4 bg-green-50 border-l-4 border-green-500 rounded-lg">
                <p className="text-sm text-green-700 font-medium">{success}</p>
              </div>
            )}

            {/* Toggle between Login and Signup */}
            <div className="mt-8 text-center">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white text-gray-500">
                    {isLogin ? "Don't have an account?" : "Already have an account?"}
                  </span>
                </div>
              </div>
              
              <button 
                className="mt-4 text-blue-600 hover:text-blue-800 font-semibold text-sm transition-colors duration-200 hover:underline" 
                onClick={() => { 
                  setIsLogin(!isLogin); 
                  setError(''); 
                  setSuccess(''); 
                  setForm({ email: '', password: '' });
                }}
              >
                {isLogin ? 'Create your account here' : 'Sign in to your account'}
              </button>
            </div>

            {/* Admin Login Link */}
            <div className="mt-6 pt-6 border-t border-gray-100 text-center">
              <a 
                href="/admin-login" 
                className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-blue-600 transition-colors duration-200 font-medium"
              >
                <Shield size={14} />
                Admin Access
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginSignup;