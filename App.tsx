import React, { useState } from 'react';
import { Building2, LayoutDashboard, Target, GitPullRequest, Settings as SettingsIcon } from 'lucide-react';
import Dashboard from './components/Dashboard';
import Prospecting from './components/Prospecting';
import Pipeline from './components/Pipeline';
import Settings from './components/Settings';
import Accounts from './components/Accounts';
import Login from './components/Login';
import { User } from './types';

type Tab = 'dashboard' | 'prospecting' | 'accounts' | 'pipeline' | 'settings';

function App() {
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [user, setUser] = useState<User | null>(null);

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'prospecting':
        return <Prospecting />;
      case 'accounts':
        return <Accounts />;
      case 'pipeline':
        return <Pipeline />;
      case 'settings':
        return <Settings />;
      default:
        return <Dashboard />;
    }
  };

  if (!user) {
    return <Login onLogin={(u) => setUser(u)} />;
  }

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden text-slate-800">
      {/* Sidebar */}
      <nav className="w-64 bg-slate-900 text-slate-300 flex flex-col h-full border-r border-slate-800">
        <div className="p-6">
          <h1 className="text-xl font-bold text-white tracking-tight flex items-center">
            <span className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center mr-3 shadow-lg shadow-blue-500/20">
              AI
            </span>
            YOURGENCY
          </h1>
        </div>

        <div className="flex-1 py-6 space-y-2 px-3">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`w-full flex items-center p-3 rounded-lg transition-colors group ${activeTab === 'dashboard' ? 'bg-blue-600 text-white shadow-md' : 'hover:bg-slate-800 hover:text-white'
              }`}
          >
            <LayoutDashboard size={20} className="flex-shrink-0" />
            <span className="ml-3 font-medium">Dashboard</span>
          </button>

          <button
            onClick={() => setActiveTab('prospecting')}
            className={`w-full flex items-center p-3 rounded-lg transition-colors group ${activeTab === 'prospecting' ? 'bg-blue-600 text-white shadow-md' : 'hover:bg-slate-800 hover:text-white'
              }`}
          >
            <Target size={20} className="flex-shrink-0" />
            <span className="ml-3 font-medium">Prospecting</span>
          </button>

          <button
            onClick={() => setActiveTab('accounts')}
            className={`w-full flex items-center p-3 rounded-lg transition-colors group ${activeTab === 'accounts' ? 'bg-blue-600 text-white shadow-md' : 'hover:bg-slate-800 hover:text-white'
              }`}
          >
            <Building2 size={20} className="flex-shrink-0" />
            <span className="ml-3 font-medium">Accounts</span>
          </button>

          <button
            onClick={() => setActiveTab('pipeline')}
            className={`w-full flex items-center p-3 rounded-lg transition-colors group ${activeTab === 'pipeline' ? 'bg-blue-600 text-white shadow-md' : 'hover:bg-slate-800 hover:text-white'
              }`}
          >
            <GitPullRequest size={20} className="flex-shrink-0" />
            <span className="ml-3 font-medium">Pipeline</span>
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`w-full flex items-center p-3 rounded-lg transition-colors group ${activeTab === 'settings' ? 'bg-blue-600 text-white shadow-md' : 'hover:bg-slate-800 hover:text-white'
              }`}
          >
            <SettingsIcon size={20} className="flex-shrink-0" />
            <span className="ml-3 font-medium">Settings</span>
          </button>
        </div>

        <div className="p-4 border-t border-slate-800">
          <div className="flex items-center p-3 rounded-lg bg-slate-800/50 border border-slate-700">
            <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold text-xs">
              {user.name.charAt(0)}
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-white">{user.name}</p>
              <p className="text-xs text-slate-400">Admin</p>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <div className="p-8">
          {renderContent()}
        </div>
      </main>
    </div>
  );
}

export default App;