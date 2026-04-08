export type RaceStatus = 'upcoming' | 'active' | 'finished' | 'archived';

export type Race = {
  id: string;
  name: string;
  date: string;
  status: RaceStatus;
  createdAt: string;
  updatedAt: string;
};
