# Mobile Quality Implementation Plan

> **For agentic workers:** Use superpowers:executing-plans to implement the approved scope. Independent motion and accessibility tasks use superpowers:dispatching-parallel-agents.

**Goal:** Improve mobile loading, scroll motion and accessibility, preserving portfolio conversion flows, then test, push and deploy.

**Architecture:** Focused improvements to the existing React/Vite portfolio. Root owns performance integration, builds and release; bounded parallel tasks own motion and navigation/accessibility files.

**Tech Stack:** React 18, Vite, CSS, Playwright, Node 24, Vercel.

**Spec:** `docs/superpowers/specs/2026-11-27-mobile-quality-design.md`

## Constraints

Preserve working privacy, contact, Alex, downloads, booking, one-minute voice limit, telemetry and security controls. Do not delete files or run real enquiries/bookings/voice sessions. No dependency changes unless evidence requires them. Shared build output is controlled by root; agents must not build, commit, push or deploy.

## Tasks

- [x] Establish source and built-asset/mobile baseline; identify actual request and rendering costs.
- [x] Improve bounded navigation/accessibility findings and add meaningful regression tests.
- [x] Improve mobile/reduced-motion scrolling and transitions with regression coverage.
- [x] Reduce measured mobile loading cost while keeping optional flows discoverable and functional.
- [x] Integrate and inspect changes, obtain a fresh review, run full tests/build and representative browser suites, and record evidence.
- [x] Commit, push, confirm CI/Vercel readiness, and verify the live portfolio and security checks.
