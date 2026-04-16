# 🚀 Proyecto: Artemis II - Laboratorio Numérico Espacial

## 1. Introducción a la Misión Artemis II y el Propósito del Simulador
La misión **Artemis II** de la NASA marca el regreso de la humanidad a las inmedaciones de la Luna por primera vez en más de 50 años. Esta misión llevará a cuatro astronautas en una trayectoria de inserción de inyección translunar (TLI), usando el poderoso cohete *Space Launch System (SLS)* y la cápsula *Orion*.

**¿Para qué sirve este programa?**  
En una misión de este calibre energético e ingenieril, las computadoras de a bordo no resuelven problemas analíticamente (con ecuaciones directas), sino que utilizan **Métodos Numéricos Algorítmicos** para encontrar aproximaciones a velocidades de máquina. Este proyecto simula precisamente los sistemas de la nave, utilizando estos métodos matemáticos iterativos en tiempo real para resolver problemas críticos: predicción de posiciones, estimaciones balísticas, interpolación de coordenadas de control espacial y pruebas de robustez de hardware a bordo.

---

## 2. Arquitectura de Software del Sistema
Nuestra simulación no es un código monolítico simple, sino que ha sido construida como una plataforma *SaaS* (Software as a Service) empresarial:
* **El Cerebro (Backend de Python + FastAPI):** Separamos intencionalmente la matemática de la interfaz. Python, usando la potencia de `Numpy`, alberga métodos matemáticos puros y eficientes que procesan los datos crudos sin interrupciones.
* **El Panel de Control (Frontend de React + Vite):** Actúa como las pantallas operativas de Houston. Consume los resultados y renderiza de forma reactiva componentes de última generación usando interfaces limpias, oscuras (Dark Mode) y gráficos matemáticamente exactos.

---

## 3. Explicación de los Módulos, Cuentas Numéricas y Gráficos

### A. Módulo 1: Trayectoria Orbital Estacionaria (Kepler)
* **El Problema:** Saber en qué punto exacto de la órbita elíptica se encuentra la cápsula espacial respecto a la Tierra y su tiempo, lo cual requiere hallar la *Anomalía Excéntrica (E)*.
* **La Matemática Subyacente:** Resolver la [Ecuación trascendente de Kepler]: $E - e \cdot \sin(E) - M = 0$. Al no tener una fórmula de despeje algebraico ordinario, usamos búsqueda algorítmica de raíces.
* **El Método Numérico (Newton-Raphson):** Empleamos este método abierto porque el ordenador calcula la derivada para encontrar la tangencia geométrica y así saltar rápidamente a la coordenada buscada en un puñado de iteraciones.
* **¿Qué explican los gráficos aquí?:** 
  - *Gráfico de Órbita de Transferencia:* Dibuja punto por punto la elipse espacial entre la órbita de validación y la inyección hacia la Luna.
  - *Gráfico Logarítmico (Error vs Iteración):* Demuestra visualmente cómo el error disminuye drásticamente casi en caída libre hacia cero; probando por qué Newton-Raphson se llama método de convergencia cuadrática rápida.

### B. Módulo 2: Impulso del Motor SLS (Integración)
* **El Problema:** Determinar la eficiencia del empuje de la etapa principal calculando el Impulso total a lo largo de los minutos que duró el encendido del motor en la atmósfera terrestre.
* **La Matemática Subyacente:** Toda sumatoria acumulativa de una Fuerza a lo largo del diferencial de tiempo se traduce como la *Integral Definida*: $\int_0^t F(t) dt$
* **El Método Numérico (Trapecio Compuesto y Simpson 1/3):** Como la curva de empuje $F(t)$ de la física del motor es engorrosa (modelada con un decaimiento exponencial aerodinámico y perturbaciones senoidales simuladas), la computadora de a bordo la troza en fragmentos *N* limitados. Calcula áreas de trapecios regulares bajo la curva, o aplica la Regla de Simpson conectando puntos con mini-parábolas perfectas para lograr una integración aproximada perfecta usando solo matemáticas discretas.
* **¿Qué explica el Gráfico?:** Es un relleno de área (AreaChart) que exhibe el pico del motor en el "Liftoff" y su decadencia amortiguada con las fluctuaciones generadas por la resistencia transónica de nuestra atmósfera.

### C. Módulo 3: Telemetría Espacial GPS (Interpolación)
* **El Problema:** Las instalaciones del centro de control (Deep Space Network) reciben un eco desde Artemis II solo cada hora o más para no malgastar energía, obteniendo *Nodos o Puntos aislados*. Si se necesita saber dónde estaba la nave entre ese vacío de información, se debe reconstruir matemáticamente el camino.
* **El Método Numérico (Polinomio de Lagrange):** Usa todos los puntos discretos en bloque para fabricar un polinomio gigante único de grado *N-1* (donde *N* es la cantidad de lecturas recibidas). Este polinomio transita obligatoriamente de forma natural uniendo todos los puntos de la línea temporal sin excepción.
* **¿Qué explica el Gráfico Multicapa?:** Sobrepone un diagrama de dispersión (Scatter, puntos rojos crudos del eco de la nave) sobre el Polinomio de Interpolación real y suavizado de Lagrange (línea morada curva). Muestra claramente la predictibilidad del fenómeno espacial.

### D. Módulo 4: Evaluación de Tolerancias (Convergencia y Benchmarking)
* **El Problema:** La nave necesita ser computacionalmente segura. Si el ordenador entra en pánico fallando en solucionar un ángulo con e = 0.99 (excentricidad hiper crítica), y el proceso consume todo el tiempo del loop de control, causará un desastre en la ignición. Aquí se exponen a luchar todos los métodos raíz.
* **Las cuentas Numéricas Enfrentadas:**
  - **Bisección (Bolzano):** Muy lento, parte los problemas estrictamente a la mitad buscando cambios de signo, pero jamás falla si halla un signo opuesto.
  - **Punto Fijo:** Muy impredecible y oscilatorio. Intenta usar una función re-ordenada sobre el mismo elemento.
  - **Newton-Raphson:** Espectacular pero peligroso, si su derivada es horizontal dispara su resultado al infinito y se rompe (Error en máquina).
  - **Steffensen (con Aceleración de Aitken Δ²):** Un algoritmo maravilla sin derivadas que "acelera" la velocidad espaciotemporal del Punto Fijo, forzándolo a llegar en 3 saltos a donde llegaría en 50.
* **¿Qué explica sus Pantallas?:** 
  - La *Pantalla de Convergencia Técnica* muestra la anatomía tabulada puramente técnica para auditores.
  - El *Benchmark Interactivo* es la competencia computacional directa: Muestra en un diagrama de barras simple qué algoritmo usó más ciclos de computadora o definitivamente falló (explotó la barra) ante las variables estresantes del usuario, sirviendo para justificar por qué en un viaje lunar debes escoger algoritmos específicos dependiendo de tus entradas.
