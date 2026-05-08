import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import App from '../App';

// Mock dependencies
vi.mock('../hooks/useAudioEngine', () => ({
    default: () => ({
        samplerReady: true,
        audioStarted: true,
        ensureAudioStarted: vi.fn(),
        playNote: vi.fn(),
        stopNote: vi.fn(),
        sustainOn: false, setSustainOn: vi.fn(),
        volume: 75, setVolume: vi.fn(),
        metronomeOn: false, setMetronomeOn: vi.fn(),
        bpm: 120, setBpm: vi.fn(),
        isRecording: false, toggleRecording: vi.fn(),
        isPlaying: false, togglePlayback: vi.fn(),
        hasRecording: false
    })
}));

vi.mock('../hooks/useChordDetector', () => ({
    default: () => 'CM'
}));

vi.mock('../hooks/useMidi', () => ({
    default: vi.fn()
}));

// Mock Visualizer since canvas doesn't render well in JSDOM tests
vi.mock('../components/Visualizer', () => ({
    default: () => <div data-testid="visualizer-mock"></div>
}));

describe('App', () => {
    it('renders the complete application', () => {
        render(<App />);
        
        // Control Bar is rendered (should have logo text)
        expect(screen.getByText('Virtual Piano')).toBeInTheDocument();
        
        // Chord detector shows CM
        expect(screen.getByText('CM')).toBeInTheDocument();
        
        // Visualizer is rendered
        expect(screen.getByTestId('visualizer-mock')).toBeInTheDocument();
        
        // Piano keyboard is rendered (should have key labels like C4)
        expect(screen.getByRole('application', { name: 'Piano keyboard' })).toBeInTheDocument();
    });
});
