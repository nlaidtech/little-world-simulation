from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from models import SimulationRequest, SimulationResponse
from simulator import simulate

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/health")
def health_check():
    return {"status": "ok"}

@app.post("/api/simulate", response_model=SimulationResponse)
def run_simulation(request: SimulationRequest):
    result = simulate(
        trees=request.trees,
        area_km2=request.area_km2,
        years=request.years,
        tree_type=request.tree_type.value
    )
    return result
