import numpy as np
import pandas as pd
import matplotlib.pyplot as plt

def graficar_punto_fijo(g_func, historial, x_range):
    x = np.linspace(x_range[0], x_range[1], 500)
    y = g_func(x)
    
    plt.figure(figsize=(10, 6))
    plt.plot(x, y, 'b', label='$g(x)$')
    plt.plot(x, x, 'r--', label='$y = x$')
    
    # Dibujar las líneas de iteración (telaraña)
    for i in range(len(historial) - 1):
        p1 = [historial[i], historial[i]]
        p2 = [historial[i], historial[i+1]]
        plt.plot(p1, p2, 'g', alpha=0.5)
        plt.plot(p2, [historial[i+1], historial[i+1]], 'g', alpha=0.5)

    plt.title('Método de Punto Fijo: Convergencia Visual')
    plt.xlabel('x')
    plt.ylabel('f(x)')
    plt.legend()
    plt.grid(True)
    plt.show()

def punto_fijo_avanzado():
    print("--- Calculadora con Gráfica de Punto Fijo ---")
    
    expr = input("Ingresa g(x) (ej. cos(x) o np.sqrt(x+2)): ")
    g = lambda x: eval(expr, {"x": x, "np": np})

    x0 = float(input("Valor inicial x0: "))
    tol = float(input("Tolerancia: "))
    max_iter = int(input("Max iteraciones: "))

    historial_x = [x0]
    datos = []

    error = float('inf')
    for i in range(max_iter):
        x_sig = g(historial_x[-1])
        error = abs(x_sig - historial_x[-1])
        
        datos.append([i+1, historial_x[-1], x_sig, error])
        historial_x.append(x_sig)
        
        if error < tol:
            break

    # Tabla
    df = pd.DataFrame(datos, columns=['Iter', 'x_n', 'g(x_n)', 'Error'])
    print("\n", df.to_string(index=False))

    # Graficar (ajustamos el rango según los valores encontrados)
    margin = 1.0
    rango = [min(historial_x) - margin, max(historial_x) + margin]
    graficar_punto_fijo(g, historial_x, rango)

if __name__ == "__main__":
    punto_fijo_avanzado()