import React from 'react';
import { GhostIcon } from '../components/Icons';

interface LoginPageProps {
    onLogin: () => void;
    onNavigate: (page: 'register') => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin, onNavigate }) => {

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Add login logic here
        onLogin();
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-slate-900">
            <div className="w-full max-w-md p-8 space-y-8 bg-slate-800/50 border border-slate-700 rounded-2xl shadow-2xl">
                <div className="text-center">
                    <GhostIcon className="mx-auto w-16 h-16 text-cyan-400" />
                    <h1 className="mt-4 text-3xl font-bold text-slate-100">Welcome to Ghost Drive</h1>
                    <p className="mt-2 text-sm text-slate-400">Securely sign in to your encrypted storage.</p>
                </div>
                <form className="space-y-6" onSubmit={handleSubmit}>
                    <div>
                        <label htmlFor="email" className="text-sm font-medium text-slate-300">Email address</label>
                        <input
                            id="email"
                            name="email"
                            type="email"
                            autoComplete="email"
                            required
                            className="mt-2 w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                            placeholder="you@example.com"
                        />
                    </div>
                    <div>
                        <label htmlFor="password" className="text-sm font-medium text-slate-300">Password</label>
                        <input
                            id="password"
                            name="password"
                            type="password"
                            autoComplete="current-password"
                            required
                            className="mt-2 w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                            placeholder="••••••••"
                        />
                    </div>
                    <div>
                        <button
                            type="submit"
                            className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-3 rounded-lg transition-colors"
                        >
                            Sign In
                        </button>
                    </div>
                </form>
                <p className="text-sm text-center text-slate-400">
                    Don't have an account?{' '}
                    <button onClick={() => onNavigate('register')} className="font-medium text-cyan-400 hover:text-cyan-300">
                        Sign up
                    </button>
                </p>
            </div>
        </div>
    );
};

export default LoginPage;
