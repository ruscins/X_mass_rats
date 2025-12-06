import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Wheel } from './Wheel';
import { Button } from './Button';
import { Assignment, WheelSegment } from '../types';
import { WHEEL_COLORS } from '../constants';
import { User, ArrowRight, Share2, RefreshCw } from 'lucide-react';

interface GamePhaseProps {
  families: string[];
  setFamilies: (f: string[]) => void;
  assignments: Assignment[];
  setAssignments: (a: Assignment[]) => void;
  onReset: () => void;
  originalFamilies: string[];
}

export const GamePhase: React.FC<GamePhaseProps> = ({ 
  families, 
  setFamilies,
  assignments, 
  setAssignments,
  onReset,
  originalFamilies
}) => {
  const [currentUser, setCurrentUser] = useState('');
  const [isSpinning, setIsSpinning] = useState(false);
  const [step, setStep] = useState<'enterName' | 'spin' | 'result'>('enterName');
  const [lastWinner, setLastWinner] = useState<string | null>(null);

  // Generate wheel segments from available families
  const segments: WheelSegment[] = families.map((family, index) => ({
    id: `seg-${index}`,
    label: family,
    color: WHEEL_COLORS[index % WHEEL_COLORS.length]
  }));

  const handleStartSpin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser.trim()) return;
    setStep('spin');
  };

  const handleSpinEnd = (winnerSegment: WheelSegment) => {
    const winnerName = winnerSegment.label;
    
    // Trigger confetti
    confetti({
      particleCount: 150,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#D42426', '#165B33', '#F8B229', '#FFFFFF']
    });

    setLastWinner(winnerName);
    
    // Save assignment
    const newAssignment: Assignment = {
      spinner: currentUser,
      receiver: winnerName,
      timestamp: Date.now()
    };
    
    setAssignments([...assignments, newAssignment]);
    
    // Remove winner from the wheel for future spins
    const remainingFamilies = families.filter(f => f !== winnerName);
    setFamilies(remainingFamilies);

    setStep('result');
  };

  const handleNextTurn = () => {
    setLastWinner(null);
    setCurrentUser('');
    setStep('enterName');
  };

  const shareResults = () => {
    const text = "🎄 Ziemassvētku Izlozes Rezultāti 🎄\n\n" + 
      assignments.map(a => `${a.spinner} 🎁 ${a.receiver}`).join('\n');
    
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(whatsappUrl, '_blank');
  };
  
  const shareWheel = () => {
    try {
      // Share the ORIGINAL families list, not the current one
      const familiesToShare = originalFamilies.length > 0 ? originalFamilies : families;
      const jsonString = JSON.stringify(familiesToShare);
      const safeEncoded = btoa(unescape(encodeURIComponent(jsonString)));
      
      const baseUrl = window.location.href.split('?')[0]; 
      const url = `${baseUrl}?data=${safeEncoded}`;
      
      const text = `Hei! Pievienojies Ziemassvētku dāvanu ratam! Spied šeit: ${url}`;
      const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(text)}`;
      window.open(whatsappUrl, '_blank');
    } catch (error) {
      console.error("Error creating share link:", error);
      alert("Neizdevās izveidot saiti. Mēģiniet vēlreiz.");
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col items-center">
      
      {/* Header Results Table (Visible always to see progress) */}
      {assignments.length > 0 && (
        <div className="w-full bg-white/90 rounded-xl p-4 mb-6 shadow-lg max-h-40 overflow-y-auto">
          <h3 className="text-xmas-darkRed font-bold mb-2 flex justify-between items-center sticky top-0 bg-white/90 pb-2 border-b border-gray-200">
            <span>Rezultātu Tabula</span>
            <div className="flex gap-2">
              <button onClick={shareWheel} className="text-sm bg-blue-600 text-white px-2 py-1 rounded flex items-center gap-1 hover:bg-blue-700" title="Kopīgot ratu ar citiem">
                <Share2 size={14} /> Kopīgot
              </button>
              <button onClick={shareResults} className="text-sm bg-green-600 text-white px-2 py-1 rounded flex items-center gap-1 hover:bg-green-700" title="Dalīties ar rezultātiem">
                <Share2 size={14} /> Rezultāti
              </button>
            </div>
          </h3>
          <div className="space-y-1">
            {assignments.map((a, i) => (
              <div key={i} className="flex justify-between items-center text-sm text-gray-800 border-b border-gray-100 last:border-0 py-1">
                <span className="font-semibold">{a.spinner}</span>
                <ArrowRight size={14} className="text-xmas-gold mx-2" />
                <span className="font-bold text-xmas-darkRed">{a.receiver}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Game Area */}
      {families.length === 0 && step !== 'result' ? (
        <div className="text-center bg-white/10 backdrop-blur-md p-8 rounded-2xl border border-white/20">
          <h2 className="text-3xl font-christmas mb-4 text-white">Izloze Pabeigta!</h2>
          <p className="mb-6 text-white/90">Visi ir izlozēti. Priecīgus Ziemassvētkus!</p>
          <div className="flex flex-col gap-4 justify-center">
            <Button onClick={shareResults} className="bg-green-600 text-white hover:bg-green-700 !border-none">
               <Share2 size={18} className="inline mr-2"/> Sūtīt rezultātus WhatsApp
            </Button>
            <Button onClick={onReset} variant="secondary">
              <RefreshCw className="inline mr-2" size={18}/> Sākt pilnībā no jauna
            </Button>
          </div>
        </div>
      ) : (
        <>
          {step === 'enterName' && (
            <div className="w-full max-w-md bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/20 animate-fadeIn">
              <h2 className="text-2xl font-christmas text-center mb-4 text-white">Kas griež ratu?</h2>
              <form onSubmit={handleStartSpin} className="flex flex-col gap-4">
                <div className="relative">
                  <User className="absolute left-3 top-3.5 text-gray-400" size={20} />
                  <input
                    type="text"
                    required
                    value={currentUser}
                    onChange={(e) => setCurrentUser(e.target.value)}
                    placeholder="Ievadi savu vārdu..."
                    className="w-full pl-10 pr-4 py-3 rounded-xl text-gray-800 focus:outline-none focus:ring-2 focus:ring-xmas-gold"
                  />
                </div>
                <Button type="submit" disabled={!currentUser.trim()}>
                  Turpināt uz Ratu
                </Button>
              </form>
            </div>
          )}

          {step === 'spin' && (
            <div className="flex flex-col items-center animate-fadeIn w-full">
              <h2 className="text-2xl font-christmas mb-2 text-xmas-gold drop-shadow-md">
                {currentUser} griež ratu!
              </h2>
              <p className="text-sm opacity-80 mb-2 text-white">Pieskaries "Griezt" vai ratam, lai noskaidrotu saņēmēju.</p>
              
              <Wheel 
                segments={segments} 
                onSpinEnd={handleSpinEnd} 
                isSpinning={isSpinning} 
                setIsSpinning={setIsSpinning} 
              />
            </div>
          )}

          {step === 'result' && (
            <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-2xl text-center animate-popIn mx-4">
              <p className="text-gray-500 text-lg mb-2">{currentUser} apdāvinās:</p>
              <h1 className="text-4xl font-bold text-xmas-red mb-6 font-christmas">{lastWinner}</h1>
              <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200 mb-6 text-sm text-gray-600">
                <p>⚠️ {lastWinner} ir izņemts no rata nākamajiem griezieniem.</p>
              </div>
              <Button onClick={handleNextTurn} className="w-full">
                Nākamais Griezējs
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
};