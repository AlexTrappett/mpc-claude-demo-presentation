import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest';

globalThis.__SKIP_AUTO_INIT__ = true;
const mod = await import('../script.js');

describe('audio (Web Audio API)', () => {
  let createBufferSource;
  let decodeAudioData;
  let resume;
  let ctxInstance;
  let CtxCtor;

  let createGain;

  beforeEach(() => {
    mod._resetAudioForTests();
    document.body.innerHTML = '';

    createBufferSource = vi.fn();
    decodeAudioData = vi.fn();
    resume = vi.fn().mockResolvedValue(undefined);
    createGain = vi.fn(() => ({
      gain: {
        setValueAtTime: vi.fn(),
        linearRampToValueAtTime: vi.fn(),
      },
      connect: vi.fn(),
    }));
    ctxInstance = {
      decodeAudioData,
      createBufferSource,
      createGain,
      destination: { mockDestination: true },
      state: 'running',
      currentTime: 10,
      resume,
    };
    CtxCtor = vi.fn(() => ctxInstance);
    vi.stubGlobal('AudioContext', CtxCtor);
    vi.stubGlobal('fetch', vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  test('exports the 16 pad keys in correct order', () => {
    expect(mod.PAD_KEYS).toEqual(['1','2','3','4','Q','W','E','R','A','S','D','F','Z','X','C','V']);
  });

  test('preloadAudio fetches each wav and decodes into audioBuffers', async () => {
    const fakeArrayBuffer = new ArrayBuffer(8);
    fetch.mockResolvedValue({ arrayBuffer: vi.fn().mockResolvedValue(fakeArrayBuffer) });
    decodeAudioData.mockImplementation((buf) => Promise.resolve({ __decoded: buf }));

    await mod.preloadAudio();

    expect(fetch).toHaveBeenCalledTimes(16);
    for (const key of mod.PAD_KEYS) {
      expect(fetch).toHaveBeenCalledWith(`src/sounds/${key}.wav`);
      expect(mod.audioBuffers[key]).toEqual({ __decoded: fakeArrayBuffer });
    }
  });

  test('playSound routes source → gain → destination and starts the source', () => {
    const start = vi.fn();
    const sourceConnect = vi.fn();
    const source = { buffer: null, connect: sourceConnect, start };
    createBufferSource.mockReturnValue(source);

    const gainConnect = vi.fn();
    const gainNode = {
      gain: { setValueAtTime: vi.fn(), linearRampToValueAtTime: vi.fn() },
      connect: gainConnect,
    };
    createGain.mockReturnValue(gainNode);

    mod.audioBuffers['Q'] = { __mock: 'qbuf', duration: 1 };
    mod.playSound('Q');

    expect(createBufferSource).toHaveBeenCalled();
    expect(createGain).toHaveBeenCalled();
    expect(source.buffer).toEqual({ __mock: 'qbuf', duration: 1 });
    expect(sourceConnect).toHaveBeenCalledWith(gainNode);
    expect(gainConnect).toHaveBeenCalledWith(ctxInstance.destination);
    expect(start).toHaveBeenCalled();
  });

  test('playSound applies a tiny fade-in at start and fade-out at end', () => {
    const source = { buffer: null, connect: vi.fn(), start: vi.fn() };
    createBufferSource.mockReturnValue(source);
    const setValueAtTime = vi.fn();
    const linearRampToValueAtTime = vi.fn();
    const gainNode = {
      gain: { setValueAtTime, linearRampToValueAtTime },
      connect: vi.fn(),
    };
    createGain.mockReturnValue(gainNode);
    ctxInstance.currentTime = 10;

    mod.audioBuffers['Q'] = { __mock: 'qbuf', duration: 1 };
    mod.playSound('Q');

    // fade in: start at 0 at now, ramp to 1 a few ms later
    expect(setValueAtTime).toHaveBeenCalledWith(0, 10);
    const fadeInCall = linearRampToValueAtTime.mock.calls.find(([v]) => v === 1);
    expect(fadeInCall).toBeDefined();
    expect(fadeInCall[1]).toBeGreaterThan(10);
    expect(fadeInCall[1]).toBeLessThan(10.05);

    // fade out: ramp to 0 by end of buffer (now + duration = 11)
    const fadeOutCall = linearRampToValueAtTime.mock.calls.find(([v]) => v === 0);
    expect(fadeOutCall).toBeDefined();
    expect(fadeOutCall[1]).toBeCloseTo(11, 5);
  });

  test('playSound resumes a suspended audio context', () => {
    const source = { buffer: null, connect: vi.fn(), start: vi.fn() };
    createBufferSource.mockReturnValue(source);
    ctxInstance.state = 'suspended';

    mod.audioBuffers['Q'] = { __mock: 'qbuf' };
    mod.playSound('Q');

    expect(resume).toHaveBeenCalled();
  });

  test('playSound on unknown key is a no-op (no throw)', () => {
    expect(() => mod.playSound('NOPE')).not.toThrow();
  });

  test('playSound before buffer is decoded is a no-op (no throw)', () => {
    expect(() => mod.playSound('Q')).not.toThrow();
  });

  test('overlapping playSound calls create independent source nodes', () => {
    const source1 = { buffer: null, connect: vi.fn(), start: vi.fn() };
    const source2 = { buffer: null, connect: vi.fn(), start: vi.fn() };
    createBufferSource.mockReturnValueOnce(source1).mockReturnValueOnce(source2);

    mod.audioBuffers['Q'] = { __mock: 'qbuf' };
    mod.playSound('Q');
    mod.playSound('Q');

    expect(source1.start).toHaveBeenCalled();
    expect(source2.start).toHaveBeenCalled();
    expect(source1).not.toBe(source2);
  });
});
