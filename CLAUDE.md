# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Meteor Madness** is an interactive web application for visualizing asteroid impact scenarios using real NASA NEO (Near-Earth Object) data. The application displays impact locations on an interactive map, calculates impact effects using scientific formulas, and provides educational visualizations through charts and tooltips.

**Tech Stack:**
- Vanilla JavaScript (ES6+) - No frameworks
- Leaflet.js 1.9.4 - Interactive mapping
- Chart.js 4.4.0 - Data visualization
- HTML5 + CSS3 - Structure and styling

## Development Server

Start a local development server using Python:

```bash
python3 -m http.server 8000
# Then open: http://localhost:8000
```

The application is fully static - no build process required.

## Architecture

### Module Structure

The application follows a modular architecture with 8 independent JavaScript modules:

1. **dataLoader.js** - Data loading and caching
   - Loads `data/integrated_dataset_final.json` containing 20 asteroid records
   - In-memory caching of asteroid data
   - Filtering functions (all, hazardous, non-hazardous)
   - Functions: `loadAsteroidData()`, `getAsteroidById(id)`, `getAllAsteroids()`, `getHazardousAsteroids()`, `getDataStats()`

2. **impactCalculator.js** - Physics calculations
   - Scientific formulas for impact effects (kinetic energy, crater diameter, seismic magnitude)
   - Constants: `CONSTANTS.DENSITY_ROCKY`, `CONSTANTS.JOULES_TO_MEGATONS`, etc.
   - Functions: `calculateImpactEffects()`, `calculateKineticEnergy()`, `calculateCraterDiameter()`, `estimateSeismicMagnitude()`
   - Ready for Phase 2 custom simulator

3. **mapController.js** - Leaflet map management
   - Dark theme CartoDB basemap
   - Custom circular markers (red for hazardous, yellow for non-hazardous)
   - Marker click events trigger info panel
   - Functions: `initializeMap()`, `addAsteroidMarkers()`, `highlightMarker()`, `updateMarkerVisibility()`

4. **catalogController.js** - Modal catalog functionality
   - Full asteroid table with search and filtering
   - Real-time search by name/ID
   - Multi-column sorting (energy, diameter, velocity, name)
   - Stagger animations on row render
   - Functions: `initCatalog()`, `openCatalog()`, `closeCatalog()`

5. **chartController.js** - Chart.js visualizations
   - 3 chart types with tab navigation:
     - Comparison chart (horizontal bar): current asteroid vs historical events (Hiroshima, Chelyabinsk, Tunguska)
     - Distribution chart (doughnut): hazardous vs non-hazardous proportion
     - Scatter plot: energy vs diameter for all asteroids
   - Automatic chart destruction on panel close (prevents memory leaks)
   - Functions: `initCharts()`, `renderComparisonChart()`, `renderDistributionChart()`, `renderScatterChart()`

6. **tooltipController.js** - Educational tooltips
   - 8 tooltip definitions for technical terms (diameter, velocity, mass, energy, crater, etc.)
   - Smart positioning (avoids viewport edges)
   - Mobile-friendly (click to toggle)
   - Functions: `initTooltips()`, `showTooltip()`, `hideAllTooltips()`

7. **uiController.js** - UI state and panel management
   - Info panel show/hide with backdrop
   - Populates panel with asteroid data
   - Integrates with chartController
   - Event listeners for buttons/toggles
   - Functions: `initializeUIController()`, `showAsteroidPanel()`, `closePanel()`

8. **main.js** - Application orchestrator
   - Initializes all modules in order
   - Global state management via `AppState` object
   - Error handling and loading indicators
   - Debug function: `window.debugMeteorMadness()`

### Data Flow

1. `main.js` → loads data via `dataLoader.js`
2. `main.js` → passes data to `mapController.js` to create markers
3. User clicks marker → `mapController.js` triggers `uiController.js`
4. `uiController.js` → fetches asteroid data and renders panel + charts
5. Charts rendered via `chartController.js` using `impactCalculator.js` for comparisons

### Dataset Structure

The file `data/integrated_dataset_final.json` contains an array of 20 asteroids with this structure:

```json
{
  "id": "string",
  "name": "string",
  "is_hazardous": boolean,
  "physical_params": {
    "diameter_avg_m": number,
    "velocity_ms": number,
    "mass_kg": number,
    "density_kgm3": 3000
  },
  "impact_calculations": {
    "kinetic_energy_j": number,
    "tnt_megatons": number,
    "crater_diameter_m": number,
    "seismic_magnitude": number
  },
  "impact_scenario": {
    "latitude": number,
    "longitude": number,
    "region": "string"
  },
  "impact_effects": {
    "surface_type": "ocean" | "land",
    "tsunami": { ... },  // if ocean
    "crater": { ... }    // if land
  },
  "orbital_data": { ... },
  "orbit_class": "string",
  "approach_date": "YYYY-MM-DD"
}
```

## Key Features

### Interactive Map
- Dark CartoDB basemap for aesthetic appeal
- 20 asteroid impact markers (color-coded by hazard status)
- Click markers to view detailed info panel
- Filter toggle: show only hazardous asteroids
- Auto-fit bounds to display all markers

### Catalog Modal
- Opens via sidebar button "📋 Ver Catálogo"
- Search bar filters by name/ID in real-time
- Checkbox filter: only hazardous asteroids
- Sort dropdown: energy, diameter, velocity, name
- Click table row → closes catalog and centers map on that asteroid

### Info Panel
- Right-side sliding panel with backdrop
- Displays: physical params, impact energy, orbital data, impact effects
- 3 interactive charts with tab navigation
- Educational tooltips (ℹ️ icons) explain technical terms
- Tsunami warnings for ocean impacts
- Closes via X button, ESC key, or backdrop click

### Animations
- Catalog modal: scale-up + fade-in (400ms)
- Panel sections: stagger animation (50ms delays)
- Table rows: fade-in with delays
- Charts: Chart.js native easing
- All animations use CSS for performance

## Debugging

Open browser console (F12) and run:

```javascript
window.debugMeteorMadness()
```

This displays the current AppState: initialized status, asteroid count, filters, selected asteroid, markers.

Expected console logs on successful initialization:
```
✓ Mapa inicializado correctamente
✓ Controladores de UI inicializados
✓ Catálogo inicializado
✓ Controlador de gráficas inicializado
✓ Sistema de tooltips inicializado (8 tooltips)
✓ Datos cargados exitosamente: 20 asteroides
✓ 20 marcadores agregados correctamente
✓ APLICACIÓN INICIALIZADA CORRECTAMENTE
```

## Code Style

- **ES6+ syntax**: `const`, `let`, arrow functions, template literals
- **No transpilation**: Code runs directly in modern browsers
- **Modular**: Each module has clear responsibilities
- **Comments**: JSDoc-style function documentation
- **Error handling**: Try-catch blocks with console logging
- **No global pollution**: Functions scoped to modules

## Important Notes

- The simulator button ("🎯 Simulador") is currently disabled - prepared for Phase 2
- All impact calculations are pre-computed in the JSON dataset
- The `impactCalculator.js` module contains formulas ready for real-time calculation in Phase 2
- Charts are destroyed when panel closes to prevent memory leaks (`chartController.js:52-60`)
- Map uses custom markers (divIcon) not default Leaflet pins for styling control

## Common Tasks

**Adding a new tooltip:**
1. Add `data-tooltip="key"` to an ℹ️ icon in `index.html`
2. Add tooltip definition in `tooltipController.js` in the `TOOLTIPS` object

**Modifying chart appearance:**
- Edit chart options in `chartController.js` functions
- Chart.js 4.4.0 documentation: https://www.chartjs.org/docs/latest/

**Adding new data fields:**
1. Update JSON structure in `data/integrated_dataset_final.json`
2. Update relevant display logic in `uiController.js`
3. Optionally update catalog table columns in `catalogController.js`

**Changing map style:**
- Edit tile layer URL in `mapController.js:29-33`
- CartoDB provides several basemap options: dark_all, light_all, voyager, etc.


1. First think through the problem, read the codebase for relevant files, and write a plan to tasks/todo.md.
2. The plan should have a list of todo items that you can check off as you complete them
3. Before you begin working, check in with me and I will verify the plan.
4. Then, begin working on the todo items, marking them as complete as you go.
5. Please every step of the way just give me a high level explanation of what changes you made
6. Make every task and code change you do as simple as possible. We want to avoid making any massive or complex changes. Every change should impact as little code as possible. Everything is about simplicity.
7. Finally, add a review section to the todo.md file with a summary of the changes you made and any other relevant information.
8. DO NOT BE LAZY. NEVER BE LAZY. IF THERE IS A BUG FIND THE ROOT CAUSE AND FIX IT. NO TEMPORARY FIXES. YOU ARE A SENIOR DEVELOPER. NEVER BE LAZY
9. MAKE ALL FIXES AND CODE CHANGES AS SIMPLE AS HUMANLY POSSIBLE. THEY SHOULD ONLY IMPACT NECESSARY CODE RELEVANT TO THE TASK AND NOTHING ELSE. IT SHOULD IMPACT AS LITTLE CODE AS POSSIBLE. YOUR GOAL IS TO NOT INTRODUCE ANY BUGS. IT'S ALL ABOUT SIMPLICITY