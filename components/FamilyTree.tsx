
import React, { useState } from 'react';
import { FamilyMember } from '../types';

interface MemberCardProps {
  member: FamilyMember;
  onEdit: (m: FamilyMember) => void;
  hoverBorderClass: string;
  avatarBgClass: string;
  defaultIcon: string;
  children?: React.ReactNode;
}

const MemberCard: React.FC<MemberCardProps> = ({ 
  member, 
  onEdit, 
  hoverBorderClass, 
  avatarBgClass, 
  defaultIcon,
  children 
}) => {
  const [expanded, setExpanded] = useState(false);

  const renderDates = (m: FamilyMember) => {
    if (!m.birthDate && !m.deathDate) return 'Dates Unknown';
    return `${m.birthDate || '?'}${m.deathDate ? ` — ${m.deathDate}` : ''}`;
  };

  const hasLongBio = member.bio && member.bio.length > 40;

  return (
    <div 
      onClick={() => onEdit(member)}
      className={`group relative cursor-pointer flex flex-col items-center bg-white p-4 rounded-2xl shadow-sm border border-slate-200 ${hoverBorderClass} transition-all duration-300 w-48 z-10 hover:shadow-xl hover:-translate-y-1`}
    >
      <div className={`w-20 h-20 rounded-full ${avatarBgClass} flex items-center justify-center overflow-hidden mb-3 border-4 border-white shadow-md shrink-0`}>
        {member.image ? (
          <img src={member.image} alt={member.name} className="w-full h-full object-cover" />
        ) : (
          <i className={`fas ${defaultIcon} text-3xl opacity-40`}></i>
        )}
      </div>
      
      <div className="text-center w-full">
        <h4 className="text-sm font-bold text-slate-800 truncate px-1 mb-0.5">{member.name}</h4>
        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-2">{renderDates(member)}</p>

        {member.phone && (
          <div className="flex items-center justify-center space-x-1 mb-2">
            <a 
              href={`tel:${member.phone}`}
              onClick={(e) => e.stopPropagation()}
              className="text-indigo-600 hover:text-indigo-800 flex items-center bg-indigo-50 px-2 py-0.5 rounded-full"
            >
              <i className="fas fa-phone text-[8px] mr-1"></i>
              <span className="text-[9px] font-bold">{member.phone}</span>
            </a>
          </div>
        )}
        
        {member.bio && (
          <div className="mt-2 pt-2 border-t border-slate-50">
            <p className={`text-[11px] text-slate-500 leading-relaxed text-center break-words ${expanded ? '' : 'line-clamp-2'}`}>
              {member.bio}
            </p>
            {hasLongBio && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setExpanded(!expanded);
                }}
                className="mt-1 text-[9px] font-extrabold text-indigo-500 hover:text-indigo-700 uppercase tracking-widest"
              >
                {expanded ? 'Hide Bio' : 'Read Bio'}
              </button>
            )}
          </div>
        )}
      </div>

      {children}
    </div>
  );
};

interface NodeProps {
  memberId: string;
  members: Record<string, FamilyMember>;
  onAddChild: (parentId: string) => void;
  onAddSpouse: (memberId: string) => void;
  onEdit: (member: FamilyMember) => void;
}

const FamilyNode: React.FC<NodeProps> = ({ memberId, members, onAddChild, onAddSpouse, onEdit }) => {
  const member = members[memberId];
  if (!member) return null;

  const spouse = member.spouseId ? members[member.spouseId] : null;

  return (
    <div className="flex flex-col items-center">
      {/* The Couple / Core Entry */}
      <div className="flex items-center mb-10 relative">
        <MemberCard
          member={member}
          onEdit={onEdit}
          hoverBorderClass="hover:border-indigo-500"
          avatarBgClass={member.gender === 'male' ? 'bg-indigo-50 text-indigo-300' : member.gender === 'female' ? 'bg-rose-50 text-rose-300' : 'bg-slate-50 text-slate-300'}
          defaultIcon={member.gender === 'male' ? 'fa-user-tie' : member.gender === 'female' ? 'fa-user-nurse' : 'fa-user'}
        >
          {/* Add Child Button Overlay (only if no spouse connected here) */}
          {!spouse && (
            <button 
              title="Add Descendant"
              onClick={(e) => { e.stopPropagation(); onAddChild(memberId); }}
              className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-8 h-8 bg-indigo-600 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 z-20 hover:scale-110 shadow-lg hover:bg-indigo-700"
            >
              <i className="fas fa-plus text-xs"></i>
            </button>
          )}
        </MemberCard>

        {/* Spouse Connection */}
        <div className="flex items-center">
          {spouse ? (
            <div className="flex items-center">
              {/* Union Bridge */}
              <div className="w-12 h-0.5 bg-slate-200 relative flex items-center justify-center">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-white rounded-full border border-slate-100 flex items-center justify-center shadow-sm">
                  <i className="fas fa-heart text-rose-400 text-xs"></i>
                </div>
                <button 
                  title="Add Descendant to Couple"
                  onClick={(e) => { e.stopPropagation(); onAddChild(memberId); }}
                  className="absolute -bottom-6 left-1/2 -translate-x-1/2 w-8 h-8 bg-emerald-500 text-white rounded-full flex items-center justify-center hover:scale-110 transition-transform shadow-lg z-20 border-2 border-white"
                >
                  <i className="fas fa-plus text-xs"></i>
                </button>
              </div>
              
              <MemberCard
                member={spouse}
                onEdit={onEdit}
                hoverBorderClass="hover:border-rose-400"
                avatarBgClass={spouse.gender === 'female' ? 'bg-rose-50 text-rose-300' : spouse.gender === 'male' ? 'bg-indigo-50 text-indigo-300' : 'bg-slate-50 text-slate-300'}
                defaultIcon={spouse.gender === 'female' ? 'fa-user-nurse' : spouse.gender === 'male' ? 'fa-user-tie' : 'fa-user'}
              />
            </div>
          ) : (
            /* Compact Spouse Call-to-Action */
            <div className="ml-4 flex items-center">
              <div className="w-6 h-0.5 bg-slate-200"></div>
              <button 
                onClick={(e) => { e.stopPropagation(); onAddSpouse(memberId); }}
                className="group/spouse w-10 h-10 rounded-full border-2 border-dashed border-slate-200 text-slate-300 flex items-center justify-center hover:bg-rose-50 hover:border-rose-300 hover:text-rose-400 transition-all shadow-sm bg-white"
                title="Add Life Partner"
              >
                <i className="fas fa-plus text-sm group-hover/spouse:scale-110 transition-transform"></i>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Children Hierarchy */}
      <div className="relative flex flex-col items-center">
        {member.childrenIds.length > 0 && (
          <div className="w-0.5 h-10 bg-slate-200 mb-0"></div>
        )}

        <div className="flex items-start justify-center gap-16 relative">
          {member.childrenIds.length > 1 && (
            <div className="absolute top-0 left-[20%] right-[20%] h-0.5 bg-slate-200"></div>
          )}
          
          {member.childrenIds.map((childId) => (
            <div key={childId} className="relative pt-10">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-0.5 h-10 bg-slate-200"></div>
              <FamilyNode 
                memberId={childId} 
                members={members} 
                onAddChild={onAddChild} 
                onAddSpouse={onAddSpouse}
                onEdit={onEdit} 
              />
            </div>
          ))}

          {/* Sibling Placeholder */}
          {member.childrenIds.length > 0 && (
            <div className="relative pt-10 flex flex-col items-center">
               <div className="absolute top-0 left-1/2 -translate-x-1/2 w-0.5 h-10 bg-slate-200"></div>
               <div className="absolute top-0 left-[-50%] right-1/2 h-0.5 bg-slate-200"></div>
               
               <button 
                onClick={() => onAddChild(memberId)}
                className="w-12 h-12 rounded-2xl border-2 border-dashed border-slate-200 flex items-center justify-center text-slate-300 hover:text-indigo-600 hover:border-indigo-200 hover:bg-indigo-50 transition-all shadow-sm bg-white mt-10"
                title="Add Sibling"
               >
                 <i className="fas fa-plus"></i>
               </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FamilyNode;
