import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Search, Upload, User, Settings, LogOut, Bell, Lock } from "lucide-react";
import { Link, useNavigate, useSearchParams } from "react-router";
import { ACCESS_TOKEN_KEY } from "@/constants";
import useUserStore from "@/store/user";
import { toast } from "sonner";
import { UploadDialog } from "../file-management/upload-dialog";
import { useEffect, useState } from "react";
import { useDebounce } from "use-debounce";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";

export function DashboardHeader() {
  const navigate = useNavigate();
  const { clearUser, user } = useUserStore();
  const handleLogout = () => {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    clearUser();
    navigate("/login");
    toast.success("Logged out successfully");
  };
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery] = useDebounce(searchQuery, 500);
  useEffect(() => {
    if (debouncedSearchQuery) {
      setSearchParams((prev) => {
        const newParams = new URLSearchParams(prev);
        newParams.set("q", debouncedSearchQuery.trim());
        return newParams;
      });
    } else {
      setSearchParams((prev) => {
        const newParams = new URLSearchParams(prev);
        newParams.delete("q");
        return newParams;
      });
    }
  }, [debouncedSearchQuery]);
  useEffect(() => {
    setSearchQuery(searchParams.get("q") || "");
  }, [searchParams]);
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 flex h-16 items-center justify-between">
        <div className="flex items-center gap-6">
          <div
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => navigate("/")}
          >
            <div className="w-8 h-8">
              <div className="relative from-primary to-primary/60 rounded-lg  shadow-lg">
                <img
                  src="/ghostdrive-logo.png"
                  alt="Ghost Drive"
                  className="w-full h-full"
                />
              </div>
            </div>
            <span className="font-bold text-lg">Ghost Drive</span>
          </div>

          <div className="hidden md:flex relative w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search files..."
              className="pl-10 bg-muted/50"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            <span className="absolute top-1 right-1 h-2 w-2 bg-primary rounded-full" />
          </Button>

          <Link to="/vault">
            <Button variant="outline" size="sm" className="gap-2 bg-transparent">
              <Lock className="h-4 w-4" />
              Vault
            </Button>
          </Link>
          
          <UploadDialog>
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
              <Upload className="h-4 w-4 mr-2" />
              Upload
            </Button>
          </UploadDialog>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full">
                {user?.avatar ? (
                  <Avatar className="h-5 w-5">
                    <AvatarImage src={user.avatar} />
                    <AvatarFallback>
                      {user.fullName?.charAt(0) || "GD"}
                    </AvatarFallback>
                  </Avatar>
                ) : (
                  <User className="h-5 w-5" />
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium">{user?.username}</p>
                  <p className="text-xs text-muted-foreground">{user?.email}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate("/settings")}>
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-destructive"
                onClick={handleLogout}
              >
                <LogOut className="mr-2 h-4 w-4" />
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
