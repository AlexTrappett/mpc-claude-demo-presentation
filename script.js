export const PAD_KEYS = ['1','2','3','4','Q','W','E','R','A','S','D','F','Z','X','C','V'];
const PAD_KEY_SET = new Set(PAD_KEYS);

export const audioBuffers = {};
let audioContext = null;

function getAudioContext() {
  if (audioContext) return audioContext;
  const Ctx = globalThis.AudioContext || globalThis.webkitAudioContext;
  if (!Ctx) return null;
  audioContext = new Ctx();
  return audioContext;
}

export function _resetAudioForTests() {
  audioContext = null;
  for (const k of Object.keys(audioBuffers)) delete audioBuffers[k];
}

export async function preloadAudio() {
  const ctx = getAudioContext();
  if (!ctx) return;
  await Promise.all(PAD_KEYS.map(async (key) => {
    try {
      const response = await fetch(`src/sounds/${key}.wav`);
      const arrayBuffer = await response.arrayBuffer();
      const buffer = await ctx.decodeAudioData(arrayBuffer);
      audioBuffers[key] = buffer;
    } catch (err) {
      console.warn('Audio preload failed for', key, err);
    }
  }));
}

const FADE_IN_SECONDS = 0.005;
const FADE_OUT_SECONDS = 0.015;

export function playSound(key) {
  const buffer = audioBuffers[key];
  if (!buffer) return;
  const ctx = getAudioContext();
  if (!ctx) return;
  if (ctx.state === 'suspended' && typeof ctx.resume === 'function') {
    ctx.resume();
  }

  const now = ctx.currentTime;
  const duration = buffer.duration || 0;
  const fadeIn = Math.min(FADE_IN_SECONDS, duration / 4);
  const fadeOut = Math.min(FADE_OUT_SECONDS, duration / 4);

  const source = ctx.createBufferSource();
  source.buffer = buffer;

  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0, now);
  gain.gain.linearRampToValueAtTime(1, now + fadeIn);
  gain.gain.setValueAtTime(1, now + duration - fadeOut);
  gain.gain.linearRampToValueAtTime(0, now + duration);

  source.connect(gain);
  gain.connect(ctx.destination);
  source.start(0);
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
    preloadAudio().catch((err) => console.warn('Audio preload failed', err));
    initInput();
  };
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
}
