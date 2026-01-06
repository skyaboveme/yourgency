import React, { useState } from 'react';
import { LayoutDashboard, Target, GitPullRequest, MessageSquareText, Settings, Sparkles } from 'lucide-react';
import Dashboard from './components/Dashboard';
import Prospecting from './components/Prospecting';
import Pipeline from './components/Pipeline';
import SkyForceChat from './components/SkyForceChat';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'prospecting' | 'pipeline'>('dashboard');
  const [isChatOpen, setIsChatOpen] = useState(false);

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'prospecting':
        return <Prospecting />;
      case 'pipeline':
        return <Pipeline />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden text-slate-800">
      {/* Sidebar Navigation */}
      <aside className="w-20 lg:w-64 bg-slate-900 text-white flex-shrink-0 flex flex-col transition-all duration-300">
        <div className="h-16 flex items-center justify-center lg:justify-start lg:px-6 border-b border-slate-800">
          <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center flex-shrink-0">
             <Sparkles className="text-white" size={18} />
          </div>
          <span className="ml-3 font-bold text-lg hidden lg:block tracking-wide">Yourgency</span>
        </div>

        <nav className="flex-1 py-6 space-y-2 px-3">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`w-full flex items-center p-3 rounded-lg transition-colors group ${
              activeTab === 'dashboard' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <LayoutDashboard size={20} className="flex-shrink-0" />
            <span className="ml-3 hidden lg:block font-medium">Dashboard</span>
          </button>

          <button
            onClick={() => setActiveTab('prospecting')}
            className={`w-full flex items-center p-3 rounded-lg transition-colors group ${
              activeTab === 'prospecting' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <Target size={20} className="flex-shrink-0" />
            <span className="ml-3 hidden lg:block font-medium">Prospecting</span>
          </button>

          <button
            onClick={() => setActiveTab('pipeline')}
            className={`w-full flex items-center p-3 rounded-lg transition-colors group ${
              activeTab === 'pipeline' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <GitPullRequest size={20} className="flex-shrink-0" />
            <span className="ml-3 hidden lg:block font-medium">Pipeline</span>
          </button>
        </nav>

        <div className="p-4 border-t border-slate-800">
           <button className="w-full flex items-center p-2 text-slate-400 hover:text-white transition-colors">
              <Settings size={20} />
              <span className="ml-3 hidden lg:block text-sm">Settings</span>
           </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 shadow-sm z-10">
          <h1 className="text-xl font-semibold capitalize text-gray-800">
            {activeTab}
          </h1>
          <div className="flex items-center space-x-4">
            <button 
              onClick={() => setIsChatOpen(!isChatOpen)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-full border transition-all ${
                isChatOpen 
                  ? 'bg-blue-50 border-blue-200 text-blue-600 ring-2 ring-blue-100' 
                  : 'bg-white border-gray-200 text-gray-600 hover:border-blue-300'
              }`}
            >
              <MessageSquareText size={18} />
              <span className="font-medium text-sm">Ask Yourgency</span>
            </button>
            <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold border border-blue-200">
              JS
            </div>
          </div>
        </header>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-auto p-6 lg:p-10 relative">
          {renderContent()}
        </div>

        {/* Chat Overlay */}
        {isChatOpen && <SkyForceChat onClose={() => setIsChatOpen(false)} />}
      </main>
    </div>
  );
};

export default App;