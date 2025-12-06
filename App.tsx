import React, { useState, useEffect } from 'react';
import { SetupPhase } from './components/SetupPhase';
import { GamePhase } from './components/GamePhase';
import { AppMode, Assignment } from './types';
import { STORAGE_KEY_ASSIGNMENTS, STORAGE_KEY_FAMILIES } from './constants';

const App: React.FC = () => {
  const [mode, setMode] = useState<AppMode>('setup');
  
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
    
    if (sharedData && families.length === 0) {
      try {
        // Decode Unicode safe Base64
        // Reverse operation of btoa(unescape(encodeURIComponent(str)))
        const decodedJson = decodeURIComponent(escape(atob(sharedData)));
        const decodedFamilies = JSON.parse(decodedJson);
        
        if (Array.isArray(decodedFamilies) && decodedFamilies.length >= 2) {
          setFamilies(decodedFamilies);
          setOriginalFamilies(decodedFamilies); // Store original list
          // Don't auto-start game immediately, let them see the list, or start if they prefer
          // But to be "easy to use", let's switch to setup so they can review, or game? 
          // The prompt implies "vispirs prasa ievadīt vardu", so maybe go straight to Setup review?
          // Let's go to setup so they can see who is imported.
          setMode('setup'); 
        }
      } catch (e) {
        console.error("Failed to parse shared URL data", e);
        // Fallback for simple base64 (old links if any)
        try {
           const simpleDecoded = JSON.parse(atob(sharedData));
           if (Array.isArray(simpleDecoded)) setFamilies(simpleDecoded);
        } catch(e2) {
           console.error("Fallback parsing failed", e2);
        }
      }
    } else if (families.length >= 2 && assignments.length > 0) {
      // If we have data and assignments, we probably reloaded in the middle of a game
      setMode('game');
    }
  }, []);

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
      setMode('game');
    }
  };

  const handleReset = () => {
    if (window.confirm("Vai tiešām vēlaties dzēst visus datus un sākt no jauna? Tas izdzēsīs gan dalībniekus, gan rezultātus.")) {
      // 1. Clear State
      setFamilies([]);
      setOriginalFamilies([]);
      setAssignments([]);
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