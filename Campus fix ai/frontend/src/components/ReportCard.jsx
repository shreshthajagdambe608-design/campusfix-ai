import React from 'react';
import { PriorityBadge, CategoryBadge, StatusBadge } from './StatusBadge';

export default function ReportCard({ report, onClick }) {
  const ai = report.ai_analysis || {};

  return (
    <div
      onClick={() => onClick(report.id)}
      className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-sm hover:shadow-lg dark:hover:shadow-indigo-950/30 hover:border-indigo-400 dark:hover:border-indigo-500/60 transition-all duration-200 cursor-pointer flex flex-col justify-between group"
    >
      <div>
        <div className="flex items-center justify-between gap-2 mb-2.5">
          <span className="text-xs font-mono font-semibold text-slate-400 dark:text-slate-500">
            #{report.id}
          </span>
          <div className="flex items-center gap-1.5">
            <CategoryBadge category={ai.category} />
            <PriorityBadge priority={ai.priority} />
          </div>
        </div>

        <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-1">
          {ai.title || report.user_description || 'Maintenance Issue'}
        </h3>

        <p className="text-xs text-slate-600 dark:text-slate-400 mt-1.5 line-clamp-2">
          {ai.description || report.user_description}
        </p>

        <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mt-3.5">
          <svg className="w-3.5 h-3.5 text-slate-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span className={`truncate font-medium ${report.user_location === 'Unknown' ? 'italic text-amber-500' : ''}`}>
            {report.user_location || 'Unknown'}
          </span>
        </div>
      </div>

      <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800/80 pt-3 mt-4">
        <StatusBadge status={report.status} />
        <span className="text-[11px] text-slate-400 dark:text-slate-500">
          {report.created_at?.split(' ')[0] || 'Today'}
        </span>
      </div>
    </div>
  );
}
