import React, { useState } from 'react';
import type { FileSystemItem } from '../types';
import { FolderIcon } from './Icons';

interface MoveItemModalProps {
  item: FileSystemItem;
  folders: FileSystemItem[];
  onClose: () => void;
  onMove: (destinationFolderId: string | null) => void;
}

const MoveItemModal: React.FC<MoveItemModalProps> = ({ item, folders, onClose, onMove }) => {
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);

  // Filter out the item itself and its descendants if it's a folder
  const availableFolders = folders.filter(f => f.id !== item.id);

  const handleMove = () => {
    onMove(selectedFolderId);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 backdrop-blur-sm flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-slate-800 border border-slate-700 rounded-lg shadow-xl p-6 w-full max-w-lg m-4 transform transition-all" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="text-xl font-bold text-slate-100">Move Item</h2>
            <p className="text-sm text-slate-400 truncate mt-1">Move "{item.name}" to a new location</p>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-200 transition-colors text-2xl leading-none">&times;</button>
        </div>
        
        <div className="bg-slate-900/50 border border-slate-700 rounded-lg p-2 h-64 overflow-y-auto">
          <div 
             onClick={() => setSelectedFolderId(null)}
             className={`flex items-center gap-3 p-2 rounded-md cursor-pointer ${selectedFolderId === null ? 'bg-cyan-500/30' : 'hover:bg-slate-700/50'}`}
          >
            <FolderIcon className="w-5 h-5 text-cyan-400" />
            <span className="text-slate-200">My Drive (root)</span>
          </div>
          {availableFolders.map(folder => (
            <div 
              key={folder.id}
              onClick={() => setSelectedFolderId(folder.id)}
              className={`flex items-center gap-3 p-2 rounded-md cursor-pointer ${selectedFolderId === folder.id ? 'bg-cyan-500/30' : 'hover:bg-slate-700/50'}`}
            >
              <FolderIcon className="w-5 h-5 text-cyan-400" />
              <span className="text-slate-200">{folder.name}</span>
            </div>
          ))}
        </div>
        
        <div className="flex justify-end gap-4 mt-6">
          <button onClick={onClose} className="bg-slate-700 hover:bg-slate-600 text-white font-bold py-2 px-4 rounded-lg transition-colors">
            Cancel
          </button>
          <button
            onClick={handleMove}
            disabled={selectedFolderId === item.parentId}
            className="bg-cyan-600 hover:bg-cyan-500 disabled:bg-cyan-800 disabled:cursor-not-allowed text-white font-bold py-2 px-4 rounded-lg transition-colors"
          >
            Move Here
          </button>
        </div>
      </div>
    </div>
  );
};

export default MoveItemModal;
