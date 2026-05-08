import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import PianoKey from '../PianoKey';

describe('PianoKey', () => {
    it('renders a white key correctly', () => {
        render(<PianoKey note="C4" type="white" isActive={false} />);
        
        const keyElement = screen.getByRole('button', { name: 'Piano key C4' });
        expect(keyElement).toBeInTheDocument();
        expect(keyElement).toHaveClass('key-white');
        expect(keyElement).not.toHaveClass('active');
        
        // Note label
        expect(screen.getByText('C4')).toBeInTheDocument();
        // Keyboard label (Q for C4)
        expect(screen.getByText('Q')).toBeInTheDocument();
    });

    it('renders an active black key correctly', () => {
        render(<PianoKey note="C#4" type="black" isActive={true} />);
        
        const keyElement = screen.getByRole('button', { name: 'Piano key C#4' });
        expect(keyElement).toBeInTheDocument();
        expect(keyElement).toHaveClass('key-black');
        expect(keyElement).toHaveClass('active');
        
        // Note label
        expect(screen.getByText('C#4')).toBeInTheDocument();
        // Keyboard label (2 for C#4)
        expect(screen.getByText('2')).toBeInTheDocument();
    });
});
