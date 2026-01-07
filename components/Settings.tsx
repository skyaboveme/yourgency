import React, { useState, useEffect } from 'react';
import { Save, Plus, Trash2, AlertCircle, RefreshCw } from 'lucide-react';

interface Config {
    industries: string[];
    systemInstruction?: string;
}

const Settings: React.FC = () => {
    const [config, setConfig] = useState<Config>({ industries: [], systemInstruction: '' });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [newIndustry, setNewIndustry] = useState('');

    const fetchConfig = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/config');
            if (!res.ok) throw new Error('Failed to load settings');
            const data = await res.json();
            setConfig(data);
        } catch (err) {
            console.error(err);
            // Fallback to defaults if API fails (e.g. local dev without worker)
            setConfig({
                industries: ['HVAC', 'Plumbing', 'Electrical', 'Roofing', 'Pest Control'],
                systemInstruction: ''
            });
            setError('Could not load settings from backend. Using defaults.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchConfig();
    }, []);

    const handleSave = async () => {
        setSaving(true);
        setError('');
        try {
            const res = await fetch('/api/config', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(config),
            });
            if (!res.ok) throw new Error('Failed to save settings');
        } catch (err) {
            console.error(err);
            setError('Failed to save settings. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    const addIndustry = () => {
        if (newIndustry && !config.industries.includes(newIndustry)) {
            setConfig(prev => ({ ...prev, industries: [...prev.industries, newIndustry] }));
            setNewIndustry('');
        }
    };

    const removeIndustry = (industry: string) => {
        setConfig(prev => ({ ...prev, industries: prev.industries.filter(i => i !== industry) }));
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full text-slate-400">
                <RefreshCw className="animate-spin mr-2" /> Loading settings...
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800">Admin Settings</h2>
                    <p className="text-slate-500">Manage your agency configuration</p>
                </div>
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                >
                    <Save size={18} className="mr-2" />
                    {saving ? 'Saving...' : 'Save Changes'}
                </button>
            </div>

            {error && (
                <div className="bg-red-50 text-red-600 p-4 rounded-lg flex items-center mb-6">
                    <AlertCircle size={20} className="mr-2 flex-shrink-0" />
                    {error}
                </div>
            )}

            {/* Industries Section */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <h3 className="text-lg font-semibold text-slate-800 mb-4">Target Industries</h3>
                <div className="flex gap-2 mb-4">
                    <input
                        type="text"
                        value={newIndustry}
                        onChange={(e) => setNewIndustry(e.target.value)}
                        placeholder="Add new industry (e.g. Landscaping)"
                        className="flex-1 p-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                        onKeyDown={(e) => e.key === 'Enter' && addIndustry()}
                    />
                    <button
                        onClick={addIndustry}
                        className="p-2 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200"
                    >
                        <Plus size={20} />
                    </button>
                </div>

                <div className="flex flex-wrap gap-2">
                    {config.industries.map((ind) => (
                        <div key={ind} className="flex items-center bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-full">
                            <span className="text-slate-700">{ind}</span>
                            <button
                                onClick={() => removeIndustry(ind)}
                                className="ml-2 text-slate-400 hover:text-red-500"
                            >
                                <Trash2 size={14} />
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            {/* System Instruction Section */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <h3 className="text-lg font-semibold text-slate-800 mb-2">AI System Instructions</h3>
                <p className="text-sm text-slate-500 mb-4">
                    Customize the core behavior of your AI agent. Leave empty to use the system default.
                </p>
                <textarea
                    value={config.systemInstruction || ''}
                    onChange={(e) => setConfig(prev => ({ ...prev, systemInstruction: e.target.value }))}
                    className="w-full h-64 p-4 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-mono text-sm"
                    placeholder="You are Yourgency AI..."
                />
            </div>
        </div>
    );
};

export default Settings;
