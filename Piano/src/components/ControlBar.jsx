import React, { useState } from 'react';

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
    chordName,
    octaveShift, setOctaveShift
}) {
    const [showSettings, setShowSettings] = useState(false);

    return (
        <header id="control-panel">
            <div className="logo-group">
                <div className="logo">
                    <svg viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
                    </svg>
                    <h1>Virtual Piano</h1>
                </div>

                {/* Octave Shifter UI */}
                <div className="octave-shifter">
                    <button 
                        className="octave-btn" 
                        onClick={() => setOctaveShift(prev => Math.max(prev - 1, -2))}
                        disabled={octaveShift <= -2}
                        aria-label="Shift octave down"
                    >−</button>
                    <span className="octave-label">Octave {octaveShift === 0 ? '' : (octaveShift > 0 ? `+${octaveShift}` : octaveShift)}</span>
                    <button 
                        className="octave-btn" 
                        onClick={() => setOctaveShift(prev => Math.min(prev + 1, 2))}
                        disabled={octaveShift >= 2}
                        aria-label="Shift octave up"
                    >+</button>
                </div>
            </div>

            {/* LCD LCD Chord Display */}
            <div id="chord-display">
                <span className="chord-label">Chord</span>
                <span id="chord-name">{chordName}</span>
            </div>

            <div className="controls">
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

                <button 
                    className={`toggle-btn record-btn ${isRecording ? 'active' : ''}`} 
                    onClick={toggleRecording}
                    aria-label="Toggle record"
                >
                    <span className="dot indicator"></span>Rec
                </button>

                <button 
                    className={`toggle-btn play-btn ${isPlaying ? 'active' : ''}`} 
                    onClick={togglePlayback}
                    disabled={!hasRecording && !isPlaying}
                    aria-label="Play recording"
                >
                    <span className="dot"></span>Play
                </button>

                {/* Settings Dropdown Toggle */}
                <div className="settings-wrapper">
                    <button 
                        className={`toggle-btn settings-btn ${showSettings ? 'active' : ''}`}
                        onClick={() => setShowSettings(!showSettings)}
                        aria-label="Toggle settings"
                    >
                        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="3"></circle>
                            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
                        </svg>
                    </button>

                    {showSettings && (
                        <div className="settings-menu">
                            <div className="settings-row">
                                <span className="settings-label">Metronome</span>
                                <button 
                                    className={`toggle-btn small-btn ${metronomeOn ? 'active' : ''}`} 
                                    onClick={() => setMetronomeOn(!metronomeOn)}
                                >
                                    {metronomeOn ? 'ON' : 'OFF'}
                                </button>
                            </div>
                            <div className="settings-row">
                                <span className="settings-label">BPM</span>
                                <input 
                                    type="number" 
                                    className="settings-input" 
                                    value={bpm} 
                                    min="40" max="240" 
                                    onChange={(e) => {
                                        let val = Number(e.target.value);
                                        if (val < 40) val = 40;
                                        if (val > 240) val = 240;
                                        setBpm(val);
                                    }}
                                />
                            </div>
                            <div className="settings-row">
                                <span className="settings-label">Volume</span>
                                <input 
                                    type="range" 
                                    className="settings-slider" 
                                    min="0" max="100" 
                                    value={volume}
                                    onChange={(e) => setVolume(Number(e.target.value))}
                                />
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}
