import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import useAudioEngine from '../useAudioEngine';
import * as Tone from 'tone';

// Mock Tone.js
vi.mock('tone', () => {
    const triggerAttackMock = vi.fn();
    const triggerReleaseMock = vi.fn();
    const triggerAttackReleaseMock = vi.fn();
    const releaseAllMock = vi.fn();
    const disposeMock = vi.fn();
    
    class MockSampler {
        constructor({ onload }) {
            this.triggerAttack = triggerAttackMock;
            this.triggerRelease = triggerReleaseMock;
            this.triggerAttackRelease = triggerAttackReleaseMock;
            this.releaseAll = releaseAllMock;
            this.dispose = disposeMock;
            // Execute onload synchronously to simplify act() warnings
            if (onload) onload();
        }
        toDestination() { return this; }
    }

    class MockMembraneSynth {
        constructor() {
            this.volume = { value: 0 };
            this.triggerAttackRelease = vi.fn();
            this.dispose = vi.fn();
        }
        toDestination() { return this; }
    }

    class MockPart {
        constructor(callback, events) {
            this.callback = callback;
            this.events = events;
        }
        start() { return this; }
        dispose() {}
    }
    
    const transportMock = {
        scheduleRepeat: vi.fn(),
        start: vi.fn().mockImplementation(() => { transportMock.state = 'started'; }),
        stop: vi.fn().mockImplementation(() => { transportMock.state = 'stopped'; }),
        cancel: vi.fn(),
        scheduleOnce: vi.fn(),
        state: 'stopped',
        bpm: { value: 120 }
    };

    return {
        Sampler: MockSampler,
        MembraneSynth: MockMembraneSynth,
        Transport: transportMock,
        Destination: {
            volume: { value: 0 }
        },
        now: vi.fn().mockReturnValue(0),
        start: vi.fn().mockResolvedValue(),
        Part: MockPart,
        Draw: { schedule: vi.fn() }
    };
});

describe('useAudioEngine', () => {
    let setActiveNotesMock;
    let setVisualBlocksMock;

    beforeEach(() => {
        vi.clearAllMocks();
        setActiveNotesMock = vi.fn();
        setVisualBlocksMock = vi.fn();
    });

    it('should initialize and load sampler', async () => {
        const { result } = renderHook(() => useAudioEngine(setActiveNotesMock, setVisualBlocksMock));
        
        // Since onload is mocked synchronously, it's already true
        expect(result.current.samplerReady).toBe(true);
    });

    it('should toggle metronome and update Tone.Transport', () => {
        const { result } = renderHook(() => useAudioEngine(setActiveNotesMock, setVisualBlocksMock));
        
        act(() => {
            result.current.setMetronomeOn(true);
        });
        
        expect(result.current.metronomeOn).toBe(true);
        expect(Tone.Transport.start).toHaveBeenCalled();
        
        act(() => {
            result.current.setMetronomeOn(false);
        });
        
        expect(result.current.metronomeOn).toBe(false);
        expect(Tone.Transport.stop).toHaveBeenCalled();
    });

    it('should play and stop a valid note', async () => {
        const { result } = renderHook(() => useAudioEngine(setActiveNotesMock, setVisualBlocksMock));
        
        // Ensure ready
        await new Promise(r => setTimeout(r, 20));
        await act(async () => {
            await result.current.ensureAudioStarted();
        });

        // Play C4
        act(() => {
            result.current.playNote('C4');
        });

        expect(setActiveNotesMock).toHaveBeenCalled();
        expect(setVisualBlocksMock).toHaveBeenCalled();

        // Stop C4
        act(() => {
            result.current.stopNote('C4');
        });

        expect(setActiveNotesMock).toHaveBeenCalledTimes(2);
        expect(setVisualBlocksMock).toHaveBeenCalledTimes(2);
    });

    it('should not play invalid notes', async () => {
        const { result } = renderHook(() => useAudioEngine(setActiveNotesMock, setVisualBlocksMock));
        await new Promise(r => setTimeout(r, 20));
        await act(async () => { await result.current.ensureAudioStarted(); });

        act(() => {
            result.current.playNote('H4'); // Invalid note
        });

        expect(setActiveNotesMock).not.toHaveBeenCalled();
    });

    it('should handle recording correctly', async () => {
        const { result } = renderHook(() => useAudioEngine(setActiveNotesMock, setVisualBlocksMock));
        await new Promise(r => setTimeout(r, 20));
        await act(async () => { await result.current.ensureAudioStarted(); });

        // Start recording
        act(() => {
            result.current.toggleRecording();
        });
        expect(result.current.isRecording).toBe(true);

        // Play note while recording
        act(() => {
            result.current.playNote('C4');
            Tone.now.mockReturnValue(1); // Advance time
            result.current.stopNote('C4');
        });

        // Stop recording
        act(() => {
            result.current.toggleRecording();
        });
        expect(result.current.isRecording).toBe(false);
        expect(result.current.hasRecording).toBe(true);

        // Start playback
        act(() => {
            result.current.togglePlayback();
        });
        expect(result.current.isPlaying).toBe(true);
        expect(Tone.Transport.start).toHaveBeenCalled();
    });
});
