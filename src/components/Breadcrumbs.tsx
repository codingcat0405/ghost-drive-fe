import React from 'react';
import type { FileSystemItem } from '../types';
import { BreadcrumbArrowIcon } from './Icons';

interface BreadcrumbsProps {
  path: FileSystemItem[];
  onNavigate: (folderId: string | null) => void;
}

const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ path, onNavigate }) => {
  return (
    <div className="flex items-center text-xl font-bold text-slate-100 flex-wrap">
      <button 
        onClick={() => onNavigate(null)}
        className="hover:text-cyan-400 transition-colors"
      >
        My Drive
      </button>

      {path.map((folder, index) => (
        <React.Fragment key={folder.id}>
          <BreadcrumbArrowIcon className="w-5 h-5 text-slate-500 mx-1" />
          {index === path.length - 1 ? (
             <span className="text-slate-300">{folder.name}</span>
          ) : (
            <button 
              onClick={() => onNavigate(folder.id)}
              className="hover:text-cyan-400 transition-colors"
            >
              {folder.name}
            </button>
          )}
        </React.Fragment>
      ))}
    </div>
  );
};

export default Breadcrumbs;
