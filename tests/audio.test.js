import { describe, test, expect, beforeEach, vi } from 'vitest';

globalThis.__SKIP_AUTO_INIT__ = true;
const mod = await import('../script.js');

describe('audio preloading', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
    for (const k of Object.keys(mod.audioCache)) delete mod.audioCache[k];
  });

  test('exports the 16 pad keys in correct order', () => {
    expect(mod.PAD_KEYS).toEqual(['1','2','3','4','Q','W','E','R','A','S','D','F','Z','X','C','V']);
  });

  test('preloadAudio populates the cache with 16 Audio elements pointing to src/sounds/{KEY}.wav', () => {
    mod.preloadAudio();
    expect(Object.keys(mod.audioCache).length).toBe(16);
    for (const key of mod.PAD_KEYS) {
      expect(mod.audioCache[key]).toBeInstanceOf(HTMLAudioElement);
      expect(mod.audioCache[key].src).toContain(`src/sounds/${key}.wav`);
      expect(mod.audioCache[key].preload).toBe('auto');
    }
  });

  test('playSound clones the cached audio and calls play (allows overlap)', () => {
    mod.preloadAudio();
    const cached = mod.audioCache['Q'];
    const playSpy = vi.fn().mockResolvedValue(undefined);
    vi.spyOn(cached, 'cloneNode').mockImplementation(() => ({ play: playSpy }));
    mod.playSound('Q');
    expect(playSpy).toHaveBeenCalled();
  });

  test('playSound on unknown key is a no-op (no throw)', () => {
    mod.preloadAudio();
    expect(() => mod.playSound('NOPE')).not.toThrow();
  });
});
