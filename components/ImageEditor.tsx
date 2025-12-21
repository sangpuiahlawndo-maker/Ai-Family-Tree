
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
    const finalPrompt = (typeof customPrompt === 'string' && customPrompt.length > 0) ? customPrompt : prompt;
    if (!image || !finalPrompt.trim()) return;

    setEditing(true);
    try {
      const pureBase64 = image.includes(',') ? image.split(',')[1] : image;
      const newImage = await editFamilyImage(pureBase64, finalPrompt);
      if (newImage) {
        setImage(newImage);
        if (!customPrompt) setPrompt('');
      } else {
        alert("The AI couldn't process this request.");
      }
    } catch (error) {
      alert("Something went wrong during the edit.");
    } finally {
      setEditing(false);
    }
  };

  const triggerUpload = () => fileInputRef.current?.click();

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-12 animate-fadeIn pb-24 sm:pb-12">
      <div className="text-center mb-8 sm:mb-12">
        <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mb-2 sm:mb-4">Portrait Refiner</h2>
        <p className="text-sm sm:text-lg text-slate-500 max-w-2xl mx-auto">AI restoration for historical family photos.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-12 items-start">
        <div className="lg:col-span-7 flex flex-col items-center w-full">
          <div className="w-full bg-white rounded-[2rem] sm:rounded-[3.5rem] p-4 sm:p-10 shadow-xl border border-slate-100 aspect-square flex items-center justify-center overflow-hidden relative group">
            {image ? (
              <img src={image} className="w-full h-full object-contain rounded-xl sm:rounded-2xl transition-all" alt="Portrait" />
            ) : (
              <div onClick={triggerUpload} className="flex flex-col items-center justify-center cursor-pointer text-slate-300 w-full h-full border-4 border-dashed border-slate-50 rounded-[1.5rem] sm:rounded-[2.5rem] bg-slate-50/30">
                <i className="fas fa-file-arrow-up text-3xl sm:text-5xl mb-4"></i>
                <span className="text-lg sm:text-xl font-black text-slate-800">Upload Photo</span>
              </div>
            )}
            <input type="file" ref={fileInputRef} hidden onChange={handleFileChange} accept="image/*" />
            
            {editing && (
              <div className="absolute inset-0 bg-white/70 backdrop-blur-md flex flex-col items-center justify-center z-20">
                <div className="w-12 h-12 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
                <p className="text-indigo-600 font-black uppercase text-[10px] tracking-widest">Applying AI...</p>
              </div>
            )}
          </div>

          <div className="flex flex-wrap justify-center gap-3 mt-6 sm:mt-8 w-full px-2">
            <button onClick={triggerUpload} className="flex-1 min-w-[140px] sm:flex-none px-6 py-4 rounded-xl sm:rounded-2xl font-bold bg-white border-2 border-indigo-600 text-indigo-600 active:scale-95 text-sm">
              {image ? 'Change' : 'Select Photo'}
            </button>
            {image && (
              <button onClick={() => {}} className="flex-1 min-w-[140px] sm:flex-none px-6 py-4 rounded-xl sm:rounded-2xl font-bold bg-indigo-600 text-white active:scale-95 text-sm shadow-lg shadow-indigo-100">
                Download
              </button>
            )}
          </div>
        </div>

        <div className="lg:col-span-5 space-y-6 sm:space-y-8 w-full">
          <div className="bg-white p-6 sm:p-10 rounded-[1.5rem] sm:rounded-[2.5rem] shadow-xl border border-slate-50">
            <h3 className="text-lg font-extrabold text-slate-900 mb-6 flex items-center">
              <i className="fas fa-wand-magic-sparkles mr-3 text-indigo-600"></i>
              Clarify & Restore
            </h3>
            
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g., 'Restore the cracked areas'..."
              className="w-full h-24 sm:h-32 p-4 sm:p-6 rounded-xl sm:rounded-2xl border-2 border-slate-50 bg-slate-50 focus:border-indigo-500 outline-none text-sm sm:text-lg"
            />

            <button
              onClick={() => handleEdit()}
              disabled={editing || !image || !prompt.trim()}
              className="w-full mt-4 bg-slate-900 text-white py-4 rounded-xl sm:rounded-2xl font-bold active:scale-95 disabled:opacity-30"
            >
              Apply AI Refinement
            </button>
          </div>

          <div className="bg-slate-900 rounded-[1.5rem] sm:rounded-[2rem] p-6 text-white overflow-x-auto">
            <h4 className="text-[10px] font-black uppercase tracking-widest mb-4 opacity-50">Quick Styles</h4>
            <div className="flex sm:grid sm:grid-cols-2 gap-2 overflow-x-auto pb-2 sm:pb-0 scroll-hide">
              {["Colorize", "Restore", "Victorian", "Sharpen"].map((label) => (
                <button 
                  key={label}
                  onClick={() => handleEdit(label)}
                  disabled={editing || !image}
                  className="whitespace-nowrap sm:whitespace-normal px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-[10px] font-black transition-all active:scale-90"
                >
                  {label}
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
