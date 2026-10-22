import React, { useState, useEffect } from 'react';
import ReportCard from '../components/ReportCard';
import { fetchReports } from '../services/api';

export default function Dashboard({ onNavigate, isDarkMode = false }) {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterCategory, setFilterCategory] = useState('All');
  const [filterPriority, setFilterPriority] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await fetchReports({
        category: filterCategory,
        priority: filterPriority,
        status: filterStatus
      });
      setReports(data || []);
    } catch (err) {
      console.error('Failed to load reports', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [filterCategory, filterPriority, filterStatus]);

  const filtered = reports.filter((r) => {
    const ai = r.ai_analysis || {};
    const text = `${ai.title || ''} ${r.user_description || ''} ${r.user_location || ''} ${ai.category || ''}`.toLowerCase();
    return text.includes(searchQuery.toLowerCase());
  });

  const counts = {
    total: reports.length,
    urgent: reports.filter((r) => r.ai_analysis?.priority === 'Urgent').length,
    inProgress: reports.filter((r) => r.status === 'In Progress').length,
    resolved: reports.filter((r) => r.status === 'Resolved').length
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Quick Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className={`p-4 rounded-2xl border transition-colors shadow-sm ${
          isDarkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
        }`}>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Reports</p>
          <p className="text-2xl font-black mt-1 text-indigo-500">{counts.total}</p>
        </div>

        <div className={`p-4 rounded-2xl border transition-colors shadow-sm ${
          isDarkMode ? 'bg-red-950/30 border-red-900/60 text-red-400' : 'bg-red-50/70 border-red-200 text-red-700'
        }`}>
          <p className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
            Urgent Priority
          </p>
          <p className="text-2xl font-black mt-1">{counts.urgent}</p>
        </div>

        <div className={`p-4 rounded-2xl border transition-colors shadow-sm ${
          isDarkMode ? 'bg-amber-950/30 border-amber-900/60 text-amber-400' : 'bg-amber-50/70 border-amber-200 text-amber-700'
        }`}>
          <p className="text-xs font-semibold uppercase tracking-wider">In Progress</p>
          <p className="text-2xl font-black mt-1">{counts.inProgress}</p>
        </div>

        <div className={`p-4 rounded-2xl border transition-colors shadow-sm ${
          isDarkMode ? 'bg-emerald-950/30 border-emerald-900/60 text-emerald-400' : 'bg-emerald-50/70 border-emerald-200 text-emerald-700'
        }`}>
          <p className="text-xs font-semibold uppercase tracking-wider">Resolved</p>
          <p className="text-2xl font-black mt-1">{counts.resolved}</p>
        </div>
      </div>

      {/* Control bar: Search & Filters */}
      <div className={`p-5 rounded-2xl border transition-colors shadow-sm space-y-4 ${
        isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
      }`}>
        <div className="flex flex-col md:flex-row gap-3 justify-between items-center">
          <div className="relative w-full md:w-96">
            <input
              type="text"
              placeholder="Search by keywords, location, building..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full pl-9 pr-4 py-2.5 text-xs rounded-xl border focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors ${
                isDarkMode
                  ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-500'
                  : 'bg-slate-50 border-slate-300 text-slate-900'
              }`}
            />
            <svg className="w-4 h-4 text-slate-400 absolute left-3 top-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto">
            <button
              onClick={() => onNavigate('graphify')}
              className={`flex-1 md:flex-none px-4 py-2.5 rounded-xl text-xs font-bold border transition flex items-center justify-center gap-1.5 ${
                isDarkMode
                  ? 'bg-indigo-950/50 hover:bg-indigo-900/50 text-indigo-300 border-indigo-800'
                  : 'bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border-indigo-200'
              }`}
            >
              <span>🕸️</span>
              <span>Open Graphify</span>
            </button>

            <button
              onClick={() => onNavigate('new')}
              className="flex-1 md:flex-none px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-600/20 transition flex items-center justify-center gap-1.5"
            >
              <span>+</span>
              <span>New Issue Report</span>
            </button>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400 font-medium">Category:</span>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className={`border rounded-lg px-2.5 py-1 text-xs focus:ring-2 focus:ring-indigo-500 outline-none ${
                isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-700'
              }`}
            >
              <option value="All">All Categories</option>
              <option value="Plumbing">Plumbing</option>
              <option value="Electrical">Electrical</option>
              <option value="Cleaning">Cleaning</option>
              <option value="Infrastructure">Infrastructure</option>
              <option value="Furniture">Furniture</option>
              <option value="Safety">Safety</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-slate-400 font-medium">Priority:</span>
            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              className={`border rounded-lg px-2.5 py-1 text-xs focus:ring-2 focus:ring-indigo-500 outline-none ${
                isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-700'
              }`}
            >
              <option value="All">All Priorities</option>
              <option value="Urgent">Urgent</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-slate-400 font-medium">Status:</span>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className={`border rounded-lg px-2.5 py-1 text-xs focus:ring-2 focus:ring-indigo-500 outline-none ${
                isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-700'
              }`}
            >
              <option value="All">All Statuses</option>
              <option value="Submitted">Submitted</option>
              <option value="In Review">In Review</option>
              <option value="Assigned">Assigned</option>
              <option value="In Progress">In Progress</option>
              <option value="Resolved">Resolved</option>
              <option value="Dismissed">Dismissed</option>
            </select>
          </div>
        </div>
      </div>

      {/* Reports Grid */}
      {loading ? (
        <div className="text-center py-16">
          <div className="inline-block animate-spin w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full mb-3" />
          <p className="text-xs text-slate-400">Loading campus reports...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className={`text-center py-16 rounded-2xl border ${
          isDarkMode ? 'bg-slate-900 border-slate-800 text-slate-400' : 'bg-white border-slate-200 text-slate-500'
        }`}>
          <p className="text-sm font-semibold">No campus reports match your filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((rep) => (
            <ReportCard
              key={rep.id}
              report={rep}
              onClick={(id) => onNavigate('details', id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
