import React, { useState, useEffect } from 'react';
import { Calendar, TrendingUp, AlertTriangle, CheckCircle, Zap, Loader2, ArrowRight } from 'lucide-react';
import { generateMorningBrief } from '../services/geminiService';
import { Prospect } from '../types';

const Dashboard: React.FC = () => {
  const [brief, setBrief] = useState<{ summary: string; actionItems: string[]; risks: string[] } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [prospects, setProspects] = useState<Prospect[]>([]);
  const [metrics, setMetrics] = useState({ totalValue: 0, activeDeals: 0, winRate: 15 }); // Mock win rate for now

  useEffect(() => {
    // Load prospects for context
    fetch('/api/prospects')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setProspects(data);

          // potential value calc (mock logic: $5k per deal)
          const active = data.filter(p => p.stage !== 'CLOSED_LOST').length;
          setMetrics({
            totalValue: active * 5000,
            activeDeals: active,
            winRate: 15
          });
        }
      })
      .catch(err => console.error(err));
  }, []);

  const handleGenerateBrief = async () => {
    setIsLoading(true);
    const result = await generateMorningBrief(prospects);
    setBrief(result);
    setIsLoading(false);
  };

  const currentDate = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex justify-between items-end border-b border-gray-100 pb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Good Morning, Alexander</h1>
          <p className="text-gray-500 mt-1 flex items-center space-x-2">
            <Calendar size={16} />
            <span>{currentDate}</span>
          </p>
        </div>
        {!brief && !isLoading && (
          <button
            onClick={handleGenerateBrief}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-lg font-semibold shadow-lg hover:shadow-blue-500/30 transition-all flex items-center space-x-2"
          >
            <Zap size={18} className="fill-current" />
            <span>Generate Morning Brief</span>
          </button>
        )}
      </div>

      {/* AI Brief Section */}
      {isLoading && (
        <div className="bg-white p-12 rounded-2xl shadow-sm border border-gray-100 text-center">
          <Loader2 size={48} className="animate-spin text-indigo-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-800">Analyzing Pipeline...</h3>
          <p className="text-gray-500">Your Co-Pilot is reviewing {prospects.length} deals to find your top priorities.</p>
        </div>
      )}

      {brief && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-slide-in-up">
          {/* Summary Card */}
          <div className="md:col-span-3 bg-gradient-to-br from-indigo-50 to-white p-6 rounded-2xl border border-indigo-100 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-100 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 opacity-50"></div>
            <h3 className="text-lg font-bold text-indigo-900 mb-2 flex items-center">
              <Zap size={20} className="mr-2 text-indigo-600 fill-current" />
              Daily Pipeline Pulse
            </h3>
            <p className="text-indigo-800 text-lg leading-relaxed relative z-10">
              "{brief.summary}"
            </p>
          </div>

          {/* Action Items */}
          <div className="md:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center border-b border-gray-50 pb-2">
              <CheckCircle size={20} className="mr-2 text-green-500" />
              Critical Actions
            </h3>
            <div className="space-y-3">
              {brief.actionItems.map((item, idx) => (
                <div key={idx} className="flex items-start p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors group cursor-pointer border border-transparent hover:border-gray-200">
                  <div className="mt-0.5 bg-white border border-gray-300 w-5 h-5 rounded-md flex items-center justify-center mr-3 group-hover:border-blue-500 transition-colors">
                    <div className="w-2.5 h-2.5 bg-blue-500 rounded-sm opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  </div>
                  <span className="text-gray-700 font-medium">{item}</span>
                  <ArrowRight size={16} className="ml-auto text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity self-center" />
                </div>
              ))}
            </div>
          </div>

          {/* Risks */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center border-b border-gray-50 pb-2">
              <AlertTriangle size={20} className="mr-2 text-amber-500" />
              Risk Radar
            </h3>
            <div className="space-y-3">
              {brief.risks.map((item, idx) => (
                <div key={idx} className="p-3 bg-amber-50 rounded-lg border border-amber-100 text-amber-900 text-sm font-medium flex items-start">
                  <span className="mr-2 mt-0.5">•</span>
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Metrics Grid */}
      <div className="grid grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500 font-medium uppercase tracking-wide">Total Value</p>
          <p className="text-3xl font-black text-gray-900 mt-2">${metrics.totalValue.toLocaleString()}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500 font-medium uppercase tracking-wide">Active Deals</p>
          <p className="text-3xl font-black text-gray-900 mt-2">{metrics.activeDeals}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500 font-medium uppercase tracking-wide">Win Rate</p>
          <p className="text-3xl font-black text-gray-900 mt-2">{metrics.winRate}%</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;