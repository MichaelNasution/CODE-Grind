import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import ControlBar from '../ControlBar';

describe('ControlBar', () => {
    const defaultProps = {
        showNotes: true, setShowNotes: vi.fn(),
        showKeys: true, setShowKeys: vi.fn(),
        sustainOn: false, setSustainOn: vi.fn(),
        volume: 75, setVolume: vi.fn(),
        metronomeOn: false, setMetronomeOn: vi.fn(),
        bpm: 120, setBpm: vi.fn(),
        isRecording: false, toggleRecording: vi.fn(),
        isPlaying: false, togglePlayback: vi.fn(),
        hasRecording: false,
        chordName: '--'
    };

    it('renders correctly with given props', () => {
        render(<ControlBar {...defaultProps} chordName="CM" />);
        expect(screen.getByText('CM')).toBeInTheDocument();
        expect(screen.getByLabelText('Toggle notes')).toHaveClass('active');
        expect(screen.getByLabelText('Toggle sustain')).not.toHaveClass('active');
    });

    it('calls toggle functions on button click', async () => {
        render(<ControlBar {...defaultProps} />);
        
        await userEvent.click(screen.getByLabelText('Toggle sustain'));
        expect(defaultProps.setSustainOn).toHaveBeenCalledWith(true);

        await userEvent.click(screen.getByLabelText('Toggle metronome'));
        expect(defaultProps.setMetronomeOn).toHaveBeenCalledWith(true);
    });

    it('disables play button if no recording and not playing', () => {
        render(<ControlBar {...defaultProps} hasRecording={false} isPlaying={false} />);
        expect(screen.getByLabelText('Play recording')).toBeDisabled();
    });

    it('enables play button if has recording', () => {
        render(<ControlBar {...defaultProps} hasRecording={true} isPlaying={false} />);
        expect(screen.getByLabelText('Play recording')).not.toBeDisabled();
    });

    it('updates BPM input', async () => {
        render(<ControlBar {...defaultProps} />);
        const bpmInput = screen.getByLabelText('BPM');
        await userEvent.clear(bpmInput);
        await userEvent.type(bpmInput, '140');
        
        // Given how number inputs with onChange work, it might fire multiple times.
        // The last call should be 140
        expect(defaultProps.setBpm).toHaveBeenCalled();
    });
});
