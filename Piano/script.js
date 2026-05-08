/**
 * =============================================
 *  Virtual Piano — Application Logic
 *  Audio engine (Tone.js Sampler), keyboard
 *  generation, pointer/keyboard events, and
 *  advanced practice tools (Metronome, Record,
 *  Chord Detector, Visualizer, MIDI).
 * =============================================
 */

(function () {
    'use strict';

    /* ------------------------------------------------------------------
     *  1. CONSTANTS & CONFIGURATION
     * ------------------------------------------------------------------ */

    const CHROMATIC = ['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'];
    const WHITE_NOTES = new Set(['C','D','E','F','G','A','B']);
    const HAS_SHARP = new Set(['C', 'D', 'F', 'G', 'A']);

    const START_OCTAVE = 2;
    const END_OCTAVE   = 7;

    const KEY_MAP = {
        'z': 'C3',  's': 'C#3', 'x': 'D3',  'd': 'D#3',
        'c': 'E3',  'v': 'F3',  'g': 'F#3',  'b': 'G3',
        'h': 'G#3', 'n': 'A3',  'j': 'A#3',  'm': 'B3',
        'q': 'C4',  '2': 'C#4', 'w': 'D4',  '3': 'D#4',
        'e': 'E4',  'r': 'F4',  '5': 'F#4', 't': 'G4',
        '6': 'G#4', 'y': 'A4',  '7': 'A#4', 'u': 'B4',
        'i': 'C5',  '9': 'C#5', 'o': 'D5',  '0': 'D#5', 'p': 'E5',
    };

    const NOTE_TO_KEY = {};
    for (const [k, n] of Object.entries(KEY_MAP)) {
        NOTE_TO_KEY[n] = k.toUpperCase();
    }

    // Set of all valid piano notes
    const VALID_NOTES = new Set();
    for(let o=START_OCTAVE; o<=END_OCTAVE; o++) {
        if(o === END_OCTAVE) { VALID_NOTES.add('C'+o); }
        else { CHROMATIC.forEach(n => VALID_NOTES.add(n+o)); }
    }

    /* ------------------------------------------------------------------
     *  2. STATE
     * ------------------------------------------------------------------ */

    let sampler        = null;
    let samplerReady   = false;
    let audioStarted   = false;

    let showNotes      = true;
    let showKeys       = true;
    let sustainOn      = false;

    const heldKeys     = new Set();
    const activeNotes  = new Set();
    const pointerNotes = new Map();

    // Metronome State
    let metronomeOn    = false;
    let metronomeSynth = null;

    // Recording State
    let isRecording        = false;
    let isPlaying          = false;
    let recordingStartTime = 0;
    let recordedNotes      = [];   // { time, note, duration }
    const noteOnTimes      = new Map(); // tracks start time of currently held notes
    let playbackPart       = null;

    // Visualizer State
    const activeBlocks     = new Map(); // note -> { startTime, x, width }
    const flyingBlocks     = [];        // { x, width, yBottom, length, color }
    let lastVisualTime     = 0;
    const FALL_SPEED       = 0.15;      // px per ms

    /* ------------------------------------------------------------------
     *  3. DOM REFERENCES
     * ------------------------------------------------------------------ */

    const $pianoWrapper= document.getElementById('piano-wrapper');
    const $piano       = document.getElementById('piano');
    const $overlay     = document.getElementById('loading-overlay');
    const $loadingText = document.getElementById('loading-text');
    const $startBtn    = document.getElementById('start-btn');
    
    // Toggles
    const $toggleNotes = document.getElementById('toggle-notes');
    const $toggleKeys  = document.getElementById('toggle-keys');
    const $toggleSust  = document.getElementById('toggle-sustain');
    const $volumeSlider= document.getElementById('volume-slider');
    
    // Advanced Controls
    const $toggleMetro = document.getElementById('toggle-metronome');
    const $bpmInput    = document.getElementById('bpm-input');
    const $toggleRec   = document.getElementById('toggle-record');
    const $togglePlay  = document.getElementById('toggle-play');
    
    // Chord Display
    const $chordName   = document.getElementById('chord-name');
    
    // Visualizer Canvas
    const $canvas      = document.getElementById('visualizer');
    const ctx          = $canvas.getContext('2d');

    /* ------------------------------------------------------------------
     *  4. BUILD PIANO KEYS
     * ------------------------------------------------------------------ */

    function buildKeyboard() {
        for (let oct = START_OCTAVE; oct <= END_OCTAVE; oct++) {
            const whiteNotes = oct === END_OCTAVE
                ? ['C']
                : ['C', 'D', 'E', 'F', 'G', 'A', 'B'];

            whiteNotes.forEach(name => {
                const wrapper   = document.createElement('div');
                wrapper.className = 'key-wrapper';

                const whiteNote = name + oct;
                wrapper.appendChild(createKey(whiteNote, 'white'));

                if (HAS_SHARP.has(name) && !(oct === END_OCTAVE)) {
                    const sharpNote = name + '#' + oct;
                    wrapper.appendChild(createKey(sharpNote, 'black'));
                }

                $piano.appendChild(wrapper);
            });
        }
    }

    function createKey(note, type) {
        const el = document.createElement('div');
        el.className   = `key-${type}`;
        el.dataset.note = note;
        el.setAttribute('role', 'button');
        el.setAttribute('aria-label', `Piano key ${note}`);

        const noteLabel = document.createElement('span');
        noteLabel.className   = 'key-label-note';
        noteLabel.textContent = note;
        el.appendChild(noteLabel);

        const keyLabel = document.createElement('span');
        keyLabel.className   = 'key-label-key';
        keyLabel.textContent = NOTE_TO_KEY[note] || '';
        el.appendChild(keyLabel);

        return el;
    }

    /* ------------------------------------------------------------------
     *  5. AUDIO ENGINE & METRONOME
     * ------------------------------------------------------------------ */

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

        applyVolume($volumeSlider.value);

        // Init Metronome
        metronomeSynth = new Tone.MembraneSynth({
            pitchDecay: 0.008,
            octaves: 2,
            envelope: { attack: 0.001, decay: 0.1, sustain: 0, release: 0.01 }
        }).toDestination();
        metronomeSynth.volume.value = -10;

        Tone.Transport.scheduleRepeat((time) => {
            if (metronomeOn) {
                // Higher pitch on the downbeat (beat 0)
                const isDownbeat = Tone.Transport.position.split(':')[1] === '0';
                metronomeSynth.triggerAttackRelease(isDownbeat ? 'C5' : 'G4', '32n', time);
            }
        }, '4n');
        
        Tone.Transport.bpm.value = Number($bpmInput.value);
    }

    function onSamplerLoaded() {
        samplerReady = true;
        $loadingText.textContent = 'Samples loaded!';
        $startBtn.style.display  = 'inline-block';
    }

    function applyVolume(val) {
        const v = Number(val);
        Tone.Destination.volume.value = v === 0 ? -Infinity : 20 * Math.log10(v / 100);
    }

    /* ------------------------------------------------------------------
     *  6. NOTE PLAY / STOP & LOGIC
     * ------------------------------------------------------------------ */

    /**
     * Internal function to trigger visuals only (used during playback)
     */
    function visualPlayNote(note) {
        const el = $piano.querySelector(`[data-note="${note}"]`);
        if (el) el.classList.add('active');
        
        // Start visualizer block
        if (el) {
            const rect = el.getBoundingClientRect();
            const wrapperRect = $pianoWrapper.getBoundingClientRect();
            const x = rect.left - wrapperRect.left + $pianoWrapper.scrollLeft;
            activeBlocks.set(note, {
                startTime: performance.now(),
                x: x,
                width: rect.width,
                isBlack: el.classList.contains('key-black')
            });
        }
    }

    function visualStopNote(note) {
        const el = $piano.querySelector(`[data-note="${note}"]`);
        if (el) el.classList.remove('active');
        
        // Finish visualizer block
        if (activeBlocks.has(note)) {
            const block = activeBlocks.get(note);
            const durationMs = performance.now() - block.startTime;
            flyingBlocks.push({
                x: block.x,
                width: block.width,
                yBottom: $canvas.height, // start flying from the bottom of canvas
                length: durationMs * FALL_SPEED,
                isBlack: block.isBlack
            });
            activeBlocks.delete(note);
        }
    }

    function playNote(note, time = Tone.now(), velocity = 1) {
        if (!samplerReady || !audioStarted) return;
        if (!VALID_NOTES.has(note)) return;

        // Audio
        sampler.triggerAttack(note, time, velocity);
        
        // State & Visuals
        activeNotes.add(note);
        visualPlayNote(note);
        updateChordDisplay();

        // Recording Logic
        if (isRecording) {
            noteOnTimes.set(note, Tone.now() - recordingStartTime);
        }
    }

    function stopNote(note, time = Tone.now()) {
        if (!samplerReady || !audioStarted) return;

        visualStopNote(note);

        if (!sustainOn) {
            sampler.triggerRelease(note, time);
            activeNotes.delete(note);
            updateChordDisplay();
        }

        // Recording Logic
        if (isRecording && noteOnTimes.has(note)) {
            const startTime = noteOnTimes.get(note);
            const duration = (Tone.now() - recordingStartTime) - startTime;
            recordedNotes.push({ time: startTime, note: note, duration: duration });
            noteOnTimes.delete(note);
        }
    }

    function releaseAllSustained() {
        for (const note of activeNotes) {
            sampler.triggerRelease(note, Tone.now());
            visualStopNote(note);
        }
        activeNotes.clear();
        updateChordDisplay();
    }

    /* ------------------------------------------------------------------
     *  7. CHORD DETECTOR (Tonal.js)
     * ------------------------------------------------------------------ */
    
    function updateChordDisplay() {
        if (!window.Tonal || activeNotes.size === 0) {
            $chordName.textContent = '--';
            return;
        }

        // Get unique pitch classes (e.g., C4, E4, G5 -> C, E, G)
        const pitchClasses = Array.from(activeNotes).map(n => n.replace(/\d/, ''));
        const uniqueNotes = [...new Set(pitchClasses)];

        if (uniqueNotes.length >= 3) {
            const detected = Tonal.Chord.detect(uniqueNotes);
            if (detected.length > 0) {
                // Show first detected chord
                $chordName.textContent = detected[0];
            } else {
                $chordName.textContent = uniqueNotes.join(', ');
            }
        } else {
            // 1 or 2 notes
            $chordName.textContent = uniqueNotes.join(', ');
        }
    }

    /* ------------------------------------------------------------------
     *  8. SYNTHESIA VISUALIZER (Canvas)
     * ------------------------------------------------------------------ */

    function resizeCanvas() {
        // Canvas covers the piano-wrapper scroll area horizontally, but fixed height
        $canvas.width = $piano.scrollWidth;
        $canvas.height = $pianoWrapper.clientHeight - $piano.clientHeight;
    }

    function drawVisualizer(timestamp) {
        if (!lastVisualTime) lastVisualTime = timestamp;
        const deltaTime = timestamp - lastVisualTime;
        lastVisualTime = timestamp;

        ctx.clearRect(0, 0, $canvas.width, $canvas.height);
        
        // Colors from classic theme
        const colorWhite = 'rgba(232, 200, 74, 0.8)'; // amber/gold
        const colorBlack = 'rgba(184, 150, 46, 0.9)'; // darker gold

        // Draw flying blocks (released notes drifting up)
        for (let i = flyingBlocks.length - 1; i >= 0; i--) {
            const block = flyingBlocks[i];
            block.yBottom -= FALL_SPEED * deltaTime;
            
            ctx.fillStyle = block.isBlack ? colorBlack : colorWhite;
            ctx.beginPath();
            ctx.roundRect(block.x, block.yBottom - block.length, block.width, block.length, 3);
            ctx.fill();

            // Remove if off screen
            if (block.yBottom < 0) {
                flyingBlocks.splice(i, 1);
            }
        }

        // Draw active blocks (currently held notes growing up from bottom)
        for (const [note, block] of activeBlocks.entries()) {
            const length = (timestamp - block.startTime) * FALL_SPEED;
            ctx.fillStyle = block.isBlack ? colorBlack : colorWhite;
            ctx.beginPath();
            ctx.roundRect(block.x, $canvas.height - length, block.width, length, 3);
            ctx.fill();
        }

        requestAnimationFrame(drawVisualizer);
    }

    /* ------------------------------------------------------------------
     *  9. EVENTS: POINTER & KEYBOARD
     * ------------------------------------------------------------------ */

    function getKeyFromPointer(e) {
        const target = document.elementFromPoint(e.clientX, e.clientY);
        if (!target) return null;
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

    document.addEventListener('keydown', (e) => {
        if (e.repeat) return;
        
        // Don't intercept if user is typing in BPM input
        if (document.activeElement === $bpmInput) return;

        const key  = e.key.toLowerCase();
        const note = KEY_MAP[key];
        if (!note) return;

        e.preventDefault();
        ensureAudioStarted();

        if (heldKeys.has(key)) return;
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
     *  10. WEB MIDI API
     * ------------------------------------------------------------------ */

    function initMIDI() {
        if (navigator.requestMIDIAccess) {
            navigator.requestMIDIAccess().then(access => {
                const inputs = access.inputs.values();
                for (let input of inputs) {
                    input.onmidimessage = (msg) => {
                        ensureAudioStarted();
                        const [command, noteNum, velocity] = msg.data;
                        
                        // Note On
                        if (command >= 144 && command <= 159 && velocity > 0) {
                            if (window.Tonal) {
                                const note = Tonal.Midi.midiToNoteName(noteNum);
                                if (!activeNotes.has(note)) {
                                    playNote(note, Tone.now(), velocity / 127);
                                }
                            }
                        } 
                        // Note Off
                        else if ((command >= 128 && command <= 143) || (command >= 144 && command <= 159 && velocity === 0)) {
                            if (window.Tonal) {
                                const note = Tonal.Midi.midiToNoteName(noteNum);
                                stopNote(note);
                            }
                        }
                    };
                }
            }).catch(err => console.warn('MIDI Access Denied:', err));
        }
    }

    /* ------------------------------------------------------------------
     *  11. CONTROL PANEL EVENTS
     * ------------------------------------------------------------------ */

    $toggleNotes.addEventListener('click', () => {
        showNotes = !showNotes;
        $toggleNotes.classList.toggle('active', showNotes);
        $piano.classList.toggle('hide-notes', !showNotes);
    });

    $toggleKeys.addEventListener('click', () => {
        showKeys = !showKeys;
        $toggleKeys.classList.toggle('active', showKeys);
        $piano.classList.toggle('hide-keys', !showKeys);
    });

    $toggleSust.addEventListener('click', () => {
        sustainOn = !sustainOn;
        $toggleSust.classList.toggle('active', sustainOn);
        if (!sustainOn) releaseAllSustained();
    });

    $volumeSlider.addEventListener('input', (e) => applyVolume(e.target.value));

    // Advanced: Metronome
    $toggleMetro.addEventListener('click', () => {
        ensureAudioStarted();
        metronomeOn = !metronomeOn;
        $toggleMetro.classList.toggle('active', metronomeOn);
        if (metronomeOn && Tone.Transport.state !== 'started') {
            Tone.Transport.start();
        }
    });

    $bpmInput.addEventListener('change', (e) => {
        let val = Number(e.target.value);
        if (val < 40) val = 40;
        if (val > 240) val = 240;
        e.target.value = val;
        Tone.Transport.bpm.value = val;
    });

    // Advanced: Record
    $toggleRec.addEventListener('click', () => {
        ensureAudioStarted();
        isRecording = !isRecording;
        $toggleRec.classList.toggle('active', isRecording);
        
        if (isRecording) {
            // Start recording
            recordedNotes = [];
            noteOnTimes.clear();
            recordingStartTime = Tone.now();
            $togglePlay.disabled = true;
            if (playbackPart) {
                playbackPart.dispose();
                playbackPart = null;
            }
        } else {
            // Stop recording
            // Close any currently held notes
            for (const [note, startTime] of noteOnTimes.entries()) {
                const duration = (Tone.now() - recordingStartTime) - startTime;
                recordedNotes.push({ time: startTime, note: note, duration: duration });
            }
            noteOnTimes.clear();
            
            // Enable play button if we have notes
            if (recordedNotes.length > 0) {
                $togglePlay.disabled = false;
            }
        }
    });

    // Advanced: Playback
    $togglePlay.addEventListener('click', () => {
        ensureAudioStarted();
        if (recordedNotes.length === 0 || isRecording) return;

        isPlaying = !isPlaying;
        $togglePlay.classList.toggle('active', isPlaying);

        if (isPlaying) {
            // Start Playback
            playbackPart = new Tone.Part((time, value) => {
                sampler.triggerAttackRelease(value.note, value.duration, time);
                
                // Sync visualizer and keys
                Tone.Draw.schedule(() => {
                    visualPlayNote(value.note);
                    updateChordDisplay(); // Note: activeNotes isn't tracking playback notes, but this looks cool
                    setTimeout(() => {
                        visualStopNote(value.note);
                    }, value.duration * 1000);
                }, time);

            }, recordedNotes).start(0);
            
            Tone.Transport.start();
            
            // Stop playback when part is done (find max time + duration)
            const maxTime = Math.max(...recordedNotes.map(n => n.time + n.duration));
            Tone.Transport.scheduleOnce(() => {
                isPlaying = false;
                $togglePlay.classList.remove('active');
                playbackPart.dispose();
                playbackPart = null;
                // Don't stop transport if metronome is on
                if (!metronomeOn) Tone.Transport.stop();
            }, `+${maxTime + 0.5}`);

        } else {
            // Stop Playback manually
            if (playbackPart) playbackPart.dispose();
            playbackPart = null;
            if (!metronomeOn) Tone.Transport.stop();
        }
    });

    /* ------------------------------------------------------------------
     *  12. INITIALIZATION
     * ------------------------------------------------------------------ */

    async function ensureAudioStarted() {
        if (audioStarted) return;
        await Tone.start();
        audioStarted = true;
    }

    function init() {
        buildKeyboard();
        initSampler();
        initMIDI();

        // Setup Visualizer Canvas
        window.addEventListener('resize', resizeCanvas);
        // Wait for DOM layout to complete before initial resize
        setTimeout(resizeCanvas, 100);
        requestAnimationFrame(drawVisualizer);

        // Center piano wrapper
        requestAnimationFrame(() => {
            const totalW = $piano.scrollWidth;
            const viewW  = $pianoWrapper.clientWidth;
            $pianoWrapper.scrollLeft = (totalW - viewW) / 2;
            resizeCanvas(); // Resize again after scroll adjustment
        });

        $startBtn.addEventListener('click', () => {
            $overlay.classList.add('hidden');
            Tone.start().then(() => { audioStarted = true; }).catch(() => {});
            resizeCanvas();
        });
    }

    init();
})();

