import React, { useState, useRef, useEffect } from 'react';
import { Streamer } from '../types';
import { cn } from '../lib/utils';
import { X, Maximize2, ExternalLink, Ghost, Volume2, VolumeX } from 'lucide-react';

interface StreamPlayerProps {
  streamer: Streamer;
  onRemove: () => void;
  onFocus?: () => void;
  isFocused?: boolean;
  className?: string;
  showControls?: boolean;
}

export const StreamPlayer: React.FC<StreamPlayerProps> = ({
  streamer,
  onRemove,
  onFocus,
  isFocused,
  className,
  showControls = true,
}) => {
  const [volume, setVolume] = useState(50);
  const [isMuted, setIsMuted] = useState(true);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    if (iframeRef.current && iframeRef.current.contentWindow && streamer.platform === 'youtube') {
      const vol = isMuted ? 0 : volume;
      
      // Sending volume and mute commands to YouTube iframe
      iframeRef.current.contentWindow.postMessage(JSON.stringify({
        event: 'command',
        func: 'setVolume',
        args: [vol]
      }), '*');
      
      if (isMuted) {
        iframeRef.current.contentWindow.postMessage(JSON.stringify({
          event: 'command',
          func: 'mute',
          args: []
        }), '*');
      } else {
        iframeRef.current.contentWindow.postMessage(JSON.stringify({
          event: 'command',
          func: 'unMute',
          args: []
        }), '*');
      }
    }
  }, [volume, isMuted, streamer.platform]);

  const getYoutubeEmbedUrl = () => {
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const params = new URLSearchParams({
      autoplay: '1',
      mute: '1',
      enablejsapi: '1',
      origin: origin,
      widget_referrer: origin
    });
    
    const baseUrl = streamer.channelId.startsWith('UC')
      ? `https://www.youtube.com/embed/live_stream?channel=${streamer.channelId}`
      : `https://www.youtube.com/embed/${streamer.channelId}`;
      
    return `${baseUrl}&${params.toString()}`;
  };

  const [currentHost, setCurrentHost] = useState<string | null>(null);
  
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setCurrentHost(window.location.hostname);
    }
  }, []);

  const getKickEmbedUrl = () => {
    const host = currentHost || (typeof window !== 'undefined' ? window.location.hostname : 'localhost');
    return `https://player.kick.com/${streamer.channelId}?muted=true&autoplay=true&parent=${host}`;
  };

  const embedUrl = streamer.platform === 'youtube'
    ? getYoutubeEmbedUrl()
    : getKickEmbedUrl();

  return (
    <div
      className={cn(
        "relative group w-full h-full bg-[#0d0d0d] rounded-xl overflow-hidden border transition-all duration-500 shadow-2xl",
        isFocused ? "border-amber-500/50 shadow-amber-900/10" : "border-white/5",
        className
      )}
    >
      {/* Background Name Flair */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none">
        <span className="text-white/5 text-4xl sm:text-6xl font-black italic uppercase text-center leading-none tracking-tighter">
          {streamer.name.split(' ')[0]}
        </span>
      </div>

      {/* Stream Iframe */}
      <iframe
        ref={iframeRef}
        src={embedUrl}
        className="w-full h-full pointer-events-auto relative z-10"
        allowFullScreen
        allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
        referrerPolicy="no-referrer-when-downgrade"
      />

      {/* Overlay Controls */}
      {showControls && (
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-between pointer-events-none z-20 p-2 sm:p-4">
          <div className="flex flex-col pointer-events-auto max-w-[60%]">
            <div className="flex items-center gap-1.5 sm:gap-2 mb-1">
              <span className={cn(
                "text-white text-[8px] sm:text-[9px] font-black px-1 sm:px-1.5 py-0.5 rounded uppercase tracking-wider",
                streamer.platform === 'youtube' ? "bg-red-600" : "bg-[#53fc18] text-black"
              )}>
                {streamer.platform === 'youtube' ? 'LIVE' : 'KICK'}
              </span>
              <span className="text-xs sm:text-sm font-bold text-white drop-shadow-md truncate">
                {streamer.name}
              </span>
            </div>
            <span className="hidden sm:inline text-[10px] text-gray-400 font-medium">Yatra RP Experience</span>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 pointer-events-auto">
            {streamer.platform === 'youtube' && (
              <div className="flex items-center gap-1.5 sm:gap-2 mr-1 sm:mr-2 bg-black/70 rounded-full px-2 sm:px-3 py-1.5 sm:py-2 border border-white/10 backdrop-blur-sm">
                <button
                  onClick={() => setIsMuted(prev => !prev)}
                  className="p-1 hover:text-amber-500 text-white transition-colors"
                >
                  {isMuted || volume === 0 ? <VolumeX size={16} /> : <Volume2 size={16} />}
                </button>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={isMuted ? 0 : volume}
                  onChange={(e) => {
                    const newVol = Number(e.target.value);
                    setVolume(newVol);
                    if (newVol > 0) {
                      setIsMuted(false);
                    } else {
                      setIsMuted(true);
                    }
                  }}
                  className="w-12 sm:w-20 h-1 bg-white/20 rounded-lg appearance-none cursor-pointer accent-amber-500"
                />
              </div>
            )}

            {onFocus && (
              <button
                onClick={onFocus}
                className={cn(
                  "w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center transition-colors text-white hover:bg-amber-500",
                  isFocused && "bg-amber-500 border border-amber-400 shadow-lg"
                )}
                title="Focus Stream"
              >
                <Maximize2 size={18} />
              </button>
            )}
            <button
              onClick={onRemove}
              className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center transition-colors text-white hover:bg-red-500"
              title="Remove Stream"
            >
              <X size={18} />
            </button>
          </div>
        </div>
      )}

      {/* Loading State Backdrop */}
      <div className="absolute inset-0 z-0 bg-[#0d0d0d] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-white/5 border-t-amber-500 rounded-full animate-spin" />
      </div>
    </div>
  );
};
