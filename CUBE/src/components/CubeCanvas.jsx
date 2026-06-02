import { useEffect, useRef } from "react";
import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import { FACE_COLORS } from "../engine/cube";
import { useCubeStore } from "../store/cubeStore";

// Face order: U=0 R=1 F=2 D=3 L=4 B=5
// Cubie positions: 3x3x3 grid from -1 to 1
// Each cubie has 6 faces; sticker color applied if on outer surface

const FACE_NORMALS = [
  new THREE.Vector3(0,1,0),  // U
  new THREE.Vector3(1,0,0),  // R
  new THREE.Vector3(0,0,1),  // F
  new THREE.Vector3(0,-1,0), // D
  new THREE.Vector3(-1,0,0), // L
  new THREE.Vector3(0,0,-1), // B
];

// Which cubie faces (BoxGeometry order: +x,-x,+y,-y,+z,-z) map to cube face
// BoxGeometry face order: right(+x)=1 left(-x)=4 top(+y)=0 bottom(-y)=3 front(+z)=2 back(-z)=5
const BOX_TO_CUBE_FACE = [1,4,0,3,2,5]; // box face idx → cube face

function getStickerColor(cubeState, cx, cy, cz, boxFaceIdx) {
  const cubeFace = BOX_TO_CUBE_FACE[boxFaceIdx];
  // Determine if this cubie face is on the outer surface
  const normal = FACE_NORMALS[cubeFace];
  const onSurface = (
    (normal.x > 0 && cx === 1) || (normal.x < 0 && cx === -1) ||
    (normal.y > 0 && cy === 1) || (normal.y < 0 && cy === -1) ||
    (normal.z > 0 && cz === 1) || (normal.z < 0 && cz === -1)
  );
  if (!onSurface) return "#1a1a2e"; // inner face — dark plastic

  // Find sticker index within the face
  // U face: looking down → x goes left→right, z goes back→front
  // map cubie grid position to 0-8 index
  let row, col;
  switch(cubeFace) {
    case 0: row = 1-cz; col = cx+1; break; // U: row=z-axis, col=x-axis
    case 3: row = cz+1; col = cx+1; break; // D
    case 1: row = 1-cy; col = 1-cz; break; // R
    case 4: row = 1-cy; col = cz+1; break; // L
    case 2: row = 1-cy; col = cx+1; break; // F
    case 5: row = 1-cy; col = 1-cx; break; // B
    default: return "#888";
  }
  const idx = row * 3 + col;
  const colorId = cubeState[cubeFace][idx];
  return FACE_COLORS[colorId] ?? "#888";
}

function getMoveSpec(move) {
  if (!move) return null;
  const face = move[0];
  const prime = move.includes("'");
  const double = move.includes("2");
  
  let axis, filter, angle;
  
  switch(face) {
    case "R":
      axis = "x";
      filter = (mesh) => mesh.userData.x > 0.5;
      angle = -Math.PI / 2;
      break;
    case "L":
      axis = "x";
      filter = (mesh) => mesh.userData.x < -0.5;
      angle = Math.PI / 2;
      break;
    case "U":
      axis = "y";
      filter = (mesh) => mesh.userData.y > 0.5;
      angle = -Math.PI / 2;
      break;
    case "D":
      axis = "y";
      filter = (mesh) => mesh.userData.y < -0.5;
      angle = Math.PI / 2;
      break;
    case "F":
      axis = "z";
      filter = (mesh) => mesh.userData.z > 0.5;
      angle = -Math.PI / 2;
      break;
    case "B":
      axis = "z";
      filter = (mesh) => mesh.userData.z < -0.5;
      angle = Math.PI / 2;
      break;
    default:
      return null;
  }
  
  if (prime) angle = -angle;
  if (double) angle = Math.PI;
  
  return { axis, filter, angle };
}

export default function CubeCanvas({ cubeState, style }) {
  const mountRef = useRef(null);
  const sceneRef = useRef(null);
  const cubiesRef = useRef([]);
  const rendererRef = useRef(null);
  const cameraRef = useRef(null);
  const frameRef = useRef(null);
  const isDragging = useRef(false);
  const lastMouse = useRef({x:0,y:0});
  const spherical = useRef({theta: Math.PI/5, phi: Math.PI/3.5});

  // Animation refs
  const activeMoveRef = useRef(null);
  const animStartTimeRef = useRef(null);

  useEffect(() => {
    const mount = mountRef.current;
    const w = mount.clientWidth, h = mount.clientHeight;

    // Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color("#0f1119");
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(45, w/h, 0.1, 100);
    cameraRef.current = camera;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(w, h);
    renderer.shadowMap.enabled = true;
    mount.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Lights
    const ambient = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambient);
    const key = new THREE.DirectionalLight(0xffffff, 1.2);
    key.position.set(5,8,6);
    key.castShadow = true;
    scene.add(key);
    const fill = new THREE.DirectionalLight(0xaabbff, 0.4);
    fill.position.set(-5,3,-4);
    scene.add(fill);

    // Build cubies using premium RoundedBoxGeometry
    const initialCube = useCubeStore.getState().cube;
    const GAP = 1.04;
    const cubies = [];
    for (let x = -1; x <= 1; x++) {
      for (let y = -1; y <= 1; y++) {
        for (let z = -1; z <= 1; z++) {
          const materials = Array.from({length:6}, (_,bi) => {
            const color = getStickerColor(initialCube, x, y, z, bi);
            return new THREE.MeshStandardMaterial({
              color, roughness: color === "#1a1a2e" ? 0.95 : 0.25, metalness: 0.15
            });
          });
          // Rounded corners catch light specular highlights for beautiful premium texture!
          const geo = new RoundedBoxGeometry(0.95, 0.95, 0.95, 4, 0.08);
          const mesh = new THREE.Mesh(geo, materials);
          const origPos = new THREE.Vector3(x*GAP, y*GAP, z*GAP);
          mesh.position.copy(origPos);
          mesh.castShadow = true;
          mesh.userData = { x, y, z, origPos };
          scene.add(mesh);
          cubies.push(mesh);
        }
      }
    }
    cubiesRef.current = cubies;

    // Position camera
    const updateCamera = () => {
      const {theta, phi} = spherical.current;
      const r = 7;
      camera.position.set(
        r * Math.sin(phi) * Math.sin(theta),
        r * Math.cos(phi),
        r * Math.sin(phi) * Math.cos(theta)
      );
      camera.lookAt(0,0,0);
    };
    updateCamera();

    // Animate loop with smooth 3D rotation and cubic easing
    const animate = () => {
      frameRef.current = requestAnimationFrame(animate);
      
      const activeMove = activeMoveRef.current;
      if (activeMove) {
        const now = performance.now();
        const start = animStartTimeRef.current;
        const storeState = useCubeStore.getState();
        const speed = storeState.speed || 1;
        const speedMultiplier = storeState.isScrambling ? 3.0 : 1.0;
        const duration = 350 / (speed * speedMultiplier); // Accelerated animation for mechanical scrambling
        
        let progress = (now - start) / duration;
        if (progress > 1) progress = 1;
        
        // Easing function: easeInOutCubic for elegant realistic turning physics
        const easeInOutCubic = (x) => x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
        const easedProgress = easeInOutCubic(progress);
        
        const spec = getMoveSpec(activeMove);
        if (spec) {
          const axisVector = new THREE.Vector3();
          axisVector[spec.axis] = 1;
          const currentAngle = spec.angle * easedProgress;
          
          cubiesRef.current.forEach(mesh => {
            if (spec.filter(mesh)) {
              mesh.position.copy(mesh.userData.origPos).applyAxisAngle(axisVector, currentAngle);
              mesh.rotation.set(0, 0, 0);
              mesh.rotateOnWorldAxis(axisVector, currentAngle);
            }
          });
        }
        
        if (progress === 1) {
          // Reset visual coordinates to solved slots
          cubiesRef.current.forEach(mesh => {
            mesh.position.copy(mesh.userData.origPos);
            mesh.rotation.set(0, 0, 0);
          });
          
          activeMoveRef.current = null;
          
          // Apply logical state change
          const store = useCubeStore.getState();
          const isSolutionMove = store.solutionMoves.length > 0 &&
                                 store.solutionStep >= 0 &&
                                 store.solutionStep < store.solutionMoves.length &&
                                 store.solutionMoves[store.solutionStep] === activeMove;
          
          if (isSolutionMove) {
            store.stepSolution();
          } else {
            store.applyMove(activeMove);
          }

          // If scramble finishes, toggle isScrambling off
          if (store.moveQueue.length === 0 && store.isScrambling) {
            useCubeStore.setState({ isScrambling: false });
          }
        }
      } else {
        // No active move animation, dequeue the next one
        const queue = useCubeStore.getState().moveQueue;
        if (queue && queue.length > 0) {
          const nextMove = useCubeStore.getState().dequeueMove();
          if (nextMove) {
            activeMoveRef.current = nextMove;
            animStartTimeRef.current = performance.now();
          }
        }
      }

      renderer.render(scene, camera);
    };
    animate();

    // Mouse drag
    const onMouseDown = (e) => { isDragging.current = true; lastMouse.current = {x:e.clientX, y:e.clientY}; };
    const onMouseMove = (e) => {
      if (!isDragging.current) return;
      const dx = e.clientX - lastMouse.current.x;
      const dy = e.clientY - lastMouse.current.y;
      spherical.current.theta -= dx * 0.008;
      spherical.current.phi = Math.max(0.1, Math.min(Math.PI-0.1, spherical.current.phi + dy * 0.008));
      lastMouse.current = {x:e.clientX, y:e.clientY};
      updateCamera();
    };
    const onMouseUp = () => { isDragging.current = false; };
    const onDblClick = () => { spherical.current = {theta:Math.PI/5, phi:Math.PI/3.5}; updateCamera(); };

    // Touch support
    const onTouchStart = (e) => {
      const t = e.touches[0];
      isDragging.current = true;
      lastMouse.current = {x:t.clientX, y:t.clientY};
    };
    const onTouchMove = (e) => {
      if (!isDragging.current) return;
      const t = e.touches[0];
      const dx = t.clientX - lastMouse.current.x;
      const dy = t.clientY - lastMouse.current.y;
      spherical.current.theta -= dx * 0.008;
      spherical.current.phi = Math.max(0.1, Math.min(Math.PI-0.1, spherical.current.phi + dy * 0.008));
      lastMouse.current = {x:t.clientX, y:t.clientY};
      updateCamera();
    };

    mount.addEventListener("mousedown", onMouseDown);
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    mount.addEventListener("dblclick", onDblClick);
    mount.addEventListener("touchstart", onTouchStart);
    mount.addEventListener("touchmove", onTouchMove);
    mount.addEventListener("touchend", onMouseUp);

    // Keyboard support for professional interactive control
    const onKeyDown = (e) => {
      if (document.activeElement.tagName === "INPUT" || document.activeElement.tagName === "TEXTAREA") {
        return;
      }
      const key = e.key.toLowerCase();
      const isShift = e.shiftKey;
      let move = null;
      switch(key) {
        case "r": move = isShift ? "R'" : "R"; break;
        case "l": move = isShift ? "L'" : "L"; break;
        case "u": move = isShift ? "U'" : "U"; break;
        case "d": move = isShift ? "D'" : "D"; break;
        case "f": move = isShift ? "F'" : "F"; break;
        case "b": move = isShift ? "B'" : "B"; break;
        case "s":
          e.preventDefault();
          useCubeStore.getState().scramble();
          break;
        case " ": {
          e.preventDefault();
          const store = useCubeStore.getState();
          if (store.solutionMoves.length > 0) {
            if (store.isPlaying) {
              store.clearQueue();
              store.setIsPlaying(false);
            } else {
              const remaining = store.solutionMoves.slice(store.solutionStep);
              store.enqueueMoves(remaining);
              store.setIsPlaying(true);
            }
          }
          break;
        }
        default:
          break;
      }
      if (move) {
        e.preventDefault();
        useCubeStore.getState().enqueueMoves([move]);
      }
    };
    window.addEventListener("keydown", onKeyDown);

    // Resize
    const onResize = () => {
      const w = mount.clientWidth, h = mount.clientHeight;
      renderer.setSize(w, h);
      camera.aspect = w/h;
      camera.updateProjectionMatrix();
    };
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(frameRef.current);
      renderer.dispose();
      mount.removeChild(renderer.domElement);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  // Update sticker colors when cube state changes
  useEffect(() => {
    // State synchronized guard: immediately abort active animation if state changed externally
    if (activeMoveRef.current !== null) {
      activeMoveRef.current = null;
    }

    cubiesRef.current.forEach(mesh => {
      const {x,y,z} = mesh.userData;
      mesh.position.copy(mesh.userData.origPos);
      mesh.rotation.set(0, 0, 0);
      mesh.material.forEach((mat, bi) => {
        mat.color.set(getStickerColor(cubeState, x, y, z, bi));
      });
    });
    rendererRef.current?.render(sceneRef.current, cameraRef.current);
  }, [cubeState]);

  return <div ref={mountRef} style={{width:"100%",height:"100%",cursor:"grab",...style}} />;
}
