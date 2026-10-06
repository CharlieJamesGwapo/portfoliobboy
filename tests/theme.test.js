import test from 'node:test'
import assert from 'node:assert/strict'
import { THEME_KEY, readTheme, resolveTheme } from '../src/lib/theme.js'

test('resolveTheme gives explicit preferences precedence over the operating system', () => {
  assert.equal(resolveTheme('light', true), 'light')
  assert.equal(resolveTheme('light', false), 'light')
  assert.equal(resolveTheme('dark', true), 'dark')
  assert.equal(resolveTheme('dark', false), 'dark')
  assert.equal(resolveTheme('system', true), 'dark')
  assert.equal(resolveTheme('system', false), 'light')
})

test('readTheme accepts only the three versioned preference values', () => {
  const values = new Map([[THEME_KEY, 'dark']])
  const storage = { getItem: (key) => values.get(key) ?? null }

  assert.equal(readTheme(storage), 'dark')
  values.set(THEME_KEY, 'light')
  assert.equal(readTheme(storage), 'light')
  values.set(THEME_KEY, 'system')
  assert.equal(readTheme(storage), 'system')
  values.set(THEME_KEY, 'solarized')
  assert.equal(readTheme(storage), 'system')
  values.set(THEME_KEY, null)
  assert.equal(readTheme(storage), 'system')
})

test('corrupt or denied storage falls back to System without preventing resolution', () => {
  assert.equal(readTheme({ getItem: () => '{not-json}' }), 'system')
  assert.equal(readTheme({ getItem() { throw new Error('denied') } }), 'system')
  assert.equal(resolveTheme('system', true), 'dark')
  assert.equal(resolveTheme('light', true), 'light')
})
