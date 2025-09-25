import React from 'react';
import type { FileSystemItem } from '../types';
import { TrashIcon, EditIcon, MoveIcon, PlusCircleIcon, UploadCloudIcon, DownloadIcon, RestoreIcon } from './Icons';

type View = 'drive' | 'recent' | 'trash';

interface ContextMenuProps {
    x: number;
    y: number;
    item: FileSystemItem | null;
    currentView: View;
    onClose: () => void;
    onNewFolder: () => void;
    onTrashItem: (itemId: string) => void;
    onRestoreItem: (itemId: string) => void;
    onPermanentlyDeleteItem: (itemId: string) => void;
    onRenameItem: (itemId: string) => void;
    onFileClick: (item: FileSystemItem) => void;
    onMoveItem: (item: FileSystemItem) => void;
    onUploadClick: () => void;
    onDownloadEncrypted: (item: FileSystemItem) => void;
    onDownloadDecrypted: (item: FileSystemItem) => void;
}

const ContextMenu: React.FC<ContextMenuProps> = (props) => {
    const { x, y, item, currentView, onClose, onNewFolder, onTrashItem, onRestoreItem, onPermanentlyDeleteItem, onRenameItem, onFileClick, onMoveItem, onUploadClick, onDownloadEncrypted, onDownloadDecrypted } = props;
    
    const handleAction = (action: () => void) => {
        action();
        onClose();
    };

    const menuStyle = {
        top: `${y}px`,
        left: `${x}px`,
    };

    const baseItemClass = "flex items-center gap-3 px-4 py-2 text-sm text-slate-200 hover:bg-slate-700 cursor-pointer";

    const renderDriveMenu = () => {
      if (!item) { // Right-clicked on background
        return (
          <>
            <div onClick={() => handleAction(onUploadClick)} className={baseItemClass}>
                <UploadCloudIcon className="w-4 h-4 text-slate-400"/> Upload File
            </div>
            <div onClick={() => handleAction(onNewFolder)} className={baseItemClass}>
                <PlusCircleIcon className="w-4 h-4 text-slate-400"/> New Folder
            </div>
          </>
        )
      }
      // Right-clicked on an item
      return (
        <>
            <div onClick={() => handleAction(() => onFileClick(item))} className={baseItemClass}>
              {item.type === 'folder' ? 'Open' : 'Preview'}
            </div>
            {item.type === 'file' && (
              <>
                <hr className="border-slate-700 my-1"/>
                <div onClick={() => handleAction(() => onDownloadDecrypted(item))} className={baseItemClass}>
                    <DownloadIcon className="w-4 h-4 text-slate-400"/> Download (Decrypted)
                </div>
                 <div onClick={() => handleAction(() => onDownloadEncrypted(item))} className={baseItemClass}>
                    <DownloadIcon className="w-4 h-4 text-slate-400"/> Download (Encrypted)
                </div>
              </>
            )}
            <hr className="border-slate-700 my-1"/>
            <div onClick={() => handleAction(() => onRenameItem(item.id))} className={baseItemClass}>
                <EditIcon className="w-4 h-4 text-slate-400"/> Rename
            </div>
            <div onClick={() => handleAction(() => onMoveItem(item))} className={baseItemClass}>
                <MoveIcon className="w-4 h-4 text-slate-400"/> Move to...
            </div>
            <hr className="border-slate-700 my-1"/>
            <div onClick={() => handleAction(() => onTrashItem(item.id))} className={`${baseItemClass} hover:bg-red-500/20`}>
                <TrashIcon className="w-4 h-4 text-red-400"/> Move to Trash
            </div>
        </>
      )
    }

    const renderTrashMenu = () => {
      if (!item) return null; // Can't do anything on background in trash
      return (
        <>
            <div onClick={() => handleAction(() => onRestoreItem(item.id))} className={baseItemClass}>
                <RestoreIcon className="w-4 h-4 text-slate-400"/> Restore
            </div>
            <hr className="border-slate-700 my-1"/>
            <div onClick={() => handleAction(() => onPermanentlyDeleteItem(item.id))} className={`${baseItemClass} text-red-400 hover:bg-red-500/20`}>
                <TrashIcon className="w-4 h-4"/> Delete Forever
            </div>
        </>
      )
    }

    return (
        <div style={menuStyle} className="fixed z-50 bg-slate-800 border border-slate-700 rounded-md shadow-lg py-2 w-56 animate-fade-in-fast">
          {currentView === 'trash' ? renderTrashMenu() : renderDriveMenu()}
        </div>
    );
};

export default ContextMenu;
