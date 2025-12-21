
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
    <div className="max-w-5xl mx-auto p-4 sm:p-12 animate-fadeIn pb-24 sm:pb-12">
      <div className="bg-white rounded-[2rem] sm:rounded-[2.5rem] shadow-xl shadow-indigo-100/50 border border-slate-100 p-6 sm:p-12 mb-8 overflow-hidden relative">
        <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-50 rounded-full -translate-y-1/2 translate-x-1/2 -z-10 opacity-40"></div>
        
        <div className="flex items-center space-x-4 mb-6 sm:mb-8">
          <div className="w-12 h-12 sm:w-14 sm:h-14 bg-indigo-600 rounded-xl sm:rounded-2xl flex items-center justify-center text-white shadow-lg">
            <i className="fas fa-landmark-flag text-xl sm:text-2xl"></i>
          </div>
          <div>
            <h2 className="text-xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Heritage Explorer</h2>
            <p className="text-xs sm:text-sm text-slate-500 font-medium">Archive search grounding</p>
          </div>
        </div>

        <form onSubmit={handleSearch} className="flex flex-col sm:relative gap-3">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search lineage history..."
            className="w-full px-5 sm:pl-6 sm:pr-48 py-4 sm:py-5 rounded-2xl sm:rounded-3xl border-2 border-slate-100 focus:border-indigo-500 outline-none transition-all text-sm sm:text-lg bg-slate-50/50"
          />
          <button
            type="submit"
            disabled={loading || !query.trim()}
            className="sm:absolute sm:right-3 sm:top-1/2 sm:-translate-y-1/2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 sm:px-8 py-4 rounded-xl sm:rounded-2xl transition-all disabled:bg-slate-200 font-bold flex items-center justify-center space-x-2 active:scale-95 shadow-lg"
          >
            {loading ? (
              <>
                <i className="fas fa-circle-notch animate-spin"></i>
                <span className="text-xs sm:text-base">Searching...</span>
              </>
            ) : (
              <>
                <i className="fas fa-magnifying-glass"></i>
                <span className="text-xs sm:text-base">Search Archives</span>
              </>
            )}
          </button>
        </form>
      </div>

      {result && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start">
          <div className="lg:col-span-8 bg-white rounded-[1.5rem] sm:rounded-[2rem] shadow-md border border-slate-100 p-6 sm:p-10 text-slate-700">
            <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center">
                <i className="fas fa-scroll mr-3 text-amber-500"></i>
                Archive Findings
            </h3>
            <div className="text-sm sm:text-lg text-slate-600 leading-relaxed whitespace-pre-wrap">
              {result.text}
            </div>
          </div>
          
          <div className="lg:col-span-4 space-y-4 sm:space-y-6">
            <div className="bg-indigo-600 rounded-[1.5rem] sm:rounded-[2rem] p-6 sm:p-8 text-white shadow-lg">
              <h3 className="text-sm sm:text-lg font-extrabold mb-4 sm:mb-6 flex items-center">
                <i className="fas fa-link mr-3 opacity-70"></i> Sources Verified
              </h3>
              <div className="space-y-2">
                {result.sources.length > 0 ? result.sources.map((src, i) => (
                  <a 
                    key={i} 
                    href={src.uri} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center p-3 sm:p-4 bg-white/10 hover:bg-white/20 rounded-xl sm:rounded-2xl border border-white/10 transition-all text-xs"
                  >
                    <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center mr-3 shrink-0">
                      <i className="fas fa-globe text-[10px]"></i>
                    </div>
                    <span className="font-bold truncate">{src.title}</span>
                  </a>
                )) : (
                  <p className="text-[10px] opacity-60 italic">No external links found.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Researcher;
