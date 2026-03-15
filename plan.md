# 🧬 GenSim — TypeScript Genetic Algorithm Simulation Engine

## Build Plan & Architecture Document

---

## 1. Vision

A **modular, test-driven TypeScript simulation engine** that lets users define organisms, fitness functions, mutation rules, and environmental pressures — then watch evolution unfold in real-time via a React canvas UI. Think _Conway's Game of Life_ meets _genetic algorithms_ with full extensibility.

---

## 2. Core Architecture

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

### Key Design Principles

- **Pure functions everywhere** — Genetics logic is pure (input genome → output genome). No side effects. Trivially testable.
- **ECS-inspired** — Organisms are data bags (genomes + position + energy). Systems operate on them each tick.
- **Config-driven simulations** — Swap a JSON preset to go from Game of Life to a predator-prey ecosystem.
- **Immutable tick snapshots** — Each world state is a snapshot. Enables rewind, replay, and deterministic tests.

---

## 3. Module Breakdown

### 3.1 `core/Genome.ts`

| Concern        | Detail                                                             |
| -------------- | ------------------------------------------------------------------ |
| Representation | `type Gene = number \| boolean \| string` / `type Genome = Gene[]` |
| Encoding       | Binary, real-valued, or permutation — configurable                 |
| Schema         | `GenomeSchema` defines gene count, ranges, types                   |
| Immutability   | All operations return new `Genome`, never mutate                   |

### 3.2 `core/Operators.ts`

| Operator  | Variants                            |
| --------- | ----------------------------------- |
| Crossover | Single-point, two-point, uniform    |
| Mutation  | Bit-flip, gaussian, swap, scramble  |
| Selection | Tournament, roulette, rank, elitism |

### 3.3 `core/Fitness.ts`

| Concern   | Detail                                                                |
| --------- | --------------------------------------------------------------------- |
| Interface | `FitnessFunction = (organism: Organism, world: WorldState) => number` |
| Built-ins | Survival duration, resource gathered, territory held                  |
| Composite | Weighted multi-objective fitness                                      |

### 3.4 `core/World.ts`

| Concern         | Detail                                                                     |
| --------------- | -------------------------------------------------------------------------- |
| Grid            | 2D toroidal grid (wraps edges) with configurable size                      |
| Tick            | `tick(world: WorldState, config: SimConfig) => WorldState` — pure function |
| Phases per tick | 1) Sense → 2) Decide → 3) Act → 4) Evaluate → 5) Reproduce → 6) Cull       |

### 3.5 `core/Organism.ts`

```typescript
interface Organism {
  id: string;
  genome: Genome;
  position: [number, number];
  energy: number;
  age: number;
  traits: Record<string, number>; // decoded from genome
  alive: boolean;
}
```

### 3.6 `presets/`

| Preset          | Description                                            |
| --------------- | ------------------------------------------------------ |
| `gameOfLife.ts` | Classic Conway rules encoded as genome-driven behavior |
| `ecosystem.ts`  | Herbivores, predators, plants with energy economy      |
| `pathfinder.ts` | Organisms evolve to navigate a maze                    |
| `custom.ts`     | Empty scaffold for user-defined simulations            |

### 3.7 `ui/` (React + Canvas)

| Component         | Role                                                         |
| ----------------- | ------------------------------------------------------------ |
| `SimCanvas`       | HTML5 Canvas rendering of the grid, color-coded by traits    |
| `ControlPanel`    | Play/pause, speed, generation counter, preset selector       |
| `StatsDashboard`  | Real-time charts: avg fitness, population, gene distribution |
| `GenomeInspector` | Click an organism to see its genome decoded                  |

---

## 4. Sub-Agent Architecture (Claude-in-Claude)

The simulation will use **embedded Claude sub-agents** via the Anthropic API to power intelligent features that would be nearly impossible to hard-code.

### Sub-Agent 1: 🧪 **Fitness Designer Agent**

- **Trigger**: User describes a fitness goal in natural language
- **Role**: Translates plain English into a valid `FitnessFunction` body
- **Prompt pattern**: System prompt constrains output to a pure TS function body that receives `(organism, world)` and returns a number
- **Safety**: Generated function is sandboxed via `new Function()` with a whitelist of accessible properties

### Sub-Agent 2: 🔬 **Mutation Advisor Agent**

- **Trigger**: User asks "why is evolution stalling?" or clicks "Diagnose"
- **Role**: Analyzes population stats (diversity, fitness plateau, convergence) and recommends parameter tweaks
- **Input**: Serialized population snapshot (top 10 genomes, fitness stats, generation count)
- **Output**: JSON with suggested `mutationRate`, `crossoverType`, `selectionPressure` changes + explanation

### Sub-Agent 3: 📖 **Narrator Agent**

- **Trigger**: Every N generations or on-demand
- **Role**: Produces a natural-language "evolution diary" entry describing what happened
- **Input**: Diff between two world snapshots (population change, new dominant traits, extinctions)
- **Output**: Short narrative paragraph displayed in a timeline sidebar

### Sub-Agent Integration Pattern

```typescript
// Shared utility for all sub-agent calls
async function callSubAgent<T>(
  systemPrompt: string,
  userMessage: string,
  parseResponse: (raw: string) => T,
): Promise<T> {
  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1000,
      system: systemPrompt,
      messages: [{ role: "user", content: userMessage }],
    }),
  });
  const data = await response.json();
  const text = data.content
    .filter((b: any) => b.type === "text")
    .map((b: any) => b.text)
    .join("\n");
  return parseResponse(text);
}
```

---

## 5. Testing Strategy (Jest)

> **Philosophy**: Every pure function gets a unit test. Every tick transition gets a snapshot test. Sub-agents get contract tests. The UI gets integration tests. _No untested logic ships._

### 5.1 Test Tiers

| Tier                  | Scope                                                     | Count Target | Runner       |
| --------------------- | --------------------------------------------------------- | ------------ | ------------ |
| **Unit**              | Pure functions (crossover, mutation, fitness, genome ops) | ~60 tests    | Jest         |
| **Snapshot**          | World state after N ticks with fixed seed                 | ~15 tests    | Jest         |
| **Contract**          | Sub-agent response shape validation                       | ~10 tests    | Jest + mocks |
| **Integration**       | Full tick cycle with preset configs                       | ~10 tests    | Jest         |
| **Visual regression** | Canvas output comparison                                  | Optional     | Playwright   |

### 5.2 Unit Test Examples

```typescript
// Genome.test.ts
describe("Genome", () => {
  it("creates genome of correct length from schema", () => { ... });
  it("clones without reference sharing", () => { ... });
  it("decodes traits deterministically", () => { ... });
});

// Operators.test.ts
describe("Crossover", () => {
  it("single-point preserves total gene count", () => { ... });
  it("uniform crossover with 0.5 rate mixes roughly equally", () => { ... });
  it("offspring differ from both parents", () => { ... });
});

describe("Mutation", () => {
  it("bit-flip mutates exactly one gene at rate 1/genomeLength", () => { ... });
  it("gaussian mutation stays within gene bounds", () => { ... });
  it("zero mutation rate returns identical genome", () => { ... });
});

describe("Selection", () => {
  it("elitism preserves top N organisms", () => { ... });
  it("tournament selects fitter organism with high probability", () => { ... });
  it("roulette never selects zero-fitness organism", () => { ... });
});
```

### 5.3 Deterministic World Tests

```typescript
// World.test.ts — uses seeded RNG for reproducibility
describe("World tick", () => {
  it("Game of Life blinker oscillates with period 2", () => {
    const world = createWorld(gameOfLifePreset, { seed: 42 });
    placePattern(world, "blinker", [5, 5]);
    const t1 = tick(world);
    const t2 = tick(t1);
    expect(t2.grid).toEqual(world.grid); // period-2 oscillation
  });

  it("empty world stays empty", () => { ... });
  it("single organism with no reproduction stays alone", () => { ... });
  it("overcrowded cell triggers death", () => { ... });
});
```

### 5.4 Sub-Agent Contract Tests

```typescript
// SubAgents.test.ts — mocks the API, validates response contracts
describe("Fitness Designer Agent", () => {
  it("returns valid function body string", async () => {
    mockApiResponse(`return organism.energy * 2;`);
    const fn = await fitnessDesignerAgent("reward high energy");
    expect(typeof fn).toBe("function");
    expect(fn(mockOrganism, mockWorld)).toBeGreaterThanOrEqual(0);
  });

  it("rejects response with side effects", async () => {
    mockApiResponse(`world.grid = []; return 0;`);
    await expect(fitnessDesignerAgent("hack it")).rejects.toThrow("unsafe");
  });
});

describe("Mutation Advisor Agent", () => {
  it("returns valid SimConfig partial", async () => {
    const advice = await mutationAdvisorAgent(mockPopulationStats);
    expect(advice).toHaveProperty("mutationRate");
    expect(advice.mutationRate).toBeGreaterThan(0);
    expect(advice.mutationRate).toBeLessThanOrEqual(1);
  });
});
```

### 5.5 Anti-Hallucination Guards

These tests specifically catch the kind of bugs that AI-assisted code generation tends to introduce:

```typescript
describe("Anti-hallucination guards", () => {
  // Guard: functions that should be pure actually are
  it("tick() does not mutate input world state", () => {
    const world = createWorld(defaultPreset, { seed: 1 });
    const frozen = deepFreeze(structuredClone(world));
    tick(world);
    expect(world).toEqual(frozen);
  });

  // Guard: array operations don't accidentally share references
  it("crossover offspring genomes are independent objects", () => {
    const [child1, child2] = crossover(parentA, parentB, "uniform");
    child1.genes[0] = 999;
    expect(child2.genes[0]).not.toBe(999);
  });

  // Guard: config boundaries are respected
  it("mutation rate clamped to [0, 1]", () => {
    expect(() => createConfig({ mutationRate: 1.5 })).toThrow();
    expect(() => createConfig({ mutationRate: -0.1 })).toThrow();
  });

  // Guard: no NaN/Infinity in fitness
  it("fitness never returns NaN or Infinity", () => {
    const edgeCases = [emptyOrganism, zeroEnergyOrg, maxAgeOrg];
    for (const org of edgeCases) {
      const score = defaultFitness(org, emptyWorld);
      expect(Number.isFinite(score)).toBe(true);
    }
  });

  // Guard: population invariants hold across ticks
  it("total population never exceeds carrying capacity", () => {
    let world = createWorld(ecosystemPreset, { seed: 7 });
    for (let i = 0; i < 100; i++) {
      world = tick(world);
      expect(world.organisms.length).toBeLessThanOrEqual(
        world.config.carryingCapacity,
      );
    }
  });
});
```

---

## 6. Build Phases

### Phase 1 — Core Engine + Tests (~40% of work)

| Step | Deliverable                                     | Tests                    |
| ---- | ----------------------------------------------- | ------------------------ |
| 1.1  | `Genome.ts` + `GenomeSchema`                    | 8 unit tests             |
| 1.2  | `Operators.ts` (crossover, mutation, selection) | 18 unit tests            |
| 1.3  | `Fitness.ts` (interface + built-ins)            | 6 unit tests             |
| 1.4  | `Organism.ts` + trait decoding                  | 5 unit tests             |
| 1.5  | `World.ts` + tick loop                          | 12 snapshot + unit tests |
| 1.6  | `RNG.ts` seeded random                          | 4 unit tests             |
| 1.7  | Anti-hallucination guard suite                  | 10 tests                 |

### Phase 2 — Presets + Validation (~15% of work)

| Step | Deliverable                         | Tests                                    |
| ---- | ----------------------------------- | ---------------------------------------- |
| 2.1  | `gameOfLife` preset (classic rules) | 5 pattern tests (blinker, glider, block) |
| 2.2  | `ecosystem` preset (predator-prey)  | 3 integration tests                      |
| 2.3  | `pathfinder` preset                 | 2 integration tests                      |
| 2.4  | Config validation + clamping        | 4 tests                                  |

### Phase 3 — Sub-Agent Integration (~20% of work)

| Step | Deliverable                   | Tests                                           |
| ---- | ----------------------------- | ----------------------------------------------- |
| 3.1  | `callSubAgent` utility        | 3 contract tests                                |
| 3.2  | Fitness Designer agent        | 4 contract tests (valid fn, safety, edge cases) |
| 3.3  | Mutation Advisor agent        | 3 contract tests                                |
| 3.4  | Narrator agent                | 2 contract tests                                |
| 3.5  | Sandboxing / validation layer | 5 security tests                                |

### Phase 4 — React UI (~25% of work)

| Step | Deliverable                                               | Tests               |
| ---- | --------------------------------------------------------- | ------------------- |
| 4.1  | Canvas renderer (grid + organisms)                        | Manual visual check |
| 4.2  | Control panel (play/pause/speed/preset)                   | —                   |
| 4.3  | Stats dashboard (Recharts)                                | —                   |
| 4.4  | Genome inspector panel                                    | —                   |
| 4.5  | Sub-agent UI panels (fitness designer, advisor, narrator) | —                   |
| 4.6  | Styling + polish                                          | —                   |

---

## 7. File Structure

```
src/
├── core/
│   ├── Genome.ts            # Genome type, creation, cloning, decoding
│   ├── Operators.ts         # Crossover, mutation, selection
│   ├── Fitness.ts           # Fitness function interface + built-ins
│   ├── Organism.ts          # Organism interface + factory
│   ├── World.ts             # World state + tick loop
│   ├── RNG.ts               # Seeded PRNG (mulberry32)
│   └── types.ts             # Shared type definitions
├── presets/
│   ├── gameOfLife.ts
│   ├── ecosystem.ts
│   ├── pathfinder.ts
│   └── custom.ts
├── agents/
│   ├── callSubAgent.ts      # Shared API utility
│   ├── fitnessDesigner.ts   # NL → fitness function
│   ├── mutationAdvisor.ts   # Population diagnosis
│   ├── narrator.ts          # Evolution diary
│   └── sandbox.ts           # Function sandboxing
├── ui/
│   ├── App.tsx
│   ├── SimCanvas.tsx
│   ├── ControlPanel.tsx
│   ├── StatsDashboard.tsx
│   ├── GenomeInspector.tsx
│   └── AgentPanels.tsx
├── __tests__/
│   ├── core/
│   │   ├── Genome.test.ts
│   │   ├── Operators.test.ts
│   │   ├── Fitness.test.ts
│   │   ├── World.test.ts
│   │   └── guards.test.ts   # Anti-hallucination suite
│   ├── agents/
│   │   ├── fitnessDesigner.test.ts
│   │   ├── mutationAdvisor.test.ts
│   │   └── narrator.test.ts
│   └── integration/
│       ├── gameOfLife.test.ts
│       └── ecosystem.test.ts
├── jest.config.ts
├── tsconfig.json
└── package.json
```

---

## 8. Tech Stack

| Layer        | Choice                 | Reason                                                   |
| ------------ | ---------------------- | -------------------------------------------------------- |
| Language     | TypeScript (strict)    | Type safety catches gene-type mismatches at compile time |
| Test runner  | Jest + ts-jest         | Fast, snapshot support, mock-friendly                    |
| UI framework | React 18               | Hooks for state, Recharts for graphs                     |
| Rendering    | HTML5 Canvas           | 60fps grid rendering, no DOM overhead                    |
| Charts       | Recharts               | Declarative, React-native, lightweight                   |
| RNG          | Custom mulberry32      | Seedable, deterministic, fast                            |
| Sub-agents   | Anthropic API (Sonnet) | Intelligent features without hardcoding heuristics       |
| Build        | Vite                   | Fast HMR for UI iteration                                |

---

## 9. Key Invariants to Test

These are the "laws" of the simulation that must never break:

1. **Purity**: `tick(world)` never mutates `world`
2. **Determinism**: Same seed + same config → identical output at any tick
3. **Conservation**: Genome length is constant across generations
4. **Bounds**: All genes stay within their schema-defined ranges after mutation
5. **Fitness sanity**: Fitness always returns a finite non-negative number
6. **Population cap**: Organism count ≤ carrying capacity at all times
7. **Energy conservation**: Total energy in system ≤ initial + generated per tick
8. **Dead organisms don't act**: `alive === false` → excluded from all phases

---

## 10. How to Execute This Plan

```
Phase 1  →  Run: "Build core engine modules with full test suite"
             Verify: `jest --coverage` shows 100% on core/

Phase 2  →  Run: "Build presets, run integration tests"
             Verify: All pattern tests pass deterministically

Phase 3  →  Run: "Build sub-agent layer with mocked contract tests"
             Verify: Contract tests pass, sandbox rejects unsafe code

Phase 4  →  Run: "Build React UI, wire to engine"
             Verify: Visual inspection + manual play-through

Final   →  Run: `jest --coverage --verbose`
             Target: >90% line coverage on core/ and agents/
```
