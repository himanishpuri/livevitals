# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- Repository hygiene files: license, contributor and security policies,
  changelog, editor and git attributes, Dependabot, CODEOWNERS, pull request and
  issue templates.
- no-mistakes push gate configuration.

## [1.0.0] - 2025-07-13

Platform overhaul. The app moves to the current Next.js and React, every screen
is rebuilt on shadcn/ui, realtime features live in a dedicated service, and the
project gains tests, containers and CI.

### Added

- Standalone `realtime/` Node service (socket.io + PeerJS) for presence, chat
  history and WebRTC signalling, with its own Docker image and compose service.
- Weekly workout plan, privacy and terms pages, and a forgot-password page.
- Page transitions on native React View Transitions, with reduced-motion support.
- Vitest unit tests, a Playwright end-to-end suite, and a realtime integration
  test suite.
- Production Dockerfile, `compose.yaml` stack and GitHub Actions CI.
- Logo, app icon and rewritten README.

### Changed

- Upgraded to Next.js 16, React 19, TypeScript 6 and current releases of every
  dependency.
- Migrated all UI to the latest shadcn/ui registry (Radix base, new-york style)
  and replaced hard-coded colours with theme tokens.
- Replaced framer-motion with motion, and next-view-transitions with the native
  View Transitions API.
- Replaced the hand-rolled theme provider with next-themes and consolidated
  toasts on a single Sonner provider.

### Fixed

- Health data, registered accounts and scheduled sessions now persist.
- Private pages are guarded by `ProtectedRoute`; the notification bell is hidden
  from anonymous visitors.
- Chat deliverability, presence, active-user count and video call setup in the
  realtime service; instructor answers now honour the caller parameter.
- Mobile navigation is keyboard-safe, avatars render without placeholder files,
  and dark-mode toasts are readable.

## [0.1.0] - 2025-05-21

Original course build: landing site, authentication with roles, health tracking
dashboard and data entry, diet plans, profile and goals, instructor listing,
chat, video consultation and session scheduling.

[Unreleased]: https://github.com/himanishpuri/livevitals/compare/v1.0.0...main
[1.0.0]: https://github.com/himanishpuri/livevitals/releases/tag/v1.0.0
