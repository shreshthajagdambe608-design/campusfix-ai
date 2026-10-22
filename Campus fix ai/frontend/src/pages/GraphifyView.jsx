import React, { useState, useEffect, useRef } from 'react';
import { fetchGraphifyData } from '../services/api';

export default function GraphifyView({ onNavigate, isDarkMode = false }) {
  const [graphData, setGraphData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedNode, setSelectedNode] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [physicsEnabled, setPhysicsEnabled] = useState(true);
  const [filterType, setFilterType] = useState('all');

  const containerRef = useRef(null);
  const networkRef = useRef(null);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const data = await fetchGraphifyData();
        setGraphData(data);
      } catch (err) {
        console.error('Failed to load Graphify data', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Initialize or re-render network when graphData or isDarkMode changes
  useEffect(() => {
    if (!graphData || !containerRef.current) return;

    // Dynamically ensure vis-network is loaded if not already in window
    const initNetwork = () => {
      if (!window.vis) {
        const script = document.createElement('script');
        script.src = 'https://unpkg.com/vis-network/standalone/umd/vis-network.min.js';
        script.onload = () => renderVis();
        document.head.appendChild(script);
      } else {
        renderVis();
      }
    };

    const renderVis = () => {
      // Filter nodes based on search and type
      let filteredNodes = graphData.nodes.filter((n) => {
        if (filterType !== 'all' && n.group !== filterType) return false;
        if (searchQuery.trim() && !n.label.toLowerCase().includes(searchQuery.toLowerCase())) return false;
        return true;
      });

      const allowedIds = new Set(filteredNodes.map((n) => n.id));
      const filteredEdges = graphData.edges.filter(
        (e) => allowedIds.has(e.from) && allowedIds.has(e.to)
      );

      // Customize node colors/styles for theme
      const themedNodes = filteredNodes.map((n) => {
        const copy = { ...n };
        if (isDarkMode) {
          if (n.group === 'location') {
            copy.color = { background: '#6366f1', border: '#818cf8' };
            copy.font = { color: '#ffffff' };
          } else if (n.group === 'category') {
            copy.font = { color: '#f1f5f9', bold: true };
          }
        }
        return copy;
      });

      const themedEdges = filteredEdges.map((e) => {
        const copy = { ...e };
        if (isDarkMode && !copy.dashes) {
          copy.color = { color: '#475569', opacity: 0.6 };
        }
        return copy;
      });

      const data = {
        nodes: new window.vis.DataSet(themedNodes),
        edges: new window.vis.DataSet(themedEdges)
      };

      const options = {
        nodes: {
          borderWidth: 2,
          shadow: { enabled: true, color: isDarkMode ? 'rgba(0,0,0,0.5)' : 'rgba(0,0,0,0.1)', size: 8 }
        },
        edges: {
          smooth: { type: 'continuous' },
          font: { size: 10, align: 'middle', color: isDarkMode ? '#94a3b8' : '#64748b' }
        },
        physics: {
          enabled: physicsEnabled,
          barnesHut: { gravitationalConstant: -2800, springLength: 95, springConstant: 0.04 },
          stabilization: { iterations: 120 }
        },
        interaction: { hover: true, navigationButtons: true, keyboard: true }
      };

      if (networkRef.current) {
        networkRef.current.destroy();
      }

      const network = new window.vis.Network(containerRef.current, data, options);
      networkRef.current = network;

      network.on('click', (params) => {
        if (params.nodes.length > 0) {
          const clickedId = params.nodes[0];
          const node = graphData.nodes.find((n) => n.id === clickedId);
          setSelectedNode(node || null);
        } else {
          setSelectedNode(null);
        }
      });
    };

    initNetwork();

    return () => {
      if (networkRef.current) networkRef.current.destroy();
    };
  }, [graphData, isDarkMode, filterType, searchQuery]);

  const togglePhysics = () => {
    const newState = !physicsEnabled;
    setPhysicsEnabled(newState);
    if (networkRef.current) {
      networkRef.current.setOptions({ physics: { enabled: newState } });
    }
  };

  const handleZoomFit = () => {
    if (networkRef.current) {
      networkRef.current.fit({ animation: { duration: 800, easingFunction: 'easeInOutQuad' } });
    }
  };

  const stats = graphData?.statistics || {};

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className={`p-6 rounded-2xl border transition-colors ${
        isDarkMode
          ? 'bg-slate-900/80 border-slate-800 text-white shadow-xl shadow-indigo-950/20'
          : 'bg-white border-slate-200 text-slate-900 shadow-sm'
      }`}>
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-500 border border-indigo-500/20">
                Graphify Engine v1.0
              </span>
              <span className="text-xs text-slate-400">Campus Facilities Knowledge Graph</span>
            </div>
            <h1 className="text-2xl font-black tracking-tight mt-1">
              Topological Incident Network
            </h1>
            <p className={`text-xs mt-1 max-w-xl ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
              Interactive relationship graph mapping campus problems, building communities, maintenance categories, and duplicate cluster links.
            </p>
          </div>

          {/* Quick Metrics Bar */}
          <div className="flex flex-wrap items-center gap-3">
            <div className={`px-3 py-2 rounded-xl border text-center ${
              isDarkMode ? 'bg-slate-800/80 border-slate-700' : 'bg-slate-50 border-slate-200'
            }`}>
              <p className="text-[10px] uppercase font-bold text-slate-400">Total Nodes</p>
              <p className="text-lg font-black text-indigo-500">{stats.total_nodes || 0}</p>
            </div>
            <div className={`px-3 py-2 rounded-xl border text-center ${
              isDarkMode ? 'bg-slate-800/80 border-slate-700' : 'bg-slate-50 border-slate-200'
            }`}>
              <p className="text-[10px] uppercase font-bold text-slate-400">Edges</p>
              <p className="text-lg font-black text-emerald-500">{stats.total_edges || 0}</p>
            </div>
            <div className={`px-3 py-2 rounded-xl border text-center ${
              isDarkMode ? 'bg-slate-800/80 border-slate-700' : 'bg-slate-50 border-slate-200'
            }`}>
              <p className="text-[10px] uppercase font-bold text-slate-400">Communities</p>
              <p className="text-lg font-black text-amber-500">{stats.building_clusters || 0}</p>
            </div>
            <div className="px-3.5 py-2 rounded-xl border border-rose-500/30 bg-rose-500/10 text-center">
              <p className="text-[10px] uppercase font-bold text-rose-400">Primary Hotspot</p>
              <p className="text-sm font-bold text-rose-500 truncate max-w-[130px]">
                {stats.hotspot_building || 'None'}
              </p>
            </div>
          </div>
        </div>

        {/* Graph Controls Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-5 mt-5 border-t border-slate-200/40 dark:border-slate-800">
          <div className="flex flex-wrap items-center gap-2">
            <input
              type="text"
              placeholder="Search nodes (e.g. Science, Leak)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`px-3 py-1.5 text-xs rounded-lg border focus:ring-2 focus:ring-indigo-500 outline-none w-56 ${
                isDarkMode
                  ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-500'
                  : 'bg-white border-slate-300 text-slate-900'
              }`}
            />

            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className={`px-3 py-1.5 text-xs rounded-lg border focus:ring-2 focus:ring-indigo-500 outline-none ${
                isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'
              }`}
            >
              <option value="all">All Node Types</option>
              <option value="report">Incident Tickets</option>
              <option value="location">Campus Buildings</option>
              <option value="category">Categories</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={togglePhysics}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition ${
                physicsEnabled
                  ? (isDarkMode ? 'bg-indigo-900/40 text-indigo-400 border-indigo-700' : 'bg-indigo-50 text-indigo-700 border-indigo-200')
                  : (isDarkMode ? 'bg-slate-800 text-slate-400 border-slate-700' : 'bg-slate-100 text-slate-600 border-slate-300')
              }`}
            >
              {physicsEnabled ? '⏸ Pause Physics' : '▶ Enable Physics'}
            </button>

            <button
              onClick={handleZoomFit}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition ${
                isDarkMode ? 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700' : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300'
              }`}
            >
              ⛶ Zoom Fit
            </button>

            <a
              href="http://localhost:8000/api/graphify"
              target="_blank"
              rel="noreferrer"
              className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm transition"
            >
              Export JSON
            </a>
          </div>
        </div>
      </div>

      {/* Main Canvas & Inspector Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Graph Canvas */}
        <div className={`lg:col-span-3 rounded-2xl border overflow-hidden relative shadow-md transition-colors ${
          isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'
        }`}>
          {loading && (
            <div className={`absolute inset-0 z-20 flex flex-col items-center justify-center backdrop-blur-sm ${
              isDarkMode ? 'bg-slate-950/80 text-white' : 'bg-white/80 text-slate-700'
            }`}>
              <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-2" />
              <p className="text-xs font-semibold">Graphifying Campus Maintenance Incidents...</p>
            </div>
          )}
          <div ref={containerRef} className="w-full h-[620px]" />
        </div>

        {/* Side Inspector Panel */}
        <div className={`p-5 rounded-2xl border space-y-4 h-fit transition-colors shadow-sm ${
          isDarkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
        }`}>
          <div className="flex items-center justify-between border-b pb-3 border-slate-200/50 dark:border-slate-800">
            <h3 className="font-bold text-sm">Node Inspector</h3>
            {selectedNode && (
              <button
                onClick={() => setSelectedNode(null)}
                className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                Clear
              </button>
            )}
          </div>

          {selectedNode ? (
            <div className="space-y-3.5 text-xs">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Node Type</span>
                <p className="font-bold text-indigo-500 uppercase mt-0.5">{selectedNode.group}</p>
              </div>

              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Label</span>
                <p className="font-bold text-sm mt-0.5">{selectedNode.label}</p>
              </div>

              {selectedNode.data ? (
                <>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Priority & Status</span>
                    <p className="font-semibold mt-0.5">
                      <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                        selectedNode.data.priority === 'Urgent' ? 'bg-red-500/20 text-red-500 border border-red-500/30' :
                        selectedNode.data.priority === 'High' ? 'bg-orange-500/20 text-orange-500 border border-orange-500/30' :
                        'bg-blue-500/20 text-blue-500 border border-blue-500/30'
                      }`}>
                        {selectedNode.data.priority}
                      </span>
                      <span className="ml-2 text-slate-400">• {selectedNode.data.status}</span>
                    </p>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Location</span>
                    <p className="font-medium mt-0.5">{selectedNode.data.location}</p>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Next Action</span>
                    <p className={`p-2 rounded mt-0.5 text-[11px] ${
                      isDarkMode ? 'bg-slate-800/80 text-slate-300' : 'bg-slate-100 text-slate-700'
                    }`}>
                      {selectedNode.data.action || 'Inspect on-site'}
                    </p>
                  </div>

                  <button
                    onClick={() => onNavigate('details', selectedNode.data.id)}
                    className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow transition mt-2"
                  >
                    Open Ticket #{selectedNode.data.id}
                  </button>
                </>
              ) : (
                <div className={`p-3 rounded-xl border text-[11px] ${
                  isDarkMode ? 'bg-slate-800/60 border-slate-700 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-600'
                }`}>
                  <p className="font-semibold">Central Hub Node</p>
                  <p className="mt-1">This node aggregates multiple maintenance reports across the campus facilities network.</p>
                </div>
              )}
            </div>
          ) : (
            <div className="py-10 text-center text-slate-400 text-xs space-y-2">
              <span className="text-3xl block">🖱️</span>
              <p className="font-semibold">Interactive Selection</p>
              <p className="text-[11px] max-w-[200px] mx-auto">
                Click any incident dot, building box, or category diamond to inspect relationships and duplicates.
              </p>
            </div>
          )}

          {/* Visual Legend */}
          <div className="border-t pt-4 border-slate-200/50 dark:border-slate-800 text-[11px] space-y-1.5 text-slate-400">
            <p className="font-bold uppercase text-[10px] text-slate-500">Legend</p>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 shadow-sm shadow-red-500/50"></span>
              <span className="text-slate-600 dark:text-slate-300">Urgent Ticket</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-orange-500"></span>
              <span className="text-slate-600 dark:text-slate-300">High Priority Ticket</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
              <span className="text-slate-600 dark:text-slate-300">Routine / Low Ticket</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 bg-indigo-600 rounded"></span>
              <span className="text-slate-600 dark:text-slate-300">Campus Building Node</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rotate-45 bg-teal-500"></span>
              <span className="text-slate-600 dark:text-slate-300">Category Node</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-4 border-t-2 border-dashed border-red-500"></span>
              <span className="text-slate-600 dark:text-slate-300">Duplicate Match Link</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
