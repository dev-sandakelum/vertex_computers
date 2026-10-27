/**
 * Barcode39 — a REAL Code 39 barcode renderer (SVG).
 *
 * Encodes the value (uppercase letters, digits, - . space $ / + % and the
 * * start/stop character) into genuine Code 39 bar patterns, so the printed
 * receipt's barcode is actually scannable. Pure function → deterministic
 * output → the downloaded PDF shows the exact same barcode as the screen.
 *
 * Code 39: each character = 9 elements (5 bars + 4 spaces), each narrow (1)
 * or wide (3 units); a narrow space separates characters.
 */

const PATTERNS: Record<string, string> = {
  '0': '000110100', '1': '100100001', '2': '001100001', '3': '101100000',
  '4': '000110001', '5': '100110000', '6': '001110000', '7': '000100101',
  '8': '100100100', '9': '001100100', 'A': '100001001', 'B': '001001001',
  'C': '101001000', 'D': '000011001', 'E': '100011000', 'F': '001011000',
  'G': '000001101', 'H': '100001100', 'I': '001001100', 'J': '000011100',
  'K': '100000011', 'L': '001000011', 'M': '101000010', 'N': '000010011',
  'O': '100010010', 'P': '001010010', 'Q': '000000111', 'R': '100000110',
  'S': '001000110', 'T': '000010110', 'U': '110000001', 'V': '011000001',
  'W': '111000000', 'X': '010010001', 'Y': '110010000', 'Z': '011010000',
  '-': '010000101', '.': '110000100', ' ': '011000100', '$': '010101000',
  '/': '010100010', '+': '010001010', '%': '000101010', '*': '010010100',
};

const WIDE = 3;   // wide:narrow bar ratio
const GAP = 1;    // inter-character narrow space (in units)

interface Barcode39Props {
  value: string;
  height?: number;
  unit?: number;      // width of one narrow unit in px
  color?: string;
  showText?: boolean;
  className?: string;
  label?: string;     // text under the barcode (defaults to value)
}

export default function Barcode39({
  value,
  height = 56,
  unit = 2,
  color = '#0D1730',
  showText = true,
  className,
  label,
}: Barcode39Props) {
  // Sanitize: keep only encodable chars, uppercase; wrap with * start/stop
  const clean = value.toUpperCase().replace(/[^0-9A-Z\-. $/+%]/g, '');
  const text = `*${clean}*`;

  // Build the bar list: [x, width] rectangles
  const bars: { x: number; w: number }[] = [];
  let x = 0;
  for (const ch of text) {
    const pattern = PATTERNS[ch];
    if (!pattern) continue;
    for (let i = 0; i < 9; i++) {
      const w = (pattern[i] === '1' ? WIDE : 1) * unit;
      if (i % 2 === 0) bars.push({ x, w }); // even index = bar
      x += w;                               // odd index = space (skip)
    }
    x += GAP * unit; // inter-character gap
  }
  const totalW = Math.max(x - GAP * unit, 1);
  const textH = showText ? 14 : 0;

  return (
    <svg
      className={className}
      width={totalW}
      height={height + textH}
      viewBox={`0 0 ${totalW} ${height + textH}`}
      role="img"
      aria-label={`Barcode encoding ${clean}`}
      shapeRendering="crispEdges"
    >
      <rect x={0} y={0} width={totalW} height={height} fill="transparent" />
      {bars.map((b, i) => (
        <rect key={i} x={b.x} y={0} width={b.w} height={height} fill={color} />
      ))}
      {showText && (
        <text
          x={totalW / 2}
          y={height + 11}
          textAnchor="middle"
          fontFamily="'JetBrains Mono', ui-monospace, monospace"
          fontSize={11}
          letterSpacing={2}
          fill={color}
        >
          {label ?? clean}
        </text>
      )}
    </svg>
  );
}
