import React, { useState, useEffect, useRef } from 'react';
import { UserIcon, SettingsIcon, LogoutIcon } from './Icons';

interface UserDropdownProps {
  onNavigate: (page: 'settings' | 'login') => void;
}

const UserDropdown: React.FC<UserDropdownProps> = ({ onNavigate }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleNavigation = (page: 'settings' | 'login') => {
    onNavigate(page);
    setIsOpen(false);
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-full text-slate-400 hover:bg-slate-700/50 hover:text-slate-200"
      >
        <UserIcon className="w-6 h-6" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-slate-800 border border-slate-700 rounded-md shadow-lg py-2 z-50 animate-fade-in-fast">
          <a
            onClick={() => handleNavigation('settings')}
            className="flex items-center gap-3 px-4 py-2 text-sm text-slate-200 hover:bg-slate-700 cursor-pointer"
          >
            <SettingsIcon className="w-4 h-4 text-slate-400" />
            <span>Settings</span>
          </a>
          <hr className="border-slate-700 my-1"/>
          <a
            onClick={() => handleNavigation('login')}
            className="flex items-center gap-3 px-4 py-2 text-sm text-red-400 hover:bg-red-500/20 cursor-pointer"
          >
            <LogoutIcon className="w-4 h-4" />
            <span>Logout</span>
          </a>
        </div>
      )}
    </div>
  );
};

export default UserDropdown;
