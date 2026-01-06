import React from 'react';
import { MOCK_PROSPECTS } from '../constants';
import { PipelineStage } from '../types';
import { MoreHorizontal, Phone, Mail, Calendar } from 'lucide-react';

const Pipeline: React.FC = () => {
  const stages = [
    { key: PipelineStage.PROSPECT, label: 'Prospect' },
    { key: PipelineStage.OUTREACH, label: 'Outreach' },
    { key: PipelineStage.ENGAGED, label: 'Engaged' },
    { key: PipelineStage.PROPOSAL, label: 'Proposal' },
    { key: PipelineStage.NEGOTIATION, label: 'Negotiation' },
  ];

  return (
    <div className="h-[calc(100vh-140px)] flex flex-col">
      <header className="mb-6 flex-none">
        <h2 className="text-2xl font-bold text-gray-800">Deal Pipeline</h2>
        <p className="text-gray-500">Manage your active opportunities and move them to close.</p>
      </header>

      <div className="flex-1 overflow-x-auto overflow-y-hidden pb-4">
        <div className="flex space-x-4 h-full min-w-max">
          {stages.map((stage) => {
            const prospects = MOCK_PROSPECTS.filter((p) => p.stage === stage.key);
            
            return (
              <div key={stage.key} className="w-80 flex flex-col bg-gray-100 rounded-xl max-h-full">
                {/* Stage Header */}
                <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gray-50 rounded-t-xl sticky top-0">
                  <div className="flex items-center space-x-2">
                    <h3 className="font-semibold text-gray-700">{stage.label}</h3>
                    <span className="bg-gray-200 text-gray-600 text-xs px-2 py-0.5 rounded-full">
                      {prospects.length}
                    </span>
                  </div>
                  <MoreHorizontal size={16} className="text-gray-400 cursor-pointer" />
                </div>

                {/* Cards Container */}
                <div className="p-3 space-y-3 overflow-y-auto flex-1 scrollbar-hide">
                  {prospects.length === 0 ? (
                    <div className="text-center py-8 text-gray-400 text-sm border-2 border-dashed border-gray-200 rounded-lg">
                      No deals
                    </div>
                  ) : (
                    prospects.map((prospect) => (
                      <div key={prospect.id} className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow cursor-pointer group">
                        <div className="flex justify-between items-start mb-2">
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                            prospect.industry === 'HVAC' ? 'bg-orange-100 text-orange-700' :
                            prospect.industry === 'Plumbing' ? 'bg-blue-100 text-blue-700' :
                            'bg-gray-100 text-gray-700'
                          }`}>
                            {prospect.industry}
                          </span>
                          {prospect.score && (
                            <span className={`text-xs font-bold ${
                              prospect.score.composite >= 80 ? 'text-green-600' : 'text-yellow-600'
                            }`}>
                              {prospect.score.composite}
                            </span>
                          )}
                        </div>
                        
                        <h4 className="font-bold text-gray-800 mb-1">{prospect.companyName}</h4>
                        <p className="text-sm text-gray-500 mb-3">{prospect.contactName}</p>
                        
                        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                          <span className="text-xs text-gray-400 font-medium">
                            {prospect.revenueRange}
                          </span>
                          <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button className="p-1 hover:bg-gray-100 rounded text-gray-500">
                              <Phone size={14} />
                            </button>
                            <button className="p-1 hover:bg-gray-100 rounded text-gray-500">
                              <Mail size={14} />
                            </button>
                            <button className="p-1 hover:bg-gray-100 rounded text-gray-500">
                              <Calendar size={14} />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
                
                {/* Footer total (Optional) */}
                <div className="p-3 bg-gray-50 rounded-b-xl border-t border-gray-200 text-xs text-center text-gray-400 font-medium">
                   Est. Value: ${prospects.length * 5}k
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Pipeline;