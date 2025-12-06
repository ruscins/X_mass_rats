import React, { useState } from 'react';
import { Button } from './Button';
import { Plus, Trash2, Gift, Share2 } from 'lucide-react';
import { soundEffects } from '../utils/sounds';

interface SetupPhaseProps {
  families: string[];
  setFamilies: (families: string[]) => void;
  onStartGame: () => void;
  originalFamilies: string[];
  isReadOnly?: boolean;
}

export const SetupPhase: React.FC<SetupPhaseProps> = ({ families, setFamilies, onStartGame, originalFamilies, isReadOnly = false }) => {
  const [inputValue, setInputValue] = useState('');

  const addFamily = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (inputValue.trim()) {
      if (!families.includes(inputValue.trim())) {
        setFamilies([...families, inputValue.trim()]);
        setInputValue('');
        soundEffects.success();
      } else {
        soundEffects.error();
      }
    }
  };

  const removeFamily = (index: number) => {
    const newFamilies = [...families];
    newFamilies.splice(index, 1);
    setFamilies(newFamilies);
    soundEffects.delete();
  };

  const shareSetupToWhatsApp = () => {
    try {
      soundEffects.whoosh();
      // Safe encoding for Latvian characters (Unicode) to Base64
      // Standard btoa fails with non-Latin1 characters
      const jsonString = JSON.stringify(families);
      const safeEncoded = btoa(unescape(encodeURIComponent(jsonString)));
      
      // Construct URL that works on GitHub Pages or locally
      // We explicitly take the origin and pathname to ensure subdirectories (like on GitHub Pages) are included
      const baseUrl = window.location.href.split('?')[0]; 
      const url = `${baseUrl}?data=${safeEncoded}`;
      
      const text = `Hei! Esmu sagatavojis Ziemassvētku dāvanu ratu. Spied šeit, lai sāktu izlozi: ${url}`;
      
      const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(text)}`;
      window.open(whatsappUrl, '_blank');
    } catch (error) {
      console.error("Error creating share link:", error);
      alert("Neizdevās izveidot saiti. Mēģiniet vēlreiz.");
    }
  };
  
  const clearAllFamilies = () => {
    if (families.length > 0 && window.confirm("Vai tiešām vēlaties izdzēst visus dalībniekus?")) {
      setFamilies([]);
      soundEffects.delete();
    }
  };

  return (
    <div className="max-w-md mx-auto w-full p-4 bg-white/10 backdrop-blur-md rounded-2xl shadow-xl border border-white/20">
      <div className="text-center mb-6">
        <Gift className="w-16 h-16 mx-auto text-xmas-gold mb-2" />
        <h2 className="text-3xl font-christmas text-white mb-2">
          {isReadOnly ? 'Pievienojies Izlozei!' : 'Sagatavošanās'}
        </h2>
        <p className="text-gray-200 text-sm">
          {isReadOnly 
            ? 'Šis saraksts ir kopīgots ar tevi. Nospied "Sākt Izlozi!" lai turpinātu.' 
            : 'Ievadiet ģimenes vai cilvēkus, kuri piedalīsies dāvanu izlozē.'}
        </p>
      </div>

      {!isReadOnly && (
        <form onSubmit={addFamily} className="flex gap-2 mb-6">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Ievadi vārdu/ģimeni..."
            className="flex-1 px-4 py-3 rounded-xl text-gray-800 focus:outline-none focus:ring-2 focus:ring-xmas-gold"
          />
          <Button type="button" onClick={() => addFamily()} className="!px-4 !py-0 flex items-center justify-center">
            <Plus size={24} />
          </Button>
        </form>
      )}

      <div className="space-y-2 mb-8 max-h-[40vh] overflow-y-auto pr-2 custom-scrollbar">
        {families.length === 0 && (
          <div className="text-center text-white/50 py-4 italic animate-fadeIn">
            Saraksts ir tukšs. Pievieno vismaz 2 dalībniekus.
          </div>
        )}
        {families.map((family, index) => (
          <div key={index} className="flex justify-between items-center bg-white/90 p-3 rounded-lg text-xmas-darkRed animate-slideInUp hover:bg-white hover:shadow-lg transition-all duration-200 group">
            <span className="font-semibold group-hover:scale-105 transition-transform">{family}</span>
            {!isReadOnly && (
              <button 
                onClick={() => removeFamily(index)}
                className="text-red-500 hover:text-red-700 p-1 hover:scale-125 transition-all duration-200"
              >
                <Trash2 size={20} />
              </button>
            )}
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-3">
        <Button 
          onClick={onStartGame} 
          disabled={families.length < 2}
          className="w-full text-lg shadow-xl"
        >
          Sākt Izlozi!
        </Button>
        
        {!isReadOnly && families.length >= 2 && (
          <Button 
            onClick={shareSetupToWhatsApp}
            variant="secondary"
            className="w-full flex items-center justify-center gap-2 text-sm bg-green-600 !text-white hover:!bg-green-700 !border-none"
          >
            <Share2 size={16} /> Kopīgot ratu WhatsApp
          </Button>
        )}
        
        {!isReadOnly && families.length > 0 && (
          <Button 
            onClick={clearAllFamilies}
            variant="secondary"
            className="w-full flex items-center justify-center gap-2 text-sm bg-red-600 !text-white hover:!bg-red-700 !border-none"
          >
            <Trash2 size={16} /> Izdzēst visus dalībniekus
          </Button>
        )}

        {families.length < 2 && (
          <p className="text-center text-xs text-red-200 mt-2">Nepieciešami vismaz 2 dalībnieki.</p>
        )}
      </div>
    </div>
  );
};