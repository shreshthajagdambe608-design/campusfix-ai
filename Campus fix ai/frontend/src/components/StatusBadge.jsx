import React from 'react';

export function PriorityBadge({ priority }) {
  const p = (priority || 'Low').toLowerCase();
  
  const styles = {
    urgent: 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/30 font-bold animate-pulse',
    high: 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/30 font-semibold',
    medium: 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/30 font-medium',
    low: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30 font-medium'
  };

  const style = styles[p] || styles.low;

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs border ${style}`}>
      <span className={`w-1.5 h-1.5 mr-1.5 rounded-full ${
        p === 'urgent' ? 'bg-red-500' : p === 'high' ? 'bg-orange-500' : p === 'medium' ? 'bg-amber-500' : 'bg-blue-500'
      }`} />
      {priority || 'Low'}
    </span>
  );
}

export function CategoryBadge({ category }) {
  const colors = {
    Plumbing: 'bg-cyan-500/10 text-cyan-700 dark:text-cyan-400 border-cyan-500/30',
    Electrical: 'bg-yellow-500/10 text-yellow-800 dark:text-yellow-400 border-yellow-500/30',
    Cleaning: 'bg-teal-500/10 text-teal-700 dark:text-teal-400 border-teal-500/30',
    Infrastructure: 'bg-stone-500/10 text-stone-700 dark:text-stone-300 border-stone-500/30',
    Furniture: 'bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border-indigo-500/30',
    Safety: 'bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/30',
    Other: 'bg-slate-500/10 text-slate-700 dark:text-slate-300 border-slate-500/30'
  };

  const style = colors[category] || colors.Other;

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-lg text-xs font-semibold border ${style}`}>
      {category || 'Other'}
    </span>
  );
}

export function StatusBadge({ status }) {
  const styles = {
    'Submitted': 'bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/30',
    'In Review': 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/30',
    'Assigned': 'bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border-indigo-500/30',
    'In Progress': 'bg-amber-500/10 text-amber-800 dark:text-amber-400 border-amber-500/30 font-semibold',
    'Resolved': 'bg-emerald-500/10 text-emerald-800 dark:text-emerald-400 border-emerald-500/30 font-bold',
    'Dismissed': 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/30'
  };

  const style = styles[status] || styles['Submitted'];

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${style}`}>
      {status || 'Submitted'}
    </span>
  );
}
