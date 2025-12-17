
import React, { useState, useRef } from 'react';
import { FamilyMember, AppTab } from './types';
import FamilyNode from './components/FamilyTree';
import VoiceAssistant from './components/VoiceAssistant';
import Researcher from './components/Researcher';
import ImageEditor from './components/ImageEditor';
import { blobToBase64 } from './utils';

const INITIAL_MEMBERS: Record<string, FamilyMember> = {
  'root': {
    id: 'root',
    name: 'Arthur Sterling Smith',
    birthDate: '1945',
    gender: 'male',
    phone: '+1 555-0123',
    childrenIds: ['child1', 'child2'],
    spouseId: 'spouse1',
    bio: 'Founder of the Smith family business and passionate gardener.'
  },
  'spouse1': {
    id: 'spouse1',
    name: 'Evelyn Rose Miller',
    birthDate: '1948',
    gender: 'female',
    phone: '+1 555-0456',
    childrenIds: [],
    spouseId: 'root',
    bio: 'A former history teacher who instilled the value of roots in our family.'
  },
  'child1': {
    id: 'child1',
    name: 'David Michael Smith',
    birthDate: '1970',
    gender: 'male',
    phone: '+1 555-0789',
    parentId: 'root',
    childrenIds: ['grandchild1'],
    bio: 'Architect living in Seattle, loves hiking and sketching old buildings.'
  },
  'child2': {
    id: 'child2',
    name: 'Sarah Jane Jones',
    birthDate: '1975',
    gender: 'female',
    phone: '+1 555-0999',
    parentId: 'root',
    childrenIds: [],
    bio: 'Public health researcher with a love for ocean photography.'
  },
  'grandchild1': {
    id: 'grandchild1',
    name: 'Emma Leigh Smith',
    birthDate: '1998',
    gender: 'female',
    phone: '+1 555-1111',
    parentId: 'child1',
    childrenIds: [],
    bio: 'Software engineer and lead guitarist in a local band.'
  }
};

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<AppTab>(AppTab.TREE);
  const [members, setMembers] = useState<Record<string, FamilyMember>>(INITIAL_MEMBERS);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<FamilyMember | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAddChild = (parentId: string) => {
    const newId = `member_${Date.now()}`;
    const newMember: FamilyMember = {
      id: newId,
      name: 'New Descendant',
      gender: 'male',
      parentId: parentId,
      childrenIds: []
    };
    
    setMembers(prev => {
      const parent = prev[parentId];
      return {
        ...prev,
        [newId]: newMember,
        [parentId]: { ...parent, childrenIds: [...parent.childrenIds, newId] }
      };
    });
    setEditingMember(newMember);
    setIsModalOpen(true);
  };

  const handleAddSpouse = (memberId: string) => {
    const newId = `spouse_${Date.now()}`;
    const member = members[memberId];
    const newSpouse: FamilyMember = {
      id: newId,
      name: `Partner of ${member.name}`,
      gender: member.gender === 'male' ? 'female' : 'male',
      spouseId: memberId,
      childrenIds: []
    };

    setMembers(prev => ({
      ...prev,
      [newId]: newSpouse,
      [memberId]: { ...prev[memberId], spouseId: newId }
    }));
    setEditingMember(newSpouse);
    setIsModalOpen(true);
  };

  const handleEditMember = (member: FamilyMember) => {
    setEditingMember(member);
    setIsModalOpen(true);
  };

  const saveMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingMember) {
      setMembers(prev => ({ ...prev, [editingMember.id]: editingMember }));
      setIsModalOpen(false);
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && editingMember) {
      const base64 = await blobToBase64(file);
      setEditingMember({ ...editingMember, image: `data:image/jpeg;base64,${base64}` });
    }
  };

  return (
    <div className="min-h-screen flex flex-col selection:bg-indigo-100 selection:text-indigo-600">
      {/* Dynamic Header */}
      <header className="bg-white/80 backdrop-blur-xl border-b border-slate-200/60 px-8 py-4 flex items-center justify-between sticky top-0 z-40 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
        <div className="flex items-center space-x-4">
          <div className="bg-indigo-600 text-white w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-200">
            <i className="fas fa-tree-city text-xl"></i>
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight leading-none">AncestryLive</h1>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-500 mt-1">Legacy Preservation Platform</p>
          </div>
        </div>

        <div className="hidden lg:flex items-center bg-slate-100/80 p-1.5 rounded-2xl">
          <TabButton active={activeTab === AppTab.TREE} onClick={() => setActiveTab(AppTab.TREE)} icon="fa-sitemap" label="Lineage" />
          <TabButton active={activeTab === AppTab.RESEARCH} onClick={() => setActiveTab(AppTab.RESEARCH)} icon="fa-building-columns" label="Archive" />
          <TabButton active={activeTab === AppTab.VOICE} onClick={() => setActiveTab(AppTab.VOICE)} icon="fa-microphone-lines" label="Heritage Talk" />
          <TabButton active={activeTab === AppTab.GALLERY} onClick={() => setActiveTab(AppTab.GALLERY)} icon="fa-camera-retro" label="Refiner" />
        </div>

        <div className="flex items-center space-x-4">
            <div className="hidden sm:block text-right">
                <p className="text-xs font-bold text-slate-800">John Doe</p>
                <p className="text-[10px] text-slate-400 font-medium">Curator</p>
            </div>
            <button className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center hover:bg-white hover:border-indigo-200 transition-all">
                <i className="fas fa-user-circle text-slate-400 text-xl"></i>
            </button>
        </div>
      </header>

      {/* Main Feature Viewport */}
      <main className="flex-1 overflow-auto bg-slate-50/50 custom-scrollbar relative">
        {activeTab === AppTab.TREE && (
          <div className="p-12 md:p-24 flex justify-center min-w-max">
            <FamilyNode 
              memberId="root" 
              members={members} 
              onAddChild={handleAddChild} 
              onAddSpouse={handleAddSpouse}
              onEdit={handleEditMember} 
            />
          </div>
        )}
        {activeTab === AppTab.RESEARCH && <Researcher />}
        {activeTab === AppTab.VOICE && <VoiceAssistant />}
        {activeTab === AppTab.GALLERY && <ImageEditor />}
      </main>

      {/* Responsive Mobile Navigator */}
      <nav className="lg:hidden bg-white/95 backdrop-blur-xl border-t border-slate-200 px-4 py-3 flex items-center justify-around sticky bottom-0 z-40 shadow-[0_-2px_10px_rgba(0,0,0,0.02)]">
        <MobileTabButton active={activeTab === AppTab.TREE} onClick={() => setActiveTab(AppTab.TREE)} icon="fa-sitemap" label="Tree" />
        <MobileTabButton active={activeTab === AppTab.RESEARCH} onClick={() => setActiveTab(AppTab.RESEARCH)} icon="fa-building-columns" label="Archive" />
        <MobileTabButton active={activeTab === AppTab.VOICE} onClick={() => setActiveTab(AppTab.VOICE)} icon="fa-microphone-lines" label="Talk" />
        <MobileTabButton active={activeTab === AppTab.GALLERY} onClick={() => setActiveTab(AppTab.GALLERY)} icon="fa-camera-retro" label="Editor" />
      </nav>

      {/* Profile Editor Modal */}
      {isModalOpen && editingMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md animate-fadeIn">
          <div className="bg-white rounded-[3rem] w-full max-w-2xl overflow-hidden shadow-2xl animate-scaleIn border border-white/20">
            <div className="bg-indigo-600 px-8 py-6 flex justify-between items-center text-white">
              <div>
                <h3 className="text-xl font-black">Heritage Profile</h3>
                <p className="text-xs text-indigo-200 font-bold uppercase tracking-widest mt-0.5">Edit Personal Details</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-all">
                <i className="fas fa-times"></i>
              </button>
            </div>
            <form onSubmit={saveMember} className="p-10 space-y-6 max-h-[75vh] overflow-y-auto custom-scrollbar">
              {/* Profile Hero Section */}
              <div className="flex flex-col items-center mb-8">
                <div className="relative group">
                  <div className={`w-32 h-32 rounded-[2.5rem] border-4 border-slate-50 shadow-xl overflow-hidden flex items-center justify-center ${editingMember.gender === 'male' ? 'bg-indigo-50' : 'bg-rose-50'}`}>
                    {editingMember.image ? (
                      <img src={editingMember.image} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <i className={`fas ${editingMember.gender === 'male' ? 'fa-user-tie text-indigo-200' : 'fa-user-nurse text-rose-200'} text-5xl`}></i>
                    )}
                  </div>
                  <button 
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute -bottom-2 -right-2 w-10 h-10 bg-indigo-600 text-white rounded-2xl flex items-center justify-center border-4 border-white shadow-xl hover:bg-indigo-700 transition-all hover:scale-110 active:scale-95"
                  >
                    <i className="fas fa-camera text-sm"></i>
                  </button>
                </div>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  className="hidden" 
                  accept="image/*" 
                  onChange={handlePhotoUpload} 
                />
              </div>

              <div className="space-y-6">
                <div className="group">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 px-1">Full Legal Name</label>
                  <input 
                    type="text" 
                    autoFocus
                    value={editingMember.name} 
                    onChange={e => setEditingMember({...editingMember, name: e.target.value})}
                    className="w-full px-6 py-4 border-2 border-slate-100 rounded-2xl focus:border-indigo-500 outline-none transition-all text-slate-800 font-bold bg-slate-50/30" 
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 px-1">Birth Year</label>
                    <input 
                      type="text" 
                      value={editingMember.birthDate || ''} 
                      onChange={e => setEditingMember({...editingMember, birthDate: e.target.value})}
                      placeholder="YYYY"
                      className="w-full px-6 py-4 border-2 border-slate-100 rounded-2xl focus:border-indigo-500 outline-none transition-all font-bold bg-slate-50/30" 
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 px-1">Death Year (if applicable)</label>
                    <input 
                      type="text" 
                      value={editingMember.deathDate || ''} 
                      onChange={e => setEditingMember({...editingMember, deathDate: e.target.value})}
                      placeholder="YYYY"
                      className="w-full px-6 py-4 border-2 border-slate-100 rounded-2xl focus:border-indigo-500 outline-none transition-all font-bold bg-slate-50/30" 
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 px-1">Phone Reference</label>
                        <input 
                            type="tel" 
                            value={editingMember.phone || ''} 
                            onChange={e => setEditingMember({...editingMember, phone: e.target.value})}
                            placeholder="+1 234 567 890"
                            className="w-full px-6 py-4 border-2 border-slate-100 rounded-2xl focus:border-indigo-500 outline-none transition-all font-bold bg-slate-50/30" 
                        />
                    </div>
                    <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 px-1">Gender Identity</label>
                        <select 
                            value={editingMember.gender} 
                            onChange={e => setEditingMember({...editingMember, gender: e.target.value as any})}
                            className="w-full px-6 py-4 border-2 border-slate-100 rounded-2xl focus:border-indigo-500 outline-none transition-all font-bold bg-white"
                        >
                            <option value="male">Male</option>
                            <option value="female">Female</option>
                            <option value="other">Other / Non-Binary</option>
                        </select>
                    </div>
                </div>

                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 px-1">Life Biography & Heritage</label>
                  <textarea 
                    value={editingMember.bio || ''} 
                    onChange={e => setEditingMember({...editingMember, bio: e.target.value})}
                    placeholder="Tell their story, achievements, and unique personality traits..."
                    className="w-full h-32 px-6 py-4 border-2 border-slate-100 rounded-2xl focus:border-indigo-500 outline-none transition-all bg-slate-50/30 resize-none font-medium leading-relaxed"
                  />
                </div>
              </div>

              <div className="pt-6">
                <button type="submit" className="w-full py-5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-3xl font-black text-lg transition-all shadow-xl shadow-indigo-100 active:scale-[0.98]">
                    Commit Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Stats Overlay Shortcut */}
      <button 
        onClick={() => setActiveTab(AppTab.STATS)}
        className="fixed bottom-24 right-8 lg:bottom-12 lg:right-12 w-16 h-16 bg-slate-900 text-white rounded-3xl flex items-center justify-center shadow-2xl hover:scale-110 active:scale-95 transition-all z-40 group"
      >
        <i className="fas fa-chart-pie text-xl group-hover:rotate-12 transition-transform"></i>
      </button>

      {/* Simple Stats Modal */}
      {activeTab === AppTab.STATS && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md">
             <div className="bg-white rounded-[3rem] w-full max-w-lg p-12 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-full opacity-50 -translate-y-12 translate-x-12"></div>
                <h2 className="text-3xl font-black text-slate-900 mb-8">Lineage Stats</h2>
                <div className="grid grid-cols-2 gap-4 mb-10">
                    <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Members</p>
                        <p className="text-3xl font-black text-indigo-600">{Object.keys(members).length}</p>
                    </div>
                    <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Generations</p>
                        <p className="text-3xl font-black text-rose-500">3</p>
                    </div>
                </div>
                <div className="space-y-4">
                    <p className="text-sm text-slate-500 leading-relaxed italic">
                        "A family tree is only as strong as the stories told about its branches."
                    </p>
                    <button 
                        onClick={() => setActiveTab(AppTab.TREE)}
                        className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold transition-all hover:bg-slate-800"
                    >
                        Back to Tree
                    </button>
                </div>
             </div>
          </div>
      )}
    </div>
  );
};

const TabButton: React.FC<{ active: boolean; onClick: () => void; icon: string; label: string }> = ({ active, onClick, icon, label }) => (
  <button 
    onClick={onClick}
    className={`px-5 py-2.5 rounded-xl flex items-center space-x-2 transition-all duration-300 ${active ? 'bg-white shadow-md text-indigo-600 scale-[1.02]' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-200/50'}`}
  >
    <i className={`fas ${icon} text-sm`}></i>
    <span className="text-xs font-black uppercase tracking-widest">{label}</span>
  </button>
);

const MobileTabButton: React.FC<{ active: boolean; onClick: () => void; icon: string; label: string }> = ({ active, onClick, icon, label }) => (
  <button 
    onClick={onClick}
    className={`flex flex-col items-center p-3 rounded-2xl transition-all ${active ? 'text-indigo-600 bg-indigo-50/50' : 'text-slate-400'}`}
  >
    <i className={`fas ${icon} text-lg mb-1.5`}></i>
    <span className="text-[9px] font-black uppercase tracking-widest">{label}</span>
  </button>
);

export default App;
