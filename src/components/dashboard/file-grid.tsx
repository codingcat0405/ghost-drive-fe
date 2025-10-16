import { useState } from "react";
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
  Share2,
  Edit,
  Grid3x3,
  List,
  Clock,
  SlashIcon,
} from "lucide-react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "../ui/breadcrumb";
import { Link } from "react-router";

type ViewMode = "grid" | "list";

interface FileItem {
  id: string;
  name: string;
  type: "folder" | "document" | "image" | "video" | "audio";
  size?: string;
  modified: string;
  encrypted: boolean;
}

const mockFiles: FileItem[] = [];

function getFileIcon(type: FileItem["type"]) {
  switch (type) {
    case "folder":
      return <Folder className="h-8 w-8 text-primary" />;
    case "document":
      return <FileText className="h-8 w-8 text-blue-500" />;
    case "image":
      return <ImageIcon className="h-8 w-8 text-green-500" />;
    case "video":
      return <Video className="h-8 w-8 text-purple-500" />;
    case "audio":
      return <Music className="h-8 w-8 text-orange-500" />;
  }
}

export function FileGrid() {
  const [viewMode, setViewMode] = useState<ViewMode>("grid");

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">My Files</h2>
          <p className="text-sm text-muted-foreground">
            All your encrypted files in one place
          </p>
        </div>

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
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link to="/">Your Drive</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator>
            <SlashIcon />
          </BreadcrumbSeparator>
        </BreadcrumbList>
      </Breadcrumb>
      {viewMode === "grid" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {mockFiles.map((file) => (
            <Card
              key={file.id}
              className="p-4 hover:bg-accent/50 transition-colors cursor-pointer border-border/50 bg-card/50 group"
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
                    >
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>
                      <Download className="mr-2 h-4 w-4" />
                      Download
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Share2 className="mr-2 h-4 w-4" />
                      Share
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Edit className="mr-2 h-4 w-4" />
                      Rename
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="text-destructive">
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
                  <p className="text-xs text-muted-foreground">{file.size}</p>
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
            {mockFiles.map((file) => (
              <div
                key={file.id}
                className="flex items-center justify-between p-4 hover:bg-accent/50 transition-colors cursor-pointer group"
              >
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <div className="p-2 rounded-lg bg-muted/50">
                    {getFileIcon(file.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium truncate">{file.name}</h3>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>{file.modified}</span>
                      {file.size && <span>{file.size}</span>}
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
                    >
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>
                      <Download className="mr-2 h-4 w-4" />
                      Download
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Share2 className="mr-2 h-4 w-4" />
                      Share
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Edit className="mr-2 h-4 w-4" />
                      Rename
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="text-destructive">
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
    </div>
  );
}
