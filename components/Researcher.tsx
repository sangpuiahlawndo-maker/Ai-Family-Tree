
import React, { useState } from 'react';
import { researchFamilyHistory } from '../services/geminiService';
import { GroundingSource } from '../types';

const Researcher: React.FC = () => {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ text: string, sources: GroundingSource[] } | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    setResult(null);
    const data = await researchFamilyHistory(query);
    setResult(data);
    setLoading(false);
  };

  return (
    <div className="max-w-5xl mx-auto p-6 md:p-12 animate-fadeIn">
      <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-indigo-100 border border-slate-100 p-8 md:p-12 mb-10 overflow-hidden relative">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50 rounded-full -translate-y-1/2 translate-x-1/2 -z-10 opacity-50"></div>
        
        <div className="flex items-center space-x-4 mb-8">
          <div className="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-200">
            <i className="fas fa-landmark-flag text-2xl"></i>
          </div>
          <div>
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Heritage Explorer</h2>
            <p className="text-slate-500 font-medium">Global database search for ancestors and events</p>
          </div>
        </div>

        <form onSubmit={handleSearch} className="relative group">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="e.g., 'What was life like for a coal miner in Sheffield in 1890?'"
            className="w-full pl-6 pr-40 py-5 rounded-3xl border-2 border-slate-100 focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50/50 transition-all text-lg placeholder:text-slate-300"
          />
          <button
            type="submit"
            disabled={loading || !query.trim()}
            className="absolute right-3 top-1/2 -translate-y-1/2 bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3.5 rounded-2xl transition-all disabled:bg-slate-200 font-bold flex items-center space-x-2 active:scale-95 shadow-lg shadow-indigo-100"
          >
            {loading ? (
              <>
                <i className="fas fa-circle-notch animate-spin"></i>
                <span>Analyzing Archives...</span>
              </>
            ) : (
              <>
                <i className="fas fa-magnifying-glass"></i>
                <span>Search Archives</span>
              </>
            )}
          </button>
        </form>
      </div>

      {result && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-8 bg-white rounded-[2rem] shadow-xl border border-slate-100 p-10 leading-relaxed text-slate-700 whitespace-pre-wrap relative">
            <div className="prose prose-slate max-w-none">
                <h3 className="text-xl font-bold text-slate-900 mb-4 flex items-center">
                    <i className="fas fa-scroll mr-3 text-amber-500"></i>
                    Archive Findings
                </h3>
                <div className="text-lg text-slate-600 leading-relaxed">
                  {result.text}
                </div>
            </div>
          </div>
          
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-gradient-to-br from-indigo-500 to-violet-600 rounded-[2rem] p-8 text-white shadow-xl shadow-indigo-200">
              <h3 className="text-lg font-extrabold mb-6 flex items-center">
                <i className="fas fa-link mr-3 opacity-70"></i> Sources Verified
              </h3>
              <div className="space-y-3">
                {result.sources.length > 0 ? result.sources.map((src, i) => (
                  <a 
                    key={i} 
                    href={src.uri} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center p-4 bg-white/10 hover:bg-white/20 rounded-2xl border border-white/20 transition-all group backdrop-blur-sm"
                  >
                    <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center mr-4 shrink-0 group-hover:bg-white group-hover:text-indigo-600 transition-colors">
                      <i className="fas fa-globe text-sm"></i>
                    </div>
                    <span className="text-sm font-bold truncate pr-2">{src.title}</span>
                    <i className="fas fa-external-link-alt text-[10px] ml-auto opacity-50"></i>
                  </a>
                )) : (
                  <p className="text-sm opacity-60 italic">No external links found.</p>
                )}
              </div>
            </div>

            <div className="bg-amber-50 rounded-[2rem] p-6 border border-amber-100">
                <h4 className="text-amber-900 font-bold text-sm mb-3 flex items-center uppercase tracking-widest">
                    <i className="fas fa-lightbulb mr-2"></i> Expert Tip
                </h4>
                <p className="text-xs text-amber-800 leading-relaxed">
                    Try searching for specific historical events that coincided with your ancestors' lives to uncover richer context about their daily struggles and triumphs.
                </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Researcher;
