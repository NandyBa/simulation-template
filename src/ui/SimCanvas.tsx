import { useEffect, useRef } from "react";
import type { Organism, WorldState } from "../core/types";

interface Props {
  world: WorldState;
  onSelectOrganism: (org: Organism | null) => void;
}

const CELL_SIZE = 10;

export function SimCanvas({ world, onSelectOrganism }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const { width, height } = world.config;
    canvas.width = width * CELL_SIZE;
    canvas.height = height * CELL_SIZE;

    // Clear
    ctx.fillStyle = "#1a1a1a";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw organisms
    for (const org of world.organisms) {
      if (!org.alive) continue;
      const [x, y] = org.position;
      const energy = Math.min(1, org.energy / 100);
      ctx.fillStyle = `hsl(${Math.round(energy * 120)}, 70%, 50%)`;
      ctx.fillRect(x * CELL_SIZE, y * CELL_SIZE, CELL_SIZE - 1, CELL_SIZE - 1);
    }
  }, [world]);

  function handleClick(e: React.MouseEvent<HTMLCanvasElement>) {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = Math.floor((e.clientX - rect.left) / CELL_SIZE);
    const y = Math.floor((e.clientY - rect.top) / CELL_SIZE);
    const org = world.organisms.find(
      (o) => o.alive && o.position[0] === x && o.position[1] === y
    );
    onSelectOrganism(org ?? null);
  }

  return (
    <canvas
      ref={canvasRef}
      onClick={handleClick}
      style={{ display: "block", cursor: "crosshair" }}
    />
  );
}
