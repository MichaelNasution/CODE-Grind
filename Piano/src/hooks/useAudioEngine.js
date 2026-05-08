import { useState, useRef, useCallback, useEffect } from 'react';
import * as Tone from 'tone';

// Allowed notes
const CHROMATIC = ['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'];
const VALID_NOTES = new Set();
for (let o=2; o<=7; o++) {
    if (o===7) VALID_NOTES.add('C7');
    else CHROMATIC.forEach(n => VALID_NOTES.add(n+o));
}

export default function useAudioEngine(setActiveNotes, setVisualBlocks) {
    const samplerRef = useRef(null);
    const metronomeRef = useRef(null);
    const playbackPartRef = useRef(null);
    
    // Track note start times for recording
    const noteOnTimesRef = useRef(new Map());

    const [samplerReady, setSamplerReady] = useState(false);
    const [audioStarted, setAudioStarted] = useState(false);
    
    const [sustainOn, setSustainOn] = useState(false);
    const sustainRef = useRef(false); // keep ref in sync for callbacks
    
    const [volume, setVolume] = useState(75);
    
    const [metronomeOn, setMetronomeOn] = useState(false);
    const [bpm, setBpm] = useState(120);

    const [isRecording, setIsRecording] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const [recordedNotes, setRecordedNotes] = useState([]);
    
    const recordingStartTimeRef = useRef(0);

    // Initialization
    useEffect(() => {
        const sampler = new Tone.Sampler({
            urls: {
                'A0' : 'A0.mp3',
                'C1' : 'C1.mp3',  'D#1': 'Ds1.mp3', 'F#1': 'Fs1.mp3', 'A1' : 'A1.mp3',
                'C2' : 'C2.mp3',  'D#2': 'Ds2.mp3', 'F#2': 'Fs2.mp3', 'A2' : 'A2.mp3',
                'C3' : 'C3.mp3',  'D#3': 'Ds3.mp3', 'F#3': 'Fs3.mp3', 'A3' : 'A3.mp3',
                'C4' : 'C4.mp3',  'D#4': 'Ds4.mp3', 'F#4': 'Fs4.mp3', 'A4' : 'A4.mp3',
                'C5' : 'C5.mp3',  'D#5': 'Ds5.mp3', 'F#5': 'Fs5.mp3', 'A5' : 'A5.mp3',
                'C6' : 'C6.mp3',  'D#6': 'Ds6.mp3', 'F#6': 'Fs6.mp3', 'A6' : 'A6.mp3',
                'C7' : 'C7.mp3',  'D#7': 'Ds7.mp3', 'F#7': 'Fs7.mp3', 'A7' : 'A7.mp3',
                'C8' : 'C8.mp3',
            },
            baseUrl: 'https://tonejs.github.io/audio/salamander/',
            release: 1.2,
            onload: () => setSamplerReady(true),
        }).toDestination();
        samplerRef.current = sampler;

        const metronome = new Tone.MembraneSynth({
            pitchDecay: 0.008,
            octaves: 2,
            envelope: { attack: 0.001, decay: 0.1, sustain: 0, release: 0.01 }
        }).toDestination();
        metronome.volume.value = -10;
        metronomeRef.current = metronome;

        Tone.Transport.scheduleRepeat((time) => {
            if (metronomeOn) {
                const isDownbeat = Tone.Transport.position.split(':')[1] === '0';
                metronomeRef.current.triggerAttackRelease(isDownbeat ? 'C5' : 'G4', '32n', time);
            }
        }, '4n');

        return () => {
            sampler.dispose();
            metronome.dispose();
            if (playbackPartRef.current) playbackPartRef.current.dispose();
            Tone.Transport.cancel();
        };
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    // Sync state to refs and audio params
    useEffect(() => { sustainRef.current = sustainOn; }, [sustainOn]);
    
    useEffect(() => {
        if (Tone.Transport.state === 'started' && !metronomeOn && !isPlaying) {
            Tone.Transport.stop();
        } else if (metronomeOn && Tone.Transport.state !== 'started') {
            Tone.Transport.start();
        }
    }, [metronomeOn, isPlaying]);

    useEffect(() => { Tone.Transport.bpm.value = bpm; }, [bpm]);
    
    useEffect(() => {
        Tone.Destination.volume.value = volume === 0 ? -Infinity : 20 * Math.log10(volume / 100);
    }, [volume]);

    const ensureAudioStarted = useCallback(async () => {
        if (audioStarted) return;
        await Tone.start();
        setAudioStarted(true);
    }, [audioStarted]);

    // Helpers to dispatch visual actions to React state safely
    const triggerVisualStart = useCallback((note) => {
        setActiveNotes(prev => {
            const next = new Set(prev);
            next.add(note);
            return next;
        });
        setVisualBlocks(prev => ({ ...prev, type: 'start', note, time: performance.now() }));
    }, [setActiveNotes, setVisualBlocks]);

    const triggerVisualStop = useCallback((note) => {
        setActiveNotes(prev => {
            const next = new Set(prev);
            next.delete(note);
            return next;
        });
        setVisualBlocks(prev => ({ ...prev, type: 'stop', note, time: performance.now() }));
    }, [setActiveNotes, setVisualBlocks]);

    const playNote = useCallback((note, time = Tone.now(), velocity = 1) => {
        if (!samplerReady || !audioStarted || !VALID_NOTES.has(note)) return;

        samplerRef.current.triggerAttack(note, time, velocity);
        triggerVisualStart(note);

        if (isRecording) {
            noteOnTimesRef.current.set(note, Tone.now() - recordingStartTimeRef.current);
        }
    }, [samplerReady, audioStarted, isRecording, triggerVisualStart]);

    const stopNote = useCallback((note, time = Tone.now()) => {
        if (!samplerReady || !audioStarted) return;

        triggerVisualStop(note);

        if (!sustainRef.current) {
            samplerRef.current.triggerRelease(note, time);
        }

        if (isRecording && noteOnTimesRef.current.has(note)) {
            const startTime = noteOnTimesRef.current.get(note);
            const duration = (Tone.now() - recordingStartTimeRef.current) - startTime;
            setRecordedNotes(prev => [...prev, { time: startTime, note, duration }]);
            noteOnTimesRef.current.delete(note);
        }
    }, [samplerReady, audioStarted, isRecording, triggerVisualStop]);

    const releaseAllSustained = useCallback(() => {
        // Stop audio but visual stop is handled if we pass the current active notes, 
        // but here we just blindly release. The actual active notes are cleared by 
        // the components if needed, or we just rely on normal stop.
        // For simplicity in React, it's easier to track active audio notes separately or just release all.
        samplerRef.current.releaseAll();
        // Since we don't have direct access to the activeNotes set inside this ref-less callback without adding it as a dep,
        // we leave visuals to just drop when keys are released.
    }, []);

    const toggleRecording = useCallback(() => {
        ensureAudioStarted();
        setIsRecording(prev => {
            const next = !prev;
            if (next) {
                setRecordedNotes([]);
                noteOnTimesRef.current.clear();
                recordingStartTimeRef.current = Tone.now();
                if (playbackPartRef.current) {
                    playbackPartRef.current.dispose();
                    playbackPartRef.current = null;
                }
            } else {
                // Close held notes
                for (const [note, startTime] of noteOnTimesRef.current.entries()) {
                    const duration = (Tone.now() - recordingStartTimeRef.current) - startTime;
                    setRecordedNotes(notes => [...notes, { time: startTime, note, duration }]);
                }
                noteOnTimesRef.current.clear();
            }
            return next;
        });
    }, [ensureAudioStarted]);

    const togglePlayback = useCallback(() => {
        ensureAudioStarted();
        if (recordedNotes.length === 0 || isRecording) return;

        setIsPlaying(prev => {
            const next = !prev;
            if (next) {
                playbackPartRef.current = new Tone.Part((time, value) => {
                    samplerRef.current.triggerAttackRelease(value.note, value.duration, time);
                    Tone.Draw.schedule(() => {
                        triggerVisualStart(value.note);
                        setTimeout(() => { triggerVisualStop(value.note); }, value.duration * 1000);
                    }, time);
                }, recordedNotes).start(0);
                
                Tone.Transport.start();
                
                const maxTime = Math.max(...recordedNotes.map(n => n.time + n.duration));
                Tone.Transport.scheduleOnce(() => {
                    setIsPlaying(false);
                    if (playbackPartRef.current) playbackPartRef.current.dispose();
                    playbackPartRef.current = null;
                }, `+${maxTime + 0.5}`);
            } else {
                if (playbackPartRef.current) playbackPartRef.current.dispose();
                playbackPartRef.current = null;
                setIsPlaying(false);
            }
            return next;
        });
    }, [recordedNotes, isRecording, ensureAudioStarted, triggerVisualStart, triggerVisualStop]);

    return {
        samplerReady,
        audioStarted,
        ensureAudioStarted,
        playNote,
        stopNote,
        sustainOn,
        setSustainOn,
        releaseAllSustained,
        volume,
        setVolume,
        metronomeOn,
        setMetronomeOn,
        bpm,
        setBpm,
        isRecording,
        toggleRecording,
        isPlaying,
        togglePlayback,
        hasRecording: recordedNotes.length > 0
    };
}
