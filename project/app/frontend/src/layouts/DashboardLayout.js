import React from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sparkles, Home, Search, FileText, Briefcase, User, LogOut, MessageCircle } from 'lucide-react';
import { ChatBot } from '../components/ChatBot';
import { toast } from 'sonner';

export const DashboardLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    toast.success('Logged out successfully');
    navigate('/login');
  };

  const menuItems = [
    { path: '/dashboard', icon: Home, label: 'Home', exact: true },
    { path: '/dashboard/jobs', icon: Search, label: 'Job Search' },
    { path: '/dashboard/resume', icon: FileText, label: 'Resume Maker' },
    { path: '/dashboard/applications', icon: Briefcase, label: 'My Applications' },
    { path: '/dashboard/profile', icon: User, label: 'Profile' },
  ];

  const isActive = (path, exact) => {
    if (exact) {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-slate-50" data-testid="dashboard-layout">
      {/* Sidebar */}
      <aside className="sidebar-fixed w-64 bg-white/80 backdrop-blur-xl border-r border-slate-200 glassmorphism">
        <div className="p-6">
          <Link to="/dashboard" className="flex items-center gap-2 mb-8" data-testid="dashboard-logo">
            <Sparkles className="w-8 h-8 text-orange-500" />
            <h1 className="text-2xl font-bold text-slate-900">JobSpark</h1>
          </Link>

          <nav className="space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path, item.exact);
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  data-testid={`nav-${item.label.toLowerCase().replace(' ', '-')}`}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                    active
                      ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </Link>
              );
            })}
          </nav>

          <div className="mt-auto pt-8">
            <button
              onClick={handleLogout}
              data-testid="logout-button"
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 hover:bg-red-50 hover:text-red-600 transition-all w-full"
            >
              <LogOut className="w-5 h-5" />
              <span className="font-medium">Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content min-h-screen">
        <div className="max-w-7xl mx-auto p-8">
          <Outlet />
        </div>
      </main>

      {/* Chatbot */}
      <ChatBot />
    </div>
  );
};