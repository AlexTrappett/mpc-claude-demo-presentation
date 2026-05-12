import { describe, test, expect, beforeAll } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const PAD_KEYS = ['1','2','3','4','Q','W','E','R','A','S','D','F','Z','X','C','V'];

describe('index.html scaffold', () => {
  beforeAll(() => {
    const html = readFileSync(resolve(__dirname, '../index.html'), 'utf8');
    document.documentElement.innerHTML = html.replace(/^[\s\S]*?<html[^>]*>/i, '').replace(/<\/html>\s*$/i, '');
  });

  test('page title is "VERY VERY COOL DEMO"', () => {
    expect(document.title).toBe('VERY VERY COOL DEMO');
  });

  test('h1 contains the title text', () => {
    const h1 = document.querySelector('h1');
    expect(h1?.textContent?.trim()).toBe('VERY VERY COOL DEMO');
  });

  test('loads Orbitron via Google Fonts', () => {
    const link = document.querySelector('link[href*="fonts.googleapis.com"][href*="Orbitron"]');
    expect(link).toBeTruthy();
  });

  test('links to style.css and script.js', () => {
    expect(document.querySelector('link[rel="stylesheet"][href="style.css"]')).toBeTruthy();
    expect(document.querySelector('script[src="script.js"]')).toBeTruthy();
  });

  test('renders a pad grid with role=group and aria-label', () => {
    const grid = document.querySelector('.pad-grid');
    expect(grid).toBeTruthy();
    expect(grid.getAttribute('role')).toBe('group');
    expect(grid.getAttribute('aria-label')).toMatch(/drum pad/i);
  });

  test('renders exactly 16 pad buttons', () => {
    const pads = document.querySelectorAll('.pad-grid .pad');
    expect(pads.length).toBe(16);
    pads.forEach((p) => {
      expect(p.tagName).toBe('BUTTON');
      expect(p.getAttribute('type')).toBe('button');
    });
  });

  test('pads are in correct order with matching data-key and label', () => {
    const pads = Array.from(document.querySelectorAll('.pad-grid .pad'));
    PAD_KEYS.forEach((key, i) => {
      expect(pads[i].getAttribute('data-key')).toBe(key);
      expect(pads[i].textContent.trim()).toBe(key);
    });
  });

  test('legend exists with hint text and a 4x4 keymap', () => {
    const legend = document.querySelector('.legend');
    expect(legend).toBeTruthy();
    expect(legend.textContent.toLowerCase()).toContain('keyboard');
    const keys = legend.querySelectorAll('.keymap .keycap');
    expect(keys.length).toBe(16);
    PAD_KEYS.forEach((key, i) => {
      expect(keys[i].textContent.trim()).toBe(key);
    });
  });
});
