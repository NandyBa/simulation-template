import { useEffect, useRef } from "react";
import type { Organism, WorldState } from "../core/types";

interface Props {
  world: WorldState;
  onSelectOrganism: (org: Organism | null) => void;
}

export function SimCanvas({ world, onSelectOrganism }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const wrapper = wrapperRef.current;
    if (!canvas || !wrapper) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const { width, height } = world.config;
    const cellSize = Math.floor(Math.min(wrapper.clientWidth / width, wrapper.clientHeight / height));
    canvas.width = width * cellSize;
    canvas.height = height * cellSize;

    ctx.fillStyle = "#1a1a1a";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    for (const org of world.organisms) {
      if (!org.alive) continue;
      const [x, y] = org.position;
      const energy = Math.min(1, org.energy / 200);
      ctx.fillStyle = `hsl(${Math.round(energy * 120)}, 70%, 50%)`;
      ctx.fillRect(x * cellSize, y * cellSize, cellSize - 1, cellSize - 1);
    }
  }, [world]);

  function handleClick(e: React.MouseEvent<HTMLCanvasElement>) {
    const canvas = canvasRef.current;
    const wrapper = wrapperRef.current;
    if (!canvas || !wrapper) return;
    const { width, height } = world.config;
    const cellSize = Math.floor(Math.min(wrapper.clientWidth / width, wrapper.clientHeight / height));
    const rect = canvas.getBoundingClientRect();
    const x = Math.floor((e.clientX - rect.left) / cellSize);
    const y = Math.floor((e.clientY - rect.top) / cellSize);
    const org = world.organisms.find(
      (o) => o.alive && o.position[0] === x && o.position[1] === y
    );
    onSelectOrganism(org ?? null);
  }

  return (
    <div
      ref={wrapperRef}
      style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "#0d0d0d" }}
    >
      <canvas
        ref={canvasRef}
        onClick={handleClick}
        style={{ display: "block", cursor: "crosshair" }}
      />
    </div>
  );
}
