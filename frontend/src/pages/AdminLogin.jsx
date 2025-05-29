import React, { useState, useEffect } from "react";
import { Eye, EyeOff, LoaderCircle, UserCog, Shield } from "lucide-react";

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
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800 font-sans">
        <div className="w-full max-w-md bg-white/90 rounded-xl shadow-2xl p-8 text-center border border-gray-200">
          <div className="mb-6">
            <div className="relative inline-block">
              <UserCog size={48} className="mx-auto text-red-600 mb-4" />
              <Shield size={20} className="absolute -top-1 -right-1 text-yellow-500" />
            </div>
            <h2 className="text-2xl font-semibold mb-2 text-gray-800">Admin Panel</h2>
            <p className="text-gray-600">Welcome back, Administrator</p>
            <p className="font-medium text-lg text-gray-800">{currentUser.email}</p>
            <div className="inline-flex items-center mt-2 px-3 py-1 bg-red-100 text-red-800 text-sm rounded-full">
              <Shield size={14} className="mr-1" />
              Admin Access
            </div>
          </div>
          
          <div className="space-y-4">
            <button
              onClick={() => window.location.href = '/admin-dashboard'}
              className="w-full bg-red-600 text-white rounded-lg px-4 py-3 font-medium hover:bg-red-700 transition shadow-md"
            >
              Go to Admin Dashboard
            </button>
            
            <button
              onClick={handleLogout}
              className="w-full bg-gray-500 text-white rounded-lg px-4 py-3 font-medium hover:bg-gray-600 transition"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800 font-sans">
      <div className="w-full max-w-md bg-white/90 rounded-xl shadow-2xl p-8 border border-gray-200">
        <div className="text-center mb-6">
          <div className="relative inline-block">
            <UserCog size={48} className="mx-auto text-red-600 mb-4" />
            <Shield size={20} className="absolute -top-1 -right-1 text-yellow-500" />
          </div>
          <h2 className="text-2xl font-semibold text-gray-800">Admin Login</h2>
          <p className="text-gray-600 mt-2">Secure administrator access</p>
          <div className="inline-flex items-center mt-3 px-3 py-1 bg-red-100 text-red-800 text-sm rounded-full">
            <Shield size={14} className="mr-1" />
            Restricted Access
          </div>
        </div>

        <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium text-gray-700">
              Admin Email
            </label>
            <input
              id="email"
              type="email"
              name="email"
              placeholder="Enter admin email"
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-red-500 focus:border-transparent transition bg-white"
              value={form.email}
              onChange={handleChange}
              required
              autoComplete="email"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-medium text-gray-700">
              Admin Password
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Enter admin password"
                className="w-full border border-gray-300 rounded-lg px-4 py-3 pr-12 focus:ring-2 focus:ring-red-500 focus:border-transparent transition bg-white"
                value={form.password}
                onChange={handleChange}
                required
                autoComplete="current-password"
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-red-600 text-white rounded-lg px-4 py-3 font-medium hover:bg-red-700 transition disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-md"
            disabled={loading}
          >
            {loading && <LoaderCircle className="animate-spin" size={20} />}
            {loading ? 'Authenticating...' : 'Admin Sign In'}
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

        {/* Back to User Login */}
        <div className="mt-6 text-center">
          <a 
            href="/login" 
            className="text-sm text-gray-500 hover:text-gray-700 underline"
          >
            ← Back to User Login
          </a>
        </div>

        {/* Security Notice */}
        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-xs text-yellow-700 text-center">
            ⚠️ This is a secure admin area. All access attempts are logged.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;