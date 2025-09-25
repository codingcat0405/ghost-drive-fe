import React from 'react';
import { GitHubIcon } from './Icons';

const Footer: React.FC = () => {
  return (
    <footer className="flex-shrink-0 bg-slate-800/30 border-t border-slate-700 px-6 py-2">
      <div className="flex justify-between items-center text-xs text-slate-500">
        <div>
            Built by <a href="https://github.com/codingcat0405" target="_blank" rel="noopener noreferrer" className="font-semibold text-cyan-400 hover:text-cyan-300">codingcat</a>
        </div>
        <div>
            Version 1.0.0
        </div>
        <div>
            <a href="https://github.com/codingcat0405/ghost-drive-fe" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 font-semibold text-cyan-400 hover:text-cyan-300 transition-colors">
                <GitHubIcon className="w-4 h-4" />
                <span>Give it a Star!</span>
            </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;