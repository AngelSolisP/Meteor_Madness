import { elementsToState, stateToElements, applyImpulse, makeOrbitCurve } from "./orbit3d.js";

let renderer, scene, camera, controls, baseLine, defLine, sun;
const container = document.getElementById("orbit3dCanvas");

function initScene(){
  // Renderer
  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(window.devicePixelRatio || 1);
  renderer.setSize(container.clientWidth || 800, container.clientHeight || 400);
  container.innerHTML = "";
  container.appendChild(renderer.domElement);

  // Scene
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x0f1024);

  // Camera
  const w = container.clientWidth || 800, h = container.clientHeight || 400;
  const aspect = w / h;
  camera = new THREE.PerspectiveCamera(50, aspect, 0.001, 1000);
  camera.position.set(2.5, 2.0, 2.5);

  // Controls
  controls = new THREE.OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;
  controls.enablePan = true;
  controls.minDistance = 0.2;
  controls.maxDistance = 50;

  // Lights
  const amb = new THREE.AmbientLight(0xffffff, 0.8);
  scene.add(amb);
  const dir = new THREE.DirectionalLight(0xffffff, 0.6);
  dir.position.set(3,3,3);
  scene.add(dir);

  // Sun
  const sunGeo = new THREE.SphereGeometry(0.1, 32, 32);
  const sunMat = new THREE.MeshBasicMaterial({ color: 0xfbbf24 });
  sun = new THREE.Mesh(sunGeo, sunMat);
  scene.add(sun);

  // Axes helper
  const axes = new THREE.AxesHelper(0.5);
  scene.add(axes);

  window.addEventListener("resize", onResize);
  animate();
}

function onResize(){
  const w = container.clientWidth || 800, h = container.clientHeight || 400;
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
  renderer.setSize(w, h);
}

function animate(){
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}

function clampEcc(e){
  if (!Number.isFinite(e)) return 0.0;
  return Math.min(Math.max(e, 0), 0.99);
}

function safeNumber(v, def){
  const n = Number(v);
  return Number.isFinite(n) ? n : def;
}

function drawOrbits(){
  // Elementos desde la UI (con saneamiento)
  const a = safeNumber(document.getElementById("a").value, 1.0);
  const e = clampEcc(safeNumber(document.getElementById("e").value, 0.1));
  const inc = safeNumber(document.getElementById("i").value, 5.0);
  const Omega = safeNumber(document.getElementById("Omega").value, 80.0);
  const omega = safeNumber(document.getElementById("omega").value, 45.0);

  // Limpiar líneas previas
  if (baseLine){ scene.remove(baseLine); baseLine.geometry.dispose(); }
  if (defLine){ scene.remove(defLine); defLine.geometry.dispose(); }

  // Órbita base (azul)
  baseLine = makeOrbitCurve(a, e, inc, Omega, omega, 0x60a5fa, 480);
  scene.add(baseLine);

  // Δv
  const dv_mag = safeNumber(document.getElementById("dv_mag").value, 0);
  const dv_dir = document.getElementById("dv_dir").value;
  const dv_nu  = safeNumber(document.getElementById("dv_nu").value, 0);

  const res = applyImpulse(a, e, inc, Omega, omega, dv_nu, dv_mag, dv_dir);
  const a2 = res.elems.a, e2 = res.elems.e, i2 = res.elems.i, O2 = res.elems.Omega, w2 = res.elems.omega;

  // Órbita desviada (rojo)
  defLine = makeOrbitCurve(a2, e2, i2, O2, w2, 0xef4444, 480);
  scene.add(defLine);
}

export function initOrbit3D(){
  initScene();
  drawOrbits();

  // Botón
  const btn = document.getElementById("applyDv");
  if (btn) btn.addEventListener("click", drawOrbits);

  // Redibujar al cambiar elementos 2D
  ["a","e","i","Omega","omega"].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener("change", drawOrbits);
  });

  // Redibujar al cambiar Δv
  ["dv_mag","dv_dir","dv_nu"].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener("change", drawOrbits);
  });
}
