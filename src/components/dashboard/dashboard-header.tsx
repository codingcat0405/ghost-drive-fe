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
import { Search, Upload, User, Settings, LogOut, Bell } from "lucide-react";
import { useNavigate } from "react-router";
import { ACCESS_TOKEN_KEY } from "@/constants";
import useUserStore from "@/store/user";
import { toast } from "sonner";

export function DashboardHeader() {
  const navigate = useNavigate();
  const { clearUser, user } = useUserStore();
  const handleLogout = () => {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    clearUser();
    navigate("/login");
    toast.success("Logged out successfully");
  };
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 flex h-16 items-center justify-between">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate("/")}>
            <div className="w-8 h-8">
              <div className="relative from-primary to-primary/60 rounded-lg  shadow-lg">
                <img src="/ghostdrive-logo.png" alt="Ghost Drive" className="w-full h-full" />
              </div>
            </div>
            <span className="font-bold text-lg">Ghost Drive</span>
          </div>

          <div className="hidden md:flex relative w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
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

          <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
            <Upload className="h-4 w-4 mr-2" />
            Upload
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full">
                <User className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium">{user?.username}</p>
                  <p className="text-xs text-muted-foreground">
                    {user?.bucketName}
                  </p>
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
