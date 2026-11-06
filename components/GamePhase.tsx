import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { Wheel } from './Wheel';
import { Button } from './Button';
import { Assignment, WheelSegment } from '../types';
import { WHEEL_COLORS } from '../constants';
import { ArrowRight, Check, Copy, RefreshCw, Share2, Undo2, User } from 'lucide-react';
import { soundEffects } from '../utils/sounds';
import { getViableRecipients } from '../utils/assignment';
import { createShareUrl } from '../utils/sharing';
import { ShareDialog } from './ShareDialog';
import { useReducedMotion } from 'framer-motion';

interface GamePhaseProps {
  families: string[];
  setFamilies: (f: string[]) => void;
  assignments: Assignment[];
  setAssignments: (a: Assignment[]) => void;
  onReset: () => void;
  originalFamilies: string[];
  isSecretResults: boolean;
}

export const GamePhase: React.FC<GamePhaseProps> = ({ 
  families, 
  setFamilies,
  assignments, 
  setAssignments,
  onReset,
  originalFamilies,
  isSecretResults
}) => {
  const [currentUser, setCurrentUser] = useState('');
  const [isSpinning, setIsSpinning] = useState(false);
  const [step, setStep] = useState<'enterName' | 'spin' | 'result'>('enterName');
  const [lastWinner, setLastWinner] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const [shareUrl, setShareUrl] = useState('');
  const [copied, setCopied] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  const availableSpinners = originalFamilies.filter(person => 
    !assignments.find(a => a.spinner === person)
  );

  const eligibleFamilies = getViableRecipients(availableSpinners, families, currentUser);
  const segments: WheelSegment[] = eligibleFamilies.map((family, index) => ({
      id: `seg-${index}`,
      label: family,
      color: WHEEL_COLORS[index % WHEEL_COLORS.length]
  }));

  const handleStartSpin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser.trim() || !availableSpinners.includes(currentUser)) return;
    
    if (segments.length === 0) {
      setMessage('Šim griezienam nav derīga saņēmēja. Atcel iepriekšējo griezienu vai sāc jaunu izlozi.');
      return;
    }
    
    setMessage('');
    soundEffects.spinStart();
    setStep('spin');
  };

  const handleSpinEnd = (winnerSegment: WheelSegment) => {
    const winnerName = winnerSegment.label;
    
    soundEffects.win();
    if (!prefersReducedMotion) {
      confetti({
        particleCount: 90,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#D42426', '#165B33', '#F8B229', '#FFFFFF']
      });
    }

    setLastWinner(winnerName);
    
    const newAssignment: Assignment = {
      spinner: currentUser,
      receiver: winnerName,
      timestamp: Date.now()
    };
    
    setAssignments([...assignments, newAssignment]);
    const remainingFamilies = families.filter(f => f !== winnerName);
    setFamilies(remainingFamilies);

    setStep('result');
  };

  const handleNextTurn = () => {
    setLastWinner(null);
    setCurrentUser('');
    setMessage('');
    setStep('enterName');
  };

  const undoLastDraw = () => {
    const previousAssignments = assignments.slice(0, -1);
    const assignedReceivers = new Set(previousAssignments.map((assignment) => assignment.receiver));
    setAssignments(previousAssignments);
    setFamilies(originalFamilies.filter((person) => !assignedReceivers.has(person)));
    setLastWinner(null);
    setCurrentUser('');
    setMessage('Pēdējais grieziens atcelts.');
    setStep('enterName');
  };

  const shareResults = async () => {
    const text = "Ziemassvētku izlozes rezultāti\n\n" +
      assignments.map(a => `${a.spinner} 🎁 ${a.receiver}`).join('\n');

    if (navigator.share) {
      try {
        await navigator.share({ title: 'Ziemassvētku izlozes rezultāti', text });
        return;
      } catch (error) {
        if (error instanceof Error && error.name === 'AbortError') return;
      }
    }

    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2500);
    } catch {
      window.prompt('Nokopē izlozes rezultātus:', text);
    }
  };
  
  const shareWheel = () => {
    try {
      soundEffects.whoosh();
      setShareUrl(createShareUrl(originalFamilies.length > 0 ? originalFamilies : families));
    } catch (error) {
      console.error("Error creating share link:", error);
      setMessage('Neizdevās izveidot kopīgošanas saiti.');
    }
  };

  const completed = assignments.length >= originalFamilies.length && originalFamilies.length > 0;
  const progress = originalFamilies.length ? Math.min(assignments.length / originalFamilies.length, 1) * 100 : 0;
  const showResultsTable = assignments.length > 0 && (!isSecretResults || (completed && step !== 'result'));

  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col items-center">
      <div className="mb-6 w-full max-w-xl">
        <div className="mb-2 flex items-center justify-between gap-4 text-sm text-white">
          <span className="font-semibold">Izloze</span>
          <span>{assignments.length} / {originalFamilies.length} dalībnieki</span>
        </div>
        <div
          className="h-2 overflow-hidden rounded-full bg-white/20"
          role="progressbar"
          aria-label="Izlozes progress"
          aria-valuemin={0}
          aria-valuemax={originalFamilies.length}
          aria-valuenow={assignments.length}
        >
          <div className="h-full rounded-full bg-[#f3c869] transition-[width] duration-500" style={{ width: `${progress}%` }} />
        </div>
      </div>

      {showResultsTable && (
        <section className="surface-panel mb-6 w-full p-4 sm:p-5" aria-labelledby="results-heading">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-3 border-b border-[#d6ded7] pb-3">
            <h2 id="results-heading" className="text-lg font-bold text-[#17392c]">{completed ? 'Visi rezultāti' : 'Līdzšinējie rezultāti'}</h2>
            <div className="flex flex-wrap gap-1">
              <button type="button" onClick={shareWheel} className="text-button"><Copy size={16} /> Kopīgot sarakstu</button>
              <button type="button" onClick={shareResults} className="text-button"><Share2 size={16} /> Dalīties ar rezultātiem</button>
            </div>
          </div>
          <ul className="max-h-48 divide-y divide-[#e3e8e3] overflow-y-auto">
            {assignments.map((assignment, index) => (
              <li key={`${assignment.spinner}-${index}`} className="flex items-center justify-between gap-3 py-2 text-sm text-[#17392c]">
                <span className="min-w-0 flex-1 break-words font-semibold">{assignment.spinner}</span>
                <ArrowRight size={15} aria-hidden="true" className="shrink-0 text-[#9a6b1e]" />
                <span className="min-w-0 flex-1 break-words text-right font-semibold">{assignment.receiver}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {completed && step !== 'result' ? (
        <section className="surface-panel w-full max-w-xl p-6 text-center sm:p-8">
          <Check size={30} aria-hidden="true" className="mx-auto mb-3 text-[#1d704e]" />
          <h2 className="display-type text-3xl text-[#17392c]">Izloze pabeigta</h2>
          <p className="mt-2 text-sm text-[#526258]">Visi dalībnieki ir izlozējuši saņēmēju.</p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Button onClick={shareResults} className="w-full !rounded-lg sm:flex-1"><Share2 size={17} /> {copied ? 'Rezultāti nokopēti' : 'Dalīties ar rezultātiem'}</Button>
            <Button onClick={onReset} variant="secondary" className="w-full !rounded-lg sm:flex-1"><RefreshCw size={17} /> Jauna izloze</Button>
          </div>
        </section>
      ) : (
        <>
          {step === 'enterName' && (
            <section className="surface-panel w-full max-w-xl p-5 sm:p-7">
              <p className="eyebrow">Nākamais solis</p>
              <h2 className="display-type mb-5 mt-2 text-3xl text-[#17392c]">Kas griež ratu?</h2>
              {availableSpinners.length > 0 ? (
                <form onSubmit={handleStartSpin} className="flex flex-col gap-4">
                  <label htmlFor="current-spinner" className="field-label">Izvēlies savu vārdu</label>
                  <div className="relative">
                    <User className="pointer-events-none absolute left-3 top-3.5 text-[#526258]" size={18} aria-hidden="true" />
                    <select
                      id="current-spinner"
                      required
                      value={currentUser}
                      onChange={(event) => setCurrentUser(event.target.value)}
                      className="field-control w-full pl-10 pr-10"
                    >
                      <option value="">Izvēlies dalībnieku…</option>
                      {availableSpinners.map((person) => <option key={person} value={person}>{person}</option>)}
                    </select>
                  </div>
                  {currentUser && <p className="text-sm leading-6 text-[#526258]">Rats parādīs tikai tos saņēmējus, pēc kuriem izloze joprojām būs pabeidzama.</p>}
                  <p className="min-h-5 text-sm text-[#a43636]" role="status">{message}</p>
                  <Button type="submit" disabled={!currentUser.trim()} className="w-full !rounded-lg">Turpināt pie rata <ArrowRight size={17} /></Button>
                </form>
              ) : (
                <div className="flex flex-col gap-4">
                  <p className="text-sm text-[#526258]">Visi dalībnieki jau ir griezuši ratu.</p>
                  <Button onClick={onReset} variant="secondary" className="!rounded-lg"><RefreshCw size={17} /> Sākt jaunu izlozi</Button>
                </div>
              )}
              {assignments.length > 0 && <button type="button" onClick={undoLastDraw} className="text-button mt-4 text-[#a43636]"><Undo2 size={16} /> Atcelt pēdējo griezienu</button>}
            </section>
          )}

          {step === 'spin' && (
            <section className="flex w-full flex-col items-center" aria-labelledby="spin-heading">
              <h2 id="spin-heading" className="display-type text-center text-3xl text-[#f3c869]">{currentUser} griež ratu</h2>
              <p className="mt-2 text-center text-sm text-white/85">Pieskaries pogai “Griezt”, lai noskaidrotu saņēmēju.</p>
              <Wheel segments={segments} onSpinEnd={handleSpinEnd} isSpinning={isSpinning} setIsSpinning={setIsSpinning} />
              <button type="button" onClick={() => setStep('enterName')} disabled={isSpinning} className="text-button mt-1 text-white">Atpakaļ pie dalībniekiem</button>
            </section>
          )}

          {step === 'result' && (
            <section className="surface-panel w-full max-w-xl p-6 text-center sm:p-8" aria-live="polite">
              <p className="eyebrow">Tavs rezultāts</p>
              <p className="mt-4 text-sm text-[#526258]">{currentUser} dāvinās:</p>
              <h2 className="display-type mt-1 break-words text-4xl text-[#a43636]">{lastWinner}</h2>
              {isSecretResults && !completed && <p className="mt-4 border-y border-[#d6ded7] py-3 text-sm text-[#526258]">Atceries šo vārdu un pēc tam paslēp rezultātu, nododot ierīci nākamajam.</p>}
              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                {assignments.length > 0 && <Button onClick={undoLastDraw} variant="secondary" className="w-full !rounded-lg"><Undo2 size={17} /> Atcelt griezienu</Button>}
                <Button onClick={handleNextTurn} className="w-full !rounded-lg">{completed ? 'Apskatīt rezultātus' : 'Paslēpt un turpināt'} <ArrowRight size={17} /></Button>
              </div>
            </section>
          )}
        </>
      )}

      {completed && step === 'result' && <p className="mt-4 text-center text-sm text-white/80">Nospied “Apskatīt rezultātus”, lai atklātu pilno tabulu.</p>}
      <p className="sr-only" aria-live="polite">{copied ? 'Rezultāti nokopēti.' : ''}</p>
      {shareUrl && <ShareDialog url={shareUrl} onClose={() => setShareUrl('')} />}
    </div>
  );
};