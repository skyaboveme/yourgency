import React, { useState, useEffect } from 'react';
import { Building2, Globe, DollarSign, Search } from 'lucide-react';
import { Account } from '../types';

const Accounts: React.FC = () => {
    const [accounts, setAccounts] = useState<Account[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('');

    useEffect(() => {
        const fetchAccounts = async () => {
            try {
                const res = await fetch('/api/accounts');
                const data = await res.json();
                if (Array.isArray(data)) {
                    // Parcel out tech stack if it's a string
                    const formatted = data.map(a => ({
                        ...a,
                        techStack: typeof a.tech_stack === 'string' ? JSON.parse(a.tech_stack) : a.tech_stack
                    }));
                    setAccounts(formatted);
                }
            } catch (error) {
                console.error('Failed to fetch accounts', error);
            } finally {
                setLoading(false);
            }
        };
        fetchAccounts();
    }, []);

    const filteredAccounts = accounts.filter(a =>
        a.name.toLowerCase().includes(filter.toLowerCase()) ||
        a.industry.toLowerCase().includes(filter.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <header className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800">Accounts</h2>
                    <p className="text-slate-500">Manage companies and organizations</p>
                </div>
                <div className="relative">
                    <Search className="absolute left-3 top-2.5 text-slate-400" size={20} />
                    <input
                        type="text"
                        placeholder="Search accounts..."
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                        className="pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 w-64"
                    />
                </div>
            </header>

            {loading ? (
                <div className="text-center py-20 text-slate-400">Loading accounts...</div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredAccounts.map(account => (
                        <div key={account.id} className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
                            <div className="flex items-start justify-between mb-4">
                                <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
                                    <Building2 size={24} />
                                </div>
                                <span className="text-xs font-medium px-2 py-1 bg-slate-100 text-slate-600 rounded-full">
                                    {account.industry}
                                </span>
                            </div>

                            <h3 className="text-lg font-bold text-slate-800 mb-1">{account.name}</h3>

                            <div className="space-y-2 mt-4">
                                {account.website && (
                                    <div className="flex items-center text-sm text-slate-500">
                                        <Globe size={16} className="mr-2" />
                                        <a href={account.website.startsWith('http') ? account.website : `https://${account.website}`} target="_blank" rel="noreferrer" className="hover:text-blue-600 truncate">
                                            {account.website}
                                        </a>
                                    </div>
                                )}
                                {account.revenueRange && (
                                    <div className="flex items-center text-sm text-slate-500">
                                        <DollarSign size={16} className="mr-2" />
                                        <span>{account.revenueRange}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}

                    {filteredAccounts.length === 0 && (
                        <div className="col-span-full text-center py-20 bg-slate-50 rounded-xl border border-dashed border-slate-200 text-slate-400">
                            No accounts found
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default Accounts;
