import React from 'react';
import { Menu, Bell, Search } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../ui';
import { useIsMobile } from '../../hooks/useMediaQuery';

const Navbar = ({ onMenuClick }) => {
  const { user } = useAuth();
  const isMobile = useIsMobile();

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="sticky top-0 z-30 glass border-b border-white/10 backdrop-blur-xl"
    >
      <div className="px-4 sm:px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Left: Menu and Search */}
          <div className="flex items-center gap-4 flex-1">
            {isMobile && (
              <button
                onClick={onMenuClick}
                className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-dark-700 transition-colors lg:hidden"
              >
                <Menu className="w-5 h-5" />
              </button>
            )}

            {/* Search - Hidden on mobile */}
            {!isMobile && (
              <div className="relative w-full max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search goals, milestones..."
                  className="w-full pl-10 pr-4 py-2 bg-dark-700 border border-dark-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                />
              </div>
            )}
          </div>

          {/* Right: Notifications and User */}
          <div className="flex items-center gap-3">
            {/* Notifications */}
            <button className="relative p-2 rounded-lg text-gray-400 hover:text-white hover:bg-dark-700 transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
            </button>

            {/* User Avatar - Desktop only */}
            {!isMobile && (
              <div className="flex items-center gap-3 pl-3 border-l border-white/10">
                <div className="text-right">
                  <p className="text-sm font-medium text-white">{user?.name}</p>
                  <p className="text-xs text-gray-400">Premium Plan</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-purple-600 flex items-center justify-center">
                  <span className="text-white font-semibold text-sm">
                    {user?.name?.charAt(0).toUpperCase()}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.nav>
  );
};

export default Navbar;
