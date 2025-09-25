import React from 'react';

interface SettingsPageProps {
  onNavigate: (page: 'drive') => void;
}

const SettingsPage: React.FC<SettingsPageProps> = ({ onNavigate }) => {
    
  const handleSaveChanges = () => {
      alert("Settings saved successfully!");
      onNavigate('drive');
  }

  return (
    <div className="max-w-4xl mx-auto text-slate-200">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-3xl font-bold text-slate-100">Settings</h2>
        <button 
          onClick={() => onNavigate('drive')}
          className="text-sm text-cyan-400 hover:text-cyan-300"
        >
          &larr; Back to Drive
        </button>
      </div>

      <div className="space-y-10">
        {/* Change Password Section */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
          <h3 className="text-xl font-semibold mb-4">Change Password</h3>
          <form className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">Current Password</label>
              <input type="password" className="w-full max-w-sm bg-slate-700/50 border border-slate-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">New Password</label>
              <input type="password" className="w-full max-w-sm bg-slate-700/50 border border-slate-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500" />
            </div>
             <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">Confirm New Password</label>
              <input type="password" className="w-full max-w-sm bg-slate-700/50 border border-slate-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500" />
            </div>
          </form>
        </div>

        {/* Update PIN Section */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
          <h3 className="text-xl font-semibold mb-4">Update Security PIN</h3>
           <p className="text-sm text-slate-400 mb-4">Enter your current password to set a new 6-digit PIN.</p>
          <form className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">Current Password</label>
              <input type="password" className="w-full max-w-sm bg-slate-700/50 border border-slate-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">New 6-Digit PIN</label>
              <input type="password" maxLength={6} className="w-full max-w-sm bg-slate-700/50 border border-slate-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500" />
            </div>
          </form>
        </div>
        
        <div className="flex justify-end">
            <button
                onClick={handleSaveChanges}
                className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-2 px-6 rounded-lg transition-colors"
            >
                Save Changes
            </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
