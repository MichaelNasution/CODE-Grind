import React from 'react';

const NOTE_TO_KEY = {
    'C3': 'Z', 'C#3': 'S', 'D3': 'X', 'D#3': 'D', 'E3': 'C', 'F3': 'V', 'F#3': 'G', 'G3': 'B', 'G#3': 'H', 'A3': 'N', 'A#3': 'J', 'B3': 'M',
    'C4': 'Q', 'C#4': '2', 'D4': 'W', 'D#4': '3', 'E4': 'E', 'F4': 'R', 'F#4': '5', 'G4': 'T', 'G#4': '6', 'A4': 'Y', 'A#4': '7', 'B4': 'U',
    'C5': 'I', 'C#5': '9', 'D5': 'O', 'D#5': '0', 'E5': 'P'
};

export default function PianoKey({ note, type, isActive }) {
    const keyLabel = NOTE_TO_KEY[note] || '';

    return (
        <div 
            className={`key-${type} ${isActive ? 'active' : ''}`} 
            data-note={note}
            role="button"
            aria-label={`Piano key ${note}`}
        >
            <span className="key-label-note">{note}</span>
            <span className="key-label-key">{keyLabel}</span>
        </div>
    );
}
