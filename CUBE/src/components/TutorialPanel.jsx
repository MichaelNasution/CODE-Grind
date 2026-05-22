import { useState } from "react";

const LESSONS = [
  {
    id:1, title:"Introduction & Notation", icon:"📖",
    steps:[
      { title:"What is a Rubik's Cube?", content:"A 3×3×3 mechanical puzzle with 6 colored faces. The goal is to return each face to a single color. There are 43 quintillion possible states!", moves:[] },
      { title:"Notation Basics", content:"Each face has a letter: R (Right), L (Left), U (Up), D (Down), F (Front), B (Back). A letter alone = 90° clockwise. Add ' for counter-clockwise. Add 2 for 180°.", moves:["R","U","F"] },
      { title:"How to Hold", content:"Hold the cube with white on bottom (D face) and green facing you (F face). Keep this orientation consistent when learning!", moves:[] },
    ]
  },
  {
    id:2, title:"White Cross", icon:"✚",
    steps:[
      { title:"Find White Edges", content:"Locate the 4 white edge pieces (white + one other color). Each belongs above a matching center on the D face.", moves:[] },
      { title:"Align Above Target", content:"Use U moves to align each white edge piece above its target center, then bring it down with F2 or similar.", moves:["U","F2"] },
      { title:"Insert Cross Piece", content:"Once aligned over the correct center, use F2 to insert. Repeat for all 4 edges.", moves:["F2"] },
    ]
  },
  {
    id:3, title:"White Corners", icon:"⬜",
    steps:[
      { title:"Find White Corners", content:"Locate the 4 white corner pieces. Each corner has 3 colors — white + 2 side colors matching adjacent faces.", moves:[] },
      { title:"Basic Right Insert", content:"Align corner above its target slot, then: R U R' inserts it from the right.", moves:["R","U","R'"] },
      { title:"Handle Tricky Cases", content:"If the corner is stuck in the wrong position, use R U R' U' (up to 5×) to pop it out, then reinsert.", moves:["R","U","R'","U'"] },
    ]
  },
  {
    id:4, title:"Middle Layer (F2L)", icon:"🟥",
    steps:[
      { title:"Find Middle Edges", content:"Locate the 4 edges with NO yellow. They belong in the middle layer slots between two side centers.", moves:[] },
      { title:"Right Slot Insert", content:"Align edge above target, then apply: U R U' R' U' F' U F", moves:["U","R","U'","R'","U'","F'","U","F"] },
      { title:"Left Slot Insert", content:"Align edge above target going left, then: U' L' U L U F U' F'", moves:["U'","L'","U","L","U","F","U'","F'"] },
    ]
  },
  {
    id:5, title:"Yellow Cross (OLL)", icon:"🟨",
    steps:[
      { title:"Get the Cross", content:"Look at the top (U) face. We need all 4 yellow edge stickers facing up. Count how many are already up.", moves:[] },
      { title:"No Edges Up", content:"Apply: F R U R' U' F' — this creates a line. Repeat from a line to get the cross.", moves:["F","R","U","R'","U'","F'"] },
      { title:"Line or L-Shape", content:"If you have a horizontal line, apply: F R U R' U' F' once more. If L-shape, position it in top-left corner first.", moves:["F","R","U","R'","U'","F'"] },
    ]
  },
  {
    id:6, title:"Last Layer (PLL)", icon:"👑",
    steps:[
      { title:"Orient Corners", content:"Apply Sune until all corners show yellow on top: R U R' U R U2 R'", moves:["R","U","R'","U","R","U2","R'"] },
      { title:"Permute Corners", content:"With all yellow on top, fix corner positions: U R U' L' U R' U' L", moves:["U","R","U'","L'","U","R'","U'","L"] },
      { title:"Permute Edges", content:"Final step — cycle any misplaced edges with U-perm: R U' R U R U R U' R' U' R2", moves:["R","U'","R","U","R","U","R","U'","R'","U'","R2"] },
    ]
  },
  {
    id:7, title:"CFOP Advanced", icon:"⚡",
    steps:[
      { title:"Cross Optimization", content:"Solve the cross in ≤8 moves by planning during the 15s inspection. Look for color groupings and plan 2-3 moves ahead.", moves:[] },
      { title:"F2L Intuitive", content:"Pair the corner and edge on the U face before inserting. This eliminates wasted moves and is the key to sub-30 solves.", moves:["R","U","R'"] },
      { title:"Full OLL & PLL", content:"Learn all 57 OLL and 21 PLL cases from the Formula Library tab. Start with T-OLL (R U R' U' R' F R F'), U-PLL, and T-PLL.", moves:[] },
    ]
  },
];

export default function TutorialPanel({ onApplyMoves }) {
  const [lessonIdx, setLessonIdx] = useState(0);
  const [stepIdx, setStepIdx] = useState(0);

  const lesson = LESSONS[lessonIdx];
  const step = lesson.steps[stepIdx];

  const goNext = () => {
    if (stepIdx < lesson.steps.length - 1) { setStepIdx(s => s+1); }
    else if (lessonIdx < LESSONS.length - 1) { setLessonIdx(l => l+1); setStepIdx(0); }
  };
  const goPrev = () => {
    if (stepIdx > 0) { setStepIdx(s => s-1); }
    else if (lessonIdx > 0) { setLessonIdx(l => l-1); setStepIdx(LESSONS[lessonIdx-1].steps.length-1); }
  };
  const isFirst = lessonIdx === 0 && stepIdx === 0;
  const isLast  = lessonIdx === LESSONS.length-1 && stepIdx === lesson.steps.length-1;

  return (
    <div className="tutorial-panel">
      <div className="lesson-list">
        {LESSONS.map((l, i) => (
          <button key={l.id}
            className={`lesson-btn ${i===lessonIdx?"active":""} ${i<lessonIdx?"done":""}`}
            onClick={() => { setLessonIdx(i); setStepIdx(0); }}>
            <span className="lesson-icon">{l.icon}</span>
            <span className="lesson-title">{l.title}</span>
            {i < lessonIdx && <span className="lesson-check">✓</span>}
          </button>
        ))}
      </div>

      <div className="step-card">
        <div className="step-breadcrumb">{lesson.title} — Step {stepIdx+1}/{lesson.steps.length}</div>
        <h3 className="step-title">{step.title}</h3>
        <p className="step-content">{step.content}</p>

        {step.moves.length > 0 && (
          <div className="step-moves">
            <div className="section-label">Algorithm</div>
            <code className="step-alg">{step.moves.join(" ")}</code>
            <button className="btn btn-accent" onClick={() => onApplyMoves?.(step.moves)}>
              ▶ Demo on Cube
            </button>
          </div>
        )}

        <div className="step-progress">
          <div className="progress-dots">
            {lesson.steps.map((_,i) => (
              <div key={i} className={`dot ${i===stepIdx?"active":i<stepIdx?"done":""}`}
                onClick={() => setStepIdx(i)} />
            ))}
          </div>
          <div className="step-nav">
            <button className="btn btn-ghost" onClick={goPrev} disabled={isFirst}>← Back</button>
            <button className="btn btn-primary" onClick={goNext} disabled={isLast}>Next →</button>
          </div>
        </div>
      </div>
    </div>
  );
}
