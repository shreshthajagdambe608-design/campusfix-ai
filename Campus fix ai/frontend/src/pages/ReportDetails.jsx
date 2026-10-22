import React, { useState, useEffect } from 'react';
import { fetchReportById, updateReport, deleteReport } from '../services/api';
import AIAnalysisPanel from '../components/AIAnalysisPanel';
import { StatusBadge, PriorityBadge, CategoryBadge } from '../components/StatusBadge';

export default function ReportDetails({ reportId, onNavigate }) {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [status, setStatus] = useState('');
  const [assignedTo, setAssignedTo] = useState('');
  const [staffNotes, setStaffNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const data = await fetchReportById(reportId);
        setReport(data);
        setStatus(data.status);
        setAssignedTo(data.assigned_to || '');
        setStaffNotes(data.staff_notes || '');
      } catch (err) {
        setError('Failed to load report details.');
      } finally {
        setLoading(false);
      }
    }
    if (reportId) load();
  }, [reportId]);

  const handleSaveUpdates = async () => {
    setSaving(true);
    setSaveSuccess(false);
    try {
      const updated = await updateReport(reportId, {
        status,
        assigned_to: assignedTo,
        staff_notes: staffNotes
      });
      setReport(updated);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      alert('Failed to update ticket.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this campus report?')) return;
    try {
      await deleteReport(reportId);
      onNavigate('dashboard');
    } catch (err) {
      alert('Failed to delete report.');
    }
  };

  if (loading) {
    return (
      <div className="text-center py-20">
        <div className="inline-block animate-spin w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full mb-3" />
        <p className="text-sm text-slate-500">Loading ticket details...</p>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="p-8 text-center bg-white rounded-xl border border-slate-200">
        <p className="text-rose-600 text-sm mb-4">{error || 'Ticket not found.'}</p>
        <button
          onClick={() => onNavigate('dashboard')}
          className="px-4 py-2 bg-indigo-600 text-white text-xs font-semibold rounded-lg"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  const ai = report.ai_analysis || {};

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate('dashboard')}
            className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600 transition"
          >
            ← Back
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-slate-400">
                #{report.id}
              </span>
              <StatusBadge status={report.status} />
              <CategoryBadge category={ai.category} />
              <PriorityBadge priority={ai.priority} />
            </div>
            <h1 className="text-xl font-bold text-slate-900 mt-1">
              {ai.title || report.user_description}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleDelete}
            className="px-3 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 border border-rose-200 rounded-lg transition"
          >
            Delete Ticket
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: AI Analysis and Student Report */}
        <div className="lg:col-span-2 space-y-6">
          {/* AI Structured Card */}
          <AIAnalysisPanel
            analysis={ai}
            duplicates={report.potential_duplicates || []}
          />

          {/* Original Student Submission */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
              Original Student Submission
            </h3>

            <div>
              <label className="text-xs font-semibold text-slate-400 uppercase">
                Submitted Description
              </label>
              <p className="text-sm text-slate-800 mt-1 bg-slate-50 p-3 rounded-lg border border-slate-100">
                "{report.user_description}"
              </p>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-400 uppercase">
                Submitted Location
              </label>
              <p className="text-sm font-medium text-slate-800 mt-1">
                📍 {report.user_location || 'Unknown'}
              </p>
            </div>

            {report.image_data && (
              <div>
                <label className="text-xs font-semibold text-slate-400 uppercase mb-2 block">
                  Attached Photo Evidence
                </label>
                <div className="rounded-xl overflow-hidden border border-slate-200 bg-slate-900 max-h-80 flex items-center justify-center">
                  <img
                    src={report.image_data}
                    alt="Campus problem evidence"
                    className="w-full h-auto max-h-80 object-contain"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Maintenance Staff Actions & Dispatch */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
              Facilities Staff Actions
            </h3>

            {saveSuccess && (
              <div className="p-2.5 bg-emerald-50 text-emerald-800 text-xs rounded-lg border border-emerald-200 font-medium text-center">
                ✓ Ticket successfully updated
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                Ticket Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full text-sm border border-slate-300 rounded-lg p-2 bg-white"
              >
                <option value="Submitted">Submitted</option>
                <option value="In Review">In Review</option>
                <option value="Assigned">Assigned</option>
                <option value="In Progress">In Progress</option>
                <option value="Resolved">Resolved</option>
                <option value="Dismissed">Dismissed</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                Assigned Technician / Team
              </label>
              <input
                type="text"
                value={assignedTo}
                onChange={(e) => setAssignedTo(e.target.value)}
                placeholder="e.g. Electrical Squad B / Lead Plumber"
                className="w-full text-sm border border-slate-300 rounded-lg p-2"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                Internal Staff Notes
              </label>
              <textarea
                rows={3}
                value={staffNotes}
                onChange={(e) => setStaffNotes(e.target.value)}
                placeholder="e.g. Dispatched technician with replacement valve..."
                className="w-full text-sm border border-slate-300 rounded-lg p-2"
              />
            </div>

            <button
              onClick={handleSaveUpdates}
              disabled={saving}
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm rounded-lg shadow transition disabled:opacity-50"
            >
              {saving ? 'Updating...' : 'Save Staff Changes'}
            </button>
          </div>

          {/* Quick Info Box */}
          <div className="bg-slate-50 rounded-xl border border-slate-200 p-4 text-xs space-y-2 text-slate-600">
            <p className="font-semibold text-slate-800">CampusFix AI Metadata</p>
            <div className="flex justify-between">
              <span>Created Timestamp:</span>
              <span className="font-mono text-slate-700">{report.created_at}</span>
            </div>
            <div className="flex justify-between">
              <span>Model Architecture:</span>
              <span className="font-mono text-slate-700">Gemma Open Weights</span>
            </div>
            <div className="flex justify-between">
              <span>Schema Format:</span>
              <span className="text-emerald-700 font-medium">Valid JSON 1.0</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
