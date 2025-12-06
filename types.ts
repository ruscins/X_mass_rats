export interface Assignment {
  spinner: string;
  receiver: string;
  timestamp: number;
}

export type AppMode = 'setup' | 'game';

export interface WheelSegment {
  id: string;
  label: string;
  color: string;
}