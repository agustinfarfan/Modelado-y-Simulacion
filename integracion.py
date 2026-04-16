import sympy as sp
import math
 
def integracion_numerica():
    print("¡Bienvenido al calculador de Integración Numérica con Errores!")
    print("1. Regla del Trapecio (Simple)")
    print("2. Regla del Trapecio (Compuesta)")
    print("3. Regla de Simpson 1/3 (Compuesta)")
    print("4. Regla de Simpson 3/8 (Compuesta)")
   
    opcion = input("\nElige un método (1-4): ").strip()
    if opcion not in ['1', '2', '3', '4']:
        print("Opción no válida. Debes elegir un número del 1 al 4.")
        return
 
    # 1. Ingreso de la función
    x_sym = sp.symbols('x')
    func_str = input("\nIngresa la función f(x) a integrar (ej. exp(x), sin(x), x**2): ")
   
    try:
        f_expr = sp.sympify(func_str)
        f = sp.lambdify(x_sym, f_expr, "math")
    except Exception:
        print("Error al interpretar la función. Revisa la sintaxis.")
        return
 
    # 2. Ingreso de los límites y validación de subintervalos (n)
    try:
        a_str = input("Ingresa el límite inferior de integración (a): ")
        a = float(sp.sympify(a_str))
       
        b_str = input("Ingresa el límite superior de integración (b): ")
        b = float(sp.sympify(b_str))
    except Exception:
        print("Error: Los límites deben ser números o expresiones válidas (ej. 0, 3.14, pi/2).")
        return
 
    n = 1 # Por defecto para el Trapecio Simple
   
    if opcion == '2':
        n = int(input("Ingresa el número de subintervalos (n): "))
    elif opcion == '3':
        n = int(input("Ingresa el número de subintervalos (n, DEBE ser par): "))
        if n % 2 != 0:
            print("\nError matemático: Para Simpson 1/3, 'n' debe ser un número par.")
            return
    elif opcion == '4':
        n = int(input("Ingresa el número de subintervalos (n, DEBE ser múltiplo de 3): "))
        if n % 3 != 0:
            print("\nError matemático: Para Simpson 3/8, 'n' debe ser múltiplo de 3.")
            return
 
    # Tamaño del paso
    h = (b - a) / n
 
    # --- IMPRESIÓN DE LA TABLA DE VALORES ---
    print("\n" + "-" * 50)
    print(" TABLA DE VALORES ".center(50, " "))
    print("-" * 50)
    print(f"{'n (índice)':>10} | {'X_n':>15} | {'F(X_n)':>15}")
    print("-" * 50)
   
    for i in range(n + 1):
        xi = a + i * h
        fxi = f(xi)
        print(f"{i:>10} | {xi:>15.6f} | {fxi:>15.6f}")
    print("-" * 50)
 
    # 3. Lógica de los Métodos Numéricos
    integral = 0
   
    if opcion == '1':
        integral = (h / 2) * (f(a) + f(b))
        metodo_nombre = "Trapecio Simple"
       
    elif opcion == '2':
        suma_interna = sum(f(a + i * h) for i in range(1, n))
        integral = (h / 2) * (f(a) + 2 * suma_interna + f(b))
        metodo_nombre = f"Trapecio Compuesto (n={n})"
       
    elif opcion == '3':
        suma_impares = sum(f(a + i * h) for i in range(1, n, 2))
        suma_pares = sum(f(a + i * h) for i in range(2, n, 2))
        integral = (h / 3) * (f(a) + 4 * suma_impares + 2 * suma_pares + f(b))
        metodo_nombre = f"Simpson 1/3 Compuesto (n={n})"
       
    elif opcion == '4':
        suma = f(a) + f(b)
        for i in range(1, n):
            if i % 3 == 0:
                suma += 2 * f(a + i * h)
            else:
                suma += 3 * f(a + i * h)
        integral = (3 * h / 8) * suma
        metodo_nombre = f"Simpson 3/8 Compuesto (n={n})"
 
    # 4. Cálculo de la Cota de Error de Truncamiento
    orden_derivada = 2 if opcion in ['1', '2'] else 4
   
    df_expr = sp.diff(f_expr, x_sym, orden_derivada)
    df = sp.lambdify(x_sym, df_expr, "math")
 
    puntos_malla = [a + i * (b - a) / 1000 for i in range(1001)]
    try:
        M = max(abs(df(pt)) for pt in puntos_malla)
    except Exception:
        M = 0
 
    if opcion == '1':
        cota_error = ((b - a)**3 / 12) * M
    elif opcion == '2':
        cota_error = ((b - a) * h**2 / 12) * M
    elif opcion == '3':
        cota_error = ((b - a) * h**4 / 180) * M
    elif opcion == '4':
        cota_error = ((b - a) * h**4 / 80) * M
 
    # 5. Cálculo Exacto para Contrastar
    try:
        integral_exacta_sym = sp.integrate(f_expr, (x_sym, a, b))
        integral_exacta = float(integral_exacta_sym)
        error_real = abs(integral_exacta - integral)
        tiene_exacta = True
    except Exception:
        tiene_exacta = False
 
    # 6. Impresión de Resultados
    print("\n" + "=" * 65)
    print(" RESULTADOS ".center(65, "="))
    print("=" * 65)
    print(f"Método utilizado  : {metodo_nombre}")
    print(f"Valor aproximado  : {integral:.8f}")
    print(f"Cota máx de Error : {cota_error:.8e} (Error de Truncamiento)")
   
    if tiene_exacta:
        print("-" * 65)
        print(f"Valor exacto      : {integral_exacta:.8f} (Vía integración analítica)")
        print(f"Error real abs.   : {error_real:.8e}")
    else:
        print("-" * 65)
        print("(La integral analítica no pudo calcularse para darte el valor real).")
    print("=" * 65)
 
# Ejecutar el programa
integracion_numerica()