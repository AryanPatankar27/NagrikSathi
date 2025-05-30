import React, { useState, useEffect } from "react";
import { Eye, EyeOff, LoaderCircle, UserCog, Shield, Mail, Lock, AlertTriangle } from "lucide-react";

// Configure your API URL here
const API_URL = 'http://localhost:5000/api';

const AdminLogin = () => {
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Check if admin is already logged in
  useEffect(() => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    
    if (token && user) {
      const userData = JSON.parse(user);
      if (userData.role === 'admin') {
        console.log('Admin already logged in:', userData);
      }
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
      const url = `${API_URL}/admin/login`;
      
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
        const errorMessage = data.message || data.msg || data.error || 'Invalid credentials';
        setError(errorMessage);
        return;
      }
      
      if (data.success) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.admin));
        
        setSuccess('Login successful! Redirecting...');
        
        if (window.axios) {
          window.axios.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
        }
        
        setTimeout(() => {
          window.location.href = '/admin-dashboard';
        }, 1500);
      } else {
        setError(data.message || 'Invalid credentials');
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

  // Check if admin is logged in
  const isLoggedIn = localStorage.getItem('token') && localStorage.getItem('user');
  const currentUser = isLoggedIn ? JSON.parse(localStorage.getItem('user')) : null;

  // If admin is already logged in, show logged in state
  if (isLoggedIn && currentUser && currentUser.role === 'admin') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-700 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-2xl border border-blue-200 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-800 to-blue-900 px-8 py-6 text-center relative">
              <div className="absolute top-4 right-4">
                <div className="w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center">
                  <Shield size={16} className="text-yellow-800" />
                </div>
              </div>
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 relative">
                <UserCog size={32} className="text-blue-800" />
                <div className="absolute -top-1 -right-1 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                  <Shield size={12} className="text-white" />
                </div>
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Admin Dashboard</h2>
              <p className="text-blue-100 text-sm">Welcome back, Administrator</p>
            </div>
            
            <div className="p-8 text-center">
              <div className="mb-6">
                <p className="text-gray-600 text-sm mb-2">Logged in as:</p>
                <p className="font-semibold text-lg text-gray-800">{currentUser.email}</p>
                <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-800 px-4 py-2 rounded-full text-sm font-semibold mt-3 border border-blue-200">
                  <Shield size={14} />
                  Administrator Access
                </div>
              </div>
              
              <div className="space-y-3">
                <button
                  onClick={() => window.location.href = '/admin-dashboard'}
                  className="w-full bg-gradient-to-r from-blue-700 to-blue-800 text-white rounded-xl px-6 py-3 font-semibold hover:from-blue-800 hover:to-blue-900 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  Access Admin Dashboard
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
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-700 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-2xl border border-blue-200 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-800 to-blue-900 px-8 py-6 text-center relative">
            <div className="absolute top-4 right-4">
              <div className="w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center">
                <Shield size={16} className="text-yellow-800" />
              </div>
            </div>
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 relative">
              <UserCog size={32} className="text-blue-800" />
              <div className="absolute -top-1 -right-1 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                <Shield size={12} className="text-white" />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Admin Access</h2>
            <p className="text-blue-100 text-sm">Secure administrator authentication</p>
          </div>

          {/* Form */}
          <div className="px-8 py-8">
            <div className="space-y-6">
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <Mail size={16} className="text-blue-700" />
                  Administrator Email
                </label>
                <input
                  id="email"
                  type="email"
                  name="email"
                  placeholder="Enter admin email address"
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:ring-4 focus:ring-blue-100 focus:border-blue-600 transition-all duration-200 text-gray-700"
                  value={form.email}
                  onChange={handleChange}
                  required
                  autoComplete="email"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <Lock size={16} className="text-blue-700" />
                  Administrator Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder="Enter admin password"
                    className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 pr-12 focus:ring-4 focus:ring-blue-100 focus:border-blue-600 transition-all duration-200 text-gray-700"
                    value={form.password}
                    onChange={handleChange}
                    required
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-blue-700 transition-colors duration-200"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                onClick={handleSubmit}
                className="w-full bg-gradient-to-r from-blue-700 to-blue-800 text-white rounded-xl px-6 py-3 font-semibold hover:from-blue-800 hover:to-blue-900 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:transform-none disabled:shadow-lg"
                disabled={loading}
              >
                {loading && <LoaderCircle className="animate-spin" size={20} />}
                {loading ? 'Authenticating...' : 'Secure Sign In'}
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

            {/* Security Notice */}
            <div className="mt-6 p-4 bg-amber-50 border-l-4 border-amber-400 rounded-lg">
              <div className="flex items-start gap-3">
                <AlertTriangle size={16} className="text-amber-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm text-amber-800 font-medium">Security Notice</p>
                  <p className="text-xs text-amber-700 mt-1">
                    This is a secure administrative area. All access attempts are monitored and logged for security purposes.
                  </p>
                </div>
              </div>
            </div>

            {/* Back to User Login */}
            <div className="mt-6 pt-6 border-t border-gray-100 text-center">
              <a 
                href="/login" 
                className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-blue-700 transition-colors duration-200 font-medium"
              >
                ← Return to User Login
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;