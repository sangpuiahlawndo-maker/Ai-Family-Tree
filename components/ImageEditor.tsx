
import React, { useState, useRef } from 'react';
import { editFamilyImage } from '../services/geminiService';

const ImageEditor: React.FC = () => {
  const [image, setImage] = useState<string | null>(null);
  const [prompt, setPrompt] = useState('');
  const [editing, setEditing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => setImage(ev.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleEdit = async (customPrompt?: string) => {
    // Determine which prompt to use: the passed one (for filters/enhancements) or the state (for custom)
    const finalPrompt = (typeof customPrompt === 'string' && customPrompt.length > 0) ? customPrompt : prompt;
    
    if (!image || !finalPrompt.trim()) return;

    setEditing(true);
    try {
      // Robust base64 extraction
      const pureBase64 = image.includes(',') ? image.split(',')[1] : image;
      const newImage = await editFamilyImage(pureBase64, finalPrompt);
      
      if (newImage) {
        setImage(newImage);
        // Clear prompt if it was a custom edit to show success
        if (!customPrompt) setPrompt('');
      } else {
        console.error("No image returned from AI");
        alert("The AI couldn't process this request. Try a different instruction.");
      }
    } catch (error) {
      console.error("Editing failed:", error);
      alert("Something went wrong during the edit. Please try again.");
    } finally {
      setEditing(false);
    }
  };

  const handleEnhance = async () => {
    const enhancePrompt = "Enhance this photo: remove any blur, sharpen the facial features, improve contrast, and increase clarity while maintaining the historical character of the original portrait.";
    await handleEdit(enhancePrompt);
  };

  const handleDownload = () => {
    if (!image) return;
    const link = document.createElement('a');
    link.href = image;
    link.download = `ancestry-live-portrait-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const triggerUpload = () => fileInputRef.current?.click();

  return (
    <div className="max-w-6xl mx-auto p-6 md:p-12 animate-fadeIn">
      <div className="text-center mb-12">
        <h2 className="text-4xl font-extrabold text-slate-900 tracking-tight mb-4">Portrait Refiner</h2>
        <p className="text-slate-500 max-w-2xl mx-auto text-lg">Breathe new life into your ancestors' photos. Restore, colorize, or reimagine historical portraits using specialized generative AI.</p>
      </div>

      <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        {/* Gallery / Editor Area */}
        <div className="lg:col-span-7 flex flex-col items-center">
          <div className="w-full bg-white rounded-[3rem] p-10 shadow-2xl border border-slate-100 aspect-square flex items-center justify-center overflow-hidden relative group bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:24px_24px]">
            {image ? (
              <img 
                src={image} 
                className="w-full h-full object-contain rounded-2xl transition-all duration-700 group-hover:scale-[1.03]" 
                alt="Portrait to edit" 
              />
            ) : (
              <div 
                onClick={triggerUpload}
                className="flex flex-col items-center cursor-pointer group text-slate-400 hover:text-indigo-600 transition-all duration-500 p-12 rounded-[2.5rem] border-4 border-dashed border-slate-100 hover:border-indigo-200 hover:bg-indigo-50/30 w-full h-full justify-center"
              >
                <div className="w-24 h-24 rounded-[2rem] bg-slate-50 flex items-center justify-center mb-8 group-hover:bg-indigo-100 group-hover:rotate-12 transition-all duration-500">
                  <i className="fas fa-file-arrow-up text-4xl"></i>
                </div>
                <span className="text-2xl font-black mb-3 text-slate-900">Upload Photo</span>
                <p className="text-sm text-center text-slate-400 max-w-xs leading-relaxed">Choose a JPEG or PNG of an ancestor to begin the refinement.</p>
              </div>
            )}
            <input type="file" ref={fileInputRef} hidden onChange={handleFileChange} accept="image/*" />
            
            {editing && (
                <div className="absolute inset-0 bg-white/60 backdrop-blur-md flex flex-col items-center justify-center z-20">
                    <div className="w-20 h-20 border-8 border-indigo-100 border-t-indigo-600 rounded-full animate-spin mb-6"></div>
                    <p className="text-indigo-600 font-black uppercase tracking-widest">Applying AI Mastery...</p>
                </div>
            )}
          </div>

          <div className="flex flex-wrap justify-center gap-4 mt-8">
            <button 
              onClick={triggerUpload}
              className={`flex items-center space-x-3 px-8 py-4 rounded-2xl font-bold transition-all shadow-xl active:scale-95 ${
                image 
                ? 'bg-white border-2 border-indigo-600 text-indigo-600 hover:bg-indigo-50 shadow-indigo-50' 
                : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-100'
              }`}
            >
              <i className={`fas ${image ? 'fa-sync' : 'fa-plus'}`}></i>
              <span>{image ? 'Change Photo' : 'Select From Device'}</span>
            </button>

            {image && (
              <button 
                onClick={handleDownload}
                className="flex items-center space-x-3 px-8 py-4 rounded-2xl font-bold transition-all shadow-xl active:scale-95 bg-gradient-to-r from-emerald-500 to-teal-600 text-white hover:from-emerald-600 hover:to-teal-700 shadow-emerald-100"
              >
                <i className="fas fa-download"></i>
                <span>Download Portrait</span>
              </button>
            )}
          </div>
        </div>

        {/* AI Control Center */}
        <div className="lg:col-span-5 space-y-8">
          <div className="bg-white p-10 rounded-[3rem] shadow-2xl border border-slate-100 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-full -translate-y-1/2 translate-x-1/2 opacity-40"></div>
            
            <div className="flex items-center space-x-4 mb-8">
              <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-lg">
                <i className="fas fa-wand-magic-sparkles"></i>
              </div>
              <h3 className="text-xl font-extrabold text-slate-900">Clarify & Restore</h3>
            </div>

            <button
              onClick={handleEnhance}
              disabled={editing || !image}
              className="w-full mb-6 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white py-5 rounded-[2rem] transition-all disabled:opacity-40 disabled:cursor-not-allowed font-black text-lg flex items-center justify-center space-x-4 shadow-xl shadow-violet-100 active:scale-95"
            >
              <i className="fas fa-sparkles"></i>
              <span>Magic Enhance (Remove Blur)</span>
            </button>

            <div className="relative mb-4 flex items-center">
                <div className="flex-1 border-t border-slate-100"></div>
                <span className="px-4 text-[10px] font-black text-slate-300 uppercase tracking-widest">or custom edit</span>
                <div className="flex-1 border-t border-slate-100"></div>
            </div>
            
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g., 'Restore the cracked areas' or 'Colorize this photo'..."
              className="w-full h-32 p-6 rounded-[2rem] border-2 border-slate-100 focus:border-indigo-500 focus:ring-0 outline-none transition-all text-slate-700 placeholder:text-slate-300 resize-none text-lg bg-slate-50/30"
            />

            <button
              onClick={() => handleEdit()}
              disabled={editing || !image || !prompt.trim()}
              className="w-full mt-4 bg-slate-800 hover:bg-slate-900 text-white py-4 rounded-2xl transition-all disabled:opacity-40 disabled:cursor-not-allowed font-bold flex items-center justify-center space-x-3 active:scale-95 shadow-lg shadow-slate-100"
            >
              <i className="fas fa-pencil"></i>
              <span>Apply Custom Edit</span>
            </button>
          </div>

          <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white">
            <h4 className="text-indigo-400 font-black text-xs uppercase tracking-[0.2em] mb-6 flex items-center">
              <i className="fas fa-bolt-lightning mr-2"></i> Quick Filters
            </h4>
            <div className="grid grid-cols-2 gap-3">
              {[
                  "Colorize this photo",
                  "Restore details",
                  "Victorian style",
                  "Sharpen edges"
              ].map((suggestion, idx) => (
                  <button 
                    key={idx}
                    disabled={editing || !image}
                    onClick={() => {
                        handleEdit(suggestion);
                    }}
                    className="text-left px-4 py-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-slate-300 text-xs font-bold transition-all disabled:opacity-30"
                  >
                    {suggestion}
                  </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageEditor;
