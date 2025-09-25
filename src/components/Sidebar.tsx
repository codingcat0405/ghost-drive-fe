import React from 'react';
import { GhostIcon, UploadCloudIcon, DriveIcon, ClockIcon, TrashIcon } from './Icons';

type View = 'drive' | 'recent' | 'trash';

interface SidebarProps {
  isOpen: boolean;
  toggleSidebar: () => void;
  onUploadClick: () => void;
  currentView: View;
  onViewChange: (view: View) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, toggleSidebar, onUploadClick, currentView, onViewChange }) => {
  const navItems = [
    { name: 'My Drive', view: 'drive' as View, icon: <DriveIcon className="w-5 h-5" /> },
    { name: 'Recent', view: 'recent' as View, icon: <ClockIcon className="w-5 h-5" /> },
    { name: 'Trash', view: 'trash' as View, icon: <TrashIcon className="w-5 h-5" /> },
  ];

  return (
    <>
      <div className={`fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden transition-opacity ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} onClick={toggleSidebar}></div>
      <aside className={`absolute lg:relative z-40 w-64 bg-slate-800/50 backdrop-blur-sm border-r border-slate-700 h-full flex flex-col transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>
        <div className="flex items-center gap-2 p-4 border-b border-slate-700">
          <GhostIcon className="w-8 h-8 text-cyan-400" />
          <h1 className="text-xl font-bold text-slate-100">Ghost Drive</h1>
        </div>
        
        <div className="p-4">
          <button onClick={onUploadClick} className="w-full flex items-center justify-center gap-2 bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-2.5 px-4 rounded-lg shadow-md transition-all duration-300 ease-in-out">
            <UploadCloudIcon className="w-5 h-5" />
            <span>Upload File</span>
          </button>
        </div>
        
        <nav className="flex-1 px-4 space-y-2">
          {navItems.map((item) => (
            <button
              key={item.name}
              onClick={() => onViewChange(item.view)}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                currentView === item.view
                  ? 'bg-cyan-500/20 text-cyan-300'
                  : 'text-slate-400 hover:bg-slate-700/50 hover:text-slate-200'
              }`}
            >
              {item.icon}
              <span>{item.name}</span>
            </button>
          ))}
        </nav>
        <div className="p-4 border-t border-slate-700">
          <div className="text-sm text-slate-400 mb-2">Storage</div>
          <div className="w-full bg-slate-700 rounded-full h-2.5">
            <div className="bg-cyan-500 h-2.5 rounded-full" style={{ width: '45%' }}></div>
          </div>
          <div className="text-xs text-slate-500 mt-1">4.5 GB of 10 GB used</div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
