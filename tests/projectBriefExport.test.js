import test from 'node:test'
import assert from 'node:assert/strict'
import { formatProjectBrief, buildBriefPrintHtml } from '../src/lib/projectBriefExport.js'

test('brief export preserves the latest edited Unicode text and line breaks', () => {
  const brief = { subject: 'José’s clinic — project brief', message: '预约提醒 👋\nBudget: to discuss\n<script>alert(1)</script>\nKeep trailing space ' }
  const text = formatProjectBrief(brief)
  assert.ok(text.includes(brief.subject))
  assert.ok(text.includes(brief.message))
  assert.doesNotMatch(text, /guaranteed|confirmed price/)
})

test('printable brief escapes visitor content and contains no active or remote content', () => {
  const html = buildBriefPrintHtml({ subject: '</title><script>bad()</script>', message: '<img src="https://evil.test" onerror="bad()"> & 你好' })
  assert.doesNotMatch(html, /<script|<img|<iframe|<link|<input|<form/i)
  assert.match(html, /&lt;img/)
  assert.match(html, /&amp; 你好/)
  assert.match(html, /@page/)
  assert.match(html, /Save as PDF/)
})
