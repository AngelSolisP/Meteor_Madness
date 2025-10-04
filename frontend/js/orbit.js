export function keplerOrbitPoints(a_AU, e, i_deg, Omega_deg, omega_deg, M_deg, N=360) {
  const points = [];
  const i = rad(i_deg), Omega = rad(Omega_deg), omega = rad(omega_deg);
  for (let k=0; k<N; k++) {
    const E = 2*Math.PI * (k/(N-1));
    const r = a_AU * (1 - e*Math.cos(E));
    const x_orb = r * (Math.cos(E) - e);
    const y_orb = r * Math.sqrt(1-e*e) * Math.sin(E);
    const z_orb = 0;
    const [x1,y1,z1] = rotZ(x_orb,y_orb,z_orb, omega);
    const [x2,y2,z2] = rotX(x1,y1,z1, i);
    const [x3,y3,z3] = rotZ(x2,y2,z2, Omega);
    points.push([x3, y3, z3]);
  }
  return points;
}
function rad(d){ return d*Math.PI/180; }
function rotZ(x,y,z,a){ const c=Math.cos(a), s=Math.sin(a); return [c*x - s*y, s*x + c*y, z]; }
function rotX(x,y,z,a){ const c=Math.cos(a), s=Math.sin(a); return [x, c*y - s*z, s*y + c*z]; }
