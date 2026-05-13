import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

globalThis.__SKIP_AUTO_INIT__ = true;
const mod = await import('../script.js');

function mountPage() {
  const html = readFileSync(resolve(__dirname, '../index.html'), 'utf8');
  const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
  document.body.innerHTML = bodyMatch[1];
}

describe('keyboard handling', () => {
  let teardown;
  let createBufferSource;

  beforeEach(() => {
    mountPage();
    mod._resetAudioForTests();

    createBufferSource = vi.fn(() => ({ buffer: null, connect: vi.fn(), start: vi.fn() }));
    vi.stubGlobal('AudioContext', vi.fn(() => ({
      decodeAudioData: vi.fn(),
      createBufferSource,
      createGain: vi.fn(() => ({
        gain: { setValueAtTime: vi.fn(), linearRampToValueAtTime: vi.fn() },
        connect: vi.fn(),
      })),
      destination: {},
      state: 'running',
      currentTime: 0,
      resume: vi.fn().mockResolvedValue(undefined),
    })));

    for (const k of mod.PAD_KEYS) mod.audioBuffers[k] = { __seed: k, duration: 1 };
    teardown = mod.initInput();
  });

  afterEach(() => {
    if (typeof teardown === 'function') teardown();
    vi.unstubAllGlobals();
  });

  test('keydown on a mapped key adds pad-pressed to the matching pad', () => {
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'q' }));
    const pad = document.querySelector('[data-key="Q"]');
    expect(pad.classList.contains('pad-pressed')).toBe(true);
  });

  test('keyup on a mapped key removes pad-pressed', () => {
    const pad = document.querySelector('[data-key="A"]');
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'a' }));
    expect(pad.classList.contains('pad-pressed')).toBe(true);
    document.dispatchEvent(new KeyboardEvent('keyup', { key: 'a' }));
    expect(pad.classList.contains('pad-pressed')).toBe(false);
  });

  test('OS key-repeat (event.repeat=true) is ignored', () => {
    const pad = document.querySelector('[data-key="1"]');
    document.dispatchEvent(new KeyboardEvent('keydown', { key: '1' }));
    expect(pad.classList.contains('pad-pressed')).toBe(true);
    pad.classList.remove('pad-pressed');
    document.dispatchEvent(new KeyboardEvent('keydown', { key: '1', repeat: true }));
    expect(pad.classList.contains('pad-pressed')).toBe(false);
  });

  test('unmapped key produces no error and no DOM change', () => {
    expect(() => {
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'p' }));
    }).not.toThrow();
    expect(document.querySelectorAll('.pad-pressed').length).toBe(0);
  });

  test('window blur clears any held pad-pressed state', () => {
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'z' }));
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'x' }));
    expect(document.querySelectorAll('.pad-pressed').length).toBe(2);
    window.dispatchEvent(new Event('blur'));
    expect(document.querySelectorAll('.pad-pressed').length).toBe(0);
  });

  test('mapped keydown triggers a sound play', () => {
    const source = { buffer: null, connect: vi.fn(), start: vi.fn() };
    createBufferSource.mockReturnValueOnce(source);
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'w' }));
    expect(source.start).toHaveBeenCalled();
  });
});
