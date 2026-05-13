import React, { useState, useEffect } from 'react';
import { Streamer, Platform } from '../types';
import { YATRA_STREAMERS } from '../constants';
import { cn } from '../lib/utils';
import { Search, Plus, Youtube, Tv, X, ExternalLink, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface StreamerPickerProps {
  selectedStreamers: Streamer[];
  onAddStreamer: (streamer: Streamer) => void;
  onRemoveStreamer: (id: string) => void;
  onClose: () => void;
}

interface LiveStreamData {
  id: string;
  platform: 'youtube' | 'kick';
  title: string;
  channelTitle: string;
  thumbnail: string;
  url: string;
  viewCount?: number;
}

export const StreamerPicker: React.FC<StreamerPickerProps> = ({
  selectedStreamers,
  onAddStreamer,
  onRemoveStreamer,
  onClose,
}) => {
  const [search, setSearch] = useState('');
  const [customName, setCustomName] = useState('');
  const [customId, setCustomId] = useState('');
  const [customPlatform, setCustomPlatform] = useState<Platform>('youtube');
  const [showCustomForm, setShowCustomForm] = useState(false);
  const [liveStreams, setLiveStreams] = useState<LiveStreamData[]>([]);
  const [isLoadingLive, setIsLoadingLive] = useState(true);
  const [apiError, setApiError] = useState(false);

  const clearAll = () => {
    selectedStreamers.forEach(s => onRemoveStreamer(s.id));
  };

  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchLiveStreams = async () => {
    setIsRefreshing(true);
    try {
      const res = await fetch('/api/streams/live');
      
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.details || 'API failed');
      }
      
      const data = await res.json();
      if (data && data.streams) {
        setLiveStreams(data.streams);
        setApiError(false);
      }
    } catch (err: any) {
      console.error('Failed to fetch live streams:', err.message);
      setApiError(true);
    } finally {
      setIsRefreshing(false);
      setIsLoadingLive(false);
    }
  };

  useEffect(() => {
    fetchLiveStreams();
    const interval = setInterval(fetchLiveStreams, 60000);
    return () => clearInterval(interval);
  }, []);

  const filteredStreamers = YATRA_STREAMERS.filter(s => 
    s.name.toLowerCase().includes(search.toLowerCase())
  );
  
  const filteredLive = liveStreams.filter(s => 
    s.channelTitle.toLowerCase().includes(search.toLowerCase()) || 
    s.title.toLowerCase().includes(search.toLowerCase())
  );

  const isSelected = (id: string) => selectedStreamers.some(s => s.id === id || s.channelId === id);

  const handleCustomAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customName || !customId) return;

    onAddStreamer({
      id: `custom-${Date.now()}`,
      name: customName,
      platform: customPlatform,
      channelId: customId,
      color: '#ffffff',
      isCustom: true
    });

    setCustomName('');
    setCustomId('');
    setShowCustomForm(false);
  };

  const handleLiveAdd = (live: LiveStreamData) => {
    if (isSelected(live.id) || isSelected(live.channelTitle)) {
      onRemoveStreamer(live.id);
      return;
    }
    
    // Check if the add logic is videoId vs channelId
    onAddStreamer({
      id: live.id, // Using video id directly
      name: live.channelTitle,
      platform: live.platform,
      // Pass video id for youtube, username for kick
      channelId: live.platform === 'youtube' ? live.id : (live.channelTitle || live.id),
      color: live.platform === 'youtube' ? '#ef4444' : '#53fc18',
      isCustom: true,
    });
  };

  return (
    <div className="flex flex-col h-full bg-[#0d0d0d] border-r border-white/10 w-full lg:w-80 shadow-2xl overflow-hidden">
      <div className="p-4 sm:p-5 border-b border-white/10 flex items-center justify-between shrink-0">
        <h2 className="text-xs font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
          <Search size={14} className="text-amber-500" />
          Streamer Picker
        </h2>
        <div className="flex items-center gap-2">
          {selectedStreamers.length > 0 && (
            <button 
              onClick={clearAll}
              className="text-[10px] font-bold text-red-500 hover:text-red-400 uppercase tracking-tighter sm:tracking-widest mr-2 px-2 py-1 bg-red-500/10 rounded"
            >
              Clear All
            </button>
          )}
          <button 
            onClick={onClose}
            className="lg:hidden p-2 text-gray-400 hover:text-white"
          >
            <X size={20} />
          </button>
        </div>
      </div>

      <div className="p-4 flex-1 overflow-y-auto custom-scrollbar">
        <div className="mb-6 sticky top-0 z-20 bg-[#0d0d0d] pb-2">
          <input
            type="text"
            placeholder="Quick search..."
            className="w-full bg-black border border-white/10 rounded-md py-3 px-4 text-sm text-white focus:outline-none focus:border-amber-500/50 transition-all font-mono"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <section className="mb-8">
          <div className="flex items-center justify-between mb-3 px-1">
            <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest flex items-center gap-1 text-zinc-600">
              <div className={`w-2 h-2 rounded-full ${apiError ? 'bg-zinc-700' : 'bg-red-500 animate-pulse'}`} />
              Live Now ({isLoadingLive ? '...' : liveStreams.length})
            </h3>
            <button 
              onClick={() => fetchLiveStreams()}
              disabled={isRefreshing}
              className={cn(
                "p-1 hover:bg-white/5 rounded transition-all text-zinc-600 hover:text-amber-500",
                isRefreshing && "animate-spin text-amber-500"
              )}
              title="Refresh Live List"
            >
              <RefreshCw size={12} />
            </button>
          </div>
          <div className="grid grid-cols-1 gap-2">
            {!isLoadingLive && apiError && (
              <div className="p-3 bg-red-500/5 border border-red-500/10 rounded-lg">
                <p className="text-[10px] text-red-400 font-medium leading-relaxed italic">
                  Live data unavailable on this host. Use Quick Add or Custom Stream instead.
                </p>
              </div>
            )}
            {!isLoadingLive && !apiError && filteredLive.length === 0 && (
              <p className="text-xs text-gray-500 px-1 py-2 italic font-mono opacity-50">Searching for live signals...</p>
            )}
            {!isLoadingLive && !apiError && filteredLive.map((stream) => {
              const selected = isSelected(stream.id) || isSelected(stream.channelTitle);
              return (
                <button
                  key={stream.id}
                  onClick={() => handleLiveAdd(stream)}
                  className={cn(
                    "flex flex-col gap-1 p-2 rounded transition-all border text-left",
                    selected 
                      ? "bg-amber-500/10 border-amber-500/50 text-amber-500 ring-1 ring-amber-500/30 shadow-lg shadow-amber-900/5" 
                      : "bg-white/5 border-white/5 hover:border-amber-500/50 text-gray-200"
                  )}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="text-sm font-bold truncate pr-2 capitalize">{stream.channelTitle}</span>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <a 
                        href={stream.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="p-1 sm:p-1.5 hover:bg-white/10 rounded transition-colors"
                        title="Open in new tab"
                      >
                         <ExternalLink size={10} className="text-zinc-500 hover:text-white" />
                      </a>
                      <span className={cn(
                        "px-1.5 py-0.5 rounded text-[9px] font-black italic uppercase",
                        stream.platform === 'youtube' ? "bg-red-600 text-white" : "bg-[#53fc18] text-black"
                      )}>
                        {stream.platform === 'youtube' ? 'YT' : 'Kick'}
                      </span>
                    </div>
                  </div>
                  <span className="text-[10px] text-gray-400 truncate opacity-70 w-full line-clamp-1">{stream.title}</span>
                </button>
              );
            })}
          </div>
        </section>

        <section className="mb-4">
          <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-3 px-1">Quick Add (YouTube)</h3>
          <div className="grid grid-cols-1 gap-2">
            {filteredStreamers.filter(s => s.platform === 'youtube').map((streamer) => {
              const selected = isSelected(streamer.id);
              return (
                <button
                  key={streamer.id}
                  onClick={() => selected ? onRemoveStreamer(streamer.id) : onAddStreamer(streamer)}
                  className={cn(
                    "flex items-center justify-between p-3 rounded transition-all border",
                    selected 
                      ? "bg-amber-500/10 border-amber-500/50 text-amber-500 ring-1 ring-amber-500/30" 
                      : "bg-white/5 border-white/5 hover:border-amber-500/50 text-gray-200"
                  )}
                >
                  <span className="text-sm font-bold">{streamer.name}</span>
                  <span className={cn(
                    "px-1.5 py-0.5 rounded text-[9px] font-bold italic uppercase",
                    streamer.platform === 'youtube' ? "bg-red-600 text-white" : "bg-[#53fc18] text-black"
                  )}>
                    {streamer.platform === 'youtube' ? 'YT' : 'Kick'}
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        <section className="mb-8">
          <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-3 px-1">Quick Add (Kick)</h3>
          <div className="grid grid-cols-1 gap-2">
            {filteredStreamers.filter(s => s.platform === 'kick').map((streamer) => {
              const selected = isSelected(streamer.id);
              return (
                <button
                  key={streamer.id}
                  onClick={() => selected ? onRemoveStreamer(streamer.id) : onAddStreamer(streamer)}
                  className={cn(
                    "flex items-center justify-between p-3 rounded transition-all border",
                    selected 
                      ? "bg-amber-500/10 border-amber-500/50 text-amber-500 ring-1 ring-amber-500/30" 
                      : "bg-white/5 border-white/5 hover:border-amber-500/50 text-gray-200"
                  )}
                >
                  <span className="text-sm font-bold">{streamer.name}</span>
                  <span className={cn(
                    "px-1.5 py-0.5 rounded text-[9px] font-bold italic uppercase",
                    streamer.platform === 'youtube' ? "bg-red-600 text-white" : "bg-[#53fc18] text-black"
                  )}>
                    {streamer.platform === 'youtube' ? 'YT' : 'Kick'}
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        <section>
          <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-3 px-1">Custom Stream</h3>
          {!showCustomForm ? (
            <button
              onClick={() => setShowCustomForm(true)}
              className="w-full py-2 bg-white/5 border border-white/5 rounded text-gray-400 hover:text-white hover:border-white/20 text-[10px] font-bold transition-all flex items-center justify-center gap-2 uppercase tracking-widest"
            >
              <Plus size={14} />
              Add Custom Channel
            </button>
          ) : (
            <motion.form 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              onSubmit={handleCustomAdd} 
              className="space-y-3 bg-black/40 p-3 rounded-lg border border-white/5 shadow-inner"
            >
              <div className="flex gap-1 p-1 bg-black rounded border border-white/10">
                <button
                  type="button"
                  onClick={() => setCustomPlatform('youtube')}
                  className={cn(
                    "flex-1 py-1 text-[10px] font-bold rounded transition-all",
                    customPlatform === 'youtube' ? "bg-white/10 text-white" : "text-zinc-500 hover:text-zinc-300"
                  )}
                >
                  YOUTUBE
                </button>
                <button
                  type="button"
                  onClick={() => setCustomPlatform('kick')}
                  className={cn(
                    "flex-1 py-1 text-[10px] font-bold rounded transition-all",
                    customPlatform === 'kick' ? "bg-white/10 text-white" : "text-zinc-500 hover:text-zinc-300"
                  )}
                >
                  KICK
                </button>
              </div>
              <input
                type="text"
                placeholder="Channel Name"
                className="w-full bg-black border border-white/10 rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
              />
              <input
                type="text"
                placeholder={customPlatform === 'youtube' ? "Channel ID (UC...) or Video ID" : "Username"}
                className="w-full bg-black border border-white/10 rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                value={customId}
                onChange={(e) => setCustomId(e.target.value)}
              />
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="flex-1 bg-amber-600 hover:bg-amber-500 text-black font-bold text-xs py-2 rounded transition-colors uppercase tracking-tighter"
                >
                  Add to Viewport
                </button>
                <button
                  type="button"
                  onClick={() => setShowCustomForm(false)}
                  className="px-3 bg-white/5 hover:bg-white/10 text-white rounded transition-colors"
                >
                  <X size={14} />
                </button>
              </div>
            </motion.form>
          )}
        </section>

        <section className="mt-8">
          <div className="p-3 bg-gradient-to-br from-amber-900/20 to-black border border-amber-900/30 rounded-xl">
            <p className="text-[11px] text-amber-200/60 leading-relaxed italic">
              "Experience the chaos of Los Santos from every angle. Yatra RP exclusive tool."
            </p>
          </div>
        </section>
      </div>

      <div className="p-4 border-t border-white/10 bg-black/20">
        <p className="text-[8px] text-gray-600 text-center uppercase tracking-[0.3em] font-black">
          Yatra RP Engine v1.0
        </p>
      </div>
    </div>
  );
};
