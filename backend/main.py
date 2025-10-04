import os
import httpx
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
import math

# Use environment variable for the API key, but fall back to the provided key for convenience.
NASA_KEY = os.getenv("NASA_KEY", "iWbKBRqNknVORYFXdyFC3mlTTBDDAd6xPUc0ytqz")

app = FastAPI(title="Meteor Madness API")

# Add CORS middleware to allow all origins, which is useful for development.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Frontend ---
@app.get("/")
async def read_index():
    """Serves the main HTML file for the frontend."""
    return FileResponse('index.html')

# --- NASA & Simulation APIs ---

@app.get("/api/neo")
async def get_near_earth_objects():
    """
    Fetches a list of Near-Earth Objects (NEOs) from NASA's NeoWs API.
    """
    url = f"https://api.nasa.gov/neo/rest/v1/neo/browse?api_key={NASA_KEY}"
    async with httpx.AsyncClient(timeout=20) as client:
        try:
            r = await client.get(url)
            r.raise_for_status()
            return r.json()
        except httpx.HTTPStatusError as e:
            raise HTTPException(status_code=e.response.status_code, detail=f"Error fetching data from NASA NEO API: {e}")

@app.get("/api/donki")
async def get_donki_events():
    """
    Fetches notifications of space weather events from NASA's DONKI API.
    (Database of Notifications, Knowledge, Information)
    """
    url = f"https://api.nasa.gov/DONKI/notifications?api_key={NASA_KEY}"
    async with httpx.AsyncClient(timeout=20) as client:
        try:
            r = await client.get(url)
            r.raise_for_status()
            return r.json()
        except httpx.HTTPStatusError as e:
            raise HTTPException(status_code=e.response.status_code, detail=f"Error fetching data from NASA DONKI API: {e}")


@app.get("/api/nasa-image")
async def search_nasa_image(q: str):
    """
    Searches the NASA Image and Video Library.
    """
    url = f"https://images-api.nasa.gov/search?q={q}&media_type=image"
    async with httpx.AsyncClient(timeout=20) as client:
        try:
            r = await client.get(url)
            r.raise_for_status()
            return r.json()
        except httpx.HTTPStatusError as e:
            raise HTTPException(status_code=e.response.status_code, detail=f"Error fetching data from NASA Image API: {e}")

@app.get("/api/simulate")
async def simulate_impact(diameter_m: float, density: float, v_kms: float, angle_deg: float):
    """
    Simulates the energy and crater size of a meteor impact.
    """
    if diameter_m <= 0 or density <= 0 or v_kms <= 0 or not (0 < angle_deg <= 90):
        raise HTTPException(status_code=400, detail="Invalid simulation parameters. All values must be positive, and angle must be between 0 and 90.")

    r = diameter_m / 2.0
    volume = (4.0/3.0) * math.pi * r**3
    mass = volume * density
    v = v_kms * 1000.0  # Convert km/s to m/s
    ke = 0.5 * mass * v * v
    energy_mt = ke / (4.184e15) # Convert Joules to Megatons of TNT
    # A simplified formula for crater diameter estimation
    crater_km = 1.161 * (energy_mt**(1.0/3.4)) * (math.sin(math.radians(angle_deg))**1.3)
    return { "energy_mt": energy_mt, "crater_km": crater_km }

# --- AstronomyAPI (Placeholder) ---
@app.get("/api/astronomy")
async def get_astronomy_data():
    """
    Placeholder for AstronomyAPI. You need to sign up for a key at
    https://docs.astronomyapi.com/ and add your Application ID and secret.
    """
    # NOTE: This endpoint will not work without credentials.
    # ASTRONOMYAPI_ID = os.getenv("ASTRONOMYAPI_ID")
    # ASTRONOMYAPI_SECRET = os.getenv("ASTRONOMYAPI_SECRET")
    # if not ASTRONOMYAPI_ID or not ASTRONOMYAPI_SECRET:
    #     raise HTTPException(status_code=501, detail="AstronomyAPI credentials not configured.")
    #
    # auth = httpx.BasicAuth(ASTRONOMYAPI_ID, ASTRONOMYAPI_SECRET)
    # url = "https://api.astronomyapi.com/api/v2/..."
    # async with httpx.AsyncClient(auth=auth, timeout=20) as client:
    #     ...
    raise HTTPException(status_code=501, detail="Not Implemented: AstronomyAPI credentials are required.")


# --- Health Check ---
@app.get("/api/health")
def health():
    """A simple health check endpoint."""
    return { "ok": True }