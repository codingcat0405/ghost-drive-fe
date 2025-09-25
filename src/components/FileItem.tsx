import React, { useState, useEffect, useRef } from 'react';
import type { FileSystemItem } from '../types';
import { FolderIcon, FileIcon, FilePdfIcon, FileImageIcon, FileZipIcon } from './Icons';

interface FileItemProps {
  item: FileSystemItem;
  viewMode: 'grid' | 'list';
  isFlatList?: boolean;
  onFileClick: (file: FileSystemItem) => void;
  onContextMenu: (event: React.MouseEvent, item: FileSystemItem) => void;
  renamingItemId: string | null;
  onCommitRename: (itemId: string, newName: string) => void;
  onUploadFiles: (files: FileList, destinationFolderId: string) => void;
}

const getFileIcon = (fileName: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    switch (extension) {
        case 'pdf': return <FilePdfIcon className="w-full h-full text-red-400" />;
        case 'png': case 'jpg': case 'jpeg': case 'gif': return <FileImageIcon className="w-full h-full text-blue-400" />;
        case 'zip': case 'rar': return <FileZipIcon className="w-full h-full text-yellow-400" />;
        default: return <FileIcon className="w-full h-full text-slate-500" />;
    }
};

const FileItem: React.FC<FileItemProps> = ({ item, viewMode, isFlatList, onFileClick, onContextMenu, renamingItemId, onCommitRename, onUploadFiles }) => {
  const isFolder = item.type === 'folder';
  const isRenaming = renamingItemId === item.id;
  const [name, setName] = useState(item.name);
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDraggingOver, setIsDraggingOver] = useState(false);

  useEffect(() => {
    if (isRenaming && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isRenaming]);

  const handleClick = () => !isRenaming && onFileClick(item);
  const handleContextMenu = (e: React.MouseEvent) => !isRenaming && onContextMenu(e, item);

  const handleRenameSubmit = () => onCommitRename(item.id, name);
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleRenameSubmit();
    if (e.key === 'Escape') {
      setName(item.name);
      onCommitRename(item.id, item.name); // Cancel rename
    }
  };

  const handleDragEvents = (e: React.DragEvent, isEntering: boolean) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.types.includes('Files')) {
       setIsDraggingOver(isEntering);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    handleDragEvents(e, false);
    onUploadFiles(e.dataTransfer.files, item.id);
  };
  
  const nameComponent = isRenaming ? (
    <input
      ref={inputRef}
      type="text"
      value={name}
      onChange={(e) => setName(e.target.value)}
      onBlur={handleRenameSubmit}
      onKeyDown={handleKeyDown}
      onClick={(e) => e.stopPropagation()}
      className={`text-sm bg-slate-600 text-slate-100 rounded p-1 w-full outline-none ring-2 ring-cyan-500 ${viewMode === 'grid' ? 'text-center' : ''}`}
    />
  ) : (
    <p className={`text-sm break-words w-full truncate ${viewMode === 'grid' ? 'text-center text-slate-300 group-hover:text-slate-100' : 'text-slate-300'}`}>{item.name}</p>
  );

  const folderDragProps = isFolder ? {
    onDragEnter: (e: React.DragEvent) => handleDragEvents(e, true),
    onDragLeave: (e: React.DragEvent) => handleDragEvents(e, false),
    onDrop: handleDrop,
  } : {};
  
  const folderDragClasses = isFolder && isDraggingOver ? 'ring-2 ring-cyan-400 bg-cyan-500/20' : '';

  if (viewMode === 'grid') {
    return (
      <div 
        onClick={handleClick}
        onContextMenu={handleContextMenu}
        className={`flex flex-col items-center p-3 bg-slate-800 rounded-lg cursor-pointer group hover:bg-slate-700/70 transition-colors relative ${folderDragClasses}`}
        {...folderDragProps}
      >
        <div className="w-16 h-16 mb-2">
            {isFolder ? <FolderIcon className="w-full h-full text-cyan-400" /> : getFileIcon(item.name)}
        </div>
        {nameComponent}
        <p className="text-xs text-slate-500 h-4">{!isRenaming && item.size}</p>
      </div>
    );
  }
  
  const nameColSpan = isFlatList ? "col-span-12 md:col-span-12" : "col-span-6 md:col-span-5";

  return (
    <div 
        onClick={handleClick}
        onContextMenu={handleContextMenu}
        className={`grid grid-cols-12 gap-4 items-center px-4 py-2 rounded-lg cursor-pointer hover:bg-slate-800/70 transition-colors relative ${folderDragClasses}`}
        {...folderDragProps}
    >
        <div className={`${nameColSpan} flex items-center gap-3`}>
            <div className="w-6 h-6 flex-shrink-0">
                {isFolder ? <FolderIcon className="w-full h-full text-cyan-400" /> : getFileIcon(item.name)}
            </div>
            {nameComponent}
        </div>
        {!isFlatList && <>
          <div className="hidden md:block md:col-span-3 text-sm text-slate-400">{item.owner}</div>
          <div className="hidden md:block md:col-span-2 text-sm text-slate-400">{item.modified}</div>
          <div className="col-span-4 md:col-span-2 text-sm text-slate-400 text-right">{item.size || '--'}</div>
        </>}
    </div>
  );
};

export default FileItem;
