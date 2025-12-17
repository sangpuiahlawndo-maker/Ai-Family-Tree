
export interface FamilyMember {
  id: string;
  name: string;
  birthDate?: string;
  deathDate?: string;
  phone?: string;
  spouseId?: string;
  parentId?: string;
  gender: 'male' | 'female' | 'other';
  image?: string;
  bio?: string;
  childrenIds: string[];
}

export interface GroundingSource {
  title: string;
  uri: string;
}

export enum AppTab {
  TREE = 'tree',
  RESEARCH = 'research',
  VOICE = 'voice',
  GALLERY = 'gallery',
  STATS = 'stats'
}
