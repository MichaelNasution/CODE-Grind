import { useState, useEffect } from 'react';
import { Chord } from '@tonaljs/tonal';

export default function useChordDetector(activeNotes) {
    const [chordName, setChordName] = useState('--');

    useEffect(() => {
        if (!activeNotes || activeNotes.size === 0) {
            setChordName('--');
            return;
        }

        // Extract pitch classes (e.g. C4 -> C)
        const pitchClasses = Array.from(activeNotes).map(n => n.replace(/\d/, ''));
        const uniqueNotes = [...new Set(pitchClasses)];

        if (uniqueNotes.length >= 3) {
            const detected = Chord.detect(uniqueNotes);
            if (detected.length > 0) {
                setChordName(detected[0]);
            } else {
                setChordName(uniqueNotes.join(', '));
            }
        } else {
            setChordName(uniqueNotes.join(', '));
        }
    }, [activeNotes]);

    return chordName;
}
