import React, { useState, useEffect } from 'react';
import { X, Save, Phone, Mail, Globe, Calendar, MessageSquare, StickyNote, Plus, User } from 'lucide-react';
import { Prospect, Activity, ActivityType, User as UserType } from '../types';
import ActivityTimeline from './ActivityTimeline';

interface DealDetailModalProps {
    prospect: Prospect;
    users: UserType[];
    onClose: () => void;
    onSave: (updatedProspect: Prospect) => void;
}

const DealDetailModal: React.FC<DealDetailModalProps> = ({ prospect, users, onClose, onSave }) => {
    const [formData, setFormData] = useState<Partial<Prospect>>({ ...prospect });
    const [activeTab, setActiveTab] = useState<'details' | 'timeline'>('details');

    // Update local state when prospect changes
    useEffect(() => {
        setFormData({ ...prospect });
    }, [prospect]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = () => {
        if (formData.id) {
            onSave(formData as Prospect);
        }
    };

    const getIcon = (type: ActivityType) => {
        switch (type) {
            case 'call': return <Phone size={16} className="text-blue-500" />;
            case 'email': return <Mail size={16} className="text-purple-500" />;
            case 'meeting': return <Calendar size={16} className="text-orange-500" />;
            case 'note': return <StickyNote size={16} className="text-yellow-500" />;
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex justify-end">
            <div className="bg-white w-full max-w-2xl h-full shadow-2xl flex flex-col animate-slide-in-right">
                {/* Header */}
                <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                    <div>
                        <h2 className="text-xl font-bold text-gray-800">{formData.companyName}</h2>
                        <span className="text-sm text-gray-500 flex items-center mt-1">
                            {formData.industry} • <span className="uppercase ml-1 font-semibold text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">{formData.stage}</span>
                        </span>
                    </div>
                    <div className="flex items-center space-x-2">
                        <button onClick={handleSave} className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors">
                            <Save size={18} />
                            <span>Save Changes</span>
                        </button>
                        <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full text-gray-500 transition-colors">
                            <X size={24} />
                        </button>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-gray-200 px-6">
                    <button
                        onClick={() => setActiveTab('details')}
                        className={`py-3 px-4 font-medium text-sm border-b-2 transition-colors ${activeTab === 'details' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                    >
                        Deal Details
                    </button>
                    <button
                        onClick={() => setActiveTab('timeline')}
                        className={`py-3 px-4 font-medium text-sm border-b-2 transition-colors ${activeTab === 'timeline' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                    >
                        Activity Timeline ({formData.activities?.length || 0})
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6">
                    {activeTab === 'details' ? (
                        <div className="space-y-6">
                            {/* ... (Existing details form logic preserved) ... */}
                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Company Name</label>
                                    <input
                                        name="companyName"
                                        value={formData.companyName}
                                        readOnly
                                        className="w-full px-3 py-2 border border-gray-200 bg-gray-50 text-gray-500 rounded-lg outline-none cursor-not-allowed"
                                        title="Manage in Accounts"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Industry</label>
                                    <input
                                        name="industry"
                                        value={formData.industry}
                                        onChange={handleChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Contact Name</label>
                                    <input
                                        name="contactName"
                                        value={formData.contactName}
                                        readOnly
                                        className="w-full px-3 py-2 border border-gray-200 bg-gray-50 text-gray-500 rounded-lg outline-none cursor-not-allowed"
                                        title="Manage in Contacts"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Revenue Range</label>
                                    <select
                                        name="revenueRange"
                                        value={formData.revenueRange}
                                        onChange={handleChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                    >
                                        <option value="Unknown">Unknown</option>
                                        <option value="<$1M">{'<$1M'}</option>
                                        <option value="$1M - $5M">$1M - $5M</option>
                                        <option value="$5M - $10M">$5M - $10M</option>
                                        <option value="$10M+">$10M+</option>
                                    </select>
                                </div>
                                <div className="col-span-2">
                                    <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Assigned To</label>
                                    <div className="relative">
                                        <User size={16} className="absolute left-3 top-3 text-gray-400" />
                                        <select
                                            name="assignedTo"
                                            value={formData.assignedTo || ''}
                                            onChange={handleChange}
                                            className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none appearance-none"
                                        >
                                            <option value="">Unassigned</option>
                                            {users.map(u => (
                                                <option key={u.id} value={u.id}>{u.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4 pt-4 border-t border-gray-100">
                                <h3 className="font-semibold text-gray-800">Contact Information</h3>
                                <div>
                                    <div className="flex items-center space-x-2 mb-1">
                                        <Mail size={14} className="text-gray-400" />
                                        <label className="text-xs font-semibold text-gray-500 uppercase">Email Address</label>
                                    </div>
                                    <input
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        placeholder="No email"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                    />
                                </div>
                                <div>
                                    <div className="flex items-center space-x-2 mb-1">
                                        <Phone size={14} className="text-gray-400" />
                                        <label className="text-xs font-semibold text-gray-500 uppercase">Phone Number</label>
                                    </div>
                                    <input
                                        name="phone"
                                        value={formData.phone || ''}
                                        onChange={handleChange}
                                        placeholder="No phone"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                    />
                                </div>
                                <div>
                                    <div className="flex items-center space-x-2 mb-1">
                                        <Globe size={14} className="text-gray-400" />
                                        <label className="text-xs font-semibold text-gray-500 uppercase">Website</label>
                                    </div>
                                    <input
                                        name="website"
                                        value={formData.website || ''}
                                        onChange={handleChange}
                                        placeholder="No website"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                    />
                                </div>
                            </div>
                        </div>
                    ) : (
                        <ActivityTimeline
                            context={{
                                opportunityId: prospect.id,
                                accountId: prospect.accountId, // Ensure types.ts Prospect has these
                                contactId: prospect.primaryContactId
                            }}
                        />
                    )}
                </div>
            </div>
        </div>
    );
};

export default DealDetailModal;
