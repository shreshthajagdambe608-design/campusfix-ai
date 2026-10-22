import React, { useState, useEffect } from 'react';
import Dashboard from './pages/Dashboard';
import NewReport from './pages/NewReport';
import ReviewReport from './pages/ReviewReport';
import ReportDetails from './pages/ReportDetails';
import GraphifyView from './pages/GraphifyView';

export default function App() {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [selectedReportId, setSelectedReportId] = useState(null);
  const [darkMode, setDarkMode] = useState(false);

  // Sync dark class on html document
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const navigateTo = (page, reportId = null) => {
    setSelectedReportId(reportId);
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className={`min-h-screen flex flex-col font-sans transition-colors duration-200 ${
      darkMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'
    }`}>
      {/* Top Navigation Bar with Glassmorphic Blur */}
      <header className={`sticky top-0 z-40 border-b backdrop-blur-md transition-colors ${
        darkMode
          ? 'bg-slate-900/80 border-slate-800'
          : 'bg-white/90 border-slate-200'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div
            onClick={() => navigateTo('dashboard')}
            className="flex items-center gap-2.5 cursor-pointer group"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-500 flex items-center justify-center text-white font-black text-lg shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform">
              CF
            </div>
            <div>
              <span className={`font-black text-base tracking-tight ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                CampusFix <span className="text-indigo-500">AI</span>
              </span>
              <span className={`hidden sm:inline-block ml-2 text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                darkMode ? 'bg-indigo-950/60 text-indigo-400 border-indigo-800' : 'bg-indigo-50 text-indigo-700 border-indigo-200'
              }`}>
                Gemma 4 E4B
              </span>
            </div>
          </div>

          <nav className="flex items-center gap-1.5 sm:gap-2">
            <button
              onClick={() => navigateTo('dashboard')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                currentPage === 'dashboard'
                  ? (darkMode ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30' : 'bg-indigo-50 text-indigo-700')
                  : (darkMode ? 'text-slate-400 hover:text-white hover:bg-slate-800' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100')
              }`}
            >
              Dashboard
            </button>

            <button
              onClick={() => navigateTo('graphify')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                currentPage === 'graphify'
                  ? (darkMode ? 'bg-indigo-600/30 text-indigo-300 border border-indigo-500/50 shadow-sm shadow-indigo-500/20' : 'bg-indigo-100 text-indigo-800 border border-indigo-200')
                  : (darkMode ? 'text-slate-400 hover:text-white hover:bg-slate-800' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100')
              }`}
            >
              <span>🕸️</span>
              <span>Graphify</span>
            </button>

            <button
              onClick={() => navigateTo('review')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                currentPage === 'review'
                  ? (darkMode ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30' : 'bg-indigo-50 text-indigo-700')
                  : (darkMode ? 'text-slate-400 hover:text-white hover:bg-slate-800' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100')
              }`}
            >
              Staff Triage
            </button>

            {/* Dark Mode Toggle Button */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              className={`p-1.5 rounded-lg border text-sm transition ${
                darkMode
                  ? 'bg-slate-800 border-slate-700 text-amber-400 hover:bg-slate-700'
                  : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {darkMode ? '☀️' : '🌙'}
            </button>

            <button
              onClick={() => navigateTo('new')}
              className="ml-1 sm:ml-2 px-3.5 py-1.5 rounded-lg text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-600/20 transition flex items-center gap-1 hover:scale-102"
            >
              <span>+</span>
              <span>Report Issue</span>
            </button>
          </nav>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {currentPage === 'dashboard' && (
          <Dashboard onNavigate={navigateTo} isDarkMode={darkMode} />
        )}
        {currentPage === 'graphify' && (
          <GraphifyView onNavigate={navigateTo} isDarkMode={darkMode} />
        )}
        {currentPage === 'new' && (
          <NewReport
            onNavigate={navigateTo}
            onReportSubmitted={(id) => navigateTo('details', id)}
            isDarkMode={darkMode}
          />
        )}
        {currentPage === 'review' && (
          <ReviewReport onNavigate={navigateTo} isDarkMode={darkMode} />
        )}
        {currentPage === 'details' && (
          <ReportDetails
            reportId={selectedReportId}
            onNavigate={navigateTo}
            isDarkMode={darkMode}
          />
        )}
      </main>

      {/* Footer */}
      <footer className={`border-t py-4 text-center text-xs transition-colors ${
        darkMode ? 'bg-slate-900/60 border-slate-800 text-slate-400' : 'bg-white border-slate-200 text-slate-500'
      }`}>
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>© 2026 CampusFix AI • Powered by Google Gemma 4 & Graphify</p>
          <div className="flex items-center gap-3 text-[11px] text-slate-400">
            <span>Graphify Topology Active</span>
            <span>•</span>
            <span>Gemma 4 E4B Compliant</span>
            <span>•</span>
            <span>Dark Theme Ready</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
