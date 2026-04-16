import numpy as np
import pandas as pd
import matplotlib.pyplot as plt

def biseccion():
    print("--- Método de Bisección ---")
    
    # Entrada de la función f(x)
    expr = input("Ingresa f(x) (ej. x**3 - x - 2): ")
    f = lambda x: eval(expr, {"x": x, "np": np, "sin": np.sin, "cos": np.cos, "exp": np.exp})

    # Parámetros iniciales
    a = float(input("Límite inferior (a): "))
    b = float(input("Límite superior (b): "))
    tol = float(input("Tolerancia (error): "))
    
    if f(a) * f(b) >= 0:
        print("Error: f(a) y f(b) deben tener signos opuestos (Teorema de Bolzano).")
        return

    datos = []
    i = 1
    error = abs(b - a)
    historial_puntos = []

    while error > tol:
        p = (a + b) / 2 # Punto medio
        fa, fp = f(a), f(p)
        
        # Guardar para la tabla
        datos.append([i, a, b, p, f(p), error])
        historial_puntos.append(p)

        if fp == 0 or error / 2 < tol:
            break
        
        # Decidir el nuevo intervalo
        if fa * fp < 0:
            b = p
        else:
            a = p
            
        i += 1
        error = abs(b - a)

    # Mostrar Tabla
    df = pd.DataFrame(datos, columns=['Iter', 'a', 'b', 'pm (Raíz)', 'f(pm)', 'Error'])
    print("\n", df.to_string(index=False))

    # Graficar
    graficar_biseccion(f, datos, historial_puntos)

def graficar_biseccion(f, datos, historial):
    # Crear eje X
    a_init, b_init = datos[0][1], datos[0][2]
    x = np.linspace(a_init - 1, b_init + 1, 500)
    y = f(x)

    plt.figure(figsize=(10, 6))
    plt.axhline(0, color='black', linewidth=1) # Eje X
    plt.plot(x, y, label='$f(x)$', color='blue')
    
    # Dibujar líneas verticales de las iteraciones
    for idx, p in enumerate(historial):
        color = 'red' if idx == len(historial)-1 else 'gray'
        alpha = 1.0 if idx == len(historial)-1 else 0.3
        plt.axvline(p, color=color, linestyle='--', alpha=alpha)

    plt.title(f'Convergencia de Bisección (Raíz aprox: {historial[-1]:.4f})')
    plt.xlabel('x')
    plt.ylabel('f(x)')
    plt.legend()
    plt.grid(True)
    plt.show()

if __name__ == "__main__":
    biseccion()