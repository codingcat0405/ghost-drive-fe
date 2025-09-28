import React, { useState, useEffect, useRef } from "react";

import {
  FolderIcon,
  FileIcon,
  FilePdfIcon,
  FileImageIcon,
  FileZipIcon,
} from "./Icons";

interface FileItemProps {
  viewMode: "grid" | "list";
  name: string;
  isFolder: boolean;
  size?: string;
}

const getFileIcon = (fileName: string) => {
  const extension = fileName.split(".").pop()?.toLowerCase();
  switch (extension) {
    case "pdf":
      return <FilePdfIcon className="w-full h-full text-red-400" />;
    case "png":
    case "jpg":
    case "jpeg":
    case "gif":
      return <FileImageIcon className="w-full h-full text-blue-400" />;
    case "zip":
    case "rar":
      return <FileZipIcon className="w-full h-full text-yellow-400" />;
    default:
      return <FileIcon className="w-full h-full text-slate-500" />;
  }
};

const FileItem: React.FC<FileItemProps> = ({
  viewMode,
  name,
  isFolder,
  size,
}) => {
  if (viewMode === "grid") {
    return (
      <div className="flex flex-col items-center p-3 bg-slate-800 rounded-lg cursor-pointer group hover:bg-slate-700/70 transition-colors relative">
        <div className="w-16 h-16 mb-2">
          {isFolder ? (
            <FolderIcon className="w-full h-full text-cyan-400" />
          ) : (
            getFileIcon(name)
          )}
        </div>
        <p className="text-sm break-words w-full truncate text-center text-slate-300 group-hover:text-slate-100">
          {name}
        </p>
        <p className="text-xs text-slate-500 h-4">{size}</p>
      </div>
    );
  }
  //list view
  const nameColSpan = "col-span-6 md:col-span-5";

  return (
    <div className="grid grid-cols-12 gap-4 items-center px-4 py-2 rounded-lg cursor-pointer hover:bg-slate-800/70 transition-colors relative">
      <div className={`${nameColSpan} flex items-center gap-3`}>
        <div className="w-6 h-6 flex-shrink-0">
          {isFolder ? (
            <FolderIcon className="w-full h-full text-cyan-400" />
          ) : (
            getFileIcon(name)
          )}
        </div>
        <p className="text-sm break-words w-full truncate text-slate-300">
          {name}
        </p>
      </div>
      <div className="hidden md:block md:col-span-3 text-sm text-slate-400">
        me
      </div>
      <div className="hidden md:block md:col-span-2 text-sm text-slate-400">
        Sep 28, 2025
      </div>
      <div className="col-span-4 md:col-span-2 text-sm text-slate-400 text-right">
        100kb
      </div>
    </div>
  );
};

export default FileItem;
