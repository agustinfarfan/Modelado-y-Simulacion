import numpy as np
import pandas as pd

def punto_fijo_acelerado():
    print("--- Punto Fijo vs. Aceleración de Steffensen ---")
    
    expr = input("Ingresa g(x) (ej. np.sqrt(x + 2)): ")
    g = lambda x: eval(expr, {"x": x, "np": np})

    x0 = float(input("Valor inicial x0: "))
    tol = float(input("Tolerancia: "))
    max_iter = int(input("Máximo de iteraciones: "))

    # Listas para la tabla
    datos = []
    
    curr_x = x0
    for i in range(max_iter):
        # Punto Fijo Simple
        x_pf = g(curr_x)
        
        # Aceleración de Steffensen (Aitken aplicado al vuelo)
        # Necesitamos 3 puntos: x_n, g(x_n), g(g(x_n))
        x_n = curr_x
        g_xn = g(x_n)
        gg_xn = g(g_xn)
        
        # Fórmula de Steffensen: x = x_n - (g(x_n) - x_n)^2 / (g(g(x_n)) - 2*g(x_n) + x_n)
        denominador = (gg_xn - 2*g_xn + x_n)
        
        if abs(denominador) < 1e-15:
            x_acc = "Error (Div/0)"
            error = abs(x_pf - x_n)
        else:
            x_acc = x_n - ((g_xn - x_n)**2) / denominador
            error = abs(x_acc - x_n)

        datos.append([i + 1, x_n, x_pf, x_acc, error])
        
        # Usamos el valor ACELERADO para la siguiente iteración (Steffensen)
        if isinstance(x_acc, (int, float)):
            curr_x = x_acc
        else:
            curr_x = x_pf
            
        if error < tol:
            break

    # Crear tabla detallada
    cols = ['Iter', 'x_n', 'Punto Fijo Simple', 'Steffensen (Acelerado)', 'Error Acel.']
    df = pd.DataFrame(datos, columns=cols)
    
    print("\n" + "="*80)
    print(df.to_string(index=False, formatters={
        'x_n': '{:,.6f}'.format,
        'Punto Fijo Simple': '{:,.6f}'.format,
        'Steffensen (Acelerado)': lambda x: f"{x:,.6f}" if isinstance(x, float) else x,
        'Error Acel.': '{:,.2e}'.format
    }))
    print("="*80)
    
    final_val = datos[-1][3]
    print(f"\nRaíz encontrada con aceleración: {final_val}")

if __name__ == "__main__":
    punto_fijo_acelerado()