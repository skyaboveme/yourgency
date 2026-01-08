import React from 'react';
import { PipelineStage, User } from '../types';
import { MoreHorizontal, Phone, Mail, Calendar, Trash2, ArrowRight, Globe, CircleUser } from 'lucide-react';

import DealDetailModal from './DealDetailModal';
import { Prospect } from '../types';

const Pipeline: React.FC = () => {
  const [prospects, setProspects] = React.useState<Prospect[]>([]);
  const [users, setUsers] = React.useState<User[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [selectedProspect, setSelectedProspect] = React.useState<Prospect | null>(null);

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const [pRes, uRes] = await Promise.all([
          fetch('/api/opportunities'),
          fetch('/api/users')
        ]);
        const pData = await pRes.json();
        const uData = await uRes.json();

        if (Array.isArray(pData)) setProspects(pData);
        if (Array.isArray(uData)) setUsers(uData);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const stages = [
    { key: PipelineStage.PROSPECT, label: 'Prospect' },
    { key: PipelineStage.OUTREACH, label: 'Outreach' },
    { key: PipelineStage.ENGAGED, label: 'Engaged' },
    { key: PipelineStage.PROPOSAL, label: 'Proposal' },
    { key: PipelineStage.NEGOTIATION, label: 'Negotiation' },
  ];

  const updateProspects = async (newList: Prospect[]) => {
    setProspects(newList);
    try {
      await fetch('/api/opportunities', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newList)
      });
    } catch (err) {
      console.error('Failed to save prospects:', err);
      // Optionally revert state here if strict
    }
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this deal?')) return;
    const newList = prospects.filter(p => p.id !== id);
    updateProspects(newList);
  };

  const handleMove = (id: string, currentStage: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const currentIndex = stages.findIndex(s => s.key === currentStage);
    if (currentIndex < 0 || currentIndex >= stages.length - 1) return;

    const nextStage = stages[currentIndex + 1].key;
    const newList = prospects.map(p => p.id === id ? { ...p, stage: nextStage } : p);
    updateProspects(newList);
  };

  const handleUpdateProspect = (updatedProspect: Prospect) => {
    const newList = prospects.map(p => p.id === updatedProspect.id ? updatedProspect : p);
    updateProspects(newList);
    setSelectedProspect(null);
  };

  return (
    <div className="h-[calc(100vh-140px)] flex flex-col">
      <header className="mb-6 flex-none">
        <h2 className="text-2xl font-bold text-gray-800">Deal Pipeline</h2>
        <p className="text-gray-500">Manage your active opportunities and move them to close.</p>
      </header>

      <div className="flex-1 overflow-x-auto overflow-y-hidden pb-4">
        <div className="flex space-x-4 h-full min-w-max">
          {stages.map((stage) => {
            const stageProspects = prospects.filter((p) => p.stage === stage.key);

            return (
              <div key={stage.key} className="w-80 flex flex-col bg-gray-100 rounded-xl max-h-full">
                {/* Stage Header */}
                <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gray-50 rounded-t-xl sticky top-0">
                  <div className="flex items-center space-x-2">
                    <h3 className="font-semibold text-gray-700">{stage.label}</h3>
                    <span className="bg-gray-200 text-gray-600 text-xs px-2 py-0.5 rounded-full">
                      {stageProspects.length}
                    </span>
                  </div>
                  <MoreHorizontal size={16} className="text-gray-400 cursor-pointer" />
                </div>

                {/* Cards Container */}
                <div className="p-3 space-y-3 overflow-y-auto flex-1 scrollbar-hide">
                  {stageProspects.length === 0 ? (
                    <div className="text-center py-8 text-gray-400 text-sm border-2 border-dashed border-gray-200 rounded-lg">
                      No deals
                    </div>
                  ) : (
                    stageProspects.map((prospect) => (
                      <div
                        key={prospect.id}
                        onClick={() => setSelectedProspect(prospect)}
                        className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow cursor-pointer group"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${prospect.industry === 'HVAC' ? 'bg-orange-100 text-orange-700' :
                            prospect.industry === 'Plumbing' ? 'bg-blue-100 text-blue-700' :
                              'bg-gray-100 text-gray-700'
                            }`}>
                            {prospect.industry}
                          </span>
                          {prospect.score && (
                            <span className={`text-xs font-bold ${prospect.score.composite >= 80 ? 'text-green-600' : 'text-yellow-600'
                              }`}>
                              {prospect.score.composite}
                            </span>
                          )}
                        </div>

                        <h4 className="font-bold text-gray-800 mb-1">{prospect.companyName}</h4>
                        <p className="text-sm text-gray-500 mb-3">{prospect.contactName}</p>

                        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                          <div className="flex items-center">
                            {prospect.assignedToName ? (
                              <div className="flex items-center space-x-1" title={`Assigned to ${prospect.assignedToName}`}>
                                <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center text-[10px] text-blue-600 font-bold">
                                  {prospect.assignedToName.charAt(0)}
                                </div>
                              </div>
                            ) : (
                              <CircleUser size={16} className="text-gray-300" />
                            )}
                            <span className="text-xs text-gray-400 font-medium ml-2">
                              {prospect.revenueRange}
                            </span>
                          </div>

                          <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            {prospect.phone && (
                              <a href={`tel:${prospect.phone}`} onClick={(e) => e.stopPropagation()} className="p-1 hover:bg-gray-100 rounded text-gray-500" title={prospect.phone}>
                                <Phone size={14} />
                              </a>
                            )}
                            {prospect.email && (
                              <a href={`mailto:${prospect.email}`} onClick={(e) => e.stopPropagation()} className="p-1 hover:bg-gray-100 rounded text-gray-500" title={prospect.email}>
                                <Mail size={14} />
                              </a>
                            )}
                            <button
                              onClick={(e) => handleDelete(prospect.id, e)}
                              className="p-1 hover:bg-red-100 hover:text-red-600 rounded text-gray-400" title="Delete">
                              <Trash2 size={14} />
                            </button>
                            {stage.key !== PipelineStage.NEGOTIATION && (
                              <button
                                onClick={(e) => handleMove(prospect.id, prospect.stage, e)}
                                className="p-1 hover:bg-blue-100 hover:text-blue-600 rounded text-gray-400" title="Move to Next Stage">
                                <ArrowRight size={14} />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Footer total (Optional) */}
                <div className="p-3 bg-gray-50 rounded-b-xl border-t border-gray-200 text-xs text-center text-gray-400 font-medium">
                  Est. Value: ${stageProspects.length * 5}k
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {selectedProspect && (
        <DealDetailModal
          prospect={selectedProspect}
          users={users}
          onClose={() => setSelectedProspect(null)}
          onSave={handleUpdateProspect}
        />
      )}
    </div>
  );
};

export default Pipeline;