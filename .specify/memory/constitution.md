<!--
=== Sync Impact Report ===
VERSION CHANGE: (none) → 1.0.0 (initial creation from template)

MODIFIED PRINCIPLES: N/A — first-time population of all placeholders

ADDED SECTIONS:
  - Core Principles (5 principles: Specification-First, Puzzle Rule Integrity,
    Component-First Design, Test-First for Game Logic, Simplicity / YAGNI)
  - Technology Standards
  - Development Workflow
  - Governance

REMOVED SECTIONS: N/A

TEMPLATE UPDATES:
  - .specify/templates/plan-template.md     ✅ No changes needed
    (Constitution Check gate is populated dynamically by /speckit.plan)
  - .specify/templates/spec-template.md     ✅ No changes needed
    (User story + requirements structure aligns with Spec-First principle)
  - .specify/templates/tasks-template.md    ✅ No changes needed
    (Test-optional framing is consistent with Principle IV, which mandates
    tests only for game-logic modules, not UI components)
  - .specify/templates/agent-file-template.md ✅ No changes needed
    (Runtime guidance; populated from plan.md files, not from constitution)
  - .specify/templates/checklist-template.md  ✅ No changes needed
    (General checklist template; unaffected by constitution content)
  - .claude/commands/*.md                   ✅ No changes needed
    (Command files reference constitution generically, no principle-specific text)

DEFERRED TODOs: None — all placeholders resolved
=== End Sync Impact Report ===
-->

# Queems Constitution

## Core Principles

### I. Specification-First (NON-NEGOTIABLE)

Every feature MUST be fully specified in a `spec.md` before any implementation begins.
No code may be written for a feature that does not have an approved, reviewed specification.
Specifications MUST cover: prioritized user scenarios with acceptance criteria, functional
requirements (FR-XXX), and measurable success criteria (SC-XXX).

**Rationale**: Unspecified features introduce hidden complexity and scope creep. Specifying first
ensures alignment on requirements before any implementation time is invested.

### II. Puzzle Rule Integrity

The Queens puzzle rules MUST be enforced correctly and consistently at all times: no queen may
share a row, column, colored region, or diagonal with another queen. These constraints MUST be
implemented in a dedicated, independently testable game-logic module that is fully decoupled
from any UI or rendering code.

**Rationale**: Queems is a faithful mock of the LinkedIn Queens puzzle. Correctness of the core
game rules is the product's primary value proposition. Coupling logic to UI makes it untestable
and fragile.

### III. Component-First Design

UI MUST be composed of small, focused React functional components with a single responsibility.
Each component MUST be independently testable. Shared UI elements MUST live in a `components/`
directory and MUST NOT contain game logic. Game logic MUST reside in dedicated service modules
or custom hooks in a `lib/` or `hooks/` directory.

**Rationale**: Separating UI rendering from game mechanics enables parallel development, simpler
testing, and safe iteration on puzzle logic without risking visual regressions.

### IV. Test-First for Game Logic

All game-logic modules (rule validation, board-state management, puzzle generation) MUST have
tests written before implementation. Tests MUST be confirmed to fail (red) before the
corresponding implementation is written (green). UI components are not required to follow
strict TDD but SHOULD have smoke tests for critical interactions.

**Rationale**: Game correctness is non-negotiable (see Principle II). TDD in the logic layer
provides a fast-feedback loop and creates living documentation of puzzle rules.

### V. Simplicity / YAGNI

Build only what the current specification requires. No speculative features, premature
abstractions, or future-proofing patterns. An abstraction is permitted only when three or more
concrete use cases already exist in the codebase. Every added layer of complexity MUST be
justified by a present, documented need.

**Rationale**: Queems is a puzzle mock of bounded scope. Premature generalization adds
maintenance burden with no user-facing value. Refactor when necessity is proven, not anticipated.

## Technology Standards

- **Language**: TypeScript with `"strict": true`. The `any` type is forbidden except in test
  utilities and MUST be accompanied by an inline comment explaining the exception.
- **Framework**: React with functional components and hooks only. Class components are forbidden.
- **Build Tool**: Vite (preferred) or Next.js. The choice MUST be documented in the first
  feature's `plan.md` and MUST remain consistent across all subsequent features.
- **Styling**: CSS Modules or Tailwind CSS. Global styles are limited to a CSS reset and
  design-token definitions. Inline styles are forbidden except for dynamically computed values
  (e.g., board-cell colors driven by game state).
- **Testing**: Vitest for game-logic unit and integration tests. React Testing Library for
  component interaction tests. E2E testing (Playwright) is optional and MUST be explicitly
  requested in the feature specification.
- **Linting & Formatting**: ESLint (with `@typescript-eslint` plugin) + Prettier. All lint
  errors MUST be resolved before merging. Warnings MUST be tracked and resolved within the
  same feature cycle.

## Development Workflow

All feature work MUST follow the speckit command sequence in strict order:

1. `/speckit.specify` — create or update the feature `spec.md`
2. `/speckit.clarify` — resolve underspecified areas before design begins (if needed)
3. `/speckit.plan` — generate the implementation plan (MUST pass Constitution Check gate)
4. `/speckit.tasks` — generate the dependency-ordered task list
5. `/speckit.implement` — execute tasks in order

No phase may be skipped. The Constitution Check gate in the implementation plan MUST be
verified against all five Core Principles before development begins. The output of
`/speckit.analyze` MUST be reviewed and any critical inconsistencies resolved before a
feature is marked complete.

All pull requests MUST reference the feature spec and MUST NOT introduce code that violates
any Core Principle. Violations require a documented justification in the Complexity Tracking
section of the relevant `plan.md`.

## Governance

This constitution supersedes all other development practices and informal conventions for
the Queems project. In any conflict, the constitution takes precedence.

**Amendment Procedure**:
1. Propose the amendment via `/speckit.constitution` with a clear description of the change.
2. Document the rationale and any impact on features already in progress.
3. Obtain explicit acknowledgment (code review approval or user confirmation) before the
   amended constitution takes effect.
4. Increment the version according to the Versioning Policy below.

**Versioning Policy**:
- **MAJOR** (X.0.0): Removal or backward-incompatible redefinition of an existing principle.
- **MINOR** (X.Y.0): New principle or section added; material expansion of existing guidance.
- **PATCH** (X.Y.Z): Clarifications, wording corrections, typo fixes, non-semantic changes.

**Compliance Review**: Every pull request and design review MUST verify compliance with this
constitution. Non-compliant work MUST be returned for remediation or the constitution MUST
be formally amended before merging proceeds.

**Version**: 1.0.0 | **Ratified**: 2026-02-17 | **Last Amended**: 2026-02-17
