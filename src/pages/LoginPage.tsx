import React, { useState } from "react";
import { GhostIcon } from "../components/Icons";
import ghostDriveApi from "../apis/ghost-drive-api";
import { useNavigate } from "react-router";

const LoginPage: React.FC = () => {
  const [loginData, setLoginData] = useState<{
    username: string;
    password: string;
  }>({ username: "", password: "" });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Add login logic here
    try {
      setLoading(true);
      const response = await ghostDriveApi.user.login(loginData);
      console.log(response);

      setLoading(false);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-900">
      <div className="w-full max-w-md p-8 space-y-8 bg-slate-800/50 border border-slate-700 rounded-2xl shadow-2xl">
        <div className="text-center">
          <GhostIcon className="mx-auto w-16 h-16 text-cyan-400" />
          <h1 className="mt-4 text-3xl font-bold text-slate-100">
            Welcome to Ghost Drive
          </h1>
          <p className="mt-2 text-sm text-slate-400">
            Securely sign in to your encrypted storage.
          </p>
        </div>
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div>
            <label
              htmlFor="email"
              className="text-sm font-medium text-slate-300"
            >
              Username
            </label>
            <input
              required
              className="mt-2 w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
              placeholder="yourusername"
              value={loginData.username}
              onChange={(e) =>
                setLoginData({ ...loginData, username: e.target.value })
              }
            />
          </div>
          <div>
            <label
              htmlFor="password"
              className="text-sm font-medium text-slate-300"
            >
              Password
            </label>
            <input
              type="password"
              autoComplete="current-password"
              required
              className="mt-2 w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
              placeholder="••••••••"
              value={loginData.password}
              onChange={(e) =>
                setLoginData({ ...loginData, password: e.target.value })
              }
            />
          </div>
          <div>
            <button
              disabled={loading}
              type="submit"
              className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-3 rounded-lg transition-colors"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </div>
        </form>
        <p className="text-sm text-center text-slate-400">
          Don't have an account?{" "}
          <button
            onClick={() => navigate("/register")}
            className="font-medium text-cyan-400 hover:text-cyan-300"
          >
            Sign up
          </button>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
