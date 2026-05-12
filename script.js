export const PAD_KEYS = ['1','2','3','4','Q','W','E','R','A','S','D','F','Z','X','C','V'];
const PAD_KEY_SET = new Set(PAD_KEYS);

export const audioCache = {};

export function preloadAudio() {
  for (const key of PAD_KEYS) {
    const audio = new Audio(`src/sounds/${key}.wav`);
    audio.preload = 'auto';
    audioCache[key] = audio;
  }
}

export function playSound(key) {
  const cached = audioCache[key];
  if (!cached) return;
  const instance = cached.cloneNode(true);
  const result = instance.play && instance.play();
  if (result && typeof result.catch === 'function') {
    result.catch((err) => console.warn('Audio playback failed for', key, err));
  }
}

function getPad(key) {
  return document.querySelector(`[data-key="${key}"]`);
}

function pressPad(key) {
  const pad = getPad(key);
  if (pad) pad.classList.add('pad-pressed');
}

function releasePad(key) {
  const pad = getPad(key);
  if (pad) pad.classList.remove('pad-pressed');
}

function releaseAllPads() {
  document.querySelectorAll('.pad-pressed').forEach((p) => p.classList.remove('pad-pressed'));
}

export function initInput() {
  const heldKeys = new Set();

  const onKeyDown = (event) => {
    const key = (event.key || '').toUpperCase();
    if (!PAD_KEY_SET.has(key)) return;
    if (event.repeat) return;
    event.preventDefault();
    if (heldKeys.has(key)) return;
    heldKeys.add(key);
    pressPad(key);
    playSound(key);
  };

  const onKeyUp = (event) => {
    const key = (event.key || '').toUpperCase();
    if (!PAD_KEY_SET.has(key)) return;
    event.preventDefault();
    heldKeys.delete(key);
    releasePad(key);
  };

  const onBlur = () => {
    heldKeys.clear();
    releaseAllPads();
  };

  const padHandlers = [];
  for (const key of PAD_KEYS) {
    const pad = getPad(key);
    if (!pad) continue;

    const onPress = (event) => {
      if (event.cancelable) event.preventDefault();
      if (heldKeys.has(key)) return;
      heldKeys.add(key);
      pressPad(key);
      playSound(key);
    };
    const onRelease = (event) => {
      if (event && event.cancelable) event.preventDefault();
      heldKeys.delete(key);
      releasePad(key);
    };

    pad.addEventListener('mousedown', onPress);
    pad.addEventListener('mouseup', onRelease);
    pad.addEventListener('mouseleave', onRelease);
    pad.addEventListener('touchstart', onPress);
    pad.addEventListener('touchend', onRelease);
    pad.addEventListener('touchcancel', onRelease);

    padHandlers.push(() => {
      pad.removeEventListener('mousedown', onPress);
      pad.removeEventListener('mouseup', onRelease);
      pad.removeEventListener('mouseleave', onRelease);
      pad.removeEventListener('touchstart', onPress);
      pad.removeEventListener('touchend', onRelease);
      pad.removeEventListener('touchcancel', onRelease);
    });
  }

  document.addEventListener('keydown', onKeyDown);
  document.addEventListener('keyup', onKeyUp);
  window.addEventListener('blur', onBlur);

  return function teardown() {
    document.removeEventListener('keydown', onKeyDown);
    document.removeEventListener('keyup', onKeyUp);
    window.removeEventListener('blur', onBlur);
    padHandlers.forEach((fn) => fn());
  };
}

if (typeof document !== 'undefined' && !globalThis.__SKIP_AUTO_INIT__) {
  const boot = () => {
    preloadAudio();
    initInput();
  };
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
}
