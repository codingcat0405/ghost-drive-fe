import React from 'react';
import { GhostIcon } from '../components/Icons';

interface RegisterPageProps {
    onRegister: () => void;
    onNavigate: (page: 'login') => void;
}

const RegisterPage: React.FC<RegisterPageProps> = ({ onRegister, onNavigate }) => {

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Add registration logic here
        onRegister();
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-slate-900">
            <div className="w-full max-w-md p-8 space-y-8 bg-slate-800/50 border border-slate-700 rounded-2xl shadow-2xl">
                <div className="text-center">
                    <GhostIcon className="mx-auto w-16 h-16 text-cyan-400" />
                    <h1 className="mt-4 text-3xl font-bold text-slate-100">Create Your Account</h1>
                    <p className="mt-2 text-sm text-slate-400">Start your secure, encrypted journey.</p>
                </div>
                <form className="space-y-6" onSubmit={handleSubmit}>
                     <div>
                        <label htmlFor="email" className="text-sm font-medium text-slate-300">Email address</label>
                        <input id="email" name="email" type="email" required className="mt-2 w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500"/>
                    </div>
                    <div>
                        <label htmlFor="password" className="text-sm font-medium text-slate-300">Password</label>
                        <input id="password" name="password" type="password" required className="mt-2 w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500"/>
                    </div>
                    <div>
                        <label htmlFor="pin" className="text-sm font-medium text-slate-300">6-Digit Security PIN</label>
                        <input id="pin" name="pin" type="password" required maxLength={6} className="mt-2 w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500" placeholder="Your key to decryption"/>
                    </div>
                    <div>
                        <button type="submit" className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-3 rounded-lg transition-colors">
                            Create Account
                        </button>
                    </div>
                </form>
                <p className="text-sm text-center text-slate-400">
                    Already have an account?{' '}
                    <button onClick={() => onNavigate('login')} className="font-medium text-cyan-400 hover:text-cyan-300">
                        Sign in
                    </button>
                </p>
            </div>
        </div>
    );
};

export default RegisterPage;
