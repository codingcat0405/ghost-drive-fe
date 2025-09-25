import React, { useState, useEffect } from 'react';
import type { FileSystemItem } from '../types';
import FileItem from './FileItem';
import { GridIcon, ListIcon, UploadCloudIcon } from './Icons';
import ContextMenu from './ContextMenu';
import Breadcrumbs from './Breadcrumbs';

type View = 'drive' | 'recent' | 'trash';

interface FileBrowserProps {
  items: FileSystemItem[];
  path: FileSystemItem[];
  currentView: View;
  onNavigate: (folderId: string | null) => void;
  onFileClick: (file: FileSystemItem) => void;
  onNewFolder: () => void;
  onTrashItem: (itemId: string) => void;
  onRestoreItem: (itemId: string) => void;
  onPermanentlyDeleteItem: (itemId: string) => void;
  onRenameItem: (itemId: string) => void;
  onCommitRename: (itemId: string, newName: string) => void;
  renamingItemId: string | null;
  onMoveItem: (item: FileSystemItem) => void;
  onUploadFiles: (files: FileList, destinationFolderId?: string | null) => void;
  onUploadClick: () => void;
  onDownloadEncrypted: (item: FileSystemItem) => void;
  onDownloadDecrypted: (item: FileSystemItem) => void;
}

type ViewMode = 'grid' | 'list';
type ContextMenuState = {
    x: number;
    y: number;
    item: FileSystemItem | null;
    visible: boolean;
}

const FileBrowser: React.FC<FileBrowserProps> = (props) => {
  const { items, path, currentView, onNavigate, onFileClick, onNewFolder, onTrashItem, onRestoreItem, onPermanentlyDeleteItem, onRenameItem, onCommitRename, renamingItemId, onMoveItem, onUploadFiles, onUploadClick, onDownloadEncrypted, onDownloadDecrypted } = props;
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [contextMenu, setContextMenu] = useState<ContextMenuState>({ x: 0, y: 0, item: null, visible: false });
  const [isDraggingOver, setIsDraggingOver] = useState(false);

  useEffect(() => {
      const handleClick = () => setContextMenu(prev => ({...prev, visible: false}));
      window.addEventListener('click', handleClick);
      return () => window.removeEventListener('click', handleClick);
  }, []);

  const handleContextMenu = (event: React.MouseEvent, item: FileSystemItem | null) => {
      event.preventDefault();
      event.stopPropagation();
      setContextMenu({ x: event.pageX, y: event.pageY, item, visible: true });
  }

  const handleDragEvents = (e: React.DragEvent, isEntering: boolean) => {
    e.preventDefault();
    e.stopPropagation();
    if (currentView !== 'drive') return; // Disable drag/drop outside of drive view
    if (isEntering && e.dataTransfer.types.includes('Files')) {
       setIsDraggingOver(true);
    } else {
      setIsDraggingOver(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    handleDragEvents(e, false);
    onUploadFiles(e.dataTransfer.files, path.length > 0 ? path[path.length - 1].id : null);
  };

  const folders = items.filter(item => item.type === 'folder');
  const files = items.filter(item => item.type === 'file');
  
  const viewTitles: Record<View, string> = { drive: 'My Drive', recent: 'Recent', trash: 'Trash' };

  const renderItems = (itemsToRender: FileSystemItem[], isFlatList = false) => {
    const commonProps = {
      viewMode,
      onFileClick,
      onContextMenu: handleContextMenu,
      renamingItemId,
      onCommitRename,
      onUploadFiles,
    };
    if (itemsToRender.length === 0) {
       return <p className="text-slate-500 text-sm px-4 md:px-0">{isFlatList ? 'This view is empty.' : 'This folder is empty.'}</p>
    }

    if (viewMode === 'grid') {
      return (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {itemsToRender.map(item => <FileItem key={item.id} item={item} {...commonProps} />)}
        </div>
      );
    } else {
      return (
        <div className="space-y-2">
            {!isFlatList && <div className="grid grid-cols-12 gap-4 px-4 py-2 text-xs font-semibold text-slate-400 border-b border-slate-700">
                <div className="col-span-6 md:col-span-5">Name</div>
                <div className="hidden md:block md:col-span-3">Owner</div>
                <div className="hidden md:block md:col-span-2">Last Modified</div>
                <div className="col-span-4 md:col-span-2 text-right">File Size</div>
            </div>}
            {itemsToRender.map(item => <FileItem key={item.id} item={item} {...commonProps} isFlatList={isFlatList} />)}
        </div>
      );
    }
  };

  return (
    <div 
      className="space-y-6 h-full relative" 
      onContextMenu={(e) => handleContextMenu(e, null)}
      onDragEnter={(e) => handleDragEvents(e, true)}
    >
        {isDraggingOver && (
          <div 
            className="absolute inset-0 bg-cyan-500/20 border-2 border-dashed border-cyan-400 rounded-xl z-20 flex flex-col items-center justify-center pointer-events-none"
            onDragLeave={(e) => handleDragEvents(e, false)}
            onDrop={handleDrop}
          >
            <UploadCloudIcon className="w-16 h-16 text-cyan-300 mb-4" />
            <p className="text-xl font-bold text-slate-100">Drop files to upload</p>
          </div>
        )}
        <div className="flex justify-between items-center">
            {currentView === 'drive' ? <Breadcrumbs path={path} onNavigate={onNavigate} /> : <h2 className="text-xl font-bold text-slate-100">{viewTitles[currentView]}</h2> }
            <div className="flex items-center gap-2 p-1 bg-slate-800 rounded-lg">
                <button onClick={() => setViewMode('grid')} className={`p-1.5 rounded-md transition-colors ${viewMode === 'grid' ? 'bg-cyan-500 text-white' : 'text-slate-400 hover:bg-slate-700'}`}>
                    <GridIcon className="w-5 h-5"/>
                </button>
                 <button onClick={() => setViewMode('list')} className={`p-1.5 rounded-md transition-colors ${viewMode === 'list' ? 'bg-cyan-500 text-white' : 'text-slate-400 hover:bg-slate-700'}`}>
                    <ListIcon className="w-5 h-5"/>
                </button>
            </div>
        </div>

      {currentView === 'drive' ? (
        <>
          <div>
            <h3 className="text-lg font-semibold text-slate-300 mb-4">Folders</h3>
            {renderItems(folders)}
          </div>
          <div>
            <h3 className="text-lg font-semibold text-slate-300 mb-4">Files</h3>
            {renderItems(files)}
          </div>
        </>
      ) : (
        <div>
          {renderItems(items, true)}
        </div>
      )}

      {contextMenu.visible && (
          <ContextMenu 
            x={contextMenu.x} y={contextMenu.y} item={contextMenu.item} 
            currentView={currentView}
            onClose={() => setContextMenu(prev => ({...prev, visible: false}))}
            onNewFolder={onNewFolder}
            onTrashItem={onTrashItem}
            onRestoreItem={onRestoreItem}
            onPermanentlyDeleteItem={onPermanentlyDeleteItem}
            onRenameItem={onRenameItem}
            onFileClick={onFileClick}
            onMoveItem={onMoveItem}
            onUploadClick={onUploadClick}
            onDownloadEncrypted={onDownloadEncrypted}
            onDownloadDecrypted={onDownloadDecrypted}
          />
      )}
    </div>
  );
};

export default FileBrowser;
