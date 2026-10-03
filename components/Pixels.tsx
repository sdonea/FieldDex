// Hand-drawn pixel art: each "X" in a row is one pixel of an SVG path.
const path = (rows: string[]) =>
  rows.flatMap((row, y) => [...row].map((c, x) => (c === "X" ? `M${x} ${y}h1v1h-1z` : ""))).join("");

const STAR = path([
  "....X....",
  "...XXX...",
  "...XXX...",
  "XXXXXXXXX",
  ".XXXXXXX.",
  "..XXXXX..",
  "..XXXXX..",
  ".XXX.XXX.",
  ".XX...XX.",
]);

export const LEAF = path([
  "........XXX",
  "......XXXXX",
  ".....XXXXXX",
  "....XXXXX.X",
  "...XXXXX.XX",
  "..XXXXX.XXX",
  "..XXXX.XXX.",
  ".XXX.XXXX..",
  ".XX.XXXX...",
  ".X.XXX.....",
  "X..........",
]);

export function Stars({ value }: { value: number }) {
  return (
    <span role="img" aria-label={`${value} of 5`} className="flex gap-[3px]">
      {[1, 2, 3, 4, 5].map((i) => (
        <svg key={i} viewBox="0 0 10 10" width="20" height="20" shapeRendering="crispEdges" aria-hidden>
          <path d={STAR} transform="translate(1 1)" fill="#5a5a5a" />
          <path d={STAR} fill={i <= value ? "#fecd00" : "#dcdcdc"} />
        </svg>
      ))}
    </span>
  );
}

export function Leaf({ size = 28 }: { size?: number }) {
  return (
    <svg viewBox="0 0 12 12" width={size} height={size} shapeRendering="crispEdges" aria-hidden>
      <path d={LEAF} transform="translate(1 1)" fill="#940f21" />
      <path d={LEAF} fill="#fff" />
    </svg>
  );
}
