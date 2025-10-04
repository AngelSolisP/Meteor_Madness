// src/config/api-config.ts
/**
 * CONFIGURACIÓN DE APIs
 * Coloca tus API keys aquí o usa variables de entorno
 */

export const API_CONFIG = {
  NASA_API_KEY: import.meta.env.PUBLIC_NASA_API_KEY || 'DEMO_KEY',
  GOOGLE_MAPS_KEY: import.meta.env.PUBLIC_GOOGLE_MAPS_KEY || '',
};

// ============================================================================
// EJEMPLO 1: Inicialización en Layout Principal (Astro)
// src/layouts/Layout.astro
// ============================================================================

/*
---
import { initMeteorAPI } from '../services/MeteorMadnessAPI';
import { API_CONFIG } from '../config/api-config';

// Inicializar API
const api = initMeteorAPI({
  nasaKey: API_CONFIG.NASA_API_KEY,
  googleMapsKey: API_CONFIG.GOOGLE_MAPS_KEY
});

// Hacer disponible globalmente para scripts del cliente
---

<script define:vars={{ apiConfig: API_CONFIG }}>
  // Inicializar en el cliente
  window.API_CONFIG = apiConfig;
</script>
*/

// ============================================================================
// EJEMPLO 2: Uso en Página Astro (Server-Side)
// src/pages/index.astro
// ============================================================================

/*
---
import Layout from '../layouts/Layout.astro';
import { getMeteorAPI } from '../services/MeteorMadnessAPI';

// Cargar dataset local
import dataset from '../../public/data/integrated_dataset_final.json';

// Obtener instancia de API
const api = getMeteorAPI();

// Obtener datos en tiempo real de NASA
const liveAsteroids = await api.getNEOFeed();
const hazardousAsteroids = await api.getHazardousAsteroids();

// Enriquecer dataset con geocoding
const enrichedDataset = await api.enrichDataset(dataset.slice(0, 5));

// Obtener estadísticas
const stats = api.getDatasetStats(dataset);

// Obtener terremotos recientes
const earthquakes = await api.getEarthquakes(6.0, 30);

// Obtener galería de imágenes
const gallery = await api.getImpactGallery();
---

<Layout title="Meteor Madness">
  <h1>Dashboard Principal</h1>
  
  <section class="stats">
    <div class="stat-card">
      <h3>Asteroides en Dataset</h3>
      <p>{stats.total}</p>
    </div>
    <div class="stat-card">
      <h3>Potencialmente Peligrosos</h3>
      <p>{stats.hazardous}</p>
    </div>
    <div class="stat-card">
      <h3>Aproximaciones HOY</h3>
      <p>{liveAsteroids.length}</p>
    </div>
  </section>

  <section class="live-feed">
    <h2>🔴 En Vivo desde NASA</h2>
    <div class="asteroid-grid">
      {liveAsteroids.map(asteroid => (
        <div class="asteroid-card">
          <h3>{asteroid.name}</h3>
          <p>Distancia: {parseFloat(asteroid.close_approach_data[0].miss_distance.kilometers).toLocaleString()} km</p>
          {asteroid.is_potentially_hazardous_asteroid && (
            <span class="badge-danger">⚠️ PELIGROSO</span>
          )}
        </div>
      ))}
    </div>
  </section>

  <section class="enriched-data">
    <h2>📍 Dataset Enriquecido con Ubicaciones</h2>
    <div class="enriched-grid">
      {enrichedDataset.map(asteroid => (
        <div class="enriched-card">
          <h3>{asteroid.name}</h3>
          <p><strong>Ubicación:</strong> {asteroid.impact_scenario.readable_location}</p>
          <p><strong>Energía:</strong> {asteroid.impact_calculations.tnt_megatons.toExponential(2)} MT</p>
          {asteroid.earthquake_comparison && (
            <div class="comparison">
              <p>Similar al terremoto de {asteroid.earthquake_comparison.earthquake.place}</p>
              <p>{asteroid.earthquake_comparison.comparison.description}</p>
            </div>
          )}
        </div>
      ))}
    </div>
  </section>

  <section class="gallery">
    <h2>🖼️ Galería NASA</h2>
    <div class="image-grid">
      {gallery.slice(0, 6).map(image => (
        <div class="image-card">
          <img src={image.imageUrl} alt={image.title} loading="lazy" />
          <h4>{image.title}</h4>
        </div>
      ))}
    </div>
  </section>
</Layout>
*/

// ============================================================================
// EJEMPLO 3: Uso en Componente de Cliente (JavaScript)
// src/components/InteractiveMap.astro
// ============================================================================

/*
<div id="meteor-map"></div>

<script>
  import { MeteorAPI } from '../services/MeteorMadnessAPI';
  import L from 'leaflet';

  // Inicializar API en el cliente
  const api = new MeteorAPI({
    nasaKey: window.API_CONFIG.NASA_API_KEY,
    googleMapsKey: window.API_CONFIG.GOOGLE_MAPS_KEY
  });

  // Cargar dataset
  async function loadDataset() {
    const response = await fetch('/data/integrated_dataset_final.json');
    return response.json();
  }

  async function initMap() {
    const dataset = await loadDataset();
    
    // Crear mapa
    const map = L.map('meteor-map').setView([20, 0], 2);
    
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    // Añadir puntos de impacto
    for (const asteroid of dataset) {
      const { latitude, longitude } = asteroid.impact_scenario;
      
      // Enriquecer con geocoding en tiempo real
      const enriched = await api.enrichWithGeocoding(asteroid);
      
      // Calcular color según peligrosidad
      const danger = api.getDangerLevel(asteroid.impact_calculations.tnt_megatons);
      
      // Crear marcador
      const circle = L.circle([latitude, longitude], {
        color: danger.color,
        fillColor: danger.color,
        fillOpacity: 0.5,
        radius: asteroid.impact_calculations.crater_diameter_m * 10
      }).addTo(map);

      // Popup con información
      circle.bindPopup(`
        <div class="impact-popup">
          <h3>${asteroid.name}</h3>
          <p><strong>Ubicación:</strong> ${enriched.impact_scenario.readable_location}</p>
          <p><strong>Energía:</strong> ${api.formatLargeNumber(asteroid.impact_calculations.tnt_megatons)} MT</p>
          <p><strong>Magnitud:</strong> ${asteroid.impact_calculations.seismic_magnitude.toFixed(1)} Mw</p>
          <p><strong>Peligro:</strong> <span style="color: ${danger.color}">${danger.level}</span></p>
          <p>${danger.description}</p>
        </div>
      `);
    }
  }

  initMap();
</script>
*/

// ============================================================================
// EJEMPLO 4: Calculadora de Impactos Interactiva
// src/components/ImpactCalculator.astro
// ============================================================================

/*
<div class="calculator">
  <h2>🧮 Calculadora de Impactos</h2>
  
  <form id="impact-form">
    <div class="form-group">
      <label>Diámetro (metros)</label>
      <input type="number" id="diameter" value="100" min="1" max="10000" />
    </div>
    
    <div class="form-group">
      <label>Velocidad (km/s)</label>
      <input type="number" id="velocity" value="20" min="1" max="50" step="0.1" />
    </div>
    
    <div class="form-group">
      <label>Ángulo de Impacto (grados)</label>
      <input type="range" id="angle" value="45" min="15" max="90" />
      <span id="angle-display">45°</span>
    </div>
    
    <div class="form-group">
      <label>Densidad (kg/m³)</label>
      <select id="density">
        <option value="2000">2000 - Tipo C (carbonáceo)</option>
        <option value="3000" selected>3000 - Tipo S (rocoso)</option>
        <option value="8000">8000 - Tipo M (metálico)</option>
      </select>
    </div>
    
    <button type="submit">Calcular Impacto 🚀</button>
  </form>

  <div id="results" style="display: none;">
    <h3>Resultados</h3>
    <div id="results-content"></div>
    <div id="comparison-content"></div>
    <div id="earthquake-comparison"></div>
  </div>
</div>

<script>
  import { MeteorAPI } from '../services/MeteorMadnessAPI';

  const api = new MeteorAPI({
    nasaKey: window.API_CONFIG.NASA_API_KEY
  });

  const form = document.getElementById('impact-form');
  const results = document.getElementById('results');
  const angleSlider = document.getElementById('angle');
  const angleDisplay = document.getElementById('angle-display');

  angleSlider.addEventListener('input', (e) => {
    angleDisplay.textContent = e.target.value + '°';
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const diameter = parseFloat(document.getElementById('diameter').value);
    const velocity = parseFloat(document.getElementById('velocity').value);
    const angle = parseFloat(angleSlider.value);
    const density = parseFloat(document.getElementById('density').value);

    // Calcular impacto
    const impact = api.calculateImpact(diameter, velocity, angle, density);
    
    // Obtener nivel de peligro
    const danger = api.getDangerLevel(impact.tnt_megatons);

    // Buscar terremoto similar
    const earthquake = await api.findSimilarEarthquake(impact.seismic_magnitude);

    // Mostrar resultados
    document.getElementById('results-content').innerHTML = `
      <div class="result-grid">
        <div class="result-item">
          <span class="label">Masa</span>
          <span class="value">${api.formatLargeNumber(impact.mass_kg)} kg</span>
        </div>
        <div class="result-item">
          <span class="label">Energía</span>
          <span class="value">${impact.tnt_megatons.toExponential(2)} MT</span>
        </div>
        <div class="result-item">
          <span class="label">Cráter</span>
          <span class="value">${Math.round(impact.crater_diameter_m)} metros</span>
        </div>
        <div class="result-item">
          <span class="label">Magnitud Sísmica</span>
          <span class="value">${impact.seismic_magnitude.toFixed(1)} Mw</span>
        </div>
      </div>
      
      <div class="danger-level" style="background: ${danger.color}">
        <h4>Nivel de Peligro: ${danger.level}</h4>
        <p>${danger.description}</p>
      </div>
    `;

    if (earthquake) {
      document.getElementById('earthquake-comparison').innerHTML = `
        <div class="comparison-box">
          <h4>🌍 Comparación con Terremoto Real</h4>
          <p>Similar al terremoto de <strong>${earthquake.properties.place}</strong></p>
          <p>Magnitud: ${earthquake.properties.mag} Mw</p>
          <p>Fecha: ${new Date(earthquake.properties.time).toLocaleDateString()}</p>
        </div>
      `;
    }

    results.style.display = 'block';
    results.scrollIntoView({ behavior: 'smooth' });
  });
</script>
*/

// ============================================================================
// EJEMPLO 5: Feed en Tiempo Real con Polling
// src/components/LiveFeed.astro
// ============================================================================

/*
<div class="live-feed">
  <h2>🔴 Aproximaciones en Tiempo Real</h2>
  <div class="update-info">
    <span id="last-update">Cargando...</span>
    <button id="refresh-btn">🔄 Actualizar</button>
  </div>
  <div id="live-asteroids-grid" class="asteroid-grid"></div>
</div>

<script>
  import { MeteorAPI } from '../services/MeteorMadnessAPI';

  const api = new MeteorAPI({
    nasaKey: window.API_CONFIG.NASA_API_KEY
  });

  const grid = document.getElementById('live-asteroids-grid');
  const lastUpdate = document.getElementById('last-update');
  const refreshBtn = document.getElementById('refresh-btn');

  async function updateFeed() {
    try {
      // Obtener aproximaciones de hoy
      const asteroids = await api.getNEOFeed();
      const hazardous = asteroids.filter(a => a.is_potentially_hazardous_asteroid);
      const critical = await api.getCriticalApproaches();

      // Mostrar información
      grid.innerHTML = '';

      if (critical.length > 0) {
        const alertDiv = document.createElement('div');
        alertDiv.className = 'critical-alert';
        alertDiv.innerHTML = `
          <h3>⚠️ APROXIMACIONES CRÍTICAS (< 0.05 AU)</h3>
          <p>${critical.length} asteroide(s) en aproximación cercana</p>
        `;
        grid.appendChild(alertDiv);
      }

      asteroids.slice(0, 12).forEach(asteroid => {
        const distance = parseFloat(asteroid.close_approach_data[0].miss_distance.kilometers);
        const velocity = parseFloat(asteroid.close_approach_data[0].relative_velocity.kilometers_per_second);
        const diameter = asteroid.estimated_diameter.meters.estimated_diameter_max;

        // Calcular impacto hipotético
        const impact = api.calculateImpact(diameter, velocity);
        const danger = api.getDangerLevel(impact.tnt_megatons);

        const card = document.createElement('div');
        card.className = 'asteroid-card-live';
        card.innerHTML = `
          <div class="card-header">
            <h3>${asteroid.name}</h3>
            ${asteroid.is_potentially_hazardous_asteroid ? 
              '<span class="badge-hazard">⚠️ PELIGROSO</span>' : ''}
          </div>
          <div class="card-body">
            <p><strong>Distancia:</strong> ${distance.toLocaleString()} km</p>
            <p><strong>Velocidad:</strong> ${velocity.toFixed(2)} km/s</p>
            <p><strong>Diámetro:</strong> ~${Math.round(diameter)} m</p>
            <p><strong>Energía potencial:</strong> ${impact.tnt_megatons.toExponential(2)} MT</p>
            <div class="danger-indicator" style="background: ${danger.color}">
              ${danger.level}
            </div>
          </div>
          <div class="card-footer">
            <small>Aproximación: ${asteroid.close_approach_data[0].close_approach_date}</small>
          </div>
        `;
        grid.appendChild(card);
      });

      lastUpdate.textContent = `Última actualización: ${new Date().toLocaleTimeString()}`;
    } catch (error) {
      console.error('Error updating feed:', error);
      grid.innerHTML = '<p class="error">Error al cargar datos. Intenta de nuevo.</p>';
    }
  }

  // Actualizar cada 5 minutos
  updateFeed();
  setInterval(updateFeed, 5 * 60 * 1000);

  refreshBtn.addEventListener('click', () => {
    api.clearCache(); // Limpiar cache para forzar actualización
    updateFeed();
  });
</script>
*/

// ============================================================================
// EJEMPLO 6: Visualización Orbital 3D
// src/components/OrbitalViewer.astro
// ============================================================================

/*
<div class="orbital-viewer">
  <h2>🌌 Órbita del Asteroide</h2>
  <select id="asteroid-selector">
    <option value="">Selecciona un asteroide...</option>
  </select>
  <div id="orbit-info"></div>
  <canvas id="orbit-canvas"></canvas>
</div>

<script>
  import { MeteorAPI } from '../services/MeteorMadnessAPI';
  import * as THREE from 'three';

  const api = new MeteorAPI({
    nasaKey: window.API_CONFIG.NASA_API_KEY
  });

  const selector = document.getElementById('asteroid-selector');
  const orbitInfo = document.getElementById('orbit-info');
  const canvas = document.getElementById('orbit-canvas');

  let scene, camera, renderer, asteroidMesh, earthMesh;

  async function init() {
    // Cargar dataset
    const response = await fetch('/data/integrated_dataset_final.json');
    const dataset = await response.json();

    // Poblar selector
    dataset.forEach(asteroid => {
      const option = document.createElement('option');
      option.value = asteroid.id;
      option.textContent = asteroid.name;
      selector.appendChild(option);
    });

    // Setup Three.js
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, canvas.clientWidth / canvas.clientHeight, 0.1, 1000);
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    renderer.setSize(canvas.clientWidth, canvas.clientHeight);

    // Sol
    const sunGeometry = new THREE.SphereGeometry(2, 32, 32);
    const sunMaterial = new THREE.MeshBasicMaterial({ color: 0xffff00 });
    const sun = new THREE.Mesh(sunGeometry, sunMaterial);
    scene.add(sun);

    // Tierra
    const earthGeometry = new THREE.SphereGeometry(0.5, 32, 32);
    const earthMaterial = new THREE.MeshBasicMaterial({ color: 0x0077ff });
    earthMesh = new THREE.Mesh(earthGeometry, earthMaterial);
    scene.add(earthMesh);

    // Órbita de la Tierra
    const earthOrbitGeometry = new THREE.BufferGeometry();
    const earthOrbitPoints = [];
    for (let i = 0; i <= 64; i++) {
      const angle = (i / 64) * Math.PI * 2;
      earthOrbitPoints.push(
        Math.cos(angle) * 10,
        0,
        Math.sin(angle) * 10
      );
    }
    earthOrbitGeometry.setAttribute('position', 
      new THREE.Float32BufferAttribute(earthOrbitPoints, 3));
    const earthOrbitMaterial = new THREE.LineBasicMaterial({ color: 0x4444ff });
    const earthOrbit = new THREE.Line(earthOrbitGeometry, earthOrbitMaterial);
    scene.add(earthOrbit);

    camera.position.set(20, 15, 20);
    camera.lookAt(0, 0, 0);

    animate();
  }

  selector.addEventListener('change', async (e) => {
    const asteroidId = e.target.value;
    if (!asteroidId) return;

    // Obtener datos orbitales
    const orbitalData = await api.getOrbitalData(asteroidId);
    
    if (orbitalData) {
      displayOrbitalInfo(orbitalData);
      drawAsteroidOrbit(orbitalData);
    }
  });

  function displayOrbitalInfo(orbital) {
    orbitInfo.innerHTML = `
      <div class="orbital-params">
        <p><strong>Semi-eje mayor:</strong> ${parseFloat(orbital.semi_major_axis).toFixed(3)} AU</p>
        <p><strong>Excentricidad:</strong> ${parseFloat(orbital.eccentricity).toFixed(4)}</p>
        <p><strong>Inclinación:</strong> ${parseFloat(orbital.inclination).toFixed(2)}°</p>
        <p><strong>Período orbital:</strong> ${parseFloat(orbital.orbital_period).toFixed(1)} días</p>
      </div>
    `;
  }

  function drawAsteroidOrbit(orbital) {
    // Remover órbita anterior
    if (asteroidMesh) scene.remove(asteroidMesh);

    // Parámetros orbitales
    const a = parseFloat(orbital.semi_major_axis) * 10; // Escalar para visualización
    const e = parseFloat(orbital.eccentricity);
    const inc = parseFloat(orbital.inclination) * (Math.PI / 180);

    // Crear órbita elíptica
    const orbitGeometry = new THREE.BufferGeometry();
    const orbitPoints = [];
    
    for (let i = 0; i <= 128; i++) {
      const theta = (i / 128) * Math.PI * 2;
      const r = a * (1 - e * e) / (1 + e * Math.cos(theta));
      
      const x = r * Math.cos(theta);
      const z = r * Math.sin(theta) * Math.cos(inc);
      const y = r * Math.sin(theta) * Math.sin(inc);
      
      orbitPoints.push(x, y, z);
    }
    
    orbitGeometry.setAttribute('position', 
      new THREE.Float32BufferAttribute(orbitPoints, 3));
    const orbitMaterial = new THREE.LineBasicMaterial({ color: 0xff6600 });
    const asteroidOrbit = new THREE.Line(orbitGeometry, orbitMaterial);
    scene.add(asteroidOrbit);

    // Asteroide
    const asteroidGeometry = new THREE.SphereGeometry(0.3, 16, 16);
    const asteroidMaterial = new THREE.MeshBasicMaterial({ color: 0xff6600 });
    asteroidMesh = new THREE.Mesh(asteroidGeometry, asteroidMaterial);
    scene.add(asteroidMesh);
  }

  function animate() {
    requestAnimationFrame(animate);

    const time = Date.now() * 0.0001;
    
    // Animar Tierra
    earthMesh.position.x = Math.cos(time) * 10;
    earthMesh.position.z = Math.sin(time) * 10;

    // Animar asteroide si existe
    if (asteroidMesh) {
      asteroidMesh.position.x = Math.cos(time * 1.5) * 8;
      asteroidMesh.position.z = Math.sin(time * 1.5) * 8;
    }

    renderer.render(scene, camera);
  }

  init();
</script>
*/

// ============================================================================
// EJEMPLO 7: Sistema de Notificaciones
// src/components/NotificationSystem.astro
// ============================================================================

/*
<div id="notification-container"></div>

<script>
  import { MeteorAPI } from '../services/MeteorMadnessAPI';

  const api = new MeteorAPI({
    nasaKey: window.API_CONFIG.NASA_API_KEY
  });

  const container = document.getElementById('notification-container');

  async function checkForAlerts() {
    try {
      const critical = await api.getCriticalApproaches();
      
      if (critical.length > 0) {
        critical.forEach(asteroid => {
          showNotification({
            type: 'critical',
            title: '⚠️ Aproximación Crítica',
            message: `${asteroid.name} a ${parseFloat(asteroid.close_approach_data[0].miss_distance.astronomical).toFixed(4)} AU`,
            asteroid: asteroid
          });
        });
      }
    } catch (error) {
      console.error('Error checking alerts:', error);
    }
  }

  function showNotification(notification) {
    const notif = document.createElement('div');
    notif.className = `notification notification-${notification.type}`;
    notif.innerHTML = `
      <div class="notification-content">
        <h4>${notification.title}</h4>
        <p>${notification.message}</p>
        <button class="view-details" data-id="${notification.asteroid.id}">
          Ver Detalles
        </button>
      </div>
      <button class="close-notification">×</button>
    `;

    container.appendChild(notif);

    // Auto-cerrar
    setTimeout(() => {
      notif.classList.add('fade-out');
      setTimeout(() => notif.remove(), 500);
    }, 10000);

    // Cerrar manual
    notif.querySelector('.close-notification').addEventListener('click', () => {
      notif.remove();
    });

    // Ver detalles
    notif.querySelector('.view-details').addEventListener('click', (e) => {
      const id = e.target.dataset.id;
      window.location.href = `/asteroid/${id}`;
    });
  }

  // Check cada minuto
  checkForAlerts();
  setInterval(checkForAlerts, 60000);
</script>

<style>
  #notification-container {
    position: fixed;
    top: 20px;
    right: 20px;
    z-index: 9999;
    display: flex;
    flex-direction: column;
    gap: 12px;
    max-width: 400px;
  }

  .notification {
    background: linear-gradient(135deg, #ff6b6b 0%, #ee5a6f 100%);
    color: white;
    padding: 20px;
    border-radius: 12px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
    display: flex;
    gap: 16px;
    animation: slideIn 0.5s ease-out;
  }

  @keyframes slideIn {
    from {
      transform: translateX(400px);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }

  .notification.fade-out {
    animation: fadeOut 0.5s ease-out forwards;
  }

  @keyframes fadeOut {
    to {
      opacity: 0;
      transform: translateX(400px);
    }
  }

  .notification-content {
    flex: 1;
  }

  .view-details {
    background: rgba(255, 255, 255, 0.2);
    border: none;
    color: white;
    padding: 8px 16px;
    border-radius: 6px;
    cursor: pointer;
    margin-top: 8px;
  }

  .close-notification {
    background: none;
    border: none;
    color: white;
    font-size: 24px;
    cursor: pointer;
  }
</style>
*/

// ============================================================================
// RESUMEN DE INTEGRACIÓN
// ============================================================================

/*
PASOS PARA INTEGRAR EN TU PROYECTO:

1. Copiar MeteorMadnessAPI.ts a src/services/
2. Crear src/config/api-config.ts con tus API keys
3. Crear archivo .env en la raíz:
   
   PUBLIC_NASA_API_KEY=tu_key_aqui
   PUBLIC_GOOGLE_MAPS_KEY=tu_key_aqui

4. En Layout.astro, inicializar API:
   
   import { initMeteorAPI } from '../services/MeteorMadnessAPI';
   import { API_CONFIG } from '../config/api-config';
   
   const api = initMeteorAPI(API_CONFIG);

5. Usar en cualquier página/componente:
   
   import { getMeteorAPI } from '../services/MeteorMadnessAPI';
   const api = getMeteorAPI();
   
   // Server-side (Astro)
   const data = await api.getNEOFeed();
   
   // Client-side (script tag)
   <script>
     import { MeteorAPI } from '../services/MeteorMadnessAPI';
     const api = new MeteorAPI({ nasaKey: 'YOUR_KEY' });
     api.getNEOFeed().then(data => console.log(data));
   </script>

CARACTERÍSTICAS PRINCIPALES:

✅ Una sola clase para todas las APIs
✅ Cache automático para optimizar requests
✅ Funciones de enrichment (geocoding, comparaciones)
✅ Cálculos científicos integrados
✅ Manejo de errores robusto
✅ TypeScript con tipos completos
✅ Funciona en server-side y client-side
✅ Sin dependencias externas (solo fetch nativo)

APIs SOPORTADAS:
- NASA NEO API (asteroides en tiempo real)
- NASA Images API (galería de imágenes)
- USGS Earthquakes API (comparación sísmica)
- Google Maps Geocoding API (ubicaciones legibles)
- Open-Elevation API (elevación del terreno)
*/
