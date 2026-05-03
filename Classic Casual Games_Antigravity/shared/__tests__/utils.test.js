require('../scripts/utils.js');

describe('GameKit Utils', () => {
  const { randomInt, shuffle, clamp, qs, qsa, animate, stagger, setPressed } = window.GameKit;

  describe('randomInt', () => {
    test('should return a number between min and max inclusive', () => {
      const val = randomInt(1, 5);
      expect(val).toBeGreaterThanOrEqual(1);
      expect(val).toBeLessThanOrEqual(5);
    });
  });

  describe('shuffle', () => {
    test('should return an array of the same length with same elements', () => {
      const arr = [1, 2, 3, 4, 5];
      const result = shuffle(arr);
      expect(result).toHaveLength(5);
      expect(result.sort()).toEqual(arr.sort());
    });

    test('should not mutate original array', () => {
      const arr = [1, 2];
      shuffle(arr);
      expect(arr).toEqual([1, 2]);
    });
  });

  describe('clamp', () => {
    test('should restrict value to min and max', () => {
      expect(clamp(5, 1, 10)).toBe(5);
      expect(clamp(0, 1, 10)).toBe(1);
      expect(clamp(15, 1, 10)).toBe(10);
    });
  });

  describe('DOM Queries (qs, qsa)', () => {
    beforeEach(() => {
      document.body.innerHTML = `
        <div id="test" class="item"></div>
        <div class="item"></div>
      `;
    });

    test('qs should return single element', () => {
      const el = qs('#test');
      expect(el).not.toBeNull();
      expect(el.id).toBe('test');
    });

    test('qsa should return array of elements', () => {
      const els = qsa('.item');
      expect(Array.isArray(els)).toBe(true);
      expect(els).toHaveLength(2);
    });
  });

  describe('animate & fallback', () => {
    beforeEach(() => {
      document.body.innerHTML = '<div class="anim"></div>';
    });

    test('should apply styles directly if anime API is missing', async () => {
      const p = animate('.anim', { opacity: 0.5, scale: [0, 2], translateY: 10 });
      expect(p.finished).toBeInstanceOf(Promise);
      
      const el = document.querySelector('.anim');
      expect(el.style.opacity).toBe("0.5");
      expect(el.style.transform).toContain('scale(2)');
      expect(el.style.transform).toContain('translateY(10px)');
    });
    
    test('stagger should return function if missing', () => {
        const stagFn = stagger(10);
        expect(typeof stagFn).toBe('function');
        expect(stagFn(null, 2)).toBe(20);
    });
  });

  describe('setPressed', () => {
    beforeEach(() => {
      document.body.innerHTML = `
        <button data-mode="easy"></button>
        <button data-mode="hard"></button>
      `;
    });

    test('should toggle active class and aria-pressed based on data attribute', () => {
      const btns = Array.from(document.querySelectorAll('button'));
      setPressed(btns, 'easy', 'mode');
      
      expect(btns[0].classList.contains('active')).toBe(true);
      expect(btns[0].getAttribute('aria-pressed')).toBe("true");
      
      expect(btns[1].classList.contains('active')).toBe(false);
      expect(btns[1].getAttribute('aria-pressed')).toBe("false");
    });
  });
});
