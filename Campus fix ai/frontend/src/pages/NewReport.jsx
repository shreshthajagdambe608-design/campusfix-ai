import React, { useState } from 'react';
import ImageUploader from '../components/ImageUploader';
import AIAnalysisPanel from '../components/AIAnalysisPanel';
import { analyzeIssue, submitReport } from '../services/api';

export default function NewReport({ onNavigate, onReportSubmitted }) {
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [imageBase64, setImageBase64] = useState(null);
  
  const [analyzing, setAnalyzing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [potentialDuplicates, setPotentialDuplicates] = useState([]);
  const [error, setError] = useState(null);

  const handleRunAnalysis = async (e) => {
    e?.preventDefault();
    if (!description.trim() && !imageBase64) {
      setError('Please provide at least a photo or a written description of the issue.');
      return;
    }

    setError(null);
    setAnalyzing(true);
    try {
      const res = await analyzeIssue({
        description,
        location: location.trim() ? location.trim() : null,
        image_base64: imageBase64
      });
      setAnalysisResult(res.ai_analysis);
      setPotentialDuplicates(res.potential_duplicates || []);
    } catch (err) {
      setError('Failed to run Gemma AI analysis. Please verify your connection.');
      console.error(err);
    } finally {
      setAnalyzing(false);
    }
  };

  const handleFinalSubmit = async () => {
    if (!analysisResult) return;
    setSubmitting(true);
    try {
      const saved = await submitReport({
        user_description: description,
        user_location: location.trim() || 'Unknown',
        image_data: imageBase64,
        ai_analysis: analysisResult
      });
      if (onReportSubmitted) {
        onReportSubmitted(saved.id);
      } else {
        onNavigate('details', saved.id);
      }
    } catch (err) {
      setError('Failed to submit report. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Report a Campus Issue</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            CampusFix AI uses Gemma to structure and triage maintenance tickets for facilities staff.
          </p>
        </div>
        <button
          onClick={() => onNavigate('dashboard')}
          className="text-xs text-slate-600 hover:text-slate-900 px-3 py-1.5 border border-slate-200 rounded-lg hover:bg-slate-50 transition"
        >
          Cancel
        </button>
      </div>

      {error && (
        <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => setError(null)} className="font-bold ml-2">✕</button>
        </div>
      )}

      {/* Input Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
            1. Report Details
          </h3>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wide mb-1">
              Issue Description <span className="text-indigo-600">*</span>
            </label>
            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe what's wrong (e.g. Faucet in 2nd floor bathroom won't turn off, water puddling on floor...)"
              className="w-full p-3 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wide mb-1">
              Campus Location <span className="text-slate-400 font-normal lowercase">(Optional)</span>
            </label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. Science Hall, Room 204 or Library 1st Floor"
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              If omitted, Gemma will mark location as "Unknown".
            </p>
          </div>

          <ImageUploader
            imageBase64={imageBase64}
            onImageSelected={(b64) => setImageBase64(b64)}
            onImageRemoved={() => setImageBase64(null)}
          />

          <button
            type="button"
            disabled={analyzing}
            onClick={handleRunAnalysis}
            className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm rounded-xl shadow transition flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {analyzing ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Analyzing with Gemma AI...</span>
              </>
            ) : (
              <>
                <span>✨</span>
                <span>Analyze with Gemma AI</span>
              </>
            )}
          </button>
        </div>

        {/* Right side: AI Analysis preview */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-slate-900">
            2. Structured AI Recommendation
          </h3>

          {analysisResult ? (
            <div className="space-y-4">
              <AIAnalysisPanel
                analysis={analysisResult}
                duplicates={potentialDuplicates}
              />

              <button
                type="button"
                disabled={submitting}
                onClick={handleFinalSubmit}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl shadow-md transition flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {submitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Transmitting to Facilities...</span>
                  </>
                ) : (
                  <>
                    <span>🚀</span>
                    <span>Submit Verified Report to Facilities</span>
                  </>
                )}
              </button>
            </div>
          ) : (
            <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl p-10 text-center text-slate-400 flex flex-col items-center justify-center h-80">
              <div className="w-12 h-12 rounded-full bg-slate-200/60 flex items-center justify-center text-slate-400 mb-3 text-xl">
                🤖
              </div>
              <p className="text-sm font-medium text-slate-600">No Analysis Yet</p>
              <p className="text-xs text-slate-400 max-w-xs mt-1">
                Enter your issue description or attach a photo, then click "Analyze with Gemma AI" to generate the structured maintenance ticket.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
