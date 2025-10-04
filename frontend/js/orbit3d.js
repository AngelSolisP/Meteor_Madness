// Simple 3D Kepler + impulsive Δv visualization using THREE.js
// Units: AU for distance, arbitrary time where mu=1 AU^3/TU^2. Speeds are in AU/TU.
// We scale real m/s to AU/TU by dividing by Vref=30 km/s (Earth orbital speed) and then multiply by a scale factor.
const MU = 1.0; // normalized solar mu

function deg2rad(d){ return d*Math.PI/180; }
function rad2deg(r){ return r*180/Math.PI; }

function rotZ(a){
  const c=Math.cos(a), s=Math.sin(a);
  return new THREE.Matrix3().set(c,-s,0, s,c,0, 0,0,1);
}
function rotX(a){
  const c=Math.cos(a), s=Math.sin(a);
  return new THREE.Matrix3().set(1,0,0, 0,c,-s, 0,s,c);
}

// PQW -> ECI rotation for angles (Omega, i, omega)
function pqwToEci(Omega,i,omega){
  const R = new THREE.Matrix3();
  const RzO = rotZ(Omega), RxI = rotX(i), Rzw = rotZ(omega);
  // R = Rz(Omega) * Rx(i) * Rz(omega)
  R.copy(RzO).multiply(RxI).multiply(Rzw);
  return R;
}

export function elementsToState(a,e,i_deg,Omega_deg,omega_deg,nu_deg){
  const i = deg2rad(i_deg), Omega = deg2rad(Omega_deg), omega = deg2rad(omega_deg), nu = deg2rad(nu_deg);
  const p = a*(1 - e*e);
  const r_pqw = new THREE.Vector3( p*Math.cos(nu)/(1+e*Math.cos(nu)), p*Math.sin(nu)/(1+e*Math.cos(nu)), 0 );
  const v_pqw = new THREE.Vector3( -Math.sqrt(MU/p)*Math.sin(nu), Math.sqrt(MU/p)*(e+Math.cos(nu)), 0 );
  const R = pqwToEci(Omega,i,omega);
  const r = r_pqw.clone().applyMatrix3(R);
  const v = v_pqw.clone().applyMatrix3(R);
  return {r,v};
}

export function stateToElements(r,v){
  const rmag = r.length();
  const vmag = v.length();
  const h = new THREE.Vector3().crossVectors(r,v);
  const hmag = h.length();
  const k = new THREE.Vector3(0,0,1);
  const n = new THREE.Vector3().crossVectors(k,h);
  const emag_vec = r.clone().multiplyScalar((vmag*vmag - MU)/MU).add( v.clone().multiplyScalar(-r.dot(v)/MU) );
  const e = emag_vec.length();
  const i = Math.acos(h.z / hmag);
  const Omega = Math.atan2(n.y, n.x);
  let omega = Math.atan2( n.clone().cross(emag_vec).dot(h)/ (n.length()*hmag), n.dot(emag_vec)/n.length() );
  if (!isFinite(omega)) omega = 0;
  const energy = vmag*vmag/2 - MU/rmag;
  const a = -MU/(2*energy);
  const nu = Math.atan2( r.dot(v)*Math.sqrt(p(a,e))/ (MU), (p(a,e)/rmag - 1) );
  return {a,e,i:rad2deg(i),Omega:rad2deg(normAng(Omega)),omega:rad2deg(normAng(omega)),nu:rad2deg(normAng(nu))};
}
function p(a,e){ return a*(1-e*e); }
function normAng(x){ let y=x%(2*Math.PI); if(y<0) y+=2*Math.PI; return y; }

function localRTN(r,v){
  const Rhat = r.clone().normalize();
  const Nhat = new THREE.Vector3().crossVectors(r,v).normalize();
  const That = new THREE.Vector3().crossVectors(Nhat,Rhat).normalize();
  // Columns are basis vectors in ECI
  const M = new THREE.Matrix3().set(
    Rhat.x, That.x, Nhat.x,
    Rhat.y, That.y, Nhat.y,
    Rhat.z, That.z, Nhat.z
  );
  return {Rhat,That,Nhat,M};
}

export function applyImpulse(a,e,i,Omega,omega,nu_apply_deg, dv_m_s, dir="tangential"){
  // 1) state at nu_apply
  const {r,v} = elementsToState(a,e,i,Omega,omega,nu_apply_deg);
  const {M} = localRTN(r,v);
  const Vref = 30000; // m/s ≈ Earth orbital speed
  const dv_scale = dv_m_s / Vref; // AU/TU units (relative scale for demo)
  // Define dv vector in RTN
  let dv_r=0, dv_t=0, dv_n=0;
  if (dir==="tangential") dv_t = dv_scale;
  else if (dir==="radial") dv_r = dv_scale;
  else if (dir==="normal") dv_n = dv_scale;
  // Convert to ECI
  const dv_rtn = new THREE.Vector3(dv_r,dv_t,dv_n);
  const dv_eci = dv_rtn.applyMatrix3(M); // columns-basis multiply
  const v_new = v.clone().add(dv_eci);

  // New elements from (r, v_new)
  const elems = stateToElements(r, v_new);
  return {r,v: v_new, elems};
}

export function makeOrbitCurve(a,e,i,Omega,omega, color=0x60a5fa, N=400){
  const geom = new THREE.BufferGeometry();
  const pts = [];
  for (let k=0;k<N;k++){
    const nu = 360*k/(N-1);
    const {r} = elementsToState(a,e,i,Omega,omega,nu);
    pts.push(r.x, r.y, r.z);
  }
  geom.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3));
  const mat = new THREE.LineBasicMaterial({ color });
  const line = new THREE.Line(geom, mat);
  return line;
}
