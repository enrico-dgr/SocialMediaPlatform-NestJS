import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Home, Search, LogOut, Users, Sparkles, Menu, X } from 'lucide-react';
import { Avatar, Badge } from './ui';
import { NotificationDropdown } from './ui/NotificationDropdown';
import { Chat } from './Chat';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActivePath = (path: string) => location.pathname === path;

  const navItems = [
    { path: '/', label: 'Home', icon: Home },
    { path: '/users', label: 'Discover', icon: Users },
    { path: '/search', label: 'Search', icon: Search },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-primary-50/30 bg-noise">
      <nav className="bg-white/90 backdrop-blur-xl shadow-soft border-b border-white/20 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8">
          <div className="flex justify-between h-14 sm:h-16">
            <div className="flex items-center min-w-0">
              <Link to="/" className="flex-shrink-0 flex items-center group">
                <div className="flex items-center space-x-1 sm:space-x-2">
                  <div className="h-6 w-6 sm:h-8 sm:w-8 bg-gradient-to-br from-primary-500 to-secondary-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                    <Sparkles className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
                  </div>
                  <h1 className="text-lg sm:text-xl font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent truncate">
                    SocialApp
                  </h1>
                </div>
              </Link>
              <div className="hidden sm:ml-8 sm:flex sm:space-x-2">
                {navItems.map(({ path, label, icon: Icon }) => (
                  <Link
                    key={path}
                    to={path}
                    className={`
                      group inline-flex items-center px-4 py-2 rounded-2xl text-sm font-medium transition-all duration-200 hover:scale-105
                      ${
                        isActivePath(path)
                          ? 'bg-gradient-to-r from-primary-500 to-secondary-500 text-white shadow-colored scale-105'
                          : 'text-gray-600 hover:text-primary-600 hover:bg-primary-50/50'
                      }
                    `}
                  >
                    <Icon className={`w-4 h-4 mr-2 transition-transform duration-200 ${
                      isActivePath(path) ? 'scale-110' : 'group-hover:scale-110'
                    }`} />
                    {label}
                  </Link>
                ))}
              </div>
            </div>
            <div className="flex items-center space-x-1 sm:space-x-2 md:space-x-4">
              <div className="hidden lg:block">
                <span className="text-xs sm:text-sm text-gray-600">
                  Welcome back, <span className="font-semibold text-primary-700">{user?.username}</span>
                </span>
              </div>
              
              {/* Notification Dropdown */}
              <NotificationDropdown />
              
              <Link to="/profile" className="group">
                <Badge dot variant="success">
                  <Avatar
                    initials={user?.firstName?.[0] || user?.username?.[0] || 'U'}
                    size="sm"
                    className="ring-1 sm:ring-2 ring-primary-200 group-hover:ring-primary-300 transition-all duration-200"
                    status="online"
                  />
                </Badge>
              </Link>
              
              <button
                onClick={handleLogout}
                className="hidden sm:block p-1.5 sm:p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all duration-200 group"
                title="Sign out"
              >
                <LogOut className="w-4 h-4 sm:w-5 sm:h-5 group-hover:scale-110 transition-transform duration-200" />
              </button>

              {/* Mobile menu button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="sm:hidden p-1.5 text-gray-500 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-all duration-200"
              >
                {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>
        
        {/* Mobile Navigation Menu */}
        {isMobileMenuOpen && (
          <div className="sm:hidden bg-white/95 backdrop-blur-xl border-t border-gray-200/50 shadow-strong animate-fade-in">
            <div className="px-4 py-4 space-y-2">
              {navItems.map(({ path, label, icon: Icon }) => (
                <Link
                  key={path}
                  to={path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`
                    group flex items-center px-4 py-3 rounded-2xl text-base font-medium transition-all duration-200
                    ${
                      isActivePath(path)
                        ? 'bg-gradient-to-r from-primary-500 to-secondary-500 text-white shadow-colored'
                        : 'text-gray-600 hover:text-primary-600 hover:bg-primary-50/50'
                    }
                  `}
                >
                  <Icon className={`w-5 h-5 mr-3 transition-transform duration-200 ${
                    isActivePath(path) ? 'scale-110' : 'group-hover:scale-110'
                  }`} />
                  {label}
                </Link>
              ))}
              <div className="border-t border-gray-200/50 my-4"></div>
              <button
                onClick={() => {
                  handleLogout();
                  setIsMobileMenuOpen(false);
                }}
                className="flex items-center w-full px-4 py-3 text-base font-medium text-red-600 hover:bg-red-50 rounded-2xl transition-all duration-200"
              >
                <LogOut className="w-5 h-5 mr-3" />
                Sign Out
              </button>
            </div>
          </div>
        )}
      </nav>
      <main className="max-w-7xl mx-auto py-4 px-2 sm:py-6 sm:px-4 lg:py-8 lg:px-8 relative">
        <div className="animate-fade-in-up">
          {children}
        </div>
      </main>
      
      {/* Chat Component */}
      <Chat />
    </div>
  );
};

export default Layout;
