export type Platform = 'youtube' | 'kick';

export interface Streamer {
  id: string;
  name: string;
  platform: Platform;
  channelId: string; // For YT it's the UC... id, for Kick it's the username
  color?: string;
  isCustom?: boolean;
}

export type LayoutMode = 'grid' | 'focus' | 'free';

export interface StreamConfig {
  id: string;
  streamer: Streamer;
  zIndex: number;
  position: { x: number; y: number };
  size: { width: number | string; height: number | string };
}
