import React, { useState, useCallback, useRef } from "react";

import Breadcrumbs from "../components/Breadcrumbs";
import { GridIcon, ListIcon } from "../components/Icons";
import FileItem from "../components/FileItem";

type ViewMode = "grid" | "list";
const HomePage: React.FC = () => {
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const gridContainerClass =
    "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4";
  const listContainerClass = "space-y-2";
  return (
    <>
      <div className="space-y-6 h-full">
        <div className="flex justify-between items-center">
          <Breadcrumbs />
          <div className="flex items-center gap-2 p-1 bg-slate-800 rounded-lg">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-1.5 rounded-md transition-colors ${
                viewMode === "grid"
                  ? "bg-cyan-500 text-white"
                  : "text-slate-400 hover:bg-slate-700"
              }`}
            >
              <GridIcon className="w-5 h-5" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-1.5 rounded-md transition-colors ${
                viewMode === "list"
                  ? "bg-cyan-500 text-white"
                  : "text-slate-400 hover:bg-slate-700"
              }`}
            >
              <ListIcon className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-slate-300 mb-4">Folders</h3>
          <div
            className={
              viewMode === "grid" ? gridContainerClass : listContainerClass
            }
          >
            {viewMode === "list" && (
              <div className="grid grid-cols-12 gap-4 px-4 py-2 text-xs font-semibold text-slate-400 border-b border-slate-700">
                <div className="col-span-6 md:col-span-5">Name</div>
                <div className="hidden md:block md:col-span-3">Owner</div>
                <div className="hidden md:block md:col-span-2">
                  Last Modified
                </div>
                <div className="col-span-4 md:col-span-2 text-right">
                  File Size
                </div>
              </div>
            )}
            <FileItem name="Folder 1" isFolder={true} viewMode={viewMode} />
            <FileItem name="Folder 1" isFolder={true} viewMode={viewMode} />
            <FileItem name="Folder 1" isFolder={true} viewMode={viewMode} />
            <FileItem name="Folder 1" isFolder={true} viewMode={viewMode} />
            <FileItem name="Folder 1" isFolder={true} viewMode={viewMode} />
            <FileItem name="Folder 1" isFolder={true} viewMode={viewMode} />
            <FileItem name="Folder 1" isFolder={true} viewMode={viewMode} />
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-slate-300 mb-4">Files</h3>
          <div
            className={
              viewMode === "grid" ? gridContainerClass : listContainerClass
            }
          >
            {viewMode === "list" && (
              <div className="grid grid-cols-12 gap-4 px-4 py-2 text-xs font-semibold text-slate-400 border-b border-slate-700">
                <div className="col-span-6 md:col-span-5">Name</div>
                <div className="hidden md:block md:col-span-3">Owner</div>
                <div className="hidden md:block md:col-span-2">
                  Last Modified
                </div>
                <div className="col-span-4 md:col-span-2 text-right">
                  File Size
                </div>
              </div>
            )}
            <FileItem
              name="image.png"
              isFolder={false}
              viewMode={viewMode}
              size="100KB"
            />

            <FileItem
              name="image.png"
              isFolder={false}
              viewMode={viewMode}
              size="100KB"
            />
            <FileItem
              name="image.png"
              isFolder={false}
              viewMode={viewMode}
              size="100KB"
            />
            <FileItem
              name="image.png"
              isFolder={false}
              viewMode={viewMode}
              size="100KB"
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default HomePage;
