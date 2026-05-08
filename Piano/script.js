/**
 * =============================================
 *  Virtual Piano — Application Logic
 *  Audio engine (Tone.js Sampler), keyboard
 *  generation, pointer/keyboard events, and
 *  control panel state management.
 * =============================================
 */

(function () {
    'use strict';

    /* ------------------------------------------------------------------
     *  1. CONSTANTS & CONFIGURATION
     * ------------------------------------------------------------------ */

    /** Chromatic note names in one octave */
    const CHROMATIC = ['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'];

    /** Which notes are "white" keys */
    const WHITE_NOTES = new Set(['C','D','E','F','G','A','B']);

    /** Piano range: C2 → C7 (5 octaves, 61 keys) */
    const START_OCTAVE = 2;
    const END_OCTAVE   = 7;   // inclusive only for C7

    /**
     * Computer-keyboard → note mapping.
     * Covers ~2.5 octaves (C3 – E5) across two QWERTY rows.
     */
    const KEY_MAP = {
        /* ---- Octave 3 (Z-row = white, S/D/G/H/J = black) ---- */
        'z': 'C3',  's': 'C#3', 'x': 'D3',  'd': 'D#3',
        'c': 'E3',  'v': 'F3',  'g': 'F#3',  'b': 'G3',
        'h': 'G#3', 'n': 'A3',  'j': 'A#3',  'm': 'B3',

        /* ---- Octave 4 (Q-row = white, number row = black) ---- */
        'q': 'C4',  '2': 'C#4', 'w': 'D4',  '3': 'D#4',
        'e': 'E4',  'r': 'F4',  '5': 'F#4', 't': 'G4',
        '6': 'G#4', 'y': 'A4',  '7': 'A#4', 'u': 'B4',

        /* ---- Octave 5 (partial) ---- */
        'i': 'C5',  '9': 'C#5', 'o': 'D5',  '0': 'D#5', 'p': 'E5',
    };

    /** Reverse map: note → display label for the computer key */
    const NOTE_TO_KEY = {};
    for (const [k, n] of Object.entries(KEY_MAP)) {
        NOTE_TO_KEY[n] = k.toUpperCase();
    }

    /**
     * Black-key left offsets expressed as a percentage of one white-key width.
     * Each value = (global-white-key-index-of-following-white-key) positions
     * from the octave start, converted to a fractional position.
     * Within an octave (7 white keys), the boundaries between pairs:
     *   C# → between C(0) and D(1) → center at 1/7 of octave ≈ 14.28%
     *   D# → between D(1) and E(2) → center at 2/7 ≈ 28.57%
     *   F# → between F(3) and G(4) → center at 4/7 ≈ 57.14%
     *   G# → between G(4) and A(5) → center at 5/7 ≈ 71.43%
     *   A# → between A(5) and B(6) → center at 6/7 ≈ 85.71%
     *
     * These are the center-point percentages within an octave-group div.
     * The black key itself is offset left by half its own width (done in CSS
     * via transform: translateX(-50%)).
     */
    const BLACK_KEY_PCT = {
        'C#': 14.2857,
        'D#': 28.5714,
        'F#': 57.1429,
        'G#': 71.4286,
        'A#': 85.7143,
    };

    /* ------------------------------------------------------------------
     *  2. STATE
     * ------------------------------------------------------------------ */

    let sampler        = null;   // Tone.Sampler instance
    let samplerReady   = false;
    let audioStarted   = false;

    let showNotes      = true;
    let showKeys       = true;
    let sustainOn      = false;

    /** Track currently-held computer-keyboard keys to prevent repeat spam */
    const heldKeys     = new Set();

    /** Track currently-sounding notes (for releasing on sustain-off) */
    const activeNotes  = new Set();

    /** Map pointer-id → note for glissando tracking */
    const pointerNotes = new Map();

    /* ------------------------------------------------------------------
     *  3. DOM REFERENCES
     * ------------------------------------------------------------------ */

    const $piano       = document.getElementById('piano');
    const $overlay     = document.getElementById('loading-overlay');
    const $loadingText = document.getElementById('loading-text');
    const $startBtn    = document.getElementById('start-btn');
    const $toggleNotes = document.getElementById('toggle-notes');
    const $toggleKeys  = document.getElementById('toggle-keys');
    const $toggleSust  = document.getElementById('toggle-sustain');
    const $volumeSlider= document.getElementById('volume-slider');

    /* ------------------------------------------------------------------
     *  4. BUILD PIANO KEYS
     * ------------------------------------------------------------------ */

    /**
     * Generate all octave groups (C2–C7).
     * Each octave is wrapped in a `.octave-group` div so that
     * black keys can be positioned via percentage offsets.
     */
    function buildKeyboard() {
        for (let oct = START_OCTAVE; oct <= END_OCTAVE; oct++) {
            const notes = oct === END_OCTAVE
                ? ['C']                          // only C7
                : CHROMATIC.slice();             // full octave

            const group = document.createElement('div');
            group.className = 'octave-group';

            // First pass: white keys (flex items that size the group)
            const whiteCount = notes.filter(n => WHITE_NOTES.has(n)).length;
            notes.forEach(name => {
                const fullNote = name + oct;
                if (WHITE_NOTES.has(name)) {
                    group.appendChild(createKey(fullNote, 'white'));
                }
            });

            // Second pass: black keys (absolutely positioned)
            notes.forEach(name => {
                const fullNote = name + oct;
                if (!WHITE_NOTES.has(name)) {
                    const key = createKey(fullNote, 'black');
                    // Position via percentage
                    key.style.left = BLACK_KEY_PCT[name] + '%';
                    key.style.transform = 'translateX(-50%)';
                    group.appendChild(key);
                }
            });

            $piano.appendChild(group);
        }
    }

    /**
     * Create a single piano key element.
     * @param {string} note  – e.g. "C4", "F#3"
     * @param {string} type  – "white" or "black"
     * @returns {HTMLElement}
     */
    function createKey(note, type) {
        const el = document.createElement('div');
        el.className   = `key-${type}`;
        el.dataset.note = note;
        el.setAttribute('role', 'button');
        el.setAttribute('aria-label', `Piano key ${note}`);

        // Note label (e.g. "C4")
        const noteLabel = document.createElement('span');
        noteLabel.className   = 'key-label-note';
        noteLabel.textContent = note;
        el.appendChild(noteLabel);

        // Computer-key label (e.g. "Q")
        const keyLabel = document.createElement('span');
        keyLabel.className   = 'key-label-key';
        keyLabel.textContent = NOTE_TO_KEY[note] || '';
        el.appendChild(keyLabel);

        return el;
    }

    /* ------------------------------------------------------------------
     *  5. AUDIO ENGINE
     * ------------------------------------------------------------------ */

    /**
     * Initialize the Tone.js Sampler with Salamander Grand Piano samples.
     * We provide a sparse set of samples; Tone.js re-pitches the rest.
     */
    function initSampler() {
        sampler = new Tone.Sampler({
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
            onload: onSamplerLoaded,
        }).toDestination();

        // Set initial volume
        applyVolume($volumeSlider.value);
    }

    function onSamplerLoaded() {
        samplerReady = true;
        $loadingText.textContent = 'Samples loaded!';
        $startBtn.style.display  = 'inline-block';
    }

    /** Convert slider 0–100 to a perceptual dB scale */
    function applyVolume(val) {
        const v = Number(val);
        Tone.Destination.volume.value = v === 0 ? -Infinity : 20 * Math.log10(v / 100);
    }

    /* ------------------------------------------------------------------
     *  6. NOTE PLAY / STOP
     * ------------------------------------------------------------------ */

    /**
     * Start playing a note.
     * @param {string} note – e.g. "C4"
     */
    function playNote(note) {
        if (!samplerReady || !audioStarted) return;

        const el = $piano.querySelector(`[data-note="${note}"]`);
        if (!el) return;

        el.classList.add('active');
        activeNotes.add(note);

        // Trigger attack (Tone.js handles polyphony natively)
        sampler.triggerAttack(note, Tone.now());
    }

    /**
     * Stop a note (unless sustain is ON).
     * @param {string} note – e.g. "C4"
     */
    function stopNote(note) {
        if (!samplerReady || !audioStarted) return;

        const el = $piano.querySelector(`[data-note="${note}"]`);
        if (el) el.classList.remove('active');

        if (!sustainOn) {
            sampler.triggerRelease(note, Tone.now());
            activeNotes.delete(note);
        }
        // When sustain is ON, note keeps ringing; activeNotes retains it
    }

    /**
     * Release ALL currently active (sustaining) notes.
     * Called when the sustain toggle is turned OFF.
     */
    function releaseAllSustained() {
        for (const note of activeNotes) {
            sampler.triggerRelease(note, Tone.now());
            const el = $piano.querySelector(`[data-note="${note}"]`);
            if (el) el.classList.remove('active');
        }
        activeNotes.clear();
    }

    /* ------------------------------------------------------------------
     *  7. POINTER EVENTS (mouse + touch + pen — supports glissando)
     * ------------------------------------------------------------------ */

    function getKeyFromPointer(e) {
        const target = document.elementFromPoint(e.clientX, e.clientY);
        if (!target) return null;
        // Handle clicks on label children
        const keyEl = target.closest('.key-white, .key-black');
        return keyEl ? keyEl.dataset.note : null;
    }

    $piano.addEventListener('pointerdown', (e) => {
        e.preventDefault();
        ensureAudioStarted();
        $piano.setPointerCapture(e.pointerId);

        const note = getKeyFromPointer(e);
        if (note) {
            pointerNotes.set(e.pointerId, note);
            playNote(note);
        }
    });

    $piano.addEventListener('pointermove', (e) => {
        if (!pointerNotes.has(e.pointerId)) return;
        e.preventDefault();

        const note = getKeyFromPointer(e);
        const prev = pointerNotes.get(e.pointerId);

        if (note !== prev) {
            // Glissando: release old, play new
            if (prev) stopNote(prev);
            if (note) {
                pointerNotes.set(e.pointerId, note);
                playNote(note);
            } else {
                pointerNotes.set(e.pointerId, null);
            }
        }
    });

    function onPointerEnd(e) {
        const note = pointerNotes.get(e.pointerId);
        if (note) stopNote(note);
        pointerNotes.delete(e.pointerId);
    }

    $piano.addEventListener('pointerup', onPointerEnd);
    $piano.addEventListener('pointercancel', onPointerEnd);

    /* ------------------------------------------------------------------
     *  8. PHYSICAL KEYBOARD EVENTS
     * ------------------------------------------------------------------ */

    document.addEventListener('keydown', (e) => {
        // Ignore key-repeat (prevents stuttering audio)
        if (e.repeat) return;

        const key  = e.key.toLowerCase();
        const note = KEY_MAP[key];
        if (!note) return;

        // Prevent browser default (e.g. Tab switching focus)
        e.preventDefault();
        ensureAudioStarted();

        if (heldKeys.has(key)) return;  // safety net
        heldKeys.add(key);
        playNote(note);
    });

    document.addEventListener('keyup', (e) => {
        const key  = e.key.toLowerCase();
        const note = KEY_MAP[key];
        if (!note) return;

        heldKeys.delete(key);
        stopNote(note);
    });

    /* ------------------------------------------------------------------
     *  9. CONTROL PANEL
     * ------------------------------------------------------------------ */

    // --- Toggle: Note Labels ---
    $toggleNotes.addEventListener('click', () => {
        showNotes = !showNotes;
        $toggleNotes.classList.toggle('active', showNotes);
        $piano.classList.toggle('hide-notes', !showNotes);
    });

    // --- Toggle: Keyboard Labels ---
    $toggleKeys.addEventListener('click', () => {
        showKeys = !showKeys;
        $toggleKeys.classList.toggle('active', showKeys);
        $piano.classList.toggle('hide-keys', !showKeys);
    });

    // --- Toggle: Sustain ---
    $toggleSust.addEventListener('click', () => {
        sustainOn = !sustainOn;
        $toggleSust.classList.toggle('active', sustainOn);

        // User refinement: release all lingering notes when sustain is turned OFF
        if (!sustainOn) {
            releaseAllSustained();
        }
    });

    // --- Volume Slider ---
    $volumeSlider.addEventListener('input', (e) => {
        applyVolume(e.target.value);
    });

    /* ------------------------------------------------------------------
     *  10. AUDIO CONTEXT UNLOCK
     * ------------------------------------------------------------------ */

    /**
     * Browsers require a user gesture to start the AudioContext.
     * This is called on the first interaction.
     */
    async function ensureAudioStarted() {
        if (audioStarted) return;
        await Tone.start();
        audioStarted = true;
    }

    /* ------------------------------------------------------------------
     *  11. INITIALIZATION
     * ------------------------------------------------------------------ */

    function init() {
        buildKeyboard();
        initSampler();

        // Scroll piano to center (middle-C area)
        const wrapper = document.getElementById('piano-wrapper');
        requestAnimationFrame(() => {
            const totalW = $piano.scrollWidth;
            const viewW  = wrapper.clientWidth;
            wrapper.scrollLeft = (totalW - viewW) / 2;
        });

        // Start button dismisses overlay and unlocks audio
        $startBtn.addEventListener('click', async () => {
            await ensureAudioStarted();
            $overlay.classList.add('hidden');
        });
    }

    init();
})();
