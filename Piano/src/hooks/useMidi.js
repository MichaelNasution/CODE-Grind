import { useEffect } from 'react';
import { Midi } from '@tonaljs/tonal';

export default function useMidi(playNote, stopNote, ensureAudioStarted) {
    useEffect(() => {
        if (!navigator.requestMIDIAccess) {
            console.warn('Web MIDI API not supported in this browser.');
            return;
        }

        let midiAccess = null;

        const onMIDIMessage = (msg) => {
            ensureAudioStarted();
            const [command, noteNum, velocity] = msg.data;
            
            // Note On
            if (command >= 144 && command <= 159 && velocity > 0) {
                const note = Midi.midiToNoteName(noteNum);
                playNote(note, undefined, velocity / 127);
            } 
            // Note Off
            else if ((command >= 128 && command <= 143) || (command >= 144 && command <= 159 && velocity === 0)) {
                const note = Midi.midiToNoteName(noteNum);
                stopNote(note);
            }
        };

        const onStateChange = (e) => {
            if (e.port.state === 'connected') {
                e.port.onmidimessage = onMIDIMessage;
            }
        };

        navigator.requestMIDIAccess().then(access => {
            midiAccess = access;
            const inputs = access.inputs.values();
            for (let input of inputs) {
                input.onmidimessage = onMIDIMessage;
            }
            access.onstatechange = onStateChange;
        }).catch(err => console.warn('MIDI Access Denied:', err));

        return () => {
            if (midiAccess) {
                midiAccess.onstatechange = null;
                const inputs = midiAccess.inputs.values();
                for (let input of inputs) {
                    input.onmidimessage = null;
                }
            }
        };
    }, [playNote, stopNote, ensureAudioStarted]);
}
