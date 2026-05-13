import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Streamer, LayoutMode, StreamConfig } from './types';
import { StreamPlayer } from './components/StreamPlayer';
import { StreamerPicker } from './components/StreamerPicker';
import { cn } from './lib/utils';
import { 
  LayoutGrid, 
  Scaling, 
  Move, 
  Menu, 
  Settings2, 
  Tv2,
  AlertCircle,
  Heart
} from 'lucide-react';
import { motion, AnimatePresence, Reorder } from 'motion/react';

export default function App() {
  const [selectedStreamers, setSelectedStreamers] = useState<Streamer[]>([]);
  const [layoutMode, setLayoutMode] = useState<LayoutMode>('grid');
  const [focusedId, setFocusedId] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [logoError, setLogoError] = useState(false);
  const [streamConfigs, setStreamConfigs] = useState<StreamConfig[]>([]);
  const [currentView, setCurrentView] = useState<'multiview' | 'donation'>('multiview');

  const LOGO_URL = "input_file_0.png";
  const [donationQrUrl, setDonationQrUrl] = useState("input_file_1.png");
  const [qrError, setQrError] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  // Check for max streamers on add
  const addStreamer = (streamer: Streamer) => {
    if (selectedStreamers.length >= 10) return;
    if (selectedStreamers.find(s => s.id === streamer.id)) return;
    setSelectedStreamers(prev => [...prev, streamer]);
    
    // Default config for free layout
    const newConfig: StreamConfig = {
      id: streamer.id,
      streamer,
      zIndex: streamConfigs.length + 1,
      position: { x: 50 + (selectedStreamers.length * 20), y: 50 + (selectedStreamers.length * 20) },
      size: { width: 400, height: 225 }
    };
    setStreamConfigs(prev => [...prev, newConfig]);
  };

  const removeStreamer = (id: string) => {
    setSelectedStreamers(prev => prev.filter(s => s.id !== id));
    setStreamConfigs(prev => prev.filter(c => c.id !== id));
    if (focusedId === id) setFocusedId(null);
  };

  const toggleFocus = (id: string) => {
    setFocusedId(prev => (prev === id ? null : id));
    if (layoutMode !== 'focus') setLayoutMode('focus');
  };

  // Helper for grid layout calculations
  const getGridCols = (count: number) => {
    if (count <= 1) return 'grid-cols-1';
    if (count <= 2) return 'grid-cols-2';
    if (count <= 4) return 'grid-cols-2';
    if (count <= 6) return 'grid-cols-3';
    if (count <= 9) return 'grid-cols-3';
    return 'grid-cols-4';
  };

  const getGridRows = (count: number) => {
    if (count <= 2) return 'grid-rows-1';
    if (count <= 4) return 'grid-rows-2';
    if (count <= 6) return 'grid-rows-2';
    if (count <= 9) return 'grid-rows-3';
    return 'grid-rows-3';
  };

  return (
    <div className="h-screen w-full bg-[#080808] text-gray-100 flex flex-col overflow-hidden select-none font-sans">
      <AnimatePresence>
        {isLoading && (
          <motion.div
            key="loading"
            initial={{ opacity: 1 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="fixed inset-0 z-[100] bg-[#080808] flex flex-col items-center justify-center"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ 
                duration: 0.8, 
                ease: [0.16, 1, 0.3, 1],
                opacity: { duration: 0.4 }
              }}
              className="relative"
            >
              <div className="relative w-32 h-32 sm:w-48 sm:h-48 z-10 flex items-center justify-center">
                 {!logoError ? (
                   <img 
                     src={LOGO_URL} 
                     onError={() => setLogoError(true)}
                     className="w-full h-full object-contain drop-shadow-[0_0_50px_rgba(245,158,11,0.5)]" 
                     alt="Yatra RP Logo"
                     referrerPolicy="no-referrer"
                   />
                 ) : (
                   <div className="w-full h-full flex items-center justify-center relative">
                     <span className="font-black text-4xl sm:text-6xl tracking-tight italic bg-gradient-to-b from-amber-200 via-amber-500 to-amber-700 bg-clip-text text-transparent drop-shadow-lg select-none relative z-10 pr-2">
                       YRMV
                     </span>
                   </div>
                 )}
              </div>
            </motion.div>
            
            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="mt-8 flex flex-col items-center gap-2"
            >
              <h1 className="text-2xl sm:text-3xl font-black tracking-tighter text-white italic">YATRA MULTIVIEW</h1>
              <div className="flex items-center gap-3">
                <div className="h-[1px] w-8 bg-zinc-800" />
                <span className="text-[10px] font-bold text-amber-500 uppercase tracking-[0.3em]">Engine Loading</span>
                <div className="h-[1px] w-8 bg-zinc-800" />
              </div>
            </motion.div>

            <div className="absolute bottom-12 text-[10px] text-zinc-600 font-medium tracking-tight">
              Made With <span className="text-red-500">❤️</span> From <span className="text-amber-500/80">AyushXD</span> For Yatra RP
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sidebar - Streamer Picker */}
      <AnimatePresence mode="wait">
        {isSidebarOpen && (
          <>
            <div className={`fixed inset-0 bg-black/60 z-[60] lg:hidden ${isSidebarOpen ? 'block' : 'hidden'}`} onClick={() => setIsSidebarOpen(false)} />
            <motion.div
              initial={{ x: -320 }}
              animate={{ x: 0 }}
              exit={{ x: -320 }}
              transition={{ type: 'spring', damping: 25, stiffness: 120 }}
              className="fixed lg:relative z-[70] lg:z-50 h-full w-72 sm:w-80 shadow-2xl shadow-black/80"
            >
              <StreamerPicker
                selectedStreamers={selectedStreamers}
                onAddStreamer={addStreamer}
                onRemoveStreamer={removeStreamer}
                onClose={() => setIsSidebarOpen(false)}
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: isLoading ? 0 : 1 }}
        transition={{ duration: 0.5 }}
        className="flex-1 flex flex-col min-w-0 relative"
      >
        {/* Header / Control Bar */}
        <header className="h-16 shrink-0 border-b border-white/10 bg-[#0d0d0d] flex items-center justify-between px-4 sm:px-6 z-40">
          <div className="flex items-center gap-2 sm:gap-4">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 hover:bg-white/5 rounded-lg transition-colors text-zinc-400 hover:text-white flex-shrink-0"
            >
              <Menu size={20} />
            </button>
            <div className="flex items-center gap-2 sm:gap-3">
               <div className="relative w-8 h-8 sm:w-10 sm:h-10 flex-shrink-0">
                 {!logoError ? (
                   <img 
                     src={LOGO_URL} 
                     onError={() => setLogoError(true)}
                     className="w-full h-full rounded-lg shadow-lg shadow-orange-900/20 object-contain shadow-amber-500/20" 
                     alt="Logo"
                     referrerPolicy="no-referrer"
                   />
                 ) : (
                    <div className="w-full h-full flex items-center justify-center relative">
                     <span className="font-black text-[8px] sm:text-[10px] tracking-tight italic bg-gradient-to-b from-amber-200 via-amber-500 to-amber-700 bg-clip-text text-transparent leading-none relative z-10 pr-0.5">
                       YRMV
                     </span>
                   </div>
                 )}
               </div>
               <div className="flex flex-col -space-y-0.5 overflow-hidden">
                 <h1 className="text-sm sm:text-base font-black tracking-tighter leading-none truncate text-white">YATRA RP</h1>
                 <span className="text-[7px] sm:text-[9px] text-zinc-500 font-medium tracking-tight truncate flex items-center gap-1">
                   Made With <span className="text-red-500">❤️</span> From <span className="text-amber-500 font-bold">AyushXD</span> For Yatra RP
                 </span>
               </div>
            </div>
          </div>

          <div className="flex bg-black/40 p-1 rounded-full border border-white/5 mx-2">
            <button
               onClick={() => setCurrentView('multiview')}
               className={cn(
                 "px-4 py-1.5 rounded-full text-[10px] font-black tracking-widest uppercase transition-all flex items-center justify-center",
                 currentView === 'multiview' ? "bg-white/10 text-white" : "text-gray-500 hover:text-white"
               )}
            >
               MULTIVIEW
            </button>
            <button
               onClick={() => setCurrentView('donation')}
               className={cn(
                 "px-4 py-1.5 rounded-full text-[10px] font-black tracking-widest uppercase transition-all flex items-center justify-center gap-2",
                 currentView === 'donation' ? "bg-amber-500/20 text-amber-500" : "text-gray-500 hover:text-white"
               )}
            >
               <Heart size={10} className={currentView === 'donation' ? "fill-amber-500" : ""} />
               DONATE
            </button>
          </div>

          {/* Layout Controls - Hide text on mobile */}
          {currentView === 'multiview' && (
            <div className="flex bg-black/40 p-1 rounded-full border border-white/5 mx-2">
            <button
              onClick={() => setLayoutMode('grid')}
              className={cn(
                "p-1.5 sm:px-4 sm:py-1.5 rounded-full text-xs font-semibold transition-all flex items-center justify-center",
                layoutMode === 'grid' ? "bg-white/10 text-white" : "text-gray-500 hover:text-white"
              )}
            >
              <LayoutGrid size={14} />
              <span className="hidden md:inline ml-2">EQUAL GRID</span>
            </button>
            <button
              onClick={() => setLayoutMode('focus')}
              className={cn(
                "p-1.5 sm:px-4 sm:py-1.5 rounded-full text-xs font-semibold transition-all flex items-center justify-center",
                layoutMode === 'focus' ? "bg-white/10 text-white" : "text-gray-500 hover:text-white"
              )}
            >
              <Scaling size={14} />
              <span className="hidden md:inline ml-2">FOCUS MODE</span>
            </button>
            <button
              onClick={() => setLayoutMode('free')}
              className={cn(
                "p-1.5 sm:px-4 sm:py-1.5 rounded-full text-xs font-semibold transition-all flex items-center justify-center",
                layoutMode === 'free' ? "bg-white/10 text-white" : "text-gray-500 hover:text-white"
              )}
            >
              <Move size={14} />
              <span className="hidden md:inline ml-2">FREE DRAG</span>
            </button>
          </div>
          )}

          <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
             <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-red-500/10 border border-red-500/20 rounded-md">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                <span className="text-[10px] font-bold text-red-500 uppercase tracking-wider">{selectedStreamers.length} STREAMS</span>
             </div>
             <div className="w-8 h-8 rounded-full bg-gray-800 border border-white/10 flex items-center justify-center text-xs text-gray-400 cursor-pointer">
               <Settings2 size={16} />
             </div>
          </div>
        </header>

        {/* Viewport Area */}
        <main className="flex-1 bg-[#050505] p-4 relative overflow-auto custom-scrollbar">
          {currentView === 'donation' ? (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="h-full w-full flex flex-col items-center justify-center max-w-4xl mx-auto p-4"
            >
              <div className="relative group">
                <div className="absolute -inset-4 bg-gradient-to-tr from-amber-500/20 to-orange-500/20 blur-2xl opacity-50 group-hover:opacity-100 transition-opacity" />
                <div className="relative bg-[#0d0d0d] p-6 sm:p-8 rounded-[2rem] border border-white/10 shadow-2xl flex flex-col items-center">
                  <div className="w-full aspect-square max-w-[300px] bg-white rounded-xl overflow-hidden shadow-2xl mb-8 relative flex items-center justify-center">
                    {!qrError ? (
                      <img 
                        src={donationQrUrl} 
                        alt="Donation QR Code" 
                        className="w-full h-full object-contain"
                        onError={() => {
                          if (donationQrUrl === "input_file_1.png") {
                            setDonationQrUrl("input_file_2.png");
                          } else {
                            setQrError(true);
                          }
                        }}
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="text-zinc-900 font-bold p-8 text-center flex flex-col items-center gap-4">
                        <AlertCircle size={48} className="text-amber-600" />
                        <p>QR Code could not be loaded. Please check the image source.</p>
                      </div>
                    )}
                  </div>
                  
                  <div className="text-center space-y-4 max-w-md mx-auto">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-500/10 border border-amber-500/20 rounded-full">
                       <Heart size={12} className="text-amber-500 fill-amber-500" />
                       <span className="text-[10px] font-black text-amber-500 tracking-widest uppercase">Support the project</span>
                    </div>
                    <h2 className="text-3xl sm:text-4xl font-black italic tracking-tighter text-white">SUPPORT YATRA RP</h2>
                    <p className="text-zinc-500 text-sm leading-relaxed">
                      Your donations help us maintain the servers and continue improving the Multiview Experience for the Yatra community. Every contribution matters!
                    </p>
                    
                    <button 
                      onClick={() => setCurrentView('multiview')}
                      className="mt-4 px-8 py-3 bg-zinc-800 hover:bg-zinc-700 text-white rounded-full font-bold text-xs tracking-[0.1em] uppercase transition-all"
                    >
                      Back to streams
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ) : selectedStreamers.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-12">
               <div className="w-24 h-24 bg-[#0d0d0d] rounded-3xl flex items-center justify-center mb-6 border border-white/5 shadow-2xl">
                 <Tv2 size={48} className="text-zinc-700" />
               </div>
               <h2 className="text-3xl font-black italic tracking-tighter mb-2 uppercase text-white/90">Your Multiview is empty</h2>
               <p className="text-gray-500 max-w-sm text-sm">Select streamers from the left panel to start watching multiple POVs at once.</p>
               <button 
                 onClick={() => setIsSidebarOpen(true)}
                 className="mt-8 bg-amber-600 hover:bg-amber-500 text-black px-8 py-2.5 rounded-full font-bold text-xs tracking-[0.1em] uppercase transition-all shadow-lg shadow-amber-900/10"
               >
                 Add from Sidebar
               </button>
            </div>
          ) : (
            <div className="h-full w-full">
              {/* EQUAL GRID MODE */}
              {layoutMode === 'grid' && (
                <div className="flex flex-wrap content-start sm:content-center justify-center gap-3 sm:gap-4 w-full h-full overflow-y-auto custom-scrollbar p-1 sm:p-2">
                  {selectedStreamers.map(s => (
                    <div
                      key={s.id}
                      className={cn(
                        "transition-all duration-300 w-full",
                        selectedStreamers.length === 1 && "xl:h-[80vh] xl:max-w-7xl aspect-video",
                        selectedStreamers.length === 2 && "md:w-[calc(50%-16px)] aspect-video",
                        selectedStreamers.length >= 3 && selectedStreamers.length <= 4 && "md:w-[calc(50%-16px)] aspect-video",
                        selectedStreamers.length >= 5 && selectedStreamers.length <= 6 && "md:w-[calc(50%-16px)] lg:w-[calc(33.33%-16px)] aspect-video",
                        selectedStreamers.length >= 7 && selectedStreamers.length <= 9 && "md:w-[calc(33.33%-16px)] aspect-video",
                        selectedStreamers.length >= 10 && "md:w-[calc(33.33%-16px)] lg:w-[calc(25%-16px)] aspect-video",
                        // Default fallback for smaller screens
                        "h-auto aspect-video max-h-[35vh] sm:max-h-none"
                      )}
                    >
                      <StreamPlayer
                        streamer={s}
                        onRemove={() => removeStreamer(s.id)}
                        onFocus={() => toggleFocus(s.id)}
                      />
                    </div>
                  ))}
                </div>
              )}

              {/* FOCUS MODE */}
              {layoutMode === 'focus' && (
                <div className="flex flex-col xl:flex-row gap-4 w-full h-full overflow-hidden">
                  <div className="flex-1 min-w-0 h-[45vh] sm:h-[55vh] xl:h-full flex items-center justify-center">
                    <div className="w-full aspect-video max-h-full">
                      {focusedId ? (
                        <StreamPlayer
                          streamer={selectedStreamers.find(s => s.id === focusedId) || selectedStreamers[0]}
                          onRemove={() => removeStreamer(focusedId)}
                          isFocused
                          onFocus={() => setFocusedId(null)}
                        />
                      ) : (
                        <StreamPlayer
                          streamer={selectedStreamers[0]}
                          onRemove={() => removeStreamer(selectedStreamers[0].id)}
                          isFocused
                        />
                      )}
                    </div>
                  </div>
                  <div className="xl:w-80 flex xl:flex-col gap-3 overflow-x-auto xl:overflow-y-auto pb-4 xl:pb-0 xl:pr-2 custom-scrollbar snap-x">
                    {selectedStreamers
                      .filter(s => s.id !== (focusedId || selectedStreamers[0].id))
                      .map(s => (
                        <div key={s.id} className="h-28 sm:h-36 w-48 sm:w-64 xl:w-auto xl:h-48 shrink-0 snap-center">
                          <StreamPlayer
                            streamer={s}
                            onRemove={() => removeStreamer(s.id)}
                            onFocus={() => setFocusedId(s.id)}
                            showControls={true}
                          />
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {/* FREE DRAG MODE */}
              {layoutMode === 'free' && (
                <div className="relative w-full h-full border border-dashed border-zinc-800 rounded-2xl">
                   {selectedStreamers.map((s, index) => (
                     <motion.div
                       key={s.id}
                       drag
                       dragMomentum={false}
                       initial={{ opacity: 0, scale: 0.9 }}
                       animate={{ opacity: 1, scale: 1 }}
                       style={{ 
                         zIndex: index,
                         position: 'absolute',
                         width: 480,
                         height: 270,
                         left: 20 + (index * 40),
                         top: 20 + (index * 40)
                       }}
                       className="cursor-grab active:cursor-grabbing"
                     >
                        <StreamPlayer
                          streamer={s}
                          onRemove={() => removeStreamer(s.id)}
                        />
                     </motion.div>
                   ))}
                   <div className="absolute top-4 right-4 flex items-center gap-2 bg-black/60 backdrop-blur p-2 rounded-lg border border-white/10 pointer-events-none">
                      <Move size={12} className="text-amber-500" />
                      <span className="text-[10px] font-bold text-white uppercase">Freestyle Mode is active</span>
                   </div>
                </div>
              )}
            </div>
          )}
        </main>
      </motion.div>

      {/* Global CSS for scrollbar */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
          height: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #27272a;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #3f3f46;
        }
      `}</style>
    </div>
  );
}

