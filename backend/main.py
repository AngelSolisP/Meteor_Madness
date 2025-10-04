import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import httpx

NASA_KEY = os.getenv("NASA_KEY", "iWbKBRqNknVORYFXdyFC3mlTTBDDAd6xPUc0ytqz")

app = FastAPI(title="Meteor Madness API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/neo")
async def neo():
    url = f"https://api.nasa.gov/neo/rest/v1/neo/browse?api_key={NASA_KEY}"
    async with httpx.AsyncClient(timeout=20) as client:
        r = await client.get(url)
        r.raise_for_status()
        return r.json()

@app.get("/api/simulate")
async def simulate(diameter_m: float, density: float, v_kms: float, angle_deg: float):
    import math
    r = diameter_m / 2.0
    volume = (4.0/3.0) * math.pi * r**3
    mass = volume * density
    v = v_kms * 1000.0
    ke = 0.5 * mass * v * v
    energy_mt = ke / (4.184e15)
    crater_km = 1.161 * (energy_mt**(1.0/3.4)) * (math.sin(math.radians(angle_deg))**1.3)
    return { "energy_mt": energy_mt, "crater_km": crater_km }

@app.get("/api/health")
def health():
    return { "ok": True }
