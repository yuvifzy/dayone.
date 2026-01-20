
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../App';
import { UserRole } from '../types';

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await new Promise(res => setTimeout(res, 800));
      if (email && password) {
        performLogin('mock-jwt-token', {
          id: '1',
          email,
          name: name || 'Demo User',
          role: email.includes('admin') ? UserRole.ADMIN : UserRole.USER
        });
        navigate('/dashboard');
      } else {
        setError('Verification parameters missing.');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Authentication error. Contact protocol support.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-84px)] flex items-center justify-center p-8">
      <div className="dark:bg-oled-card bg-white p-12 rounded-[3rem] shadow-2xl w-full max-w-lg border dark:border-oled-border border-gray-100 animate-fade-in">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-black dark:text-white text-gray-900 tracking-tighter mb-4">
            {mode === 'login' ? 'Welcome back.' : 'Initialize Access.'}
          </h2>
          <p className="dark:text-gray-400 text-gray-500 font-medium">
            {mode === 'login' ? 'Access your strategic workspace.' : 'Enter the secure DayOne network.'}
          </p>
        </div>

        {error && (
          <div className="bg-rose-500/10 text-rose-500 p-4 rounded-2xl text-xs font-black uppercase tracking-widest mb-8 border border-rose-500/20">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {mode === 'register' && (
            <div className="space-y-3">
              <label className="block text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">Operator Name</label>
              <input 
                type="text" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-6 py-4 rounded-2xl border transition-all dark:bg-oled-surface dark:border-oled-border dark:text-white bg-gray-50 border-gray-100 outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-[#4f46e5] font-bold"
                placeholder="John Matrix"
              />
            </div>
          )}
          <div className="space-y-3">
            <label className="block text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">Protocol ID (Email)</label>
            <input 
              type="email" 
              required
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
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-6 py-4 rounded-2xl border transition-all dark:bg-oled-surface dark:border-oled-border dark:text-white bg-gray-50 border-gray-100 outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-[#4f46e5] font-bold"
              placeholder="••••••••"
            />
          </div>
          
          <button 
            type="submit"
            disabled={loading}
            className="w-full py-5 bg-[#4f46e5] text-white font-black rounded-3xl btn-glow shadow-2xl shadow-indigo-500/20 uppercase tracking-[0.2em] text-sm mt-4 disabled:opacity-50"
          >
            {loading ? 'Authenticating...' : mode === 'login' ? 'Enter Terminal' : 'Register Operator'}
          </button>
        </form>

        <div className="mt-12 pt-8 border-t dark:border-oled-border border-gray-50 text-center">
          <p className="text-gray-500 dark:text-gray-400 font-medium">
            {mode === 'login' ? "New operator?" : "Already registered?"}{' '}
            <Link 
              to={mode === 'login' ? '/register' : '/login'} 
              className="text-[#4f46e5] font-black hover:underline tracking-tight"
            >
              {mode === 'login' ? 'Initialize here' : 'Authenticate ID'}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
