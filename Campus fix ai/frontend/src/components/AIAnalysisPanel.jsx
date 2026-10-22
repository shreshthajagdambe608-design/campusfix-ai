import React from 'react';
import { PriorityBadge, CategoryBadge } from './StatusBadge';

export default function AIAnalysisPanel({ analysis, duplicates = [], onFieldChange, isEditable = false }) {
  if (!analysis) return null;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-5">
      {/* Header bar with badges */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
            Gemma AI Structured Analysis
          </span>
          <h3 className="text-lg font-bold text-slate-900 mt-1">
            {analysis.title || 'Untitled Maintenance Issue'}
          </h3>
        </div>
        <div className="flex items-center gap-2">
          <CategoryBadge category={analysis.category} />
          <PriorityBadge priority={analysis.priority} />
        </div>
      </div>

      {/* Duplicate warning banner */}
      {duplicates && duplicates.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <span className="text-amber-600 text-lg">⚠️</span>
            <div className="flex-1">
              <h4 className="text-sm font-bold text-amber-900">
                Potential Duplicate Report Detected ({Math.round(duplicates[0].similarity_score * 100)}% match)
              </h4>
              <p className="text-xs text-amber-800 mt-0.5">
                Similar issue already recorded: <span className="font-semibold">{duplicates[0].title}</span> at <span className="font-semibold">{duplicates[0].location}</span> (Ticket #{duplicates[0].report_id}).
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Primary fields grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
            Assigned Location
          </label>
          <p className={`text-sm font-medium mt-0.5 ${analysis.location === 'Unknown' ? 'text-amber-600 italic' : 'text-slate-800'}`}>
            {analysis.location === 'Unknown' ? 'Unknown (Not specified in report)' : analysis.location}
          </p>
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
            Priority Rationale
          </label>
          <p className="text-sm font-medium text-slate-800 mt-0.5">
            {analysis.priority === 'Urgent' ? 'Immediate hazard requiring urgent technician dispatch.'
              : analysis.priority === 'High' ? 'Significant disruption or credible safety hazard.'
              : analysis.priority === 'Medium' ? 'Routine campus maintenance issue.'
              : 'Minor cosmetic or low impact issue.'}
          </p>
        </div>
      </div>

      {/* Summary Description */}
      <div>
        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
          Issue Summary
        </label>
        <p className="text-sm text-slate-700 mt-1 bg-slate-50 p-3 rounded-lg border border-slate-100">
          {analysis.description}
        </p>
      </div>

      {/* Visible Observations */}
      <div>
        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
          Visible & Explicit Observations
        </label>
        <ul className="mt-1.5 space-y-1">
          {analysis.observations?.map((obs, idx) => (
            <li key={idx} className="flex items-start text-xs text-slate-700 gap-2">
              <span className="text-indigo-500 font-bold">•</span>
              <span>{obs}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Safety Precaution */}
      {analysis.safety_note && analysis.safety_note !== 'None' && (
        <div className="bg-rose-50 border border-rose-200 rounded-xl p-3.5">
          <div className="flex items-start gap-2.5">
            <span className="text-rose-600 font-bold text-sm">🚨</span>
            <div>
              <p className="text-xs font-bold text-rose-900">Safety Precaution</p>
              <p className="text-xs text-rose-800 mt-0.5">{analysis.safety_note}</p>
            </div>
          </div>
        </div>
      )}

      {/* Practical Action Recommendation */}
      <div className="bg-indigo-50/60 border border-indigo-100 rounded-xl p-4">
        <label className="text-xs font-bold text-indigo-950 uppercase tracking-wide flex items-center gap-1.5">
          <span>🛠️</span> Practical Next Step Recommendation
        </label>
        <p className="text-sm font-medium text-indigo-900 mt-1">
          {analysis.recommended_action}
        </p>
      </div>

      {/* Uncertainty Notice */}
      {analysis.uncertainty && analysis.uncertainty !== 'None' && (
        <div className="text-xs text-slate-500 bg-slate-100/70 p-3 rounded-lg border border-slate-200/60 flex items-start gap-2">
          <span>ℹ️</span>
          <div>
            <span className="font-semibold text-slate-700">Missing Information / Uncertainty:</span>{' '}
            {analysis.uncertainty}
          </div>
        </div>
      )}

      <p className="text-[11px] text-slate-400 italic text-center pt-2 border-t border-slate-100">
        Recommendation generated for human staff review. Not a completed diagnosis or repair.
      </p>
    </div>
  );
}
