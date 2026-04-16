import sympy as sp
import math
 
def lagrange_interactivo():
    print("¡Bienvenido al generador de Polinomios de Lagrange!")
    print("1. Tengo una función f(x) (Calcula el polinomio y los errores)")
    print("2. Solo tengo una tabla de puntos (Calcula solo el polinomio)")
   
    opcion = input("\nElige una opción (1 o 2): ").strip()
   
    x_sym = sp.symbols('x')
    tiene_funcion = (opcion == '1')
   
    if tiene_funcion:
        func_str = input("\nIngresa la función f(x) (ej. exp(x)): ")
        try:
            f_expr = sp.sympify(func_str)
            f = sp.lambdify(x_sym, f_expr, "math")
        except Exception:
            print("Error al interpretar la función.")
            return
 
        nodos_str = input("Ingresa los puntos x separados por comas (ej. 1, 2, 3): ")
        x_nodos = [float(val.strip()) for val in nodos_str.split(',')]
        y_nodos = [f(xi) for xi in x_nodos]
    else:
        x_str = input("\nIngresa los valores de x separados por comas (ej. 1, 2, 3): ")
        x_nodos = [float(val.strip()) for val in x_str.split(',')]
       
        y_str = input("Ingresa los valores de y correspondientes separados por comas (ej. 2.71, 7.38, 20.08): ")
        y_nodos = [float(val.strip()) for val in y_str.split(',')]
       
        if len(x_nodos) != len(y_nodos):
            print("\nError: Debes ingresar la misma cantidad de valores para x e y.")
            return
 
    n = len(x_nodos) - 1
 
    # 3. Construcción del Polinomio de Lagrange
    polinomio = 0
    for i in range(n + 1):
        L_i = 1
        for j in range(n + 1):
            if i != j:
                L_i *= (x_sym - x_nodos[j]) / (x_nodos[i] - x_nodos[j])
        polinomio += y_nodos[i] * L_i
 
    # Simplificamos el polinomio
    polinomio_simp = sp.simplify(polinomio)
    P = sp.lambdify(x_sym, polinomio_simp, "math")
   
    print("\n" + "-" * 75)
    print(f"Polinomio de Lagrange P(x):\n{polinomio_simp}")
    print("-" * 75)
 
    # 4. Evaluación y Análisis
    x_eval_str = input(f"\nIngresa un punto 'x' para evaluar el polinomio: ")
    x_eval = float(x_eval_str)
    valor_aprox = P(x_eval)
   
    print("\n--- RESULTADOS ---")
    print(f"Valor interpolado P({x_eval}): {valor_aprox:.6f}")
 
    # Si tenemos la función, calculamos los errores
    if tiene_funcion:
        valor_exacto = f(x_eval)
        error_real = abs(valor_exacto - valor_aprox)
       
        df_n1_expr = sp.diff(f_expr, x_sym, n + 1)
        df_n1 = sp.lambdify(x_sym, df_n1_expr, "math")
 
        a, b = min(x_nodos), max(x_nodos)
        puntos_malla = [a + i * (b - a) / 1000 for i in range(1001)]
 
        try:
            M = max(abs(df_n1(pt)) for pt in puntos_malla)
        except Exception:
            M = 0
 
        productoria_local = math.prod([abs(x_eval - xi) for xi in x_nodos])
        cota_error_local = (M / math.factorial(n + 1)) * productoria_local
 
        max_productoria = max(math.prod([abs(pt - xi) for xi in x_nodos]) for pt in puntos_malla)
        cota_error_global = (M / math.factorial(n + 1)) * max_productoria
 
        print(f"Valor exacto f({x_eval}): {valor_exacto:.6f}")
        print(f"Error real absoluto: {error_real:.6f}")
        print(f"\nCota de Error Local (teórico en x={x_eval}): {cota_error_local:.6f}")
        print(f"Cota de Error Global (máximo en [{a}, {b}]): {cota_error_global:.6f}")
    else:
        print("\n(Nota: No se pueden calcular los errores teóricos porque no se proporcionó la función original f(x)).")
 
# Ejecutar
lagrange_interactivo()