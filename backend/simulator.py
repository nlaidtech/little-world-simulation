import math

CO2_PER_MATURE_TREE_KG = 21.8
POLLUTANTS_PER_MATURE_TREE_KG = 1.15
STORMWATER_PER_MATURE_TREE_L = 5000
CANOPY_M2_BROADLEAF = 20
CANOPY_M2_CONIFER = 13
POLLUTANT_MULT_CONIFER = 1.15
POLLUTANT_MULT_BROADLEAF = 1.0
TAU_BROADLEAF = 6
TAU_CONIFER = 10
MAX_TEMP_REDUCTION_C = 4.0
CO2_PER_CAR_TONS = 4.6
OLYMPIC_POOL_LITERS = 2_500_000

def get_maturity(years: int, tree_type: str) -> float:
    tau = TAU_BROADLEAF if tree_type == "broadleaf" else TAU_CONIFER
    return 1 - math.exp(-years / tau)

def simulate(trees: int, area_km2: float, years: int, tree_type: str) -> dict:
    maturity = get_maturity(years, tree_type)
    
    effective_trees = trees * maturity
    
    co2_kg = effective_trees * CO2_PER_MATURE_TREE_KG
    co2_tons = co2_kg / 1000.0
    cars_removed = co2_tons / CO2_PER_CAR_TONS
    
    pollutant_mult = POLLUTANT_MULT_BROADLEAF if tree_type == "broadleaf" else POLLUTANT_MULT_CONIFER
    pollutants_kg = effective_trees * POLLUTANTS_PER_MATURE_TREE_KG * pollutant_mult
    
    stormwater_liters = effective_trees * STORMWATER_PER_MATURE_TREE_L
    stormwater_m3 = stormwater_liters / 1000.0
    olympic_pools = stormwater_liters / OLYMPIC_POOL_LITERS
    
    canopy_m2 = CANOPY_M2_BROADLEAF if tree_type == "broadleaf" else CANOPY_M2_CONIFER
    total_canopy_m2 = effective_trees * canopy_m2
    area_m2 = area_km2 * 1_000_000
    
    canopy_fraction = min(1.0, total_canopy_m2 / area_m2)
    canopy_percent = canopy_fraction * 100.0
    
    temp_reduction_c = MAX_TEMP_REDUCTION_C * (1 - math.exp(-3 * canopy_fraction))
    
    return {
        "co2_kg": round(co2_kg, 2),
        "co2_tons": round(co2_tons, 2),
        "cars_removed": round(cars_removed, 2),
        "pollutants_kg": round(pollutants_kg, 2),
        "stormwater_liters": round(stormwater_liters, 2),
        "stormwater_m3": round(stormwater_m3, 2),
        "olympic_pools": round(olympic_pools, 2),
        "temp_reduction_c": round(temp_reduction_c, 1),
        "canopy_fraction": round(canopy_fraction, 4),
        "canopy_percent": round(canopy_percent, 2)
    }
