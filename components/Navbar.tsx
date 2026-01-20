
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth, useTheme } from '../App';
import { UserRole } from '../types';

const Navbar: React.FC = () => {
  const { auth, logout } = useAuth();
  const { isDarkMode, toggleDarkMode } = useTheme();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="border-b transition-colors duration-300 dark:bg-black dark:border-oled-border bg-white border-gray-100 px-8 py-4 flex items-center justify-between sticky top-0 z-[60]">
      <Link to="/" className="flex items-center gap-3 group">
        <div className="w-10 h-10 bg-[#4f46e5] rounded-[12px] flex items-center justify-center text-white font-black text-xl btn-glow shadow-sm group-hover:scale-105 transition-transform">D</div>
        <span className="text-2xl font-black transition-colors dark:text-white text-gray-900 tracking-tighter">DayOne</span>
      </Link>

      <div className="flex items-center gap-8">
        <button 
          onClick={toggleDarkMode}
          className="p-2 rounded-xl transition-colors dark:hover:bg-oled-surface hover:bg-gray-100 text-gray-500 dark:text-gray-400"
          title="Toggle Theme"
        >
          {isDarkMode ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 9h-1m15.364-6.364l-.707.707M6.343 17.657l-.707.707M16.95 16.95l.707.707M7.05 7.05l.707.707M12 8a4 4 0 100 8 4 4 0 000-8z" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
            </svg>
          )}
        </button>

        {auth.isAuthenticated ? (
          <>
            <div className="hidden md:flex items-center gap-8">
              <Link to="/dashboard" className="text-[13px] font-bold text-gray-400 dark:text-gray-500 hover:text-[#4f46e5] transition-colors uppercase tracking-widest">Dashboard</Link>
              <Link to="/tasks" className="text-[13px] font-bold text-gray-400 dark:text-gray-500 hover:text-[#4f46e5] transition-colors uppercase tracking-widest">Tasks</Link>
              {auth.user?.role === UserRole.ADMIN && (
                <Link to="/admin" className="text-[13px] font-bold text-gray-400 dark:text-gray-500 hover:text-[#4f46e5] transition-colors uppercase tracking-widest">Admin</Link>
              )}
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3 px-4 py-2 dark:bg-oled-surface bg-gray-50 rounded-full border dark:border-oled-border border-gray-100">
                <div className="w-6 h-6 rounded-full bg-indigo-200 dark:bg-indigo-900/40 flex items-center justify-center text-[10px] text-[#4f46e5] dark:text-indigo-400 font-bold">
                  {auth.user?.name.charAt(0)}
                </div>
                <span className="text-[13px] font-bold dark:text-gray-300 text-gray-600 hidden sm:inline">{auth.user?.name}</span>
              </div>
              <button 
                onClick={handleLogout}
                className="px-5 py-2 text-[13px] font-bold text-rose-500 border border-rose-100 dark:border-rose-900/30 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-900/10 transition-all uppercase tracking-widest"
              >
                Logout
              </button>
            </div>
          </>
        ) : (
          <div className="flex items-center gap-6">
            <Link to="/login" className="text-[13px] font-bold text-gray-400 dark:text-gray-500 hover:text-[#4f46e5] transition-colors uppercase tracking-widest">Sign in</Link>
            <Link 
              to="/register" 
              className="px-6 py-3 bg-[#4f46e5] text-white text-[13px] font-bold rounded-xl btn-glow shadow-lg shadow-indigo-100/10 uppercase tracking-widest"
            >
              Get Started
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
