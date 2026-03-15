# GenSim — Genetic Algorithm Simulation Engine

A modular, test-driven TypeScript simulation engine for genetic algorithms. Define organisms, fitness functions, mutation rules, and environmental pressures — then watch evolution unfold in real-time via a React canvas UI.

## Architecture

```
┌─────────────────────────────────────────────────────┐
│                    React UI Layer                    │
│  Canvas Renderer │ Controls Panel │ Stats Dashboard  │
├─────────────────────────────────────────────────────┤
│                  Simulation Engine                   │
│  World │ Tick Loop │ Selection │ Rendering Bridge    │
├─────────────────────────────────────────────────────┤
│                  Genetics Module                     │
│  Genome │ Crossover │ Mutation │ Fitness Evaluator   │
├─────────────────────────────────────────────────────┤
│                  Entity System                       │
│  Organism │ Environment │ Resource │ Traits          │
├─────────────────────────────────────────────────────┤
│                  Config / Presets                    │
│  GameOfLife │ Ecosystem │ Custom                     │
└─────────────────────────────────────────────────────┘
```

## Getting Started

### Prerequisites

- Node.js >= 18
- npm

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

### Build

```bash
npm run build
```

### Testing

```bash
npm test                # run all tests
npm run test:coverage   # run with coverage report
npm run test:watch      # run in watch mode
```

## Tech Stack

| Layer | Choice | Reason |
|-------|--------|--------|
| Language | TypeScript (strict) | Type safety catches gene-type mismatches at compile time |
| Test runner | Jest + ts-jest | Fast, snapshot support, mock-friendly |
| UI framework | React 18 | Hooks for state, Recharts for graphs |
| Rendering | HTML5 Canvas | 60fps grid rendering, no DOM overhead |
| Charts | Recharts | Declarative, React-native, lightweight |
| RNG | Custom mulberry32 | Seedable, deterministic, fast |
| Sub-agents | Anthropic API (Claude) | Intelligent features without hardcoding heuristics |
| Build | Vite | Fast HMR for UI iteration |

## Key Design Principles

- **Pure functions everywhere** — Genetics logic is pure (input genome → output genome). No side effects.
- **ECS-inspired** — Organisms are data bags (genomes + position + energy). Systems operate on them each tick.
- **Config-driven simulations** — Swap a JSON preset to go from Game of Life to a predator-prey ecosystem.
- **Immutable tick snapshots** — Each world state is a snapshot. Enables rewind, replay, and deterministic tests.

## Sub-Agent Features

GenSim uses embedded Claude sub-agents via the Anthropic API to power intelligent features:

- **Fitness Designer** — Describe a fitness goal in natural language and get a valid fitness function generated
- **Mutation Advisor** — Diagnose stalled evolution with AI-powered parameter recommendations
- **Narrator** — Get natural-language "evolution diary" entries describing what's happening in the simulation

## License

MIT
