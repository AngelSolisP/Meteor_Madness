import os
import requests
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv

from calculations import (
    sphere_mass, kinetic_energy_joules, tnt_equivalent_tons,
    seismic_magnitude_mw, crater_diameter_m, shock_radius_km, thermal_radius_km
)

load_dotenv()

NASA_API_KEY = os.getenv("NASA_API_KEY", "DEMO_KEY")
HOST = os.getenv("HOST", "127.0.0.1")
PORT = int(os.getenv("PORT", "5001"))

app = Flask(__name__)
CORS(app)

@app.get("/api/health")
def health():
    return {"ok": True}

@app.post("/api/simulate-impact")
def simulate_impact():
    data = request.get_json(force=True)
    diameter_m = float(data.get("diameter_m", 50.0))
    density = float(data.get("density_kg_m3", 3000.0))
    velocity_km_s = float(data.get("velocity_km_s", 17.0))
    angle_deg = float(data.get("angle_deg", 45.0))
    lat = float(data.get("lat", 0.0))
    lon = float(data.get("lon", 0.0))
    target = data.get("target", "land")

    m = sphere_mass(diameter_m, density)
    E = kinetic_energy_joules(m, velocity_km_s)
    tnt_tons = tnt_equivalent_tons(E)
    Mw = seismic_magnitude_mw(E)
    crater_m = crater_diameter_m(tnt_tons)
    shock_km = shock_radius_km(tnt_tons)
    thermal_km = thermal_radius_km(tnt_tons)

    tsunami_risk = (target == "water") or (angle_deg < 20.0)

    result = {
        "inputs": {
            "diameter_m": diameter_m,
            "density_kg_m3": density,
            "velocity_km_s": velocity_km_s,
            "angle_deg": angle_deg,
            "lat": lat,
            "lon": lon,
            "target": target
        },
        "derived": {
            "mass_kg": m,
            "energy_joules": E,
            "tnt_tons": tnt_tons,
            "seismic_Mw_equiv": Mw,
            "crater_diameter_m": crater_m,
            "shock_radius_km": shock_km,
            "thermal_radius_km": thermal_km,
            "tsunami_risk": tsunami_risk
        },
        "geo": {
            "type": "FeatureCollection",
            "features": [
                {
                    "type": "Feature",
                    "properties": {"type": "impact_point"},
                    "geometry": {"type": "Point", "coordinates": [lon, lat]}
                },
                {
                    "type": "Feature",
                    "properties": {"type": "shock_zone_km", "radius_km": shock_km},
                    "geometry": {"type": "Point", "coordinates": [lon, lat]}
                },
                {
                    "type": "Feature",
                    "properties": {"type": "thermal_zone_km", "radius_km": thermal_km},
                    "geometry": {"type": "Point", "coordinates": [lon, lat]}
                }
            ]
        }
    }
    return jsonify(result)

@app.get("/api/neows/browse")
def neows_browse():
    page = request.args.get("page","0")
    size = request.args.get("size","20")
    url = f"https://api.nasa.gov/neo/rest/v1/neo/browse"
    params = {"page": page, "size": size, "api_key": NASA_API_KEY}
    r = requests.get(url, params=params, timeout=30)
    return (r.text, r.status_code, {"Content-Type": "application/json"})

@app.get("/api/earthquakes")
def usgs_comcat():
    params = request.args.to_dict(flat=True)
    params.setdefault("format","geojson")
    url = "https://earthquake.usgs.gov/fdsnws/event/1/query"
    r = requests.get(url, params=params, timeout=30)
    return (r.text, r.status_code, {"Content-Type": "application/json"})

@app.get("/api/elevation")
def elevation():
    lat = request.args.get("lat")
    lon = request.args.get("lon")
    if lat is None or lon is None:
        return jsonify({"error":"lat/lon required"}), 400
    url = "https://epqs.nationalmap.gov/v1/json"
    params = {"x": lon, "y": lat, "units": "Meters", "wkid": 4326}
    r = requests.get(url, params=params, timeout=30)
    return (r.text, r.status_code, {"Content-Type": "application/json"})

if __name__ == "__main__":
    app.run(host=HOST, port=PORT, debug=True)


@app.get("/api/sbdb")
def sbdb_proxy():
    """Proxy simple al SSD SBDB API (JPL). Ejemplo:
    /api/sbdb?sstr=433%20Eros&orb=1&phys=1
    """
    params = request.args.to_dict(flat=True)
    url = "https://ssd-api.jpl.nasa.gov/sbdb.api"
    r = requests.get(url, params=params, timeout=30)
    return (r.text, r.status_code, {"Content-Type": "application/json"})

@app.get("/api/neows/neo")
def neows_neo_by_id():
    nid = request.args.get("id")
    if not nid:
        return jsonify({ "error": "id required"}), 400
    url = f"https://api.nasa.gov/neo/rest/v1/neo/{nid}"
    params = {"api_key": NASA_API_KEY}
    r = requests.get(url, params=params, timeout=30)
    return (r.text, r.status_code, {"Content-Type": "application/json"})
