// OLL Top-Face SVG Diagram
// topFace: 9-element array (1=yellow, 0=grey)
export function OLLDiagram({ topFace, size = 60 }) {
  const cell = size / 3;
  const colors = topFace.map(v => v ? "#FFD700" : "#334155");
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {colors.map((c, i) => {
        const row = Math.floor(i / 3), col = i % 3;
        return (
          <rect key={i}
            x={col * cell + 1} y={row * cell + 1}
            width={cell - 2} height={cell - 2}
            rx={2} fill={c}
          />
        );
      })}
    </svg>
  );
}

// PLL Diagram — all yellow top face with arrow indicators
export function PLLDiagram({ size = 60 }) {
  const cell = size / 3;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {Array.from({length:9}, (_,i) => {
        const row = Math.floor(i/3), col = i%3;
        return <rect key={i} x={col*cell+1} y={row*cell+1} width={cell-2} height={cell-2} rx={2} fill="#FFD700" />;
      })}
      {/* Arrow hint */}
      <path d={`M${size*0.3},${size*0.5} Q${size*0.5},${size*0.2} ${size*0.7},${size*0.5}`}
        stroke="#6366f1" strokeWidth={2} fill="none" strokeLinecap="round"
        markerEnd="url(#arr)" opacity={0.8}/>
      <defs>
        <marker id="arr" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
          <path d="M0,0 L6,3 L0,6 Z" fill="#6366f1"/>
        </marker>
      </defs>
    </svg>
  );
}

// Generic mini face diagram
export function FaceDiagram({ colors, size = 60 }) {
  const cell = size / 3;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {colors.map((c, i) => {
        const row = Math.floor(i/3), col = i%3;
        return <rect key={i} x={col*cell+1} y={row*cell+1} width={cell-2} height={cell-2} rx={2} fill={c}/>;
      })}
    </svg>
  );
}
