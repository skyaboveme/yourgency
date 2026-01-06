import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { AlertTriangle, TrendingUp, Users, DollarSign, Bell } from 'lucide-react';
import { MOCK_ALERTS, PIPELINE_DATA } from '../constants';

const Dashboard: React.FC = () => {
  return (
    <div className="space-y-6 animate-fade-in">
      <header className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Mission Control</h2>
        <p className="text-gray-500">Welcome back. Here is your Yourgency performance overview.</p>
      </header>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center space-x-4">
          <div className="p-3 bg-blue-100 text-blue-600 rounded-full">
            <Users size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500">Active Prospects</p>
            <h3 className="text-2xl font-bold text-gray-800">42</h3>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center space-x-4">
          <div className="p-3 bg-green-100 text-green-600 rounded-full">
            <DollarSign size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500">Pipeline Value</p>
            <h3 className="text-2xl font-bold text-gray-800">$185k</h3>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center space-x-4">
          <div className="p-3 bg-purple-100 text-purple-600 rounded-full">
            <TrendingUp size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500">Win Rate</p>
            <h3 className="text-2xl font-bold text-gray-800">24%</h3>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center space-x-4">
          <div className="p-3 bg-red-100 text-red-600 rounded-full">
            <AlertTriangle size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500">At Risk</p>
            <h3 className="text-2xl font-bold text-gray-800">5 Deals</h3>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pipeline Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Pipeline Distribution</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={PIPELINE_DATA}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#6b7280'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#6b7280'}} />
                <Tooltip 
                  cursor={{fill: '#f3f4f6'}}
                  contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'}}
                />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {PIPELINE_DATA.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index === 5 ? '#10b981' : '#3b82f6'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Alerts Feed */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Yourgency Alerts</h3>
            <span className="bg-red-100 text-red-600 text-xs px-2 py-1 rounded-full font-bold">3 New</span>
          </div>
          <div className="space-y-4">
            {MOCK_ALERTS.map((alert) => (
              <div key={alert.id} className="border-l-4 border-red-500 bg-red-50 p-3 rounded-r-lg">
                <div className="flex items-start justify-between">
                  <h4 className="text-sm font-bold text-red-700">{alert.type.replace('_', ' ')}</h4>
                  <span className="text-xs text-red-400">{alert.timestamp}</span>
                </div>
                <p className="text-sm text-gray-700 mt-1">{alert.message}</p>
                <div className="mt-2 flex space-x-2">
                  <button className="text-xs bg-white text-red-600 border border-red-200 px-2 py-1 rounded hover:bg-red-50 transition-colors">
                    Act Now
                  </button>
                  <button className="text-xs text-gray-500 hover:text-gray-700 px-2 py-1">
                    Dismiss
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;