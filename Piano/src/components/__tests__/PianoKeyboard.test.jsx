import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import PianoKeyboard from '../PianoKeyboard';

describe('PianoKeyboard', () => {
    const defaultProps = {
        activeNotes: new Set(),
        playNote: vi.fn(),
        stopNote: vi.fn(),
        ensureAudioStarted: vi.fn(),
        showNotes: true,
        showKeys: true
    };

    it('renders the correct number of white and black keys', () => {
        // C2 to C7:
        // C2-B6 = 5 octaves = 5 * 7 = 35 white keys + C7 = 36 white keys.
        // Black keys: 5 octaves * 5 = 25 black keys.
        render(<PianoKeyboard {...defaultProps} />);
        
        const whiteKeys = screen.getAllByRole('button').filter(el => el.classList.contains('key-white'));
        const blackKeys = screen.getAllByRole('button').filter(el => el.classList.contains('key-black'));
        
        expect(whiteKeys).toHaveLength(36);
        expect(blackKeys).toHaveLength(25);
    });

    it('triggers playNote and stopNote on keyboard events', () => {
        render(<PianoKeyboard {...defaultProps} />);
        
        // Press 'q' which maps to 'C4'
        fireEvent.keyDown(document, { key: 'q' });
        expect(defaultProps.ensureAudioStarted).toHaveBeenCalled();
        expect(defaultProps.playNote).toHaveBeenCalledWith('C4');
        
        // Release 'q'
        fireEvent.keyUp(document, { key: 'q' });
        expect(defaultProps.stopNote).toHaveBeenCalledWith('C4');
    });

    it('applies hide classes based on props', () => {
        const { container } = render(<PianoKeyboard {...defaultProps} showNotes={false} showKeys={false} />);
        const piano = container.firstChild;
        expect(piano).toHaveClass('hide-notes');
        expect(piano).toHaveClass('hide-keys');
    });
});
