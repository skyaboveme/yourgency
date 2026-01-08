import React, { useState, useEffect } from 'react';
import { Save, Plus, Trash2, AlertCircle, RefreshCw } from 'lucide-react';

import { User } from '../types';

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

    // User Management State
    const [users, setUsers] = useState<User[]>([]);
    const [newUserName, setNewUserName] = useState('');
    const [newUserEmail, setNewUserEmail] = useState('');
    const [newUserRole, setNewUserRole] = useState('user');

    const fetchConfig = async () => {
        setLoading(true);
        try {
            const [configRes, usersRes] = await Promise.all([
                fetch('/api/config'),
                fetch('/api/users')
            ]);

            if (!configRes.ok) throw new Error('Failed to load settings');
            const configData = await configRes.json();
            setConfig(configData);

            if (usersRes.ok) {
                const usersData = await usersRes.json();
                if (Array.isArray(usersData)) setUsers(usersData);
            }

        } catch (err) {
            console.error(err);
            // Fallback to defaults
            setConfig({
                industries: ['HVAC', 'Plumbing', 'Electrical', 'Roofing', 'Pest Control'],
                systemInstruction: ''
            });
            setError('Could not load settings from backend. Using defaults.');
        } finally {
            setLoading(false);
        }
    };

    const addUser = async () => {
        if (!newUserName || !newUserEmail) return;
        try {
            const res = await fetch('/api/users', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: newUserName,
                    email: newUserEmail,
                    role: newUserRole
                })
            });

            if (res.ok) {
                const data = await res.json();
                setUsers(prev => [{
                    id: data.id,
                    name: newUserName,
                    email: newUserEmail,
                    role: newUserRole as 'admin' | 'user'
                }, ...prev]);
                setNewUserName('');
                setNewUserEmail('');
            } else {
                const errData = await res.json();
                setError(`Failed to add user: ${errData.error || 'Unknown error'}`);
            }
        } catch (e) {
            console.error(e);
            setError('Failed to add user. Network error.');
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

            {/* Team Management Section */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <h3 className="text-lg font-semibold text-slate-800 mb-4">Team Management</h3>

                {/* Add User Form */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-2 mb-6">
                    <input
                        type="text"
                        placeholder="Name"
                        className="p-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                        id="newUserName"
                    />
                    <input
                        type="email"
                        placeholder="Email"
                        className="p-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                        id="newUserEmail"
                    />
                    <input
                        type="password"
                        placeholder="Password (optional)"
                        className="p-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                        id="newUserPassword"
                    />
                    <div className="flex gap-2">
                        <select id="newUserRole" className="flex-1 p-2 border border-slate-200 rounded-lg bg-white">
                            <option value="user">User</option>
                            <option value="admin">Admin</option>
                        </select>
                        <button
                            onClick={async () => {
                                const nameInput = document.getElementById('newUserName') as HTMLInputElement;
                                const emailInput = document.getElementById('newUserEmail') as HTMLInputElement;
                                const passwordInput = document.getElementById('newUserPassword') as HTMLInputElement;
                                const roleInput = document.getElementById('newUserRole') as HTMLSelectElement;

                                if (nameInput.value && emailInput.value) {
                                    try {
                                        const res = await fetch('/api/users', {
                                            method: 'POST',
                                            headers: { 'Content-Type': 'application/json' },
                                            body: JSON.stringify({
                                                name: nameInput.value,
                                                email: emailInput.value,
                                                password: passwordInput.value || undefined,
                                                role: roleInput.value
                                            })
                                        });
                                        if (res.ok) {
                                            const data = await res.json();
                                            // Refresh list (optimistic update)
                                            setUsers(prev => [{
                                                id: data.id,
                                                name: nameInput.value,
                                                email: emailInput.value,
                                                role: roleInput.value as 'admin' | 'user',
                                                lastLogin: undefined
                                            }, ...prev]);

                                            nameInput.value = '';
                                            emailInput.value = '';
                                            passwordInput.value = '';
                                            alert('User added successfully');
                                        } else {
                                            const errData = await res.json();
                                            alert(`Failed: ${errData.error}`);
                                        }
                                    } catch (e) {
                                        console.error(e);
                                        alert('Failed to add user');
                                    }
                                }
                            }}
                            className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 w-12 flex justify-center items-center"
                        >
                            <Plus size={20} />
                        </button>
                    </div>
                </div>

                <div className="space-y-0 border rounded-lg overflow-hidden">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-slate-50 text-slate-500 font-medium">
                            <tr>
                                <th className="p-3">Name</th>
                                <th className="p-3">Email</th>
                                <th className="p-3">Role</th>
                                <th className="p-3">Last Login</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {users.map(user => (
                                <tr key={user.id} className="hover:bg-slate-50">
                                    <td className="p-3 font-medium text-slate-800">{user.name}</td>
                                    <td className="p-3 text-slate-500">{user.email}</td>
                                    <td className="p-3">
                                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${user.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-green-100 text-green-700'
                                            }`}>
                                            {user.role}
                                        </span>
                                    </td>
                                    <td className="p-3 text-slate-400">
                                        {user.lastLogin ? new Date(user.lastLogin).toLocaleString() : 'Never'}
                                    </td>
                                </tr>
                            ))}
                            {users.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="p-6 text-center text-slate-400">No users found.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
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
