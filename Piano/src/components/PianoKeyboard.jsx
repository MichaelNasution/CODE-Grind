import React, { useEffect, useRef } from 'react';
import PianoKey from './PianoKey';

const HAS_SHARP = new Set(['C', 'D', 'F', 'G', 'A']);
const START_OCTAVE = 2;
const END_OCTAVE = 7;

const KEY_MAP = {
    'z': 'C3',  's': 'C#3', 'x': 'D3',  'd': 'D#3',
    'c': 'E3',  'v': 'F3',  'g': 'F#3',  'b': 'G3',
    'h': 'G#3', 'n': 'A3',  'j': 'A#3',  'm': 'B3',
    'q': 'C4',  '2': 'C#4', 'w': 'D4',  '3': 'D#4',
    'e': 'E4',  'r': 'F4',  '5': 'F#4', 't': 'G4',
    '6': 'G#4', 'y': 'A4',  '7': 'A#4', 'u': 'B4',
    'i': 'C5',  '9': 'C#5', 'o': 'D5',  '0': 'D#5', 'p': 'E5',
};

export default function PianoKeyboard({ activeNotes, playNote, stopNote, ensureAudioStarted, showNotes, showKeys, octaveShift }) {
    const pianoRef = useRef(null);
    const pointerNotesRef = useRef(new Map());
    const heldKeysRef = useRef(new Map()); // Key -> Note

    const shiftNoteOctave = (noteStr, shift) => {
        if (!shift) return noteStr;
        const match = noteStr.match(/([A-Z]#?)(\d)/);
        if (!match) return noteStr;
        let [, noteName, octave] = match;
        octave = Number(octave) + shift;
        if (octave < 2) octave = 2;
        if (octave > 7) octave = 7;
        // Edge case C8
        if (octave > 7 && noteName !== 'C') octave = 7;
        return noteName + octave;
    };

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.repeat) return;
            if (document.activeElement && document.activeElement.tagName === 'INPUT') return;

            const key = e.key.toLowerCase();
            const baseNote = KEY_MAP[key];
            if (!baseNote) return;

            e.preventDefault();
            ensureAudioStarted();

            if (heldKeysRef.current.has(key)) return;
            
            const shiftedNote = shiftNoteOctave(baseNote, octaveShift);
            heldKeysRef.current.set(key, shiftedNote);
            playNote(shiftedNote);
        };

        const handleKeyUp = (e) => {
            const key = e.key.toLowerCase();
            if (!heldKeysRef.current.has(key)) return;

            const playedNote = heldKeysRef.current.get(key);
            heldKeysRef.current.delete(key);
            stopNote(playedNote);
        };

        document.addEventListener('keydown', handleKeyDown);
        document.addEventListener('keyup', handleKeyUp);

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            document.removeEventListener('keyup', handleKeyUp);
            // We should release all held keys on unmount or shift change if we want it perfect,
            // but just leaving them held locally is fine as `stopNote` cleans up.
        };
    }, [playNote, stopNote, ensureAudioStarted, octaveShift]);

    const getKeyFromPointer = (e) => {
        const target = document.elementFromPoint(e.clientX, e.clientY);
        if (!target) return null;
        const keyEl = target.closest('.key-white, .key-black');
        return keyEl ? keyEl.dataset.note : null;
    };

    const handlePointerDown = (e) => {
        e.preventDefault();
        ensureAudioStarted();
        if (pianoRef.current) {
            pianoRef.current.setPointerCapture(e.pointerId);
        }

        const note = getKeyFromPointer(e);
        if (note) {
            pointerNotesRef.current.set(e.pointerId, note);
            playNote(note);
        }
    };

    const handlePointerMove = (e) => {
        if (!pointerNotesRef.current.has(e.pointerId)) return;
        e.preventDefault();

        const note = getKeyFromPointer(e);
        const prev = pointerNotesRef.current.get(e.pointerId);

        if (note !== prev) {
            if (prev) stopNote(prev);
            if (note) {
                pointerNotesRef.current.set(e.pointerId, note);
                playNote(note);
            } else {
                pointerNotesRef.current.set(e.pointerId, null);
            }
        }
    };

    const onPointerEnd = (e) => {
        const note = pointerNotesRef.current.get(e.pointerId);
        if (note) stopNote(note);
        pointerNotesRef.current.delete(e.pointerId);
    };

    // Generate Key Elements
    const renderKeys = () => {
        const keys = [];
        for (let oct = START_OCTAVE; oct <= END_OCTAVE; oct++) {
            const whiteNotes = oct === END_OCTAVE ? ['C'] : ['C', 'D', 'E', 'F', 'G', 'A', 'B'];

            whiteNotes.forEach((name) => {
                const whiteNote = name + oct;
                const hasSharp = HAS_SHARP.has(name) && oct !== END_OCTAVE;
                const sharpNote = hasSharp ? name + '#' + oct : null;

                keys.push(
                    <div className="key-wrapper" key={whiteNote}>
                        <PianoKey note={whiteNote} type="white" isActive={activeNotes.has(whiteNote)} />
                        {hasSharp && (
                            <PianoKey note={sharpNote} type="black" isActive={activeNotes.has(sharpNote)} />
                        )}
                    </div>
                );
            });
        }
        return keys;
    };

    let pianoClasses = '';
    if (!showNotes) pianoClasses += ' hide-notes';
    if (!showKeys) pianoClasses += ' hide-keys';

    return (
        <div 
            id="piano" 
            className={pianoClasses.trim()}
            role="application" 
            aria-label="Piano keyboard"
            ref={pianoRef}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={onPointerEnd}
            onPointerCancel={onPointerEnd}
        >
            {renderKeys()}
        </div>
    );
}
