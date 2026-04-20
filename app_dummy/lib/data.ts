// ─── Type Definitions ───────────────────────────────────────────────────────

export interface Project {
  slug: string;
  title: string;
  subtitle: string;
  category: "WebGL" | "Motion" | "Systems" | "Data" | "Open Source";
  year: string;
  client: string;
  tags: string[];
  accentColor: string;
  bgColor: string;
  description: string;
  challenge: string;
  solution: string;
  outcome: string;
  metrics: { label: string; value: string }[];
  techStack: string[];
  featured: boolean;
  order: number;
}

export interface LabExperiment {
  slug: string;
  title: string;
  subtitle: string;
  tag: string;
  year: string;
  description: string;
  techStack: string[];
  gradientFrom: string;
  gradientTo: string;
  status: "Live" | "WIP" | "Archived";
  demoUrl?: string;
  sourceUrl?: string;
}

// ─── Projects Database ───────────────────────────────────────────────────────

export const projects: Project[] = [
  {
    slug: "gsap-morphing-showcase",
    title: "GSAP Morphing Showcase",
    subtitle: "An immersive motion library for enterprise design systems",
    category: "Motion",
    year: "2025",
    client: "Internal / Open Source",
    tags: ["GSAP", "SVG", "Motion Design", "React", "TypeScript"],
    accentColor: "#00ff41",
    bgColor: "#050a08",
    description:
      "A comprehensive showcase and documentation platform for advanced GSAP animation patterns, built to help engineering teams adopt motion design at scale. The platform demonstrates 40+ reusable animation primitives with live editors and code exports.",
    challenge:
      "Engineering teams at scale struggle to implement consistent, performant animations. Ad-hoc GSAP usage leads to janky UIs, memory leaks from uncleared timelines, and zero design coherence across products.",
    solution:
      "Built a curated library of 40+ GSAP animation primitives — each with a live interactive editor, performance metrics overlay, and one-click copy of production-ready TypeScript. ScrollTrigger patterns are pinned and documented in a dedicated chapter.",
    outcome:
      "Adopted by 12 engineering teams within 3 months. Reduced animation-related UI bugs by 73% across adopting products. Featured in the GSAP community newsletter with 4,200+ stars on GitHub.",
    metrics: [
      { label: "Animation Primitives", value: "40+" },
      { label: "GitHub Stars", value: "4.2k" },
      { label: "Bug Reduction", value: "73%" },
      { label: "Teams Adopting", value: "12" },
    ],
    techStack: ["Next.js", "TypeScript", "GSAP", "ScrollTrigger", "MorphSVG", "Monaco Editor"],
    featured: true,
    order: 1,
  },
  {
    slug: "webgl-data-cosmos",
    title: "WebGL Data Cosmos",
    subtitle: "Real-time 3D visualization of global financial network flows",
    category: "WebGL",
    year: "2024",
    client: "Meridian Capital Partners",
    tags: ["WebGL", "Three.js", "GLSL", "Data Viz", "Finance"],
    accentColor: "#7c3aed",
    bgColor: "#05050d",
    description:
      "A WebGL-powered 3D globe visualizing $2.4T in cross-border capital flows in real-time. Portfolio managers can orbit, zoom, and filter 180,000+ data points rendered as particle systems with custom GLSL shaders.",
    challenge:
      "Traditional 2D charts couldn't convey the spatial relationships and volume of global capital movement. The client needed analysts to grasp macro trends in seconds — not minutes of spreadsheet reading.",
    solution:
      "Custom Three.js scene with a 500k-vertex Earth sphere, real-time WebSocket data pipeline, and a GLSL particle shader that encodes transaction volume as both size and luminosity. GSAP drives the camera choreography on key interactions.",
    outcome:
      "Reduced analyst time-to-insight from 18 minutes to 90 seconds. Won the 2024 Financial Technology Design Award. Now the primary interface for 340 active portfolio managers.",
    metrics: [
      { label: "Data Points", value: "180k+" },
      { label: "Insight Speed", value: "90s" },
      { label: "FPS @ 4K", value: "60fps" },
      { label: "Active Users", value: "340" },
    ],
    techStack: ["Three.js", "GLSL", "WebGL", "WebSocket", "GSAP", "Next.js", "Rust WASM"],
    featured: true,
    order: 2,
  },
  {
    slug: "design-system-atlas",
    title: "Design System Atlas",
    subtitle: "Enterprise component library powering 28 product lines",
    category: "Systems",
    year: "2024",
    client: "Nuvola SaaS Group",
    tags: ["Design Systems", "Storybook", "Figma Tokens", "React", "Accessibility"],
    accentColor: "#f59e0b",
    bgColor: "#0a0800",
    description:
      "A complete design system from foundations to product — 200+ components, a Figma-to-code pipeline, and motion guidelines that span 28 SaaS products across 4 business units. Built with accessibility and RTL support from day zero.",
    challenge:
      "Fragmented UI across 28 products caused brand inconsistency and doubled design+development effort. Each team was reinventing buttons. Accessibility debt was severe, blocking enterprise sales.",
    solution:
      "Architected Atlas — a monorepo design system with Figma Token Studio → style-dictionary → React component pipeline. Every component ships with ARIA, keyboard navigation, and automated axe-core accessibility tests. Motion tokens define animation easing and duration at the system level.",
    outcome:
      "Reduced UI development effort by 58% across teams. Passed WCAG 2.1 AA audit with zero critical findings. Enabled three enterprise deals previously blocked by accessibility requirements.",
    metrics: [
      { label: "Components", value: "200+" },
      { label: "Products Powered", value: "28" },
      { label: "Dev Speed", value: "+58%" },
      { label: "Accessibility", value: "WCAG AA" },
    ],
    techStack: ["React", "TypeScript", "Storybook", "Style Dictionary", "Figma", "axe-core", "Turborepo"],
    featured: true,
    order: 3,
  },
  {
    slug: "livemarket-dashboard",
    title: "LiveMarket Dashboard",
    subtitle: "Sub-50ms latency trading interface with adaptive data density",
    category: "Data",
    year: "2024",
    client: "PulseTrading Ltd.",
    tags: ["Data Viz", "Canvas", "WebSocket", "Performance", "Finance"],
    accentColor: "#06b6d4",
    bgColor: "#050810",
    description:
      "A professional trading terminal handling 12,000 price updates per second, rendered without dropping a single frame. Built with a hybrid Canvas + React architecture that keeps DOM mutations surgical and the render loop deterministic.",
    challenge:
      "The previous React-based dashboard couldn't handle more than 200 updates/sec before the UI froze. Traders were losing money due to stale data and laggy interactions during volatile market sessions.",
    solution:
      "Redesigned rendering as a Canvas-first architecture: all high-frequency data (tick charts, order books, price ladders) renders to Canvas via Web Workers. React only manages static layout and user preferences. A custom virtual scroller handles 50,000-row watchlists at 60fps.",
    outcome:
      "Achieved stable 60fps at 12k updates/sec. P99 input latency dropped from 340ms to 18ms. Zero missed renders during the 2024 flash crash event — which stress-tested every system.",
    metrics: [
      { label: "Updates/sec", value: "12k" },
      { label: "Input Latency", value: "18ms P99" },
      { label: "Watchlist Rows", value: "50k" },
      { label: "FPS Stability", value: "60fps" },
    ],
    techStack: ["Canvas API", "Web Workers", "WebSocket", "React", "TypeScript", "Rust WASM", "IndexedDB"],
    featured: false,
    order: 4,
  },
  {
    slug: "scroll-orchestrator",
    title: "Scroll Orchestrator",
    subtitle: "Open-source scroll animation toolkit for the modern web",
    category: "Open Source",
    year: "2023",
    client: "Open Source / Community",
    tags: ["Open Source", "Lenis", "GSAP", "ScrollTrigger", "npm"],
    accentColor: "#00ff41",
    bgColor: "#050a05",
    description:
      "A zero-dependency TypeScript library that orchestrates complex scroll-driven animations with a declarative API. Composes Lenis smooth scroll with GSAP ScrollTrigger in a predictable, testable way — abstracting away the synchronization complexity.",
    challenge:
      "Combining Lenis + GSAP ScrollTrigger correctly is notoriously complex. Dozens of subtle bugs emerge from incorrect RAF synchronization, causing animation drift and memory leaks in SPAs.",
    solution:
      "Scroll Orchestrator exposes a single `createScrollScene()` API that handles Lenis-to-ScrollTrigger synchronization, SPA cleanup, and automatic refresh on route changes. Ships with a React hook, Vue composable, and a vanilla JS adapter.",
    outcome:
      "8,700+ weekly npm downloads. Used in production by 200+ companies including two Fortune 500 digital teams. Maintains 100% backward compatibility across 14 semver releases.",
    metrics: [
      { label: "npm Downloads/wk", value: "8.7k" },
      { label: "GitHub Stars", value: "3.1k" },
      { label: "Companies Using", value: "200+" },
      { label: "Bundle Size", value: "4.2kb gz" },
    ],
    techStack: ["TypeScript", "Lenis", "GSAP", "Vitest", "Rollup", "npm"],
    featured: false,
    order: 5,
  },
  {
    slug: "fluid-interaction-system",
    title: "Fluid Interaction System",
    subtitle: "WebGL fluid simulation as a UI interaction layer",
    category: "WebGL",
    year: "2023",
    client: "Forma Studio — Luxury Brand",
    tags: ["WebGL", "GLSL", "Fluid Sim", "Luxury", "Interactive"],
    accentColor: "#ec4899",
    bgColor: "#0a0508",
    description:
      "A real-time Navier-Stokes fluid simulation rendered in WebGL, used as the hero interaction layer for a luxury fashion brand's digital flagship. User cursor movement disturbs a dye-injected fluid field — creating a mesmerizing, tactile-feeling hero experience.",
    challenge:
      "The brand's digital presence felt sterile and corporate, failing to translate the tactile luxury of their physical products. They needed an interaction that felt genuinely premium — not just visually, but in its physical response.",
    solution:
      "Implemented Pavel Dobryakov's GPU fluid simulation adapted for Next.js, with custom dye injection mapped to brand colors and cursor velocity. Added GSAP-choreographed product photography reveals that appear to tear through the fluid field.",
    outcome:
      "Average session time on the hero increased from 12 seconds to 4.5 minutes. Bounce rate dropped 61%. The experience was awarded the Awwwards Site of the Day within 48 hours of launch.",
    metrics: [
      { label: "Session Time", value: "+2,150%" },
      { label: "Bounce Rate", value: "-61%" },
      { label: "Awwwards", value: "SOTD" },
      { label: "FPS", value: "60fps" },
    ],
    techStack: ["WebGL", "GLSL", "Three.js", "GSAP", "Next.js", "TypeScript"],
    featured: true,
    order: 6,
  },
];

// ─── Lab Experiments Database ────────────────────────────────────────────────

export const labExperiments: LabExperiment[] = [
  {
    slug: "fluid-cursor",
    title: "Fluid Cursor",
    subtitle: "GPU-accelerated fluid simulation following mouse movement",
    tag: "WebGL + GLSL",
    year: "2025",
    description:
      "Real-time Navier-Stokes fluid simulation on the GPU. Cursor movement injects dye into a 512×512 velocity field solved across 20 pressure iterations per frame. Runs at 60fps on mid-range hardware.",
    techStack: ["WebGL", "GLSL", "Canvas API", "requestAnimationFrame"],
    gradientFrom: "#00ff41",
    gradientTo: "#003311",
    status: "Live",
    demoUrl: "#",
    sourceUrl: "#",
  },
  {
    slug: "morphing-svg-paths",
    title: "Morphing SVG Paths",
    subtitle: "Organic shape transitions with custom easing curves",
    tag: "GSAP MorphSVG",
    year: "2025",
    description:
      "A collection of 12 organic blob shapes that morph into each other via GSAP's MorphSVG plugin. Each transition uses custom cubic-bezier curves to feel physically weighted. Scroll-driven, with a control panel to compose sequences.",
    techStack: ["GSAP", "MorphSVG", "SVG", "React"],
    gradientFrom: "#7c3aed",
    gradientTo: "#1e0050",
    status: "Live",
    demoUrl: "#",
    sourceUrl: "#",
  },
  {
    slug: "scroll-velocity-text",
    title: "Scroll Velocity Text",
    subtitle: "Marquee speed and skew driven by scroll momentum",
    tag: "Lenis + GSAP",
    year: "2024",
    description:
      "Text marquee that reads scroll velocity from Lenis and maps it to both playback speed and CSS skewX transform. Fast scrolling stretches the text; slow scrolling relaxes it. Creates a deeply satisfying physical feedback loop.",
    techStack: ["Lenis", "GSAP", "React", "TypeScript"],
    gradientFrom: "#f59e0b",
    gradientTo: "#431407",
    status: "Live",
    demoUrl: "#",
  },
  {
    slug: "particle-gravity-field",
    title: "Particle Gravity Field",
    subtitle: "N-body gravity simulation with 50k particles",
    tag: "Canvas + Web Workers",
    year: "2024",
    description:
      "50,000 particles simulated under N-body gravity across 3 attractor nodes, computed in a Web Worker to keep the main thread clear. The Canvas 2D renderer uses alpha compositing for a luminous trail effect. Fully deterministic — same seed → same simulation.",
    techStack: ["Canvas API", "Web Workers", "SharedArrayBuffer", "TypeScript"],
    gradientFrom: "#06b6d4",
    gradientTo: "#042030",
    status: "Live",
    demoUrl: "#",
  },
  {
    slug: "css-houdini-ripple",
    title: "CSS Houdini Ripple",
    subtitle: "Custom paint worklet for physics-based ripple backgrounds",
    tag: "CSS Houdini",
    year: "2024",
    description:
      "A CSS Paint API worklet that draws a physics-accurate ripple simulation as a background-image. Zero JavaScript on the main thread — the ripple origin is set via a single CSS custom property. Falls back gracefully in unsupported browsers.",
    techStack: ["CSS Houdini", "Paint API", "JavaScript Worklet"],
    gradientFrom: "#ec4899",
    gradientTo: "#2d0020",
    status: "WIP",
  },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

export function getProjectBySlug(slug: string): Project | undefined {
  return projects.find((p) => p.slug === slug);
}

export function getFeaturedProjects(): Project[] {
  return projects.filter((p) => p.featured).sort((a, b) => a.order - b.order);
}

export function getProjectsByCategory(category: Project["category"]): Project[] {
  return projects.filter((p) => p.category === category).sort((a, b) => a.order - b.order);
}

export function getAdjacentProjects(slug: string): { prev: Project | null; next: Project | null } {
  const sorted = [...projects].sort((a, b) => a.order - b.order);
  const idx = sorted.findIndex((p) => p.slug === slug);
  return {
    prev: idx > 0 ? sorted[idx - 1] : null,
    next: idx < sorted.length - 1 ? sorted[idx + 1] : null,
  };
}
