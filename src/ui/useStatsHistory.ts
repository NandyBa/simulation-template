import { useEffect, useRef, useState } from "react";
import type { WorldState } from "../core/types";

export interface StatPoint {
  tick: number;
  generation: number;
  population: number;
  avgEnergy: number;
  maxEnergy: number;
  minEnergy: number;
  avgAge: number;
}

const MAX_HISTORY = 200; // keep last 200 ticks

export function useStatsHistory(world: WorldState) {
  const [history, setHistory] = useState<StatPoint[]>([]);
  const lastTickRef = useRef(-1);

  useEffect(() => {
    if (world.tick === lastTickRef.current) return;
    lastTickRef.current = world.tick;

    const alive = world.organisms.filter((o) => o.alive);
    if (alive.length === 0) {
      setHistory((h) => [
        ...h.slice(-MAX_HISTORY + 1),
        { tick: world.tick, generation: world.generation, population: 0, avgEnergy: 0, maxEnergy: 0, minEnergy: 0, avgAge: 0 },
      ]);
      return;
    }

    const energies = alive.map((o) => o.energy);
    const avgEnergy = energies.reduce((a, b) => a + b, 0) / alive.length;
    const maxEnergy = Math.max(...energies);
    const minEnergy = Math.min(...energies);
    const avgAge = alive.reduce((a, o) => a + o.age, 0) / alive.length;

    setHistory((h) => [
      ...h.slice(-MAX_HISTORY + 1),
      {
        tick: world.tick,
        generation: world.generation,
        population: alive.length,
        avgEnergy: Math.round(avgEnergy * 10) / 10,
        maxEnergy: Math.round(maxEnergy * 10) / 10,
        minEnergy: Math.round(minEnergy * 10) / 10,
        avgAge: Math.round(avgAge * 10) / 10,
      },
    ]);
  }, [world.tick, world.generation, world.organisms]);

  function reset() {
    setHistory([]);
    lastTickRef.current = -1;
  }

  return { history, reset };
}
