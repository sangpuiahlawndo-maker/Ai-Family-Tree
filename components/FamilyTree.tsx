
import React, { useState } from 'react';
import { FamilyMember } from '../types';

interface MemberCardProps {
  member: FamilyMember;
  onEdit: (m: FamilyMember) => void;
  hoverBorderClass: string;
  avatarBgClass: string;
  defaultIcon: string;
  generation: number;
  children?: React.ReactNode;
}

const MemberCard: React.FC<MemberCardProps> = ({ 
  member, 
  onEdit, 
  hoverBorderClass, 
  avatarBgClass, 
  defaultIcon,
  generation,
  children 
}) => {
  const [expanded, setExpanded] = useState(false);

  const renderDates = (m: FamilyMember) => {
    if (!m.birthDate && !m.deathDate) return 'Dates Unknown';
    return `${m.birthDate || '?'}${m.deathDate ? ` — ${m.deathDate}` : ''}`;
  };

  const hasLongBio = member.bio && member.bio.length > 35;

  return (
    <div 
      onClick={() => onEdit(member)}
      className={`group relative cursor-pointer flex flex-col items-center bg-white p-3 sm:p-4 rounded-2xl shadow-sm border border-slate-200 ${hoverBorderClass} transition-all duration-300 w-36 sm:w-48 z-10 hover:shadow-xl hover:-translate-y-1 active:scale-95`}
    >
      {/* Generation Badge */}
      <div className="absolute -top-2 -left-2 bg-slate-900 text-white text-[8px] sm:text-[9px] font-black px-2 py-0.5 sm:py-1 rounded-full shadow-lg border-2 border-white z-30 uppercase tracking-tighter">
        Gen {generation}
      </div>

      <div className={`w-14 h-14 sm:w-20 sm:h-20 rounded-2xl ${avatarBgClass} flex items-center justify-center overflow-hidden mb-2 sm:mb-3 border-4 border-white shadow-md shrink-0`}>
        {member.image ? (
          <img src={member.image} alt={member.name} className="w-full h-full object-cover" />
        ) : (
          <i className={`fas ${defaultIcon} text-xl sm:text-3xl opacity-40`}></i>
        )}
      </div>
      
      <div className="text-center w-full">
        <h4 className="text-[11px] sm:text-sm font-bold text-slate-800 truncate px-0.5 mb-0.5">{member.name}</h4>
        <p className="text-[8px] sm:text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1.5">{renderDates(member)}</p>

        {member.phone && (
          <div className="flex items-center justify-center mb-1.5">
            <div className="text-indigo-600 flex items-center bg-indigo-50 px-1.5 py-0.5 rounded-full">
              <i className="fas fa-phone text-[7px] mr-1"></i>
              <span className="text-[7px] sm:text-[8px] font-black">{member.phone}</span>
            </div>
          </div>
        )}
        
        {member.bio && (
          <div className="mt-1 pt-1.5 border-t border-slate-50">
            <p className={`text-[9px] sm:text-[11px] text-slate-500 leading-relaxed text-center break-words ${expanded ? '' : 'line-clamp-2'}`}>
              {member.bio}
            </p>
            {hasLongBio && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setExpanded(!expanded);
                }}
                className="mt-1 text-[8px] font-black text-indigo-500 hover:text-indigo-700 uppercase tracking-widest"
              >
                {expanded ? 'Hide' : 'More'}
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
  level?: number;
}

const FamilyNode: React.FC<NodeProps> = ({ memberId, members, onAddChild, onAddSpouse, onEdit, level = 1 }) => {
  const member = members[memberId];
  if (!member) return null;

  const spouse = member.spouseId ? members[member.spouseId] : null;

  return (
    <div className="flex flex-col items-center">
      {/* The Couple / Core Entry */}
      <div className="flex items-center mb-10 sm:mb-12 relative">
        <MemberCard
          member={member}
          onEdit={onEdit}
          generation={level}
          hoverBorderClass="hover:border-indigo-500"
          avatarBgClass={member.gender === 'male' ? 'bg-indigo-50 text-indigo-300' : member.gender === 'female' ? 'bg-rose-50 text-rose-300' : 'bg-slate-50 text-slate-300'}
          defaultIcon={member.gender === 'male' ? 'fa-user-tie' : member.gender === 'female' ? 'fa-user-nurse' : 'fa-user'}
        >
          {!spouse && (
            <button 
              title="Add Descendant"
              onClick={(e) => { e.stopPropagation(); onAddChild(memberId); }}
              className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-9 h-9 sm:w-10 sm:h-10 bg-indigo-600 text-white rounded-full flex items-center justify-center z-20 shadow-xl border-4 border-white active:scale-90"
            >
              <i className="fas fa-plus text-xs"></i>
            </button>
          )}
        </MemberCard>

        <div className="flex items-center">
          {spouse ? (
            <div className="flex items-center">
              <div className="w-6 sm:w-12 h-0.5 bg-slate-200 relative flex items-center justify-center">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 sm:w-9 sm:h-9 bg-white rounded-full border border-slate-100 flex items-center justify-center shadow-sm">
                  <i className="fas fa-heart text-rose-400 text-[10px] sm:text-xs"></i>
                </div>
                <button 
                  title="Add Descendant to Couple"
                  onClick={(e) => { e.stopPropagation(); onAddChild(memberId); }}
                  className="absolute -bottom-5 sm:bottom-[-24px] left-1/2 -translate-x-1/2 w-8 h-8 sm:w-10 sm:h-10 bg-emerald-500 text-white rounded-full flex items-center justify-center shadow-xl z-20 border-4 border-white active:scale-90"
                >
                  <i className="fas fa-plus text-[10px] sm:text-xs"></i>
                </button>
              </div>
              
              <MemberCard
                member={spouse}
                onEdit={onEdit}
                generation={level}
                hoverBorderClass="hover:border-rose-400"
                avatarBgClass={spouse.gender === 'female' ? 'bg-rose-50 text-rose-300' : spouse.gender === 'male' ? 'bg-indigo-50 text-indigo-300' : 'bg-slate-50 text-slate-300'}
                defaultIcon={spouse.gender === 'female' ? 'fa-user-nurse' : spouse.gender === 'male' ? 'fa-user-tie' : 'fa-user'}
              />
            </div>
          ) : (
            <div className="ml-2 sm:ml-4 flex items-center">
              <div className="w-3 sm:w-6 h-0.5 bg-slate-200"></div>
              <button 
                onClick={(e) => { e.stopPropagation(); onAddSpouse(memberId); }}
                className="w-9 h-9 sm:w-11 sm:h-11 rounded-full border-2 border-dashed border-slate-200 text-slate-300 flex items-center justify-center hover:bg-rose-50 transition-all bg-white shadow-sm active:scale-90"
                title="Add Spouse"
              >
                <i className="fas fa-plus text-sm"></i>
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="relative flex flex-col items-center">
        {member.childrenIds.length > 0 && (
          <div className="w-0.5 h-10 sm:h-12 bg-slate-200 mb-0"></div>
        )}

        <div className="flex items-start justify-center gap-6 sm:gap-16 relative">
          {member.childrenIds.length > 1 && (
            <div className="absolute top-0 left-[25%] right-[25%] h-0.5 bg-slate-200"></div>
          )}
          
          {member.childrenIds.map((childId) => (
            <div key={childId} className="relative pt-10 sm:pt-12">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-0.5 h-10 sm:h-12 bg-slate-200"></div>
              <FamilyNode 
                memberId={childId} 
                members={members} 
                onAddChild={onAddChild} 
                onAddSpouse={onAddSpouse}
                onEdit={onEdit} 
                level={level + 1}
              />
            </div>
          ))}

          {member.childrenIds.length > 0 && (
            <div className="relative pt-10 sm:pt-12 flex flex-col items-center">
               <div className="absolute top-0 left-1/2 -translate-x-1/2 w-0.5 h-10 sm:h-12 bg-slate-200"></div>
               <div className="absolute top-0 left-[-50%] right-1/2 h-0.5 bg-slate-200"></div>
               <button 
                onClick={() => onAddChild(memberId)}
                className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl border-2 border-dashed border-slate-200 flex items-center justify-center text-slate-300 bg-white mt-10 sm:mt-12 active:scale-90"
                title="Add Sibling"
               >
                 <i className="fas fa-plus text-sm"></i>
               </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FamilyNode;
