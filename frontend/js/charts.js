// frontend/js/charts.js
// Pequeño módulo para actualizar gráficas de resultados con Chart.js (UMD global "Chart").

let energyChart, radiiChart, seismicChart;

function formatSci(x) {
  if (!Number.isFinite(x)) return 0;
  // Muestra en notación científica si es muy grande
  const abs = Math.abs(x);
  return (abs >= 1e6 || abs < 1e-3) ? Number(x).toExponential(2) : Number(x).toFixed(2);
}

export function updateCharts(metrics) {
  // metrics: { energy_joules, tnt_tons, shock_radius_km, thermal_radius_km, seismic_Mw_equiv, crater_diameter_m }

  // 1) Energía y TNT
  {
    const ctx = document.getElementById("chartEnergyTNT");
    if (ctx) {
      const data = {
        labels: ["Energía (J)", "TNT (ton)"],
        datasets: [{
          label: "Magnitud",
          data: [metrics.energy_joules || 0, metrics.tnt_tons || 0],
        }]
      };
      const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false }, tooltip: { callbacks: {
          label: (c) => `${c.dataset.label}: ${formatSci(c.raw)}`
        }}},
        scales: {
          y: { ticks: { callback: (v) => `${v}` } }
        }
      };
      if (energyChart) { energyChart.data = data; energyChart.update(); }
      else { energyChart = new Chart(ctx, { type: "bar", data, options }); }
    }
  }

  // 2) Radios de efecto (km)
  {
    const ctx = document.getElementById("chartRadii");
    if (ctx) {
      const data = {
        labels: ["Onda de choque (km)", "Térmico (km)"],
        datasets: [{
          label: "Radio",
          data: [metrics.shock_radius_km || 0, metrics.thermal_radius_km || 0],
        }]
      };
      const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          y: { ticks: { callback: (v) => `${v}` } }
        }
      };
      if (radiiChart) { radiiChart.data = data; radiiChart.update(); }
      else { radiiChart = new Chart(ctx, { type: "bar", data, options }); }
    }
  }

  // 3) Magnitud sísmica (Mw)
  {
    const ctx = document.getElementById("chartSeismic");
    if (ctx) {
      const Mw = Number(metrics.seismic_Mw_equiv || 0);
      const data = {
        labels: ["Mw (equivalente)"],
        datasets: [{
          label: "Magnitud",
          data: [Mw],
        }]
      };
      const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          y: { suggestedMin: 0, suggestedMax: Math.max(8, Math.ceil(Mw + 1)) }
        }
      };
      if (seismicChart) { seismicChart.data = data; seismicChart.update(); }
      else { seismicChart = new Chart(ctx, { type: "bar", data, options }); }
    }
  }
}
