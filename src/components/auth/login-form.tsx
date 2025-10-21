import type React from "react";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Lock, User } from "lucide-react";
import ghostDriveApi from "@/apis/ghost-drive-api";
import { ACCESS_TOKEN_KEY } from "@/constants";
import { useNavigate } from "react-router";
import useUserStore from "@/store/user";
import { toast } from "sonner";
import { TwoFactorVerifyDialog } from "./two-factor-verify-dialog";

export function LoginForm() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [openTwoFactorVerifyDialog, setOpenTwoFactorVerifyDialog] =
    useState(false);
  const [verifyingTwoFactor, setVerifyingTwoFactor] = useState(false);
  const navigate = useNavigate();
  const { setUser } = useUserStore();

  const handleSubmit = async (e: React.FormEvent) => {
    try {
      e.preventDefault();
      setIsLoading(true);
      const response = await ghostDriveApi.user.login({
        username,
        password,
      });
      //not requires two factor, login successful
      if (!response.requiresTwoFactor && response.jwt && response.user) {
        localStorage.setItem(ACCESS_TOKEN_KEY, response.jwt);
        setUser({
          id: response.user.id,
          bucketName: response.user.bucketName,
          aesKeyEncrypted: response.user.aesKeyEncrypted || "",
          role: response.user.role,
          username: response.user.username,
          avatar: response.user.avatar,
          fullName: response.user.fullName,
          email: response.user.email,
        });
        toast.success("Login successful");
        navigate("/");
        return;
      } else {
        //requires two factor, open verify dialog
        setOpenTwoFactorVerifyDialog(true);
      }
    } catch (error: any) {
      toast.error(error.message);
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyTwoFactor = async (code: string) => {
    try {
      if (!username) {
        toast.error("Please enter your username");
        return;
      }
      setVerifyingTwoFactor(true);
      const response = await ghostDriveApi.twoFactor.verify({
        token: code,
        username,
      });
      localStorage.setItem(ACCESS_TOKEN_KEY, response.jwt);
      setUser({
        id: response.user.id,
        bucketName: response.user.bucketName,
        aesKeyEncrypted: response.user.aesKeyEncrypted || "",
        role: response.user.role,
        username: response.user.username,
        avatar: response.user.avatar,
        fullName: response.user.fullName,
        email: response.user.email,
      });
      toast.success("Login successful");
      navigate("/");
      return;
    } catch (error: any) {
      console.error(error);
      toast.error(error.message);
    } finally {
      setVerifyingTwoFactor(false);
    }
  };

  return (
    <Card className="border-border/50 bg-card/50 backdrop-blur">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl">Sign in</CardTitle>
        <CardDescription>
          Enter your credentials to access your secure storage
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Username</Label>
            <div className="relative">
              <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="username"
                type="text"
                placeholder="you@example.com"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="pl-10"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Password</Label>
              <a
                href="/forgot-password"
                className="text-xs text-primary hover:underline"
              >
                Forgot password?
              </a>
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10"
                required
              />
            </div>
          </div>

          <Button
            type="submit"
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
            disabled={isLoading}
          >
            {isLoading ? "Signing in..." : "Sign in"}
          </Button>
        </form>

        <div className="mt-6 p-4 bg-muted/50 rounded-lg border border-border/50">
          <div className="flex items-start space-x-2">
            <Lock className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
            <p className="text-xs text-muted-foreground">
              Your files are encrypted end-to-end. Not even we can access your
              data.
            </p>
          </div>
        </div>
      </CardContent>
      <TwoFactorVerifyDialog
        open={openTwoFactorVerifyDialog}
        setOpen={setOpenTwoFactorVerifyDialog}
        onVerify={handleVerifyTwoFactor}
        isVerifying={verifyingTwoFactor}
      />
    </Card>
  );
}
