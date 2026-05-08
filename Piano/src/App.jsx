import React, { useState } from 'react';
import useAudioEngine from './hooks/useAudioEngine';
import useChordDetector from './hooks/useChordDetector';
import useMidi from './hooks/useMidi';
import ControlBar from './components/ControlBar';
import PianoKeyboard from './components/PianoKeyboard';
import Visualizer from './components/Visualizer';

export default function App() {
    const [activeNotes, setActiveNotes] = useState(new Set());
    const [visualBlocks, setVisualBlocks] = useState(null);
    const [showNotes, setShowNotes] = useState(true);
    const [showKeys, setShowKeys] = useState(true);

    const {
        samplerReady,
        audioStarted,
        ensureAudioStarted,
        playNote,
        stopNote,
        sustainOn, setSustainOn,
        volume, setVolume,
        metronomeOn, setMetronomeOn,
        bpm, setBpm,
        isRecording, toggleRecording,
        isPlaying, togglePlayback,
        hasRecording
    } = useAudioEngine(setActiveNotes, setVisualBlocks);

    const chordName = useChordDetector(activeNotes);
    useMidi(playNote, stopNote, ensureAudioStarted);

    return (
        <div id="app">
            <div id="loading-overlay" className={samplerReady && audioStarted ? 'hidden' : ''}>
                <div className="loader-ring"></div>
                <h2 id="loading-text">{samplerReady ? 'Ready' : 'Loading Samples...'}</h2>
                <p>High-fidelity audio engine initializing</p>
                <button 
                    id="start-btn" 
                    style={{ display: samplerReady && !audioStarted ? 'inline-block' : 'none' }}
                    onClick={ensureAudioStarted}
                >
                    Start Playing
                </button>
            </div>

            <ControlBar
                showNotes={showNotes} setShowNotes={setShowNotes}
                showKeys={showKeys} setShowKeys={setShowKeys}
                sustainOn={sustainOn} setSustainOn={setSustainOn}
                volume={volume} setVolume={setVolume}
                metronomeOn={metronomeOn} setMetronomeOn={setMetronomeOn}
                bpm={bpm} setBpm={setBpm}
                isRecording={isRecording} toggleRecording={toggleRecording}
                isPlaying={isPlaying} togglePlayback={togglePlayback}
                hasRecording={hasRecording}
                chordName={chordName}
            />

            <main id="piano-wrapper">
                <Visualizer visualEvent={visualBlocks} />
                <PianoKeyboard 
                    activeNotes={activeNotes}
                    playNote={playNote}
                    stopNote={stopNote}
                    ensureAudioStarted={ensureAudioStarted}
                    showNotes={showNotes}
                    showKeys={showKeys}
                />
            </main>
        </div>
    );
}
