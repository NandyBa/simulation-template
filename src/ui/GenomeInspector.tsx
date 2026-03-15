import type { Organism, WorldState } from "../core/types";

interface Props {
  organism: Organism;
  world: WorldState;
}

export function GenomeInspector({ organism, world }: Props) {
  const schema = world.config.genomeSchema;

  return (
    <div>
      <h2 style={{ fontSize: "0.9rem" }}>Genome Inspector</h2>
      <p style={{ fontSize: "0.75rem", color: "#aaa" }}>ID: {organism.id}</p>
      <table style={{ fontSize: "0.75rem", width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th style={{ textAlign: "left" }}>Gene</th>
            <th style={{ textAlign: "left" }}>Type</th>
            <th style={{ textAlign: "left" }}>Value</th>
          </tr>
        </thead>
        <tbody>
          {organism.genome.map((gene, i) => (
            <tr key={i}>
              <td>{i}</td>
              <td>{schema.genes[i]?.type ?? "?"}</td>
              <td>{String(gene).slice(0, 8)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
