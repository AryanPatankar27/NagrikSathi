import React, { useState, useEffect } from "react";
import { Eye, EyeOff, LoaderCircle, User, UserCog } from "lucide-react";
import { Card } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Button } from "../components/ui/button";
import { Toggle } from "../components/ui/toggle";



const LoginSignup = () => {
  const [role, setRole] = useState('user');
  const [form, setForm] = useState({ email: '', password: '' });
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      const endpoint = isLogin ? '/login' : '/register';
      const res = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, role })
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.msg || (data.errors && data.errors[0]?.msg) || 'Something went wrong');
      } else {
        setSuccess(isLogin ? 'Login successful!' : 'Signup successful! You can now log in.');
        if (isLogin) {
          localStorage.setItem('token', data.token);
          // Optionally redirect or update UI
        }
      }
    } catch (err) {
      setError('Server error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background font-sans">
      <div className="w-full max-w-2xl bg-white/80 rounded-xl shadow-lg p-8">
        <div className="flex justify-center mb-8">
          <button
            className={`px-6 py-2 rounded-l-full font-medium transition-colors ${role === 'user' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
            onClick={() => setRole('user')}
            aria-pressed={role === 'user'}
          >
            Login as User
          </button>
          <button
            className={`px-6 py-2 rounded-r-full font-medium transition-colors ${role === 'admin' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
            onClick={() => setRole('admin')}
            aria-pressed={role === 'admin'}
          >
            Login as Admin
          </button>
        </div>
        <div className="flex flex-col md:flex-row gap-8">
          <div className="flex-1">
            <h2 className="text-xl font-semibold mb-4">{isLogin ? (role === 'user' ? 'User Login' : 'Admin Login') : 'Sign Up'}</h2>
            <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
              <input
                type="email"
                name="email"
                placeholder="Email"
                className="border rounded px-4 py-2"
                value={form.email}
                onChange={handleChange}
                required
                autoComplete="email"
              />
              <input
                type="password"
                name="password"
                placeholder="Password"
                className="border rounded px-4 py-2"
                value={form.password}
                onChange={handleChange}
                required
                minLength={6}
                autoComplete={isLogin ? 'current-password' : 'new-password'}
              />
              <button
                type="submit"
                className="bg-blue-600 text-white rounded px-4 py-2 font-medium hover:bg-blue-700 transition disabled:opacity-60"
                disabled={loading}
              >
                {loading ? (isLogin ? 'Logging in...' : 'Signing up...') : (isLogin ? 'Login' : 'Sign Up')}
              </button>
            </form>
            {error && <div className="mt-4 text-sm text-red-600 text-center">{error}</div>}
            {success && <div className="mt-4 text-sm text-green-600 text-center">{success}</div>}
            <div className="mt-4 text-sm text-center">
              {isLogin ? (
                <>Don't have an account?{' '}
                  <button className="text-blue-600 underline" onClick={() => { setIsLogin(false); setError(''); setSuccess(''); }}>Sign up</button>
                </>
              ) : (
                <>Already have an account?{' '}
                  <button className="text-blue-600 underline" onClick={() => { setIsLogin(true); setError(''); setSuccess(''); }}>Login</button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginSignup; 