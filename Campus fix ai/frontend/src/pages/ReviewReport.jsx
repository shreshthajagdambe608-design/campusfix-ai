import React, { useState, useEffect } from 'react';
import { fetchReports, updateReport } from '../services/api';
import { StatusBadge, PriorityBadge, CategoryBadge } from '../components/StatusBadge';

export default function ReviewReport({ onNavigate }) {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadPendingReports = async () => {
    setLoading(true);
    try {
      const data = await fetchReports({ status: 'Submitted' });
      setReports(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPendingReports();
  }, []);

  const handleQuickApprove = async (id) => {
    try {
      await updateReport(id, { status: 'Assigned', assigned_to: 'Central Dispatch' });
      loadPendingReports();
    } catch (err) {
      alert('Error updating report');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900">Maintenance Triage & Review Queue</h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Review newly submitted student reports categorized by Gemma AI before dispatching to maintenance teams.
        </p>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full mb-3" />
          <p className="text-sm text-slate-500">Loading pending tickets...</p>
        </div>
      ) : reports.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-2xl border border-slate-200">
          <p className="text-sm text-slate-600 font-medium">All caught up!</p>
          <p className="text-xs text-slate-400 mt-1">No pending unreviewed reports in the triage queue.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-[11px] font-semibold uppercase tracking-wider text-slate-500 border-b border-slate-200">
                <th className="p-4">Ticket</th>
                <th className="p-4">Category & Priority</th>
                <th className="p-4">Reported Issue</th>
                <th className="p-4">Location</th>
                <th className="p-4">Recommended Action</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {reports.map((r) => {
                const ai = r.ai_analysis || {};
                return (
                  <tr key={r.id} className="hover:bg-slate-50/70 transition">
                    <td className="p-4 font-mono font-bold text-slate-500 text-xs">
                      #{r.id}
                    </td>
                    <td className="p-4">
                      <div className="flex flex-col gap-1 items-start">
                        <CategoryBadge category={ai.category} />
                        <PriorityBadge priority={ai.priority} />
                      </div>
                    </td>
                    <td className="p-4">
                      <p className="font-semibold text-slate-900">{ai.title || r.user_description}</p>
                      <p className="text-xs text-slate-500 line-clamp-1">{r.user_description}</p>
                    </td>
                    <td className="p-4 text-xs text-slate-700">
                      <span className={r.user_location === 'Unknown' ? 'italic text-amber-600' : ''}>
                        {r.user_location || 'Unknown'}
                      </span>
                    </td>
                    <td className="p-4 text-xs text-slate-600 max-w-xs">
                      {ai.recommended_action || 'Inspect on-site'}
                    </td>
                    <td className="p-4 text-right space-x-2">
                      <button
                        onClick={() => onNavigate('details', r.id)}
                        className="px-2.5 py-1 text-xs border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-100 transition"
                      >
                        Inspect
                      </button>
                      <button
                        onClick={() => handleQuickApprove(r.id)}
                        className="px-2.5 py-1 text-xs bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
                      >
                        Dispatch
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
