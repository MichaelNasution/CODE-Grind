import React from 'react';

export default function ControlBar({
    showNotes, setShowNotes,
    showKeys, setShowKeys,
    sustainOn, setSustainOn,
    volume, setVolume,
    metronomeOn, setMetronomeOn,
    bpm, setBpm,
    isRecording, toggleRecording,
    isPlaying, togglePlayback,
    hasRecording,
    chordName
}) {
    return (
        <header id="control-panel">
            <div className="logo">
                <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
                </svg>
                <h1>Virtual Piano</h1>
            </div>

            <div className="controls">
                {/* Chord Detector Display - Moved inside Control Bar as requested */}
                <div id="chord-display">
                    <span className="chord-label">Chord:</span>
                    <span id="chord-name">{chordName}</span>
                </div>

                <button 
                    className={`toggle-btn ${showNotes ? 'active' : ''}`} 
                    onClick={() => setShowNotes(!showNotes)}
                    aria-label="Toggle notes"
                >
                    <span className="dot"></span>Notes
                </button>

                <button 
                    className={`toggle-btn ${showKeys ? 'active' : ''}`} 
                    onClick={() => setShowKeys(!showKeys)}
                    aria-label="Toggle keys"
                >
                    <span className="dot"></span>Keys
                </button>

                <button 
                    className={`toggle-btn ${sustainOn ? 'active' : ''}`} 
                    onClick={() => setSustainOn(!sustainOn)}
                    aria-label="Toggle sustain"
                >
                    <span className="dot"></span>Sustain
                </button>

                <div className="control-group">
                    <button 
                        className={`toggle-btn ${metronomeOn ? 'active' : ''}`} 
                        onClick={() => setMetronomeOn(!metronomeOn)}
                        aria-label="Toggle metronome"
                    >
                        <span className="dot"></span>Metronome
                    </button>
                    <input 
                        type="number" 
                        id="bpm-input" 
                        value={bpm} 
                        min="40" max="240" 
                        onChange={(e) => {
                            let val = Number(e.target.value);
                            if (val < 40) val = 40;
                            if (val > 240) val = 240;
                            setBpm(val);
                        }}
                        aria-label="BPM"
                    />
                </div>

                <button 
                    className={`toggle-btn record-btn ${isRecording ? 'active' : ''}`} 
                    onClick={toggleRecording}
                    aria-label="Toggle record"
                >
                    <span className="dot indicator"></span>Record
                </button>

                <button 
                    className={`toggle-btn play-btn ${isPlaying ? 'active' : ''}`} 
                    onClick={togglePlayback}
                    disabled={!hasRecording && !isPlaying}
                    aria-label="Play recording"
                >
                    <span className="dot"></span>Play
                </button>

                <div className="volume-control">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                        <path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path>
                        <path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path>
                    </svg>
                    <input 
                        type="range" 
                        id="volume-slider" 
                        min="0" max="100" 
                        value={volume}
                        onChange={(e) => setVolume(Number(e.target.value))}
                        aria-label="Volume" 
                    />
                </div>
            </div>
        </header>
    );
}
