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
        // Decode base64 and parse JSON
        const decodedFamilies = JSON.parse(atob(sharedData));
        if (Array.isArray(decodedFamilies) && decodedFamilies.length >= 2) {
          setFamilies(decodedFamilies);
          setMode('game'); // Auto-start game if valid data found
        }
      } catch (e) {
        console.error("Failed to parse shared URL data", e);
      }
    }
  }, []);

  // Persistence effects
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_FAMILIES, JSON.stringify(families));
  }, [families]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_ASSIGNMENTS, JSON.stringify(assignments));
  }, [assignments]);

  const handleStartGame = () => {
    if (families.length >= 2) {
      setMode('game');
    }
  };

  const handleReset = () => {
    if (window.confirm("Vai tiešām vēlaties dzēst visus datus un sākt no jauna? Tas izdzēsīs gan dalībniekus, gan rezultātus.")) {
      setFamilies([]);
      setAssignments([]);
      setMode('setup');
      localStorage.removeItem(STORAGE_KEY_FAMILIES);
      localStorage.removeItem(STORAGE_KEY_ASSIGNMENTS);
      
      // Clear URL parameters without reloading page so the shared link data doesn't come back immediately
      window.history.pushState({}, '', window.location.pathname);
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
          />
        ) : (
          <GamePhase 
            families={families} 
            setFamilies={setFamilies}
            assignments={assignments}
            setAssignments={setAssignments}
            onReset={handleReset}
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