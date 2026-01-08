import React, { useState, useEffect } from 'react';
import { Phone, Mail, Calendar, StickyNote, ArrowUpRight, ArrowDownLeft, CheckCircle, Circle } from 'lucide-react';
import { Activity, ActivityType } from '../types';

interface ActivityTimelineProps {
    context: {
        accountId?: string;
        contactId?: string;
        opportunityId?: string;
    };
    height?: string;
}

const ActivityTimeline: React.FC<ActivityTimelineProps> = ({ context, height = "h-96" }) => {
    const [activities, setActivities] = useState<Activity[]>([]);
    const [loading, setLoading] = useState(true);

    // Form State
    const [type, setType] = useState<ActivityType>('note');
    const [content, setContent] = useState('');
    const [subject, setSubject] = useState('');
    const [direction, setDirection] = useState<'inbound' | 'outbound'>('outbound');

    const fetchActivities = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (context.accountId) params.append('accountId', context.accountId);
            if (context.contactId) params.append('contactId', context.contactId);
            if (context.opportunityId) params.append('opportunityId', context.opportunityId);

            const res = await fetch(`/api/activities?${params.toString()}`);
            const data = await res.json();
            if (Array.isArray(data)) setActivities(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchActivities();
    }, [context.accountId, context.contactId, context.opportunityId]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!content.trim()) return;

        try {
            const newActivity = {
                ...context,
                type,
                direction,
                subject: subject || `${direction} ${type}`,
                content,
                status: 'completed',
                date: new Date().toISOString()
            };

            await fetch('/api/activities', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newActivity)
            });

            setContent('');
            setSubject('');
            fetchActivities(); // Refresh list
        } catch (err) {
            console.error('Failed to save activity', err);
        }
    };

    const getIcon = (type: ActivityType) => {
        switch (type) {
            case 'call': return <Phone size={14} />;
            case 'email': return <Mail size={14} />;
            case 'meeting': return <Calendar size={14} />;
            case 'note': return <StickyNote size={14} />;
        }
    };

    const getColor = (type: ActivityType) => {
        switch (type) {
            case 'call': return 'bg-blue-100 text-blue-600';
            case 'email': return 'bg-purple-100 text-purple-600';
            case 'meeting': return 'bg-orange-100 text-orange-600';
            case 'note': return 'bg-yellow-100 text-yellow-600';
        }
    };

    return (
        <div className="flex flex-col h-full">
            {/* Quick Add Form */}
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 mb-6">
                <div className="flex space-x-2 mb-3">
                    {['note', 'call', 'email', 'meeting'].map(t => (
                        <button
                            key={t}
                            onClick={() => setType(t as ActivityType)}
                            className={`px-3 py-1.5 text-xs font-medium rounded-md capitalize transition-colors flex items-center space-x-1 ${type === t ? 'bg-white shadow text-slate-800 border border-gray-200' : 'text-gray-500 hover:bg-gray-100'}`}
                        >
                            {getIcon(t as ActivityType)}
                            <span>{t}</span>
                        </button>
                    ))}
                </div>

                <form onSubmit={handleSubmit} className="space-y-3">
                    {type !== 'note' && (
                        <div className="flex space-x-2">
                            <input
                                value={subject}
                                onChange={(e) => setSubject(e.target.value)}
                                placeholder="Subject"
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:border-blue-500"
                            />
                            {type === 'call' && (
                                <select
                                    value={direction}
                                    onChange={(e) => setDirection(e.target.value as any)}
                                    className="px-2 py-2 border border-gray-300 rounded-lg text-sm outline-none bg-white"
                                >
                                    <option value="outbound">Outbound</option>
                                    <option value="inbound">Inbound</option>
                                </select>
                            )}
                        </div>
                    )}

                    <textarea
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder="Log details..."
                        className="w-full h-20 p-3 border border-gray-300 rounded-lg outline-none text-sm resize-none focus:border-blue-500"
                    />

                    <div className="flex justify-end">
                        <button type="submit" disabled={!content.trim()} className="bg-slate-800 text-white text-xs font-bold px-4 py-2 rounded-lg hover:bg-slate-700 transition-colors disabled:opacity-50">
                            Log Activity
                        </button>
                    </div>
                </form>
            </div>

            {/* Timeline */}
            <div className={`overflow-y-auto ${height} pr-2 relative border-l-2 border-slate-100 ml-3 space-y-6 pb-2`}>
                {loading ? (
                    <div className="text-center text-xs text-gray-400 py-4">Loading history...</div>
                ) : activities.length === 0 ? (
                    <div className="text-center text-xs text-gray-400 py-4 pl-4">No history yet.</div>
                ) : (
                    activities.map((activity) => (
                        <div key={activity.id} className="relative pl-6 group">
                            <div className={`absolute -left-[11px] top-1 p-1.5 rounded-full border-2 border-white shadow-sm z-10 ${getColor(activity.type)}`}>
                                {getIcon(activity.type)}
                            </div>

                            <div className="bg-white p-3 rounded-lg border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                                <div className="flex justify-between items-start mb-1">
                                    <div className="flex items-center space-x-2">
                                        <span className="font-semibold text-sm text-slate-800 capitalize">
                                            {activity.subject || activity.type}
                                        </span>
                                        {activity.direction && activity.type !== 'note' && (
                                            <span className="text-[10px] uppercase font-bold text-gray-400 flex items-center">
                                                {activity.direction === 'outbound' ? <ArrowUpRight size={10} className="mr-0.5" /> : <ArrowDownLeft size={10} className="mr-0.5" />}
                                                {activity.direction}
                                            </span>
                                        )}
                                    </div>
                                    <span className="text-xs text-slate-400 whitespace-nowrap">
                                        {new Date(activity.date).toLocaleDateString()}
                                    </span>
                                </div>
                                <p className="text-sm text-slate-600 whitespace-pre-wrap leading-relaxed">
                                    {activity.content}
                                </p>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default ActivityTimeline;
