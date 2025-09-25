import React from 'react';
import { MenuIcon, SearchIcon } from './Icons';
import UserDropdown from './UserDropdown';

interface HeaderProps {
    toggleSidebar: () => void;
    onNavigate: (page: 'settings' | 'login') => void;
}

const Header: React.FC<HeaderProps> = ({ toggleSidebar, onNavigate }) => {
  return (
    <header className="flex-shrink-0 bg-slate-800/30 backdrop-blur-sm border-b border-slate-700 flex items-center justify-between p-4">
      <div className="flex items-center gap-4">
        <button onClick={toggleSidebar} className="lg:hidden p-2 rounded-md text-slate-400 hover:bg-slate-700/50 hover:text-slate-200">
          <MenuIcon className="w-6 h-6" />
        </button>
        <div className="relative">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
          <input
            type="text"
            placeholder="Search in Drive"
            className="w-full max-w-xs pl-10 pr-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
          />
        </div>
      </div>
      <div className="flex items-center gap-4">
        <UserDropdown onNavigate={onNavigate} />
      </div>
    </header>
  );
};

export default Header;
