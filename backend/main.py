from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import numpy as np
from methods import biseccion, newton_raphson, punto_fijo, aitken, lagrange_interpolar, simpson, trapecio

app = FastAPI(title="Artemis Numerical Methods API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class TrayectoriaInput(BaseModel):
    e: float
    M: float
    tol: float
    altitud_parking: float

@app.post("/api/trayectoria")
def solve_trayectoria(data: TrayectoriaInput):
    f  = lambda E: E - data.e * np.sin(E) - data.M
    df = lambda E: 1 - data.e * np.cos(E)
    
    try:
        sol_E, hist = newton_raphson(f, df, data.M, tol=data.tol)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
        
    R_TIERRA  = 6371e3
    D_LUNA    = 384400e3
    MU_TIERRA = 3.986e14
    
    r1  = R_TIERRA + (data.altitud_parking * 1e3)
    r2  = R_TIERRA + D_LUNA
    a   = (r1 + r2) / 2
    v_c = np.sqrt(MU_TIERRA / r1)
    v_t = np.sqrt(MU_TIERRA * (2 / r1 - 1 / a))
    dv = float(v_t - v_c) / 1e3
    
    # Orbits data for frontend
    e_tr = (r2 - r1) / (r2 + r1)
    a_tr = (r1 + r2) / 2
    theta = np.linspace(0, np.pi, 200)
    r_arr = a_tr * (1 - e_tr**2) / (1 + e_tr * np.cos(theta))
    
    orbit_tli = [{"x": float(r * np.cos(t) / 1e9), "y": float(r * np.sin(t) / 1e9)} for r, t in zip(r_arr, theta)]
    
    return {
        "E_sol": sol_E,
        "dv": dv,
        "history": hist,
        "orbit_tli": orbit_tli
    }

class ImpulsoInput(BaseModel):
    t_max: float
    n: int

@app.post("/api/impulso")
def solve_impulso(data: ImpulsoInput):
    if data.n <= 0 or data.t_max <= 0:
        raise HTTPException(status_code=400, detail="Valores deben ser positivos")
        
    F_max = 8800e3
    F = lambda t: F_max * np.exp(-0.0015 * t) * (1 + 0.1 * np.sin(0.08 * t))
    
    imp_s = simpson(F, 0, data.t_max, data.n)
    imp_t = trapecio(F, 0, data.t_max, data.n)
    
    t_arr = np.linspace(0, data.t_max, 200)
    F_arr = F(t_arr) / 1e6
    curve = [{"t": float(t), "F": float(f)} for t, f in zip(t_arr, F_arr)]
    
    return {
        "imp_simpson": imp_s / 1e9,
        "imp_trapecio": imp_t / 1e9,
        "curve": curve
    }

class TelemetriaInput(BaseModel):
    t_pts: list[float]
    d_pts: list[float]

@app.post("/api/telemetria")
def solve_telemetria(data: TelemetriaInput):
    if len(data.t_pts) != len(data.d_pts) or len(data.t_pts) < 2:
        raise HTTPException(status_code=400, detail="Longitudes no coinciden o datos insuficientes.")
        
    t_arr = np.array(data.t_pts)
    d_arr = np.array(data.d_pts)
    
    t_d = np.linspace(t_arr[0], t_arr[-1], 200)
    d_i = lagrange_interpolar(t_arr, d_arr, t_d)
    
    poly_curve = [{"t": float(t), "d": float(d)} for t, d in zip(t_d, d_i)]
    pts = [{"t": float(t), "d": float(d)} for t, d in zip(t_arr, d_arr)]
    
    mid = float((t_arr[0] + t_arr[-1]) / 2)
    d_mid = float(lagrange_interpolar(t_arr, d_arr, np.array([mid]))[0])
    
    return {
        "curve": poly_curve,
        "points": pts,
        "midpoint": {"t": mid, "d": d_mid},
        "degree": len(t_arr) - 1
    }

class BenchmarkInput(BaseModel):
    e: float
    M: float
    tol: float
    x0: float

@app.post("/api/benchmark")
def run_benchmark(data: BenchmarkInput):
    f  = lambda E: E - data.e * np.sin(E) - data.M
    df = lambda E: 1 - data.e * np.cos(E)
    g  = lambda E: data.M + data.e * np.sin(E)
    
    results = {}
    
    try: _, hb = biseccion(f, 0.5, 3.5, tol=data.tol, max_iter=200); results["Biseccion"] = hb
    except ValueError as ex: results["Biseccion"] = {"error": str(ex)}
    
    try: _, hn = newton_raphson(f, df, data.x0, tol=data.tol, max_iter=200); results["Newton"] = hn
    except Exception as ex: results["Newton"] = {"error": str(ex)}
    
    try: _, hp = punto_fijo(g, data.x0, tol=data.tol, max_iter=200); results["PuntoFijo"] = hp
    except Exception as ex: results["PuntoFijo"] = {"error": str(ex)}
    
    try: _, ha = aitken(g, data.x0, tol=data.tol, max_iter=200); results["Aitken"] = ha
    except Exception as ex: results["Aitken"] = {"error": str(ex)}
    
    return {"results": results}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
