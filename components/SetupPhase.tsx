import React, { useState } from 'react';
import { Button } from './Button';
import { Check, Pencil, Plus, Share2, Trash2, X } from 'lucide-react';
import { soundEffects } from '../utils/sounds';
import { createShareUrl } from '../utils/sharing';
import { ShareDialog } from './ShareDialog';

interface SetupPhaseProps {
  families: string[];
  setFamilies: (families: string[]) => void;
  onStartGame: () => void;
  isReadOnly?: boolean;
  isSecretResults: boolean;
  setIsSecretResults: (value: boolean) => void;
}

export const SetupPhase: React.FC<SetupPhaseProps> = ({ families, setFamilies, onStartGame, isReadOnly = false, isSecretResults, setIsSecretResults }) => {
  const [inputValue, setInputValue] = useState('');
  const [feedback, setFeedback] = useState('');
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editingValue, setEditingValue] = useState('');
  const [shareUrl, setShareUrl] = useState('');

  const addFamily = (e?: React.FormEvent) => {
    e?.preventDefault();
    const names = inputValue.split(/\r?\n/).map((name) => name.trim()).filter(Boolean);
    const knownNames = new Set(families.map((name) => name.toLocaleLowerCase('lv')));
    const additions: string[] = [];

    names.forEach((name) => {
      const key = name.toLocaleLowerCase('lv');
      if (!knownNames.has(key)) {
        additions.push(name);
        knownNames.add(key);
      }
    });

    if (additions.length > 0) {
      setFamilies([...families, ...additions]);
      setInputValue('');
      setFeedback(names.length > additions.length ? 'Dublikāti izlaisti; pārējie dalībnieki pievienoti.' : `${additions.length} dalībnieki pievienoti.`);
      soundEffects.success();
    } else if (names.length > 0) {
      setFeedback('Šie dalībnieki jau ir sarakstā.');
      soundEffects.error();
    }
  };

  const saveEdit = (index: number) => {
    const updatedName = editingValue.trim();
    const duplicate = families.some((name, currentIndex) => currentIndex !== index && name.toLocaleLowerCase('lv') === updatedName.toLocaleLowerCase('lv'));

    if (!updatedName || duplicate) {
      setFeedback(duplicate ? 'Šāds dalībnieks jau ir sarakstā.' : 'Vārds nevar būt tukšs.');
      return;
    }

    setFamilies(families.map((name, currentIndex) => currentIndex === index ? updatedName : name));
    setEditingIndex(null);
    setFeedback('Dalībnieka vārds atjaunināts.');
  };

  const removeFamily = (index: number) => {
    setFamilies(families.filter((_, currentIndex) => currentIndex !== index));
    soundEffects.delete();
  };

  const shareSetup = () => {
    try {
      soundEffects.whoosh();
      setShareUrl(createShareUrl(families));
    } catch (error) {
      console.error("Error creating share link:", error);
      setFeedback('Neizdevās izveidot saiti. Mēģini vēlreiz.');
    }
  };
  
  const clearAllFamilies = () => {
    if (families.length > 0 && window.confirm("Vai tiešām vēlaties izdzēst visus dalībniekus?")) {
      setFamilies([]);
      soundEffects.delete();
    }
  };

  return (
    <section className="surface-panel mx-auto w-full max-w-2xl p-5 sm:p-8">
      <div className="mb-7 border-b border-[#d6ded7] pb-5">
        <p className="eyebrow">Ziemassvētku dāvanu izloze</p>
        <h2 className="display-type mt-2 text-3xl text-[#17392c] sm:text-4xl">
          {isReadOnly ? 'Pievienojies izlozei' : 'Sagatavo dalībniekus'}
        </h2>
        <p className="mt-2 max-w-xl text-sm leading-6 text-[#526258]">
          {isReadOnly ? 'Kopīgots saraksts ir ielādēts šajā pārlūkā.' : 'Pievieno cilvēkus vai ģimenes. Katru dalībnieku vari rediģēt vai izņemt pirms izlozes.'}
        </p>
      </div>

      {!isReadOnly && (
        <form onSubmit={addFamily} className="mb-5">
          <label htmlFor="participant-input" className="field-label">Dalībnieki</label>
          <div className="flex items-end gap-2">
            <textarea
              id="participant-input"
              value={inputValue}
              onChange={(event) => setInputValue(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' && !event.shiftKey) {
                  event.preventDefault();
                  addFamily();
                }
              }}
              placeholder="Ievadi vārdu vai ielīmē sarakstu, katru dalībnieku jaunā rindā"
              rows={2}
              className="field-control min-h-12 flex-1 resize-y"
            />
            <Button type="submit" disabled={!inputValue.trim()} className="!rounded-lg !px-4 !py-3" aria-label="Pievienot dalībniekus">
              <Plus size={20} />
            </Button>
          </div>
          <p className="mt-1 text-xs text-[#68766d]">Enter pievieno, Shift + Enter ievieto jaunu rindu.</p>
        </form>
      )}

      <div className="mb-6" aria-label="Dalībnieku saraksts">
        {families.length === 0 ? (
          <p className="border-y border-dashed border-[#cbd5cc] py-7 text-center text-sm text-[#68766d]">Saraksts ir tukšs. Pievieno vismaz divus dalībniekus.</p>
        ) : (
          <ul className="max-h-[42vh] divide-y divide-[#dfe5df] overflow-y-auto border-y border-[#dfe5df]">
            {families.map((family, index) => (
              <li key={`${family}-${index}`} className="flex min-h-14 items-center gap-3 py-2">
                {editingIndex === index ? (
                  <>
                    <input
                      autoFocus
                      value={editingValue}
                      onChange={(event) => setEditingValue(event.target.value)}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter') saveEdit(index);
                        if (event.key === 'Escape') setEditingIndex(null);
                      }}
                      aria-label={`Rediģēt ${family}`}
                      className="field-control min-w-0 flex-1"
                    />
                    <button type="button" onClick={() => saveEdit(index)} aria-label="Saglabāt vārdu" className="icon-button text-[#1d704e]"><Check size={18} /></button>
                    <button type="button" onClick={() => setEditingIndex(null)} aria-label="Atcelt rediģēšanu" className="icon-button"><X size={18} /></button>
                  </>
                ) : (
                  <>
                    <span className="min-w-0 flex-1 break-words font-semibold text-[#17392c]">{family}</span>
                    {!isReadOnly && (
                      <>
                        <button type="button" onClick={() => { setEditingIndex(index); setEditingValue(family); }} aria-label={`Rediģēt ${family}`} className="icon-button"><Pencil size={17} /></button>
                        <button type="button" onClick={() => removeFamily(index)} aria-label={`Noņemt ${family}`} className="icon-button text-[#a43636]"><Trash2 size={17} /></button>
                      </>
                    )}
                  </>
                )}
              </li>
            ))}
          </ul>
        )}
        <p className="mt-2 min-h-5 text-sm text-[#526258]" aria-live="polite">{feedback}</p>
      </div>

      <label className="flex cursor-pointer items-start gap-3 border-y border-[#d6ded7] py-4 text-sm text-[#17392c]">
        <input type="checkbox" checked={isSecretResults} onChange={(event) => setIsSecretResults(event.target.checked)} className="mt-0.5 h-4 w-4 accent-[#1d704e]" />
        <span><strong>Slēpt iepriekšējos rezultātus</strong><span className="mt-1 block text-xs leading-5 text-[#68766d]">Katrs redzēs savu rezultātu; pilna tabula būs pieejama izlozes beigās.</span></span>
      </label>

      <div className="mt-5 flex flex-col gap-3 sm:flex-row">
        <Button onClick={onStartGame} disabled={families.length < 2} className="w-full !rounded-lg sm:flex-1">Sākt izlozi <span aria-hidden="true">→</span></Button>
        {!isReadOnly && families.length >= 2 && (
          <Button onClick={shareSetup} variant="secondary" className="w-full !rounded-lg sm:flex-1"><Share2 size={17} /> Kopīgot sarakstu</Button>
        )}
      </div>
      <p className="mt-3 text-center text-xs leading-5 text-[#68766d]">Saraksts un izloze tiek saglabāti tikai šajā pārlūkā. Kopīgotā saite ielādē sarakstu citā ierīcē, bet nesinhronizē rezultātus.</p>

      {!isReadOnly && families.length > 0 && (
        <button type="button" onClick={clearAllFamilies} className="mt-5 flex w-full items-center justify-center gap-2 py-2 text-sm font-medium text-[#a43636] hover:underline">
          <Trash2 size={16} /> Izdzēst visus dalībniekus
        </button>
      )}
      {shareUrl && <ShareDialog url={shareUrl} onClose={() => setShareUrl('')} />}
    </section>
  );
};