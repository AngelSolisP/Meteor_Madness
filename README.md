# Meteor Madness — Interactive Asteroid Impact Visualizer

Web app para modelar escenarios de impacto de asteroides con datos de **NASA** y **USGS**, visualización en **Leaflet** y un panel 3D básico en **Three.js** para órbitas.

## Estructura
```
meteor-madness/
├─ backend/
│  ├─ app.py
│  ├─ calculations.py
│  ├─ requirements.txt
│  └─ .env.example
└─ frontend/
   ├─ index.html
   ├─ styles.css
   └─ js/
      ├─ app.js
      ├─ api.js
      └─ orbit.js
```

## Instalación (backend)
```bash
cd backend
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
python app.py
```
Backend por defecto: `http://127.0.0.1:5001`

## Frontend
```bash
cd frontend
python -m http.server 8080
# Abre http://127.0.0.1:8080
```

## Endpoints
- POST `/api/simulate-impact`
- GET `/api/neows/browse`
- GET `/api/earthquakes`
- GET `/api/elevation`

## Nota
Modelos simplificados para uso educativo/hackathon.


## Mitigación (Δv) en 3D
- Panel "Órbita 3D + Mitigación (Δv)".
- Configura magnitud Δv (m/s), dirección (tangencial/radial/normal) y la anomalía verdadera ν donde se aplica.
- Se dibujan dos órbitas: **azul** (original) y **roja** (después del impulso). Modelo two-body normalizado (educativo).
