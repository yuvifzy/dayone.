
import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthState, User, UserRole } from './types';
import LandingPage from './pages/LandingPage';
import AuthPage from './pages/AuthPage';
import Dashboard from './pages/Dashboard';
import TasksPage from './pages/TasksPage';
import StudyAssistant from './pages/StudyAssistant';
import AdminDashboard from './pages/AdminDashboard';
import Navbar from './components/Navbar';
import api from './services/api';
import { AuthContext, useAuth } from './context/AuthContext';
import { ThemeContext } from './context/ThemeContext';

const ProtectedRoute: React.FC<{ children: React.ReactNode, adminOnly?: boolean }> = ({ children, adminOnly = false }) => {
  const { auth } = useAuth();

  if (auth.loading) {
    return (
      <div className="flex h-screen items-center justify-center dark:bg-black bg-white">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="font-black dark:text-white text-gray-900 uppercase tracking-widest text-xs">DayOne Authenticating...</p>
        </div>
      </div>
    );
  }

  if (!auth.isAuthenticated) return <Navigate to="/login" replace />;
  if (adminOnly && auth.user?.role !== UserRole.ADMIN) return <Navigate to="/dashboard" replace />;

  return <>{children}</>;
};

const App: React.FC = () => {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('theme');
    return saved ? saved === 'dark' : true;
  });

  const [auth, setAuth] = useState<AuthState>({
    user: null,
    token: null,
    isAuthenticated: false,
    loading: true,
  });

  useEffect(() => {
    const root = window.document.documentElement;
    if (isDarkMode) {
      root.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          // Verify token and get user info on every app load/refresh
          const response = await api.get('/auth/me');
          setAuth({
            user: response.data,
            token,
            isAuthenticated: true,
            loading: false,
          });
        } catch (err) {
          console.error("Session verification failed", err);
          localStorage.removeItem('token');
          setAuth({ user: null, token: null, isAuthenticated: false, loading: false });
        }
      } else {
        setAuth({ user: null, token: null, isAuthenticated: false, loading: false });
      }
    };
    initAuth();
  }, []);

  const login = (token: string, user: User) => {
    localStorage.setItem('token', token);
    setAuth({ user, token, isAuthenticated: true, loading: false });
  };

  const logout = () => {
    localStorage.removeItem('token');
    setAuth({ user: null, token: null, isAuthenticated: false, loading: false });
  };

  const toggleDarkMode = () => setIsDarkMode(!isDarkMode);

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleDarkMode }}>
      <AuthContext.Provider value={{ auth, login, logout }}>
        <HashRouter>
          <div className="min-h-screen flex flex-col transition-colors duration-300 dark:bg-black bg-[#f9fafb]">
            <Navbar />
            <main className="flex-grow">
              <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/login" element={<AuthPage mode="login" />} />
                <Route path="/register" element={<AuthPage mode="register" />} />
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute>
                      <Dashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/tasks"
                  element={
                    <ProtectedRoute>
                      <TasksPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/study"
                  element={
                    <ProtectedRoute>
                      <StudyAssistant />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin"
                  element={
                    <ProtectedRoute adminOnly>
                      <AdminDashboard />
                    </ProtectedRoute>
                  }
                />
              </Routes>
            </main>
          </div>
        </HashRouter>
      </AuthContext.Provider>
    </ThemeContext.Provider>
  );
};

export default App;
