(function () {
  "use strict";

  const GameKit = window.GameKit || {};

  function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  function shuffle(array) {
    const copy = [...array];
    for (let index = copy.length - 1; index > 0; index -= 1) {
      const swapIndex = randomInt(0, index);
      [copy[index], copy[swapIndex]] = [copy[swapIndex], copy[index]];
    }
    return copy;
  }

  function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
  }

  function qs(selector, root = document) {
    return root.querySelector(selector);
  }

  function qsa(selector, root = document) {
    return Array.from(root.querySelectorAll(selector));
  }

  const animeApi = window.anime || {};
  const rawAnimate = animeApi.animate || fallbackAnimate;

  function animate(targets, params = {}) {
    try {
      return rawAnimate(targets, params);
    } catch (error) {
      return fallbackAnimate(targets, params);
    }
  }

  function stagger(step) {
    return animeApi.stagger ? animeApi.stagger(step) : (_, index) => index * step;
  }

  function fallbackAnimate(targets, params = {}) {
    const elements = typeof targets === "string"
      ? qsa(targets)
      : Array.isArray(targets)
        ? targets
        : [targets];

    elements.filter(Boolean).forEach((element) => {
      if (params.opacity !== undefined) element.style.opacity = String(lastValue(params.opacity));
      if (params.scale !== undefined || params.translateY !== undefined) {
        let transformStr = "";
        if (params.scale !== undefined) transformStr += `scale(${lastValue(params.scale)}) `;
        if (params.translateY !== undefined) transformStr += `translateY(${lastValue(params.translateY)}px)`;
        element.style.transform = transformStr.trim();
      }
    });

    return { finished: Promise.resolve() };
  }

  function lastValue(value) {
    return Array.isArray(value) ? value[value.length - 1] : value;
  }

  function setPressed(buttons, activeValue, dataKey) {
    buttons.forEach((button) => {
      const isActive = button.dataset[dataKey] === activeValue;
      button.classList.toggle("active", isActive);
      button.setAttribute("aria-pressed", String(isActive));
    });
  }

  window.GameKit = {
    ...GameKit,
    randomInt,
    shuffle,
    clamp,
    qs,
    qsa,
    animate,
    stagger,
    setPressed,
  };
})();
