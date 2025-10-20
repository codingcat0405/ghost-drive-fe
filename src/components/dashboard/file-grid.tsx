import { useMemo, useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  FileText,
  ImageIcon,
  Video,
  Music,
  Folder,
  MoreVertical,
  Download,
  Trash2,
  Move,
  Edit,
  Grid3x3,
  List,
  Clock,
  SlashIcon,
  X,
  Search,
} from "lucide-react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "../ui/breadcrumb";
import { useSearchParams } from "react-router";
import { useQuery } from "@tanstack/react-query";
import ghostDriveApi from "@/apis/ghost-drive-api";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "../ui/pagination";
import moment from "moment";
import { MoveFileDialog } from "../file-management/move-file-dialog";
import { ConfirmDeleteDialog } from "../file-management/delete-file-dialog";
import { RenameFileDialog } from "../file-management/rename-file-dialog";
import { PreviewFileDialog } from "../file-management/preview-file-dialog";
import useUserStore from "@/store/user";
import DecryptPinDialog from "../DecryptPinDialog";

type ViewMode = "grid" | "list";

interface FileItem {
  key: number;
  id: string;
  name: string;
  type: string;
  size?: number;
  sizeFormatted?: string;
  modified: string;
  encrypted: boolean;
  objectKey: string;
}

function getFileIcon(mimeType: string) {
  if (mimeType.startsWith("image/")) {
    return <ImageIcon className="h-8 w-8 text-green-500" />;
  }
  if (mimeType.startsWith("video/")) {
    return <Video className="h-8 w-8 text-purple-500" />;
  }
  if (mimeType.startsWith("audio/")) {
    return <Music className="h-8 w-8 text-orange-500" />;
  }
  if (
    mimeType.startsWith("text/") ||
    mimeType.includes("document") ||
    mimeType.includes("pdf") ||
    mimeType.includes("word") ||
    mimeType.includes("sheet") ||
    mimeType.includes("presentation")
  ) {
    return <FileText className="h-8 w-8 text-blue-500" />;
  }
  if (mimeType === "folder") {
    return <Folder className="h-8 w-8 text-primary" />;
  }
  // For folders, you'll need to handle separately since folders don't have MIME types
  // Default fallback
  return <FileText className="h-8 w-8 text-gray-500" />;
}

export function FileGrid() {
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [searchParams, setSearchParams] = useSearchParams();
  const [moveFileDialogOpen, setMoveFileDialogOpen] = useState(false);
  const [renameFileDialogOpen, setRenameFileDialogOpen] = useState(false);
  const [deleteFileDialogOpen, setDeleteFileDialogOpen] = useState(false);
  const [previewFileDialogOpen, setPreviewFileDialogOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<{
    id: number;
    name: string;
    type: "file" | "folder";
    size: number;
    mimeType: string;
    objectKey: string;
  } | null>(null);
  const { user } = useUserStore();
  const [openPinDialog, setOpenPinDialog] = useState(false);

  // Get page and folder from URL or default values
  const currentPage = parseInt(searchParams.get("page") || "1", 10);
  const currentFolderId = searchParams.get("folder") || undefined;
  const searchQuery = searchParams.get("q") || undefined;
  const [params, setParams] = useState({
    folderId: currentFolderId ? parseInt(currentFolderId) : undefined,
    page: currentPage,
    limit: 9,
    searchQuery: searchQuery,
  });

  // Update fileParams when URL changes
  useEffect(() => {
    setParams((prev) => ({
      ...prev,
      page: currentPage,
      folderId: currentFolderId ? parseInt(currentFolderId) : undefined,
      searchQuery: searchQuery,
    }));
  }, [currentPage, currentFolderId, searchQuery]);

  const { data: folderContentsData, isLoading } = useQuery({
    queryKey: ["folder-contents", params],
    queryFn: async ({ queryKey }) => {
      if ((queryKey[1] as any).searchQuery) {
        return await ghostDriveApi.file.searchFiles({
          q: (queryKey[1] as any).searchQuery,
          page: (queryKey[1] as any).page,
          limit: (queryKey[1] as any).limit,
        });
      } else {
        return await ghostDriveApi.folder.contents(queryKey[1] as any);
      }
    },
  });

  const { data: parentTreeData = [] } = useQuery({
    queryKey: ["parent-tree", params],
    queryFn: ({ queryKey }) =>
      ghostDriveApi.folder.getParentTree({
        folderId: (queryKey[1] as any).folderId,
      }),
  });

  const folderContents: FileItem[] = useMemo(() => {
    const allContents = folderContentsData?.contents || [];

    return allContents.map((item, index) => ({
      key: index,
      id: item.id.toString(),
      name: item.name,
      type: item.folderId
        ? item.mimeType ?? "application/octet-stream"
        : "folder",
      sizeFormatted: item.size
        ? (item.size / 1024 / 1024).toFixed(2) + " MB"
        : "",
      size: item.size,
      modified: moment(item.createdAt).format("DD/MM/YYYY HH:mm:ss"),
      encrypted: true,
      objectKey: item.objectKey ?? "",
    }));
  }, [folderContentsData]);

  // Pagination data from API response
  const paginationData = folderContentsData
    ? {
        currentPage: folderContentsData.currentPage,
        totalPages: folderContentsData.totalPage,
        totalElements: folderContentsData.totalElements,
        perPage: folderContentsData.perPage,
      }
    : null;

  // Handle page change
  const handlePageChange = (newPage: number) => {
    // Update URL with new page parameter
    setSearchParams((prev) => {
      const newParams = new URLSearchParams(prev);
      newParams.set("page", newPage.toString());
      return newParams;
    });
  };

  // Handle folder navigation
  const handleFolderClick = (folderId: string) => {
    setSearchParams((prev) => {
      const newParams = new URLSearchParams(prev);
      newParams.set("folder", folderId);
      newParams.set("page", "1"); // Reset to first page when changing folders
      return newParams;
    });
  };

  // Generate page numbers for pagination
  const generatePageNumbers = () => {
    if (!paginationData) return [];

    const { currentPage, totalPages } = paginationData;
    const pages = [];

    // Always show first page
    if (currentPage > 3) {
      pages.push(1);
      if (currentPage > 4) pages.push("ellipsis");
    }

    // Show pages around current page
    const start = Math.max(1, currentPage - 2);
    const end = Math.min(totalPages, currentPage + 2);

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    // Always show last page
    if (currentPage < totalPages - 2) {
      if (currentPage < totalPages - 3) pages.push("ellipsis");
      pages.push(totalPages);
    }

    return pages;
  };
  const handleFileClick = (file: FileItem) => {
    if (file.type === "folder") {
      handleFolderClick(file.id);
      return;
    }
    setSelectedFile({
      id: +file.id,
      name: file.name,
      type: file.type === "folder" ? "folder" : "file",
      size: file.size ?? 0,
      mimeType: file.type === "folder" ? "application/octet-stream" : file.type,
      objectKey: file.objectKey ?? "",
    });
    if (!user.aesKeyPlain) {
      // If user doesn't have aesKeyPlain, show PIN dialog instead
      setOpenPinDialog(true);
      return;
    }
    setPreviewFileDialogOpen(true);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">My Files</h2>

        <div className="flex items-center gap-2">
          <Button
            variant={viewMode === "grid" ? "default" : "ghost"}
            size="icon"
            onClick={() => setViewMode("grid")}
          >
            <Grid3x3 className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === "list" ? "default" : "ghost"}
            size="icon"
            onClick={() => setViewMode("list")}
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>
      {searchQuery ? (
        <div className="flex items-center justify-between gap-4 px-4 py-3 rounded-lg bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="flex-shrink-0 p-2 rounded-md bg-primary/20">
              <Search className="h-4 w-4 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground">
                Search results for{" "}
                <span className="font-semibold text-primary">
                  "{searchQuery}"
                </span>
              </p>

              <p className="text-xs text-muted-foreground mt-0.5">
                {folderContentsData?.totalElements} found
              </p>
            </div>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setSearchParams((prev) => {
                const newParams = new URLSearchParams(prev);
                newParams.delete("q");
                return newParams;
              });
            }}
            className="flex-shrink-0 hover:bg-destructive/10 hover:text-destructive transition-colors"
          >
            <X className="h-4 w-4 mr-1.5" />
            <span className="hidden sm:inline">Clear</span>
          </Button>
        </div>
      ) : (
        <Breadcrumb>
          <BreadcrumbList>
            {parentTreeData.length === 0 ? (
              <>
                <BreadcrumbPage>
                  <BreadcrumbLink>My Drive</BreadcrumbLink>
                </BreadcrumbPage>
                <BreadcrumbSeparator>
                  <SlashIcon />
                </BreadcrumbSeparator>
              </>
            ) : (
              parentTreeData.map((item) => (
                <>
                  {+item.id === +currentFolderId! ? (
                    <BreadcrumbItem key={item.id}>
                      <BreadcrumbPage
                        onClick={() => handleFolderClick(item.id.toString())}
                        className="cursor-pointer"
                      >
                        {item.name == "/" ? "My Drive" : item.name}
                      </BreadcrumbPage>
                    </BreadcrumbItem>
                  ) : (
                    <BreadcrumbItem key={item.id}>
                      <BreadcrumbLink
                        onClick={() => handleFolderClick(item.id.toString())}
                        className="cursor-pointer"
                      >
                        {item.name == "/" ? "My Drive" : item.name}
                      </BreadcrumbLink>
                    </BreadcrumbItem>
                  )}
                  <BreadcrumbSeparator>
                    <SlashIcon />
                  </BreadcrumbSeparator>
                </>
              ))
            )}
          </BreadcrumbList>
        </Breadcrumb>
      )}
      <p className="text-sm text-muted-foreground">
        {paginationData
          ? `Showing ${
              (paginationData.currentPage - 1) * paginationData.perPage + 1
            }-${Math.min(
              paginationData.currentPage * paginationData.perPage,
              paginationData.totalElements
            )} of ${paginationData.totalElements} files`
          : "All your encrypted files in one place"}
      </p>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading files...</p>
          </div>
        </div>
      ) : folderContents.length === 0 ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <Folder className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No files yet</h3>
            <p className="text-muted-foreground">
              Upload your first file to get started
            </p>
          </div>
        </div>
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {folderContents.map((file) => (
            <Card
              key={file.key}
              className="p-4 hover:bg-accent/50 transition-colors cursor-pointer border-border/50 bg-card/50 group"
              onClick={() => handleFileClick(file)}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="p-3 rounded-lg bg-muted/50">
                  {getFileIcon(file.type)}
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 opacity-0 group-hover:opacity-100"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="end"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {file.type !== "folder" && (
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedFile({
                            id: +file.id,
                            name: file.name,
                            type: file.type === "folder" ? "folder" : "file",
                            size: file.size ?? 0,
                            mimeType:
                              file.type === "folder"
                                ? "application/octet-stream"
                                : file.type,
                            objectKey: file.objectKey ?? "",
                          });
                          if (!user.aesKeyPlain) {
                            // If user doesn't have aesKeyPlain, show PIN dialog instead
                            setOpenPinDialog(true);
                            return;
                          }
                          setPreviewFileDialogOpen(true);
                        }}
                      >
                        <Download className="mr-2 h-4 w-4" />
                        Download
                      </DropdownMenuItem>
                    )}

                    <DropdownMenuItem
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedFile({
                          id: +file.id,
                          name: file.name,
                          type: file.type === "folder" ? "folder" : "file",
                          size: file.size ?? 0,
                          mimeType:
                            file.type === "folder"
                              ? "application/octet-stream"
                              : file.type,
                          objectKey: file.objectKey ?? "",
                        });
                        setMoveFileDialogOpen(true);
                      }}
                    >
                      <Move className="mr-2 h-4 w-4" />
                      Move to
                    </DropdownMenuItem>

                    <DropdownMenuItem
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedFile({
                          id: +file.id,
                          name: file.name,
                          type: file.type === "folder" ? "folder" : "file",
                          size: file.size ?? 0,
                          mimeType:
                            file.type === "folder"
                              ? "application/octet-stream"
                              : file.type,
                          objectKey: file.objectKey ?? "",
                        });
                        setRenameFileDialogOpen(true);
                      }}
                    >
                      <Edit className="mr-2 h-4 w-4" />
                      Rename
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="text-destructive"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedFile({
                          id: +file.id,
                          name: file.name,
                          type: file.type === "folder" ? "folder" : "file",
                          size: file.size ?? 0,
                          mimeType:
                            file.type === "folder"
                              ? "application/octet-stream"
                              : file.type,
                          objectKey: file.objectKey ?? "",
                        });
                        setDeleteFileDialogOpen(true);
                      }}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <div className="space-y-1">
                <h3 className="font-medium truncate">{file.name}</h3>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  <span>{file.modified}</span>
                </div>
                {file.size && (
                  <p className="text-xs text-muted-foreground">
                    {file.sizeFormatted}
                  </p>
                )}
              </div>

              {file.encrypted && (
                <div className="mt-3 flex items-center gap-1 text-xs text-primary">
                  <svg
                    className="h-3 w-3"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    />
                  </svg>
                  <span>Encrypted</span>
                </div>
              )}
            </Card>
          ))}
        </div>
      ) : (
        <Card className="border-border/50 bg-card/50">
          <div className="divide-y divide-border/50">
            {folderContents.map((file) => (
              <div
                key={file.key}
                className="flex items-center justify-between p-4 hover:bg-accent/50 transition-colors cursor-pointer group"
                onClick={() => handleFileClick(file)}
              >
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <div className="p-2 rounded-lg bg-muted/50">
                    {getFileIcon(file.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium truncate">{file.name}</h3>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>{file.modified}</span>
                      {file.size && <span>{file.sizeFormatted}</span>}
                      {file.encrypted && (
                        <span className="flex items-center gap-1 text-primary">
                          <svg
                            className="h-3 w-3"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                            />
                          </svg>
                          Encrypted
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="opacity-0 group-hover:opacity-100"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="end"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {file.type !== "folder" && (
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedFile({
                            id: +file.id,
                            name: file.name,
                            type: file.type === "folder" ? "folder" : "file",
                            size: file.size ?? 0,
                            objectKey: file.objectKey ?? "",
                            mimeType:
                              file.type === "folder"
                                ? "application/octet-stream"
                                : file.type,
                          });
                          if (!user.aesKeyPlain) {
                            // If user doesn't have aesKeyPlain, show PIN dialog instead
                            setOpenPinDialog(true);
                            return;
                          }
                          setPreviewFileDialogOpen(true);
                        }}
                      >
                        <Download className="mr-2 h-4 w-4" />
                        Download
                      </DropdownMenuItem>
                    )}

                    <DropdownMenuItem
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedFile({
                          id: +file.id,
                          name: file.name,
                          type: file.type === "folder" ? "folder" : "file",
                          size: file.size ?? 0,
                          mimeType:
                            file.type === "folder"
                              ? "application/octet-stream"
                              : file.type,
                          objectKey: file.objectKey ?? "",
                        });
                        setMoveFileDialogOpen(true);
                      }}
                    >
                      <Move className="mr-2 h-4 w-4" />
                      Move to
                    </DropdownMenuItem>

                    <DropdownMenuItem
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedFile({
                          id: +file.id,
                          name: file.name,
                          type: file.type === "folder" ? "folder" : "file",
                          size: file.size ?? 0,
                          mimeType:
                            file.type === "folder"
                              ? "application/octet-stream"
                              : file.type,
                          objectKey: file.objectKey ?? "",
                        });
                        setRenameFileDialogOpen(true);
                      }}
                    >
                      <Edit className="mr-2 h-4 w-4" />
                      Rename
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="text-destructive"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedFile({
                          id: +file.id,
                          name: file.name,
                          type: file.type === "folder" ? "folder" : "file",
                          size: file.size ?? 0,
                          mimeType:
                            file.type === "folder"
                              ? "application/octet-stream"
                              : file.type,
                          objectKey: file.objectKey ?? "",
                        });
                        setDeleteFileDialogOpen(true);
                      }}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ))}
          </div>
        </Card>
      )}
      {paginationData && paginationData.totalPages > 1 && (
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                onClick={() => handlePageChange(paginationData.currentPage - 1)}
                className={
                  paginationData.currentPage <= 1
                    ? "pointer-events-none opacity-50"
                    : "cursor-pointer"
                }
              />
            </PaginationItem>

            {generatePageNumbers().map((page, index) => (
              <PaginationItem key={index}>
                {page === "ellipsis" ? (
                  <PaginationEllipsis />
                ) : (
                  <PaginationLink
                    onClick={() => handlePageChange(page as number)}
                    isActive={page === paginationData.currentPage}
                    className="cursor-pointer"
                  >
                    {page}
                  </PaginationLink>
                )}
              </PaginationItem>
            ))}

            <PaginationItem>
              <PaginationNext
                onClick={() => handlePageChange(paginationData.currentPage + 1)}
                className={
                  paginationData.currentPage >= paginationData.totalPages
                    ? "pointer-events-none opacity-50"
                    : "cursor-pointer"
                }
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
      <MoveFileDialog
        file={
          selectedFile ?? {
            id: 0,
            name: "",
            type: "file",
            size: 0,
            mimeType: "",
            objectKey: "",
          }
        }
        open={moveFileDialogOpen}
        setOpen={setMoveFileDialogOpen}
      />
      <ConfirmDeleteDialog
        file={
          selectedFile ?? {
            id: 0,
            name: "",
            type: "file",
            size: 0,
            mimeType: "",
            objectKey: "",
          }
        }
        open={deleteFileDialogOpen}
        setOpen={setDeleteFileDialogOpen}
      />
      <RenameFileDialog
        file={
          selectedFile ?? {
            id: 0,
            name: "",
            type: "file",
            size: 0,
            mimeType: "",
            objectKey: "",
          }
        }
        open={renameFileDialogOpen}
        setOpen={setRenameFileDialogOpen}
      />

      <PreviewFileDialog
        file={
          selectedFile ?? {
            id: 0,
            name: "",
            type: "file",
            size: 0,
            mimeType: "",
            objectKey: "",
          }
        }
        open={previewFileDialogOpen}
        setOpen={setPreviewFileDialogOpen}
      />
      <DecryptPinDialog
        open={openPinDialog}
        setOpen={setOpenPinDialog}
        onSuccess={() => setPreviewFileDialogOpen(true)}
      />
    </div>
  );
}
