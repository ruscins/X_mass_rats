import React, { useState, useEffect } from 'react';
import { SetupPhase } from './components/SetupPhase';
import { GamePhase } from './components/GamePhase';
import { AppMode, Assignment } from './types';
import { STORAGE_KEY_ASSIGNMENTS, STORAGE_KEY_FAMILIES } from './constants';
import { soundEffects } from './utils/sounds';
import { Volume2, VolumeX, Music } from 'lucide-react';

const App: React.FC = () => {
  const [mode, setMode] = useState<AppMode>('setup');
  const [isSharedList, setIsSharedList] = useState(false); // Track if list came from shared link
  const [isMuted, setIsMuted] = useState(false);
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  
  // State initialization with localStorage check
  const [families, setFamilies] = useState<string[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_FAMILIES);
    return saved ? JSON.parse(saved) : [];
  });
  
  // Store original families list to share correctly
  const [originalFamilies, setOriginalFamilies] = useState<string[]>(() => {
    const saved = localStorage.getItem('originalFamilies');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [assignments, setAssignments] = useState<Assignment[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_ASSIGNMENTS);
    return saved ? JSON.parse(saved) : [];
  });

  // Check for shared data in URL on initial load
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sharedData = params.get('data');
    
    if (sharedData) {
      try {
        // Decode Unicode safe Base64
        // Reverse operation of btoa(unescape(encodeURIComponent(str)))
        const decodedJson = decodeURIComponent(escape(atob(sharedData)));
        const decodedFamilies = JSON.parse(decodedJson);
        
        if (Array.isArray(decodedFamilies) && decodedFamilies.length >= 2) {
          // If we already have data, ask user what to do
          if (families.length > 0) {
            const shouldReplace = window.confirm(
              "Jūs atvērāt kopīgotu sarakstu. Vai vēlaties aizstāt pašreizējo sarakstu ar jauno?"
            );
            if (!shouldReplace) {
              // Clear URL params but keep current data
              window.history.replaceState({}, '', window.location.href.split('?')[0]);
              return;
            }
          }
          
          // Load the shared data
          setFamilies(decodedFamilies);
          setOriginalFamilies(decodedFamilies); // Store original list
          setAssignments([]); // Clear any old assignments
          setIsSharedList(true); // Mark as shared list (read-only)
          setMode('setup');
          
          // Clear URL params after loading
          window.history.replaceState({}, '', window.location.href.split('?')[0]);
        }
      } catch (e) {
        console.error("Failed to parse shared URL data", e);
        // Fallback for simple base64 (old links if any)
        try {
           const simpleDecoded = JSON.parse(atob(sharedData));
           if (Array.isArray(simpleDecoded)) {
             setFamilies(simpleDecoded);
             setOriginalFamilies(simpleDecoded);
             setAssignments([]);
             setIsSharedList(true); // Mark as shared list
             setMode('setup');
           }
        } catch(e2) {
           console.error("Fallback parsing failed", e2);
        }
      }
    } else if (families.length >= 2 && assignments.length > 0) {
      // If we have data and assignments, we probably reloaded in the middle of a game
      setMode('game');
    }
  }, []);
  
  // Start background music on first user interaction
  useEffect(() => {
    const startMusic = () => {
      if (!isMusicPlaying && !isMuted) {
        soundEffects.startBackgroundMusic();
        setIsMusicPlaying(true);
      }
      // Remove listeners after first interaction
      document.removeEventListener('click', startMusic);
      document.removeEventListener('keydown', startMusic);
    };

    document.addEventListener('click', startMusic);
    document.addEventListener('keydown', startMusic);

    return () => {
      document.removeEventListener('click', startMusic);
      document.removeEventListener('keydown', startMusic);
    };
  }, [isMusicPlaying, isMuted]);

  // Persistence effects
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_FAMILIES, JSON.stringify(families));
  }, [families]);
  
  useEffect(() => {
    localStorage.setItem('originalFamilies', JSON.stringify(originalFamilies));
  }, [originalFamilies]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_ASSIGNMENTS, JSON.stringify(assignments));
  }, [assignments]);

  const handleStartGame = () => {
    if (families.length >= 2) {
      // Save original list when starting the game
      setOriginalFamilies(families);
      setIsSharedList(false); // Once game starts, allow editing again
      setMode('game');
    }
  };

  const handleReset = () => {
    if (window.confirm("Vai tiešām vēlaties dzēst visus datus un sākt no jauna? Tas izdzēsīs gan dalībniekus, gan rezultātus.")) {
      // 1. Clear State
      setFamilies([]);
      setOriginalFamilies([]);
      setAssignments([]);
      setIsSharedList(false);
      setMode('setup');
      
      // 2. Clear Storage
      localStorage.removeItem(STORAGE_KEY_FAMILIES);
      localStorage.removeItem('originalFamilies');
      localStorage.removeItem(STORAGE_KEY_ASSIGNMENTS);
      
      // 3. Clear URL Params without reload
      // We use split('?') to get the clean path regardless of whether we are on localhost or github pages subpath
      const cleanUrl = window.location.href.split('?')[0];
      window.history.pushState({}, '', cleanUrl);
    }
  };

  return (
    <div className="min-h-screen flex flex-col p-4 relative z-10 overflow-x-hidden pb-12">
      {/* Sound toggle button */}
      <button
        onClick={() => {
          const muted = soundEffects.toggleMute();
          setIsMuted(muted);
          setIsMusicPlaying(!muted);
        }}
        className="fixed top-4 right-4 z-50 bg-white/20 backdrop-blur-sm p-3 rounded-full hover:bg-white/30 transition-all hover:scale-110 active:scale-95 shadow-lg"
        title={isMuted ? "Ieslēgt skaņu" : "Izslēgt skaņu"}
      >
        {isMuted ? (
          <VolumeX size={24} className="text-white" />
        ) : (
          <div className="relative">
            <Volume2 size={24} className="text-white" />
            {isMusicPlaying && (
              <Music size={12} className="text-xmas-gold absolute -top-1 -right-1 animate-pulse" />
            )}
          </div>
        )}
      </button>

      <header className="text-center py-6 mb-4">
        <h1 className="text-4xl md:text-5xl font-christmas font-bold text-white drop-shadow-[0_2px_2px_rgba(0,0,0,0.5)]">
          Ziemassvētku Rats
        </h1>
        {mode === 'game' && (
           <div className="mt-2 flex justify-center gap-4 text-xs text-white/80">
             <button 
               onClick={handleReset}
               className="underline hover:text-white hover:font-bold transition-all"
             >
               Sākt visu no jauna
             </button>
           </div>
        )}
      </header>

      <main className="flex-1 w-full max-w-4xl mx-auto">
        {mode === 'setup' ? (
          <SetupPhase 
            families={families} 
            setFamilies={setFamilies} 
            onStartGame={handleStartGame}
            originalFamilies={originalFamilies}
            isReadOnly={isSharedList}
          />
        ) : (
          <GamePhase 
            families={families} 
            setFamilies={setFamilies}
            assignments={assignments}
            setAssignments={setAssignments}
            onReset={handleReset}
            originalFamilies={originalFamilies}
          />
        )}
      </main>

      <footer className="mt-8 text-center text-white/40 text-sm">
        <p>Priecīgus Ziemassvētkus! 🎅</p>
      </footer>
    </div>
  );
};

export default App;