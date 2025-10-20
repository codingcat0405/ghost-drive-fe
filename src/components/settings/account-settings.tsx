import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User, Mail, Camera } from "lucide-react";
import { toast } from "sonner";
import useUserStore from "@/store/user";
import ghostDriveApi from "@/apis/ghost-drive-api";

export function AccountSettings() {
  const { user } = useUserStore();
  const [name, setName] = useState(user.fullName || "");
  const [email, setEmail] = useState(user.email || "");
  const [isSaving, setIsSaving] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [previewAvatar, setPreviewAvatar] = useState("");

  const handleSave = async () => {
    try {
      setIsSaving(true);
      await ghostDriveApi.user.updateUser({
        fullName: name,
        email: email,
        avatar: previewAvatar,
      });
    } catch(err: any) {
      toast.error(err.message);
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]); // Only take the first file
      if (!e.target.files[0]?.type.includes("image")) {
        toast.error("Please select an image file");
        e.target.value = "";
      }
      //create preview url
      const previewUrl = URL.createObjectURL(e.target.files[0]);
      setPreviewAvatar(previewUrl);
    }
  };

  useEffect(() => {
    return () => {
      // Cleanup the old URL when component unmounts or previewAvatar changes
      if (previewAvatar) {
        URL.revokeObjectURL(previewAvatar);
      }
    };
  }, [previewAvatar]);

  return (
    <div className="space-y-6">
      <Card className="border-border/50 bg-card/50">
        <CardHeader>
          <CardTitle>Profile Information</CardTitle>
          <CardDescription>
            Update your account details and profile picture
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center gap-6">
            <Avatar className="h-20 w-20">
              <AvatarImage src={previewAvatar || user.avatar} />
              <AvatarFallback>
                {user.fullName?.charAt(0) || "GD"}
              </AvatarFallback>
            </Avatar>
            <input
              type="file"
              onChange={handleFileInput}
              className="hidden"
              id="file-upload"
              accept="image/*"
              // disabled={uploading}
            />
            <Button variant="outline">
              <label htmlFor="file-upload" className="flex">
                <Camera className="h-4 w-4 mr-2" />
                Change Photo
              </label>
            </Button>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </div>

          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="bg-primary text-primary-foreground hover:bg-primary/90"
          >
            {isSaving ? "Saving..." : "Save Changes"}
          </Button>
        </CardContent>
      </Card>

      <Card className="border-border/50 bg-card/50 border-destructive/50">
        <CardHeader>
          <CardTitle className="text-destructive">Danger Zone</CardTitle>
          <CardDescription>
            Irreversible actions for your account
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 rounded-lg bg-destructive/5 border border-destructive/20">
            <div>
              <h4 className="font-medium">Delete Account</h4>
              <p className="text-sm text-muted-foreground">
                Permanently delete your account and all data
              </p>
            </div>
            <Button variant="destructive">Delete</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
