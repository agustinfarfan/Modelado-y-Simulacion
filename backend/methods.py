import numpy as np
import math

def biseccion(f, a, b, tol=1e-8, max_iter=100):
    historia = []
    if f(a) * f(b) > 0:
        raise ValueError("f(a) y f(b) deben tener signos opuestos.")
    for i in range(max_iter):
        c = (a + b) / 2
        error = abs(b - a) / 2
        historia.append({"iter": i + 1, "a": round(a, 8), "b": round(b, 8),
                          "c": round(c, 8), "fc": round(f(c), 8), "error": round(error, 10)})
        if error < tol or abs(f(c)) < tol:
            break
        if f(a) * f(c) < 0:
            b = c
        else:
            a = c
    return float(c), historia

def newton_raphson(f, df, x0, tol=1e-8, max_iter=100):
    historia = []
    x = float(x0)
    for i in range(max_iter):
        fx  = f(x)
        dfx = df(x)
        if abs(dfx) < 1e-15:
            raise ValueError("Derivada cero — método no converge.")
        x_new = x - fx / dfx
        error = abs(x_new - x)
        historia.append({"iter": i + 1, "xn": round(x, 8), "fxn": round(fx, 8),
                          "dfxn": round(dfx, 8), "xnew": round(x_new, 8), "error": round(error, 10)})
        x = x_new
        if error < tol:
            break
    return float(x), historia

def punto_fijo(g, x0, tol=1e-8, max_iter=100):
    historia = []
    x = float(x0)
    for i in range(max_iter):
        x_new = g(x)
        error = abs(x_new - x)
        historia.append({"iter": i + 1, "xn": round(x, 8), "xnew": round(x_new, 8), "error": round(error, 10)})
        x = x_new
        if error < tol:
            break
    return float(x), historia

def aitken(g, x0, tol=1e-8, max_iter=100):
    historia = []
    x = float(x0)
    for i in range(max_iter):
        x1 = g(x)
        x2 = g(x1)
        denom = x2 - 2 * x1 + x
        if abs(denom) < 1e-15:
            historia.append({"iter": i + 1, "xn": round(x, 8), "x1": round(x1, 8),
                              "x2": round(x2, 8), "xnew": round(x, 8), "error": 0.0})
            break
        x_new = x - (x1 - x) ** 2 / denom
        error = abs(x_new - x)
        historia.append({"iter": i + 1, "xn": round(x, 8), "x1": round(x1, 8),
                          "x2": round(x2, 8), "xnew": round(x_new, 8), "error": round(error, 10)})
        x = x_new
        if error < tol:
            break
    return float(x), historia

def lagrange_interpolar(x_pts, y_pts, x_eval):
    n   = len(x_pts)
    res = np.zeros_like(x_eval, dtype=float)
    for i in range(n):
        L = np.ones_like(x_eval, dtype=float)
        for j in range(n):
            if i != j:
                L *= (x_eval - x_pts[j]) / (x_pts[i] - x_pts[j])
        res += y_pts[i] * L
    return res

def simpson(f, a, b, n):
    if n % 2:
        n += 1
    h = (b - a) / n
    x = np.linspace(a, b, n + 1)
    y = f(x)
    return float(h / 3 * (y[0] + y[-1] + 4 * np.sum(y[1:-1:2]) + 2 * np.sum(y[2:-2:2])))

def trapecio(f, a, b, n):
    h = (b - a) / n
    x = np.linspace(a, b, n + 1)
    y = f(x)
    return float(h * (y[0] / 2 + np.sum(y[1:-1]) + y[-1] / 2))
