
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../App';
import api from '../services/api';

interface AuthPageProps {
  mode: 'login' | 'register';
}

const AuthPage: React.FC<AuthPageProps> = ({ mode }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login: performLogin } = useAuth();
  const navigate = useNavigate();

  // Helper to ensure we never set an object to the error state
  const safeString = (val: any): string => {
    if (typeof val === 'string') return val;
    if (val && typeof val === 'object') {
      return val.message || val.error || JSON.stringify(val);
    }
    return String(val || '');
  };

  const validateForm = () => {
    if (mode === 'register' && name.trim().length < 2) {
      setError('Operator identity too short. 2 characters minimum.');
      return false;
    }
    if (!email.includes('@')) {
      setError('Invalid Protocol ID format.');
      return false;
    }
    if (password.length < 6) {
      setError('Access Key security insufficient. 6 characters minimum.');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!validateForm()) return;
    
    setLoading(true);

    try {
      const endpoint = mode === 'login' ? '/auth/login' : '/auth/register';
      const payload = mode === 'login' ? { email, password } : { name, email, password };
      
      const response = await api.post(endpoint, payload);
      const { token, user } = response.data;
      
      if (!token || !user) {
        throw new Error("Invalid terminal response payload.");
      }

      performLogin(token, user);
      navigate('/dashboard');
    } catch (err: any) {
      // Improved logging to prevent [object Object] in environments with string-only consoles
      console.error("Auth Exception Details:", {
        message: err.message,
        status: err.response?.status,
        data: err.response?.data
      });
      
      let displayMessage = 'PROTOCOL VIOLATION: Access Denied.';

      if (err.response?.data) {
        const data = err.response.data;
        // Multi-tier extraction with safety checks
        const extracted = data.message || data.error || data.statusText;
        if (extracted) displayMessage = safeString(extracted);
      } 
      else if (err.code === 'ERR_NETWORK') {
        displayMessage = 'TERMINAL OFFLINE: Local DayOne Node (localhost:8080) unreachable.';
      } 
      else if (err.message) {
        displayMessage = safeString(err.message);
      }

      setError(displayMessage.toUpperCase());
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-84px)] flex items-center justify-center p-8">
      <div className="dark:bg-oled-card bg-white p-12 rounded-[3rem] shadow-2xl w-full max-w-lg border dark:border-oled-border border-gray-100 animate-fade-in transition-all duration-500">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-black dark:text-white text-gray-900 tracking-tighter mb-4">
            {mode === 'login' ? 'Authenticate.' : 'Register Unit.'}
          </h2>
          <p className="dark:text-gray-400 text-gray-500 font-medium">
            {mode === 'login' ? 'Validate your credentials for terminal access.' : 'Initialize a new operator profile.'}
          </p>
        </div>

        {error && (
          <div className="bg-rose-500/10 text-rose-500 p-6 rounded-2xl text-[10px] font-black uppercase tracking-widest mb-8 border border-rose-500/20 leading-relaxed flex items-start gap-3 animate-pulse">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 shrink-0 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <span className="break-words">{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {mode === 'register' && (
            <div className="space-y-3">
              <label className="block text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">Operator Name</label>
              <input 
                type="text" 
                required
                autoComplete="name"
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                className="w-full px-6 py-4 rounded-2xl border transition-all dark:bg-oled-surface dark:border-oled-border dark:text-white bg-gray-50 border-gray-100 outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-[#4f46e5] font-bold" 
                placeholder="Full Name" 
              />
            </div>
          )}
          <div className="space-y-3">
            <label className="block text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">Protocol ID (Email)</label>
            <input 
              type="email" 
              required 
              autoComplete="email"
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              className="w-full px-6 py-4 rounded-2xl border transition-all dark:bg-oled-surface dark:border-oled-border dark:text-white bg-gray-50 border-gray-100 outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-[#4f46e5] font-bold" 
              placeholder="id@dayone.com" 
            />
          </div>
          <div className="space-y-3">
            <label className="block text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">Access Key (Password)</label>
            <input 
              type="password" 
              required 
              autoComplete={mode === 'login' ? "current-password" : "new-password"}
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              className="w-full px-6 py-4 rounded-2xl border transition-all dark:bg-oled-surface dark:border-oled-border dark:text-white bg-gray-50 border-gray-100 outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-[#4f46e5] font-bold" 
              placeholder="••••••••" 
            />
          </div>
          <button 
            type="submit" 
            disabled={loading} 
            className="w-full py-5 bg-[#4f46e5] text-white font-black rounded-3xl btn-glow shadow-2xl shadow-indigo-500/20 uppercase tracking-[0.2em] text-sm mt-4 disabled:opacity-50 flex items-center justify-center gap-3 transition-transform active:scale-[0.98]"
          >
            {loading ? (
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (mode === 'login' ? 'Access Terminal' : 'Launch Unit')}
          </button>
        </form>

        <div className="mt-12 pt-8 border-t dark:border-oled-border border-gray-50 text-center">
          <p className="text-gray-500 dark:text-gray-400 font-medium">
            {mode === 'login' ? "New operative?" : "Existing operative?"}{' '}
            <Link to={mode === 'login' ? '/register' : '/login'} className="text-[#4f46e5] font-black hover:underline tracking-tight">
              {mode === 'login' ? 'Initialize here' : 'Validate here'}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
