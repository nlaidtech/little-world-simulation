from enum import Enum
from pydantic import BaseModel, Field

class TreeType(str, Enum):
    broadleaf = "broadleaf"
    conifer = "conifer"

class SimulationRequest(BaseModel):
    trees: int = Field(..., ge=0, le=100000)
    area_km2: float = Field(..., ge=0.5, le=100.0)
    years: int = Field(..., ge=0, le=30)
    tree_type: TreeType

class SimulationResponse(BaseModel):
    co2_kg: float
    co2_tons: float
    cars_removed: float
    pollutants_kg: float
    stormwater_liters: float
    stormwater_m3: float
    olympic_pools: float
    temp_reduction_c: float
    canopy_fraction: float
    canopy_percent: float
