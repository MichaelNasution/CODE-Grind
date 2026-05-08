import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

// Clean up after each test to ensure a clean slate
afterEach(() => {
    cleanup();
});

// Mock Web Audio API and Canvas API which are not fully supported in JSDOM
window.AudioContext = class {
    resume() { return Promise.resolve(); }
    suspend() { return Promise.resolve(); }
    close() { return Promise.resolve(); }
};

HTMLCanvasElement.prototype.getContext = () => {
    return {
        clearRect: vi.fn(),
        beginPath: vi.fn(),
        roundRect: vi.fn(),
        fill: vi.fn()
    };
};
