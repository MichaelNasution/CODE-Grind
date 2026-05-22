import { useEffect, useRef } from "react";
import * as THREE from "three";
import { FACE_COLORS } from "../engine/cube";

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

    // Build cubies
    const GAP = 1.04;
    const cubies = [];
    for (let x = -1; x <= 1; x++) {
      for (let y = -1; y <= 1; y++) {
        for (let z = -1; z <= 1; z++) {
          const materials = Array.from({length:6}, (_,bi) => {
            const color = getStickerColor(cubeState, x, y, z, bi);
            return new THREE.MeshStandardMaterial({
              color, roughness: color === "#1a1a2e" ? 0.9 : 0.3, metalness: 0.1
            });
          });
          const geo = new THREE.BoxGeometry(0.95, 0.95, 0.95, 1, 1, 1);
          const mesh = new THREE.Mesh(geo, materials);
          mesh.position.set(x*GAP, y*GAP, z*GAP);
          mesh.castShadow = true;
          mesh.userData = {x,y,z};
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

    // Animate
    const animate = () => {
      frameRef.current = requestAnimationFrame(animate);
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
      window.removeEventListener("resize", onResize);
    };
  }, []);

  // Update sticker colors when cube state changes
  useEffect(() => {
    cubiesRef.current.forEach(mesh => {
      const {x,y,z} = mesh.userData;
      mesh.material.forEach((mat, bi) => {
        mat.color.set(getStickerColor(cubeState, x, y, z, bi));
      });
    });
    rendererRef.current?.render(sceneRef.current, cameraRef.current);
  }, [cubeState]);

  return <div ref={mountRef} style={{width:"100%",height:"100%",cursor:"grab",...style}} />;
}
