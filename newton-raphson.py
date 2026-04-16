import numpy as np
import pandas as pd
import sympy as sp
import matplotlib.pyplot as plt

def newton_raphson_corregido():
    print("--- Newton-Raphson (Versión Robusta) ---")
    
    # 1. Entrada de la función
    print("Ejemplo de entrada: x**3 - 2*x - 5  (Usa ** para potencias y * para multiplicar)")
    txt_f = input("f(x) = ")
    
    try:
        x_sym = sp.symbols('x')
        # Transformamos el texto en una expresión de Sympy
        f_sym = sp.parse_expr(txt_f.replace('^', '**')) 
        df_sym = sp.diff(f_sym, x_sym)
        
        # Convertimos a funciones numéricas (usando módulos de numpy)
        f = sp.lambdify(x_sym, f_sym, 'numpy')
        df = sp.lambdify(x_sym, df_sym, 'numpy')
        
        print(f"\nDerivada obtenida: f'(x) = {df_sym}")
    except Exception as e:
        print(f"Error en la función: {e}")
        return

    # 2. Parámetros
    try:
        x0 = float(input("x0 (valor inicial): "))
        tol = float(input("Tolerancia (ej. 1e-6): "))
        max_iter = int(input("Máximo de iteraciones: "))
    except ValueError:
        print("Error: Ingresa números válidos.")
        return

    # 3. Algoritmo
    datos = []
    xn = x0
    convergio = False

    for i in range(max_iter):
        val_f = float(f(xn))
        val_df = float(df(xn))
        
        if abs(val_df) < 1e-15:
            print("Fallo: Derivada nula (división por cero).")
            break
            
        xn_siguiente = xn - (val_f / val_df)
        error = abs(xn_siguiente - xn)
        
        datos.append({
            'Iter': i + 1,
            'x_n': xn,
            'f(x_n)': val_f,
            "f'(x_n)": val_df,
            'x_n+1': xn_siguiente,
            'Error': error
        })
        
        if error < tol:
            convergio = True
            break
        xn = xn_siguiente

    # 4. Resultados
    if datos:
        df_tabla = pd.DataFrame(datos)
        print("\n" + "="*80)
        print(df_tabla.to_string(index=False, justify='center'))
        print("="*80)
        
        if convergio:
            print(f"\n✅ ¡Éxito! Raíz encontrada en: {xn_siguiente:.10f}")
            # Graficar
            graficar(f, xn_siguiente, x0)
        else:
            print("\n❌ No se alcanzó la tolerancia en el máximo de iteraciones.")

def graficar(f_num, raiz, x0):
    # Definir rango de visualización
    rango = abs(raiz - x0) + 2
    x = np.linspace(raiz - rango, raiz + rango, 400)
    y = f_num(x)
    
    plt.figure(figsize=(10, 5))
    plt.axhline(0, color='black', lw=1)
    plt.axvline(0, color='black', lw=1)
    plt.plot(x, y, label='f(x)', color='blue')
    plt.plot(raiz, 0, 'ro', label=f'Raíz: {raiz:.4f}')
    
    plt.title("Visualización del resultado (Newton-Raphson)")
    plt.grid(True, linestyle='--')
    plt.legend()
    plt.show()

if __name__ == "__main__":
    newton_raphson_corregido()