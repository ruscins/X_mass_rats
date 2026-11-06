import React, { useState, useEffect } from 'react';
import { SetupPhase } from './components/SetupPhase';
import { GamePhase } from './components/GamePhase';
import { AppMode, Assignment } from './types';
import { STORAGE_KEY_ASSIGNMENTS, STORAGE_KEY_FAMILIES, STORAGE_KEY_SECRET_RESULTS } from './constants';
import { soundEffects } from './utils/sounds';
import { Volume2, VolumeX } from 'lucide-react';
import { decodeSharedFamilies } from './utils/sharing';

let storageRecoveryNeeded = false;

const readStoredValue = <T,>(key: string, fallback: T): T => {
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) as T : fallback;
  } catch {
    storageRecoveryNeeded = true;
    return fallback;
  }
};

const readStoredNames = (key: string): string[] => {
  const stored = readStoredValue<unknown>(key, []);
  if (!Array.isArray(stored)) {
    storageRecoveryNeeded = true;
    return [];
  }
  return [...new Set(stored.filter((value): value is string => typeof value === 'string').map((value) => value.trim()).filter(Boolean))];
};

const readStoredAssignments = (): Assignment[] => {
  const stored = readStoredValue<unknown>(STORAGE_KEY_ASSIGNMENTS, []);
  if (!Array.isArray(stored)) {
    storageRecoveryNeeded = true;
    return [];
  }
  return stored.filter((value): value is Assignment => Boolean(
    value && typeof value === 'object' && typeof (value as Assignment).spinner === 'string' && typeof (value as Assignment).receiver === 'string'
  ));
};

const App: React.FC = () => {
  const [mode, setMode] = useState<AppMode>('setup');
  const [isSharedList, setIsSharedList] = useState(false); // Track if list came from shared link
  const [isMuted, setIsMuted] = useState(true);
  const [isSecretResults, setIsSecretResults] = useState(() => readStoredValue(STORAGE_KEY_SECRET_RESULTS, false));
  
  const [families, setFamilies] = useState<string[]>(() => readStoredNames(STORAGE_KEY_FAMILIES));
  
  const [originalFamilies, setOriginalFamilies] = useState<string[]>(() => readStoredNames('originalFamilies'));
  
  const [assignments, setAssignments] = useState<Assignment[]>(readStoredAssignments);
  const [storageWarning, setStorageWarning] = useState(storageRecoveryNeeded);

  const persistValue = (key: string, value: unknown) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      setStorageWarning(true);
    }
  };

  // Check for shared data in URL on initial load
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sharedData = params.get('data');
    
    if (sharedData) {
      try {
        const decodedFamilies = decodeSharedFamilies(sharedData);
        
        if (decodedFamilies.length >= 2) {
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
        window.alert('Kopīgoto dalībnieku sarakstu neizdevās nolasīt.');
        window.history.replaceState({}, '', window.location.pathname);
      }
    } else if (originalFamilies.length >= 2 && assignments.length > 0) {
      const receiversSet = new Set(assignments.map(a => a.receiver));
      setFamilies(originalFamilies.filter(f => !receiversSet.has(f)));
      setMode('game');
    }
  }, []);

  // Persistence effects
  useEffect(() => {
    persistValue(STORAGE_KEY_FAMILIES, families);
  }, [families]);
  
  useEffect(() => {
    persistValue('originalFamilies', originalFamilies);
  }, [originalFamilies]);

  useEffect(() => {
    persistValue(STORAGE_KEY_ASSIGNMENTS, assignments);
  }, [assignments]);

  useEffect(() => {
    persistValue(STORAGE_KEY_SECRET_RESULTS, isSecretResults);
  }, [isSecretResults]);

  const handleStartGame = () => {
    if (families.length >= 2) {
      // Save original list when starting the game
      setOriginalFamilies(families);
      setIsSharedList(false); // Once game starts, allow editing again
      setAssignments([]);
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
      try {
        localStorage.removeItem(STORAGE_KEY_FAMILIES);
        localStorage.removeItem('originalFamilies');
        localStorage.removeItem(STORAGE_KEY_ASSIGNMENTS);
      } catch {
        setStorageWarning(true);
      }
      
      // 3. Clear URL Params without reload
      // We use split('?') to get the clean path regardless of whether we are on localhost or github pages subpath
      const cleanUrl = window.location.pathname;
      window.history.pushState({}, '', cleanUrl);
    }
  };

  return (
    <div className="app-shell relative z-10 flex min-h-screen flex-col overflow-x-hidden px-4 pb-8">
      <button
        onClick={() => {
          const muted = soundEffects.toggleMute();
          setIsMuted(muted);
        }}
        className="icon-button fixed right-4 top-4 z-50 border border-white/25 bg-[#123b2b]/80 text-white shadow-lg"
        aria-label={isMuted ? 'Ieslēgt skaņas efektus' : 'Izslēgt skaņas efektus'}
        title={isMuted ? 'Ieslēgt skaņas efektus' : 'Izslēgt skaņas efektus'}
      >
        {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
      </button>

      <header className="mx-auto w-full max-w-4xl py-8 text-center sm:py-10">
        <p className="eyebrow text-[#f3c869]">Svētku dāvanu izloze</p>
        <h1 className="display-type mt-2 text-4xl font-bold text-white sm:text-5xl">
          Ziemassvētku Rats
        </h1>
        {mode === 'game' && (
           <div className="mt-3 flex justify-center gap-4 text-sm text-white/80">
             <button 
               onClick={handleReset}
               className="rounded px-2 py-1 underline underline-offset-4 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#f3c869]"
             >
               Sākt jaunu izlozi
             </button>
           </div>
        )}
      </header>

      {storageWarning && (
        <p role="alert" className="mx-auto mb-4 w-full max-w-2xl rounded-lg border border-[#f3c869] bg-[#fff7df] px-4 py-3 text-sm text-[#4c3a14]">
          Pārlūka saglabātos datus neizdevās nolasīt vai ierakstīt. Šīs sesijas izmaiņas var pazust, aizverot cilni.
        </p>
      )}

      <main className="flex-1 w-full max-w-4xl mx-auto">
        {mode === 'setup' ? (
          <SetupPhase 
            families={families} 
            setFamilies={setFamilies} 
            onStartGame={handleStartGame}
            isReadOnly={isSharedList}
            isSecretResults={isSecretResults}
            setIsSecretResults={setIsSecretResults}
          />
        ) : (
          <GamePhase 
            families={families} 
            setFamilies={setFamilies}
            assignments={assignments}
            setAssignments={setAssignments}
            onReset={handleReset}
            originalFamilies={originalFamilies}
            isSecretResults={isSecretResults}
          />
        )}
      </main>

      <footer className="mt-auto pt-8 text-center text-xs text-white/60">
        <p>Priecīgus Ziemassvētkus</p>
      </footer>
    </div>
  );
};

export default App;