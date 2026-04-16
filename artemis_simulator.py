#!/usr/bin/env python3
"""
╔══════════════════════════════════════════════════════════════╗
║    ARTEMIS II — Simulador de Métodos Numéricos              ║
║    Modelado y Simulación · Ingeniería                       ║
╚══════════════════════════════════════════════════════════════╝

Refactorizado usando CustomTkinter para una UI/UX moderna y visualizaciones mejoradas.
"""

import tkinter as tk
from tkinter import ttk, messagebox
import customtkinter as ctk
import numpy as np
import matplotlib
matplotlib.use("TkAgg")
from matplotlib.backends.backend_tkagg import FigureCanvasTkAgg
from matplotlib.figure import Figure
from matplotlib.patches import Circle

# Configuración global de CustomTkinter
ctk.set_appearance_mode("Dark")  # Themes: "System", "Dark", "Light"
ctk.set_default_color_theme("blue")  # Themes: "blue", "green", "dark-blue"

# Paleta base para gráficos
BG = "#2b2b2b"
PANEL = "#1e1e1e"
ACCENT = "#3a7ebf"
ACC2 = "#ff6b35"
ACC3 = "#7fff6b"
TEXT = "#e8eaf6"

# Constantes Planetarias
R_TIERRA  = 6371e3
D_LUNA    = 384400e3
MU_TIERRA = 3.986e14
R_LUNA    = 1737e3

# ══════════════════════════════════════════════════════════════
#  MÉTODOS NUMÉRICOS (Sin alterar lógica original)
# ══════════════════════════════════════════════════════════════

def biseccion(f, a, b, tol=1e-8, max_iter=100):
    historia = []
    if f(a) * f(b) > 0:
        raise ValueError("f(a) y f(b) deben tener signos opuestos.")
    for i in range(max_iter):
        c = (a + b) / 2
        error = abs(b - a) / 2
        historia.append((i + 1, round(a, 8), round(b, 8),
                          round(c, 8), round(f(c), 8), round(error, 10)))
        if error < tol or abs(f(c)) < tol:
            break
        if f(a) * f(c) < 0:
            b = c
        else:
            a = c
    return c, historia

def newton_raphson(f, df, x0, tol=1e-8, max_iter=100):
    historia = []
    x = x0
    for i in range(max_iter):
        fx  = f(x)
        dfx = df(x)
        if abs(dfx) < 1e-15:
            raise ValueError("Derivada cero — método no converge.")
        x_new = x - fx / dfx
        error = abs(x_new - x)
        historia.append((i + 1, round(x, 8), round(fx, 8),
                          round(dfx, 8), round(x_new, 8), round(error, 10)))
        x = x_new
        if error < tol:
            break
    return x, historia

def punto_fijo(g, x0, tol=1e-8, max_iter=100):
    historia = []
    x = x0
    for i in range(max_iter):
        x_new = g(x)
        error = abs(x_new - x)
        historia.append((i + 1, round(x, 8), round(x_new, 8), round(error, 10)))
        x = x_new
        if error < tol:
            break
    return x, historia

def aitken(g, x0, tol=1e-8, max_iter=100):
    historia = []
    x = x0
    for i in range(max_iter):
        x1 = g(x)
        x2 = g(x1)
        denom = x2 - 2 * x1 + x
        if abs(denom) < 1e-15:
            historia.append((i + 1, round(x, 8), round(x1, 8),
                              round(x2, 8), round(x, 8), 0.0))
            break
        x_new = x - (x1 - x) ** 2 / denom
        error = abs(x_new - x)
        historia.append((i + 1, round(x, 8), round(x1, 8),
                          round(x2, 8), round(x_new, 8), round(error, 10)))
        x = x_new
        if error < tol:
            break
    return x, historia

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
    return h / 3 * (y[0] + y[-1] + 4 * np.sum(y[1:-1:2]) + 2 * np.sum(y[2:-2:2]))

def trapecio(f, a, b, n):
    h = (b - a) / n
    x = np.linspace(a, b, n + 1)
    y = f(x)
    return h * (y[0] / 2 + np.sum(y[1:-1]) + y[-1] / 2)


# ══════════════════════════════════════════════════════════════
#  HERRAMIENTAS UX
# ══════════════════════════════════════════════════════════════

class ToolTip:
    """Clase para mostrar tooltips flotantes sobre elementos de UI."""
    def __init__(self, widget, text):
        self.widget = widget
        self.text = text
        self.tooltip_window = None
        self.id = None
        self.widget.bind("<Enter>", self.enter)
        self.widget.bind("<Leave>", self.leave)

    def enter(self, event=None):
        self.schedule()

    def leave(self, event=None):
        self.unschedule()
        self.hide()

    def schedule(self):
        self.unschedule()
        self.id = self.widget.after(500, self.show)

    def unschedule(self):
        if self.id:
            self.widget.after_cancel(self.id)
        self.id = None

    def show(self, event=None):
        x, y, cx, cy = self.widget.bbox("insert")
        x = x + self.widget.winfo_rootx() + 25
        y = y + cy + self.widget.winfo_rooty() + 25
        self.tooltip_window = tw = tk.Toplevel(self.widget)
        tw.wm_overrideredirect(True)
        tw.wm_geometry(f"+{x}+{y}")
        label = tk.Label(tw, text=self.text, justify='left',
                         background="#333333", foreground="white", relief='solid', borderwidth=1,
                         font=("Segoe UI", 9, "normal"), padx=10, pady=5)
        label.pack(ipadx=1)

    def hide(self):
        if self.tooltip_window:
            self.tooltip_window.destroy()
        self.tooltip_window = None

def setup_plot_style(fig, ax, title, xlabel, ylabel):
    """Estiliza los gráficos para mantener una estética consistente."""
    fig.patch.set_facecolor(BG)
    ax.set_facecolor(BG)
    ax.set_title(title, color=TEXT, fontsize=12, pad=12, fontweight='bold')
    ax.set_xlabel(xlabel, color=TEXT, fontsize=10)
    ax.set_ylabel(ylabel, color=TEXT, fontsize=10)
    ax.tick_params(colors=TEXT)
    for sp in ax.spines.values():
        sp.set_color("#555555")
    ax.grid(True, color="#555555", alpha=0.4, linestyle="--")


# ══════════════════════════════════════════════════════════════
#  Pestañas de la Aplicación
# ══════════════════════════════════════════════════════════════

class TabTrayectoria:
    def __init__(self, parent):
        self.parent = parent
        
        # Grid layout (2 columns)
        parent.grid_columnconfigure(0, weight=0, minsize=350)
        parent.grid_columnconfigure(1, weight=1)
        parent.grid_rowconfigure(0, weight=1)
        
        # Panel izquierdo (Controles)
        self.ctrl_frame = ctk.CTkFrame(parent)
        self.ctrl_frame.grid(row=0, column=0, padx=10, pady=10, sticky="nsew")
        
        titulo = ctk.CTkLabel(self.ctrl_frame, text="PARÁMETROS ORBITALES", font=ctk.CTkFont(size=16, weight="bold"))
        titulo.pack(pady=(20, 10))
        
        self.inputs = {}
        self._add_input("Altitud parking (km)", "200", "Altitud de la órbita de espera respecto a la superficie.")
        self._add_input("Excentricidad e", "0.967", "Excentricidad de la órbita de transferencia (>0 y <1 para elipses).")
        self._add_input("Anomalía media M", "1.2", "Anomalía media en radianes (posición en el tiempo).")
        self._add_input("Tolerancia Newton-R", "1e-10", "Tolerancia requerida para el error de cálculo.")
        
        btn_frame = ctk.CTkFrame(self.ctrl_frame, fg_color="transparent")
        btn_frame.pack(fill="x", padx=20, pady=15)
        
        self.btn_run = ctk.CTkButton(btn_frame, text="SIMULAR", command=self.run, fg_color=ACCENT, font=ctk.CTkFont(weight="bold"))
        self.btn_run.pack(side="left", expand=True, fill="x", padx=(0, 5))
        
        self.btn_reset = ctk.CTkButton(btn_frame, text="RESET", width=60, command=self.reset, fg_color="transparent", border_width=1, text_color=TEXT)
        self.btn_reset.pack(side="right")
        
        # Resultados
        self.res_frame = ctk.CTkFrame(self.ctrl_frame, fg_color="#1a1a1a")
        self.res_frame.pack(fill="x", padx=20, pady=10)
        self.lbl_E = ctk.CTkLabel(self.res_frame, text="Anomalía Exc. (E) = —", text_color=ACC3, font=ctk.CTkFont(weight="bold"))
        self.lbl_E.pack(pady=5)
        self.lbl_ni = ctk.CTkLabel(self.res_frame, text="Iteraciones = —")
        self.lbl_ni.pack()
        self.lbl_dv = ctk.CTkLabel(self.res_frame, text="Δv TLI = —", text_color=ACC2, font=ctk.CTkFont(weight="bold"))
        self.lbl_dv.pack(pady=(0, 5))

        # Panel Educativo
        edu_text = ("ℹ️ Newton-Raphson:\n"
                    "Resuelve la Ecuación de Kepler (E - e*sen(E) - M = 0) para encontrar "
                    "la Anomalía Excéntrica (E). Es crucial para saber la posición "
                    "exacta de la nave astronavegando en el tiempo.")
        edu_lbl = ctk.CTkLabel(self.ctrl_frame, text=edu_text, justify="left", wraplength=280, text_color="#aaaaaa")
        edu_lbl.pack(side="bottom", pady=20, padx=20)
        
        # Panel derecho (Gráficos)
        self.fig = Figure(figsize=(7, 6), facecolor=BG)
        self.canvas = FigureCanvasTkAgg(self.fig, master=parent)
        self.canvas.get_tk_widget().grid(row=0, column=1, padx=10, pady=10, sticky="nsew")
        
        self.run()
        
    def _add_input(self, label_text, default, tooltip_msg=""):
        lbl = ctk.CTkLabel(self.ctrl_frame, text=label_text)
        lbl.pack(anchor="w", padx=20, pady=(10, 0))
        ToolTip(lbl, tooltip_msg)
        
        entry = ctk.CTkEntry(self.ctrl_frame)
        entry.insert(0, default)
        entry.pack(fill="x", padx=20)
        self.inputs[label_text] = entry

    def reset(self):
        defaults = ["200", "0.967", "1.2", "1e-10"]
        for entry, val in zip(self.inputs.values(), defaults):
            entry.delete(0, 'end')
            entry.insert(0, val)
        self.run()
        
    def run(self):
        try:
            h_pk = float(self.inputs["Altitud parking (km)"].get()) * 1e3
            e    = float(self.inputs["Excentricidad e"].get())
            M    = float(self.inputs["Anomalía media M"].get())
            tol  = float(self.inputs["Tolerancia Newton-R"].get())
        except ValueError:
            messagebox.showerror("Error de Entrada", "Todos los valores deben ser numéricos.")
            return

        f  = lambda E: E - e * np.sin(E) - M
        df = lambda E: 1 - e * np.cos(E)
        
        try:
            E_sol, hist = newton_raphson(f, df, M, tol=tol)
        except ValueError as exc:
            messagebox.showerror("Error Numérico", str(exc))
            return

        self.lbl_E.configure(text=f"Anomalía Exc. (E) = {E_sol:.8f} rad")
        self.lbl_ni.configure(text=f"Iteraciones = {len(hist)}")

        r1  = R_TIERRA + h_pk
        r2  = R_TIERRA + D_LUNA
        a   = (r1 + r2) / 2
        v_c = np.sqrt(MU_TIERRA / r1)
        v_t = np.sqrt(MU_TIERRA * (2 / r1 - 1 / a))
        self.lbl_dv.configure(text=f"Δv TLI ≈ {(v_t - v_c)/1e3:.4f} km/s")

        self.fig.clear()
        ax1 = self.fig.add_subplot(121)
        ax2 = self.fig.add_subplot(122)

        # Gráfico 1: Órbitas
        e_tr  = (r2 - r1) / (r2 + r1)
        a_tr  = (r1 + r2) / 2
        theta = np.linspace(0, np.pi, 600)
        r_arr = a_tr * (1 - e_tr**2) / (1 + e_tr * np.cos(theta))
        x_orb, y_orb = r_arr * np.cos(theta) / 1e9, r_arr * np.sin(theta) / 1e9

        ax1.plot(x_orb, y_orb, color=ACCENT, lw=2, label="Trayectoria TLI")
        ang_c = np.linspace(0, 2 * np.pi, 300)
        ax1.plot(r1 / 1e9 * np.cos(ang_c), r1 / 1e9 * np.sin(ang_c),
                 color=ACCENT, lw=1, linestyle=":", alpha=0.5)

        ax1.add_patch(Circle((0, 0), R_TIERRA / 1e9, color="#1a73e8", zorder=5, label="Tierra"))
        x_luna = (R_TIERRA + D_LUNA) / 1e9
        ax1.add_patch(Circle((x_luna, 0), R_LUNA / 1e9, color="#aaaaaa", zorder=5, label="Luna"))

        nu   = 2 * np.arctan2(np.sqrt(1 + e) * np.sin(E_sol / 2),
                               np.sqrt(1 - e) * np.cos(E_sol / 2))
        r_E  = a * (1 - e * np.cos(E_sol))
        ax1.plot(r_E * np.cos(nu) / 1e9, r_E * np.sin(nu) / 1e9,
                 marker="D", color=ACC2, markersize=9, zorder=10, label="Orion")

        setup_plot_style(self.fig, ax1, "Transferencia Tierra → Luna", "x [×10⁹ m]", "y [×10⁹ m]")
        ax1.set_aspect("equal")
        ax1.legend(fontsize=8, facecolor=PANEL, edgecolor="#555555", labelcolor=TEXT, loc="upper right")

        # Gráfico 2: Convergencia
        errores = [h[5] for h in hist]
        iters = range(1, len(errores) + 1)
        ax2.semilogy(iters, errores, color=ACCENT, marker="o", ms=5, lw=2)
        ax2.fill_between(iters, errores, alpha=0.2, color=ACCENT)
        ax2.axhline(tol, color=ACC2, linestyle="--", lw=1.5, label="Tolerancia Tol")
        
        setup_plot_style(self.fig, ax2, "Convergencia de Newton-Raphson", "Iteración", "Error absoluto")
        ax2.legend(fontsize=8, facecolor=PANEL, edgecolor="#555555", labelcolor=TEXT)

        self.fig.tight_layout(pad=3.0)
        self.canvas.draw()


class TabImpulso:
    def __init__(self, parent):
        self.parent = parent
        parent.grid_columnconfigure(0, weight=0, minsize=350)
        parent.grid_columnconfigure(1, weight=1)
        parent.grid_rowconfigure(0, weight=1)
        
        self.ctrl_frame = ctk.CTkFrame(parent)
        self.ctrl_frame.grid(row=0, column=0, padx=10, pady=10, sticky="nsew")
        
        titulo = ctk.CTkLabel(self.ctrl_frame, text="MOTOR SLS BLOCK 1", font=ctk.CTkFont(size=16, weight="bold"))
        titulo.pack(pady=(20, 10))
        
        formula = ctk.CTkLabel(self.ctrl_frame, text="F(t) = F₀·e^(-0.0015t) · (1 + 0.1·sen(0.08t))", text_color=ACCENT, font=ctk.CTkFont(family="Consolas"))
        formula.pack(pady=5)
        
        self.inputs = {}
        self._add_input("Tiempo encendido TLI (s)", "500", "Tiempo total en segundos que el motor permanecerá encendido.")
        self._add_input("Intervalos de integración", "100", "Número de particiones (n) para calcular el área bajo la curva.")
        
        btn_frame = ctk.CTkFrame(self.ctrl_frame, fg_color="transparent")
        btn_frame.pack(fill="x", padx=20, pady=15)
        
        self.btn_run = ctk.CTkButton(btn_frame, text="CALCULAR IMPULSO", command=self.run, fg_color=ACCENT, font=ctk.CTkFont(weight="bold"))
        self.btn_run.pack(side="left", expand=True, fill="x", padx=(0, 5))
        
        self.btn_reset = ctk.CTkButton(btn_frame, text="RESET", width=60, command=self.reset, fg_color="transparent", border_width=1, text_color=TEXT)
        self.btn_reset.pack(side="right")
        
        self.res_frame = ctk.CTkFrame(self.ctrl_frame, fg_color="#1a1a1a")
        self.res_frame.pack(fill="x", padx=20, pady=10)
        self.lbl_si = ctk.CTkLabel(self.res_frame, text="Simpson:  —  GN·s", text_color=ACC3, font=ctk.CTkFont(weight="bold"))
        self.lbl_si.pack(pady=(10, 2))
        self.lbl_tr = ctk.CTkLabel(self.res_frame, text="Trapecio: —  GN·s", text_color=ACC2)
        self.lbl_tr.pack(pady=2)
        self.lbl_er = ctk.CTkLabel(self.res_frame, text="Diferencia: —")
        self.lbl_er.pack(pady=(2, 10))

        edu_text = ("ℹ️ Cuadratura Numérica:\n"
                    "Compara Trapecio Compuesto (lineal por tramos) contra Simpson 1/3 (parabólico). "
                    "Simpson provee una estimación mucho más fiel en curvas oscilantes de motores reales.")
        edu_lbl = ctk.CTkLabel(self.ctrl_frame, text=edu_text, justify="left", wraplength=280, text_color="#aaaaaa")
        edu_lbl.pack(side="bottom", pady=20, padx=20)
        
        self.fig = Figure(figsize=(7, 5), facecolor=BG)
        self.canvas = FigureCanvasTkAgg(self.fig, master=parent)
        self.canvas.get_tk_widget().grid(row=0, column=1, padx=10, pady=10, sticky="nsew")
        self.run()
        
    def _add_input(self, label_text, default, tip):
        lbl = ctk.CTkLabel(self.ctrl_frame, text=label_text)
        lbl.pack(anchor="w", padx=20, pady=(10, 0))
        ToolTip(lbl, tip)
        entry = ctk.CTkEntry(self.ctrl_frame)
        entry.insert(0, default)
        entry.pack(fill="x", padx=20)
        self.inputs[label_text] = entry

    def reset(self):
        self.inputs["Tiempo encendido TLI (s)"].delete(0, 'end'); self.inputs["Tiempo encendido TLI (s)"].insert(0, "500")
        self.inputs["Intervalos de integración"].delete(0, 'end'); self.inputs["Intervalos de integración"].insert(0, "100")
        self.run()

    def run(self):
        try:
            t_max = float(self.inputs["Tiempo encendido TLI (s)"].get())
            n     = int(self.inputs["Intervalos de integración"].get())
            if n <= 0 or t_max <= 0: raise ValueError
        except ValueError:
            messagebox.showerror("Error", "Ingrese valores numéricos positivos mayores a 0.")
            return

        F_max = 8800e3
        F = lambda t: F_max * np.exp(-0.0015 * t) * (1 + 0.1 * np.sin(0.08 * t))

        imp_s = simpson(F, 0, t_max, n)
        imp_t = trapecio(F, 0, t_max, n)
        self.lbl_si.configure(text=f"Simpson:  {imp_s/1e9:.5f} GN·s")
        self.lbl_tr.configure(text=f"Trapecio: {imp_t/1e9:.5f} GN·s")
        self.lbl_er.configure(text=f"Diferencia: {abs(imp_s-imp_t)/1e6:.3f} MN·s")

        t   = np.linspace(0, t_max, 600)
        t_p = np.linspace(0, t_max, n + 1)

        self.fig.clear()
        ax = self.fig.add_subplot(111)
        ax.fill_between(t, F(t) / 1e6, alpha=0.2, color=ACC2)
        ax.plot(t, F(t) / 1e6, color=ACC2, lw=2.5, label="F(t) empuje SLS")
        
        # Muestra menos lineas si son muchas para no ensuciar la gráfica
        if n <= 100:
            ax.vlines(t_p, 0, F(t_p) / 1e6, color=ACCENT, alpha=0.3, lw=1, label="Particiones")
            ax.scatter(t_p, F(t_p) / 1e6, color=ACCENT, s=15, zorder=5)

        setup_plot_style(self.fig, ax, f"Perfil de Empuje | Total ≈ {imp_s/1e9:.3f} GN·s", "Tiempo [s]", "Empuje [MN]")
        ax.legend(facecolor=PANEL, edgecolor="#555555", labelcolor=TEXT, fontsize=10)
        
        # Annotate peak
        peak_idx = np.argmax(F(t))
        ax.annotate(f"Pico Local", xy=(t[peak_idx], F(t[peak_idx])/1e6), xytext=(t[peak_idx]+50, F(t[peak_idx])/1e6+0.5),
                    arrowprops=dict(arrowstyle="->", color="white"), color="white")

        self.fig.tight_layout(pad=3.0)
        self.canvas.draw()


class TabTelemetria:
    def __init__(self, parent):
        self.parent = parent
        parent.grid_columnconfigure(0, weight=0, minsize=350)
        parent.grid_columnconfigure(1, weight=1)
        parent.grid_rowconfigure(0, weight=1)
        
        self.ctrl_frame = ctk.CTkFrame(parent)
        self.ctrl_frame.grid(row=0, column=0, padx=10, pady=10, sticky="nsew")
        
        titulo = ctk.CTkLabel(self.ctrl_frame, text="MODELADO POR INTERPOLACIÓN", font=ctk.CTkFont(size=16, weight="bold"))
        titulo.pack(pady=(20, 10))
        
        self.inputs = {}
        self._add_input("Tiempos t [h] (separados por coma)", "0,10,24,48,72,96", "Arreglo de tiempos discretos obtenidos por telemetría.")
        self._add_input("Distancia [×10³ km] (sep. por coma)", "0,38,95,201,313,384", "Valores discretos de la posición correspondientes a cada tiempo.")
        
        btn_frame = ctk.CTkFrame(self.ctrl_frame, fg_color="transparent")
        btn_frame.pack(fill="x", padx=20, pady=15)
        self.btn_run = ctk.CTkButton(btn_frame, text="INTERPOLAR", command=self.run, fg_color=ACCENT, font=ctk.CTkFont(weight="bold"))
        self.btn_run.pack(side="left", expand=True, fill="x", padx=(0, 5))
        self.btn_reset = ctk.CTkButton(btn_frame, text="RESET", width=60, command=self.reset, fg_color="transparent", border_width=1, text_color=TEXT)
        self.btn_reset.pack(side="right")
        
        self.res_frame = ctk.CTkFrame(self.ctrl_frame, fg_color="#1a1a1a")
        self.res_frame.pack(fill="x", padx=20, pady=10)
        self.lbl_lag = ctk.CTkLabel(self.res_frame, text="—", text_color=ACC3, font=ctk.CTkFont(weight="bold"))
        self.lbl_lag.pack(pady=10, padx=10)

        edu_text = ("ℹ️ Lagrange:\n"
                    "Dado un conjunto discreto de datos de GPS espaciales, genera el polinomio único "
                    "de menor grado que pasa exactamente por todos ellos, creando un modelo continuo predictivo.")
        edu_lbl = ctk.CTkLabel(self.ctrl_frame, text=edu_text, justify="left", wraplength=280, text_color="#aaaaaa")
        edu_lbl.pack(side="bottom", pady=20, padx=20)
        
        self.fig = Figure(figsize=(7, 5), facecolor=BG)
        self.canvas = FigureCanvasTkAgg(self.fig, master=parent)
        self.canvas.get_tk_widget().grid(row=0, column=1, padx=10, pady=10, sticky="nsew")
        self.run()

    def _add_input(self, label_text, default, tip):
        lbl = ctk.CTkLabel(self.ctrl_frame, text=label_text)
        lbl.pack(anchor="w", padx=20, pady=(10, 0))
        ToolTip(lbl, tip)
        entry = ctk.CTkEntry(self.ctrl_frame)
        entry.insert(0, default)
        entry.pack(fill="x", padx=20)
        self.inputs[label_text] = entry

    def reset(self):
        self.inputs["Tiempos t [h] (separados por coma)"].delete(0, 'end'); self.inputs["Tiempos t [h] (separados por coma)"].insert(0, "0,10,24,48,72,96")
        self.inputs["Distancia [×10³ km] (sep. por coma)"].delete(0, 'end'); self.inputs["Distancia [×10³ km] (sep. por coma)"].insert(0, "0,38,95,201,313,384")
        self.run()

    def run(self):
        try:
            t_pts = np.array([float(x) for x in self.inputs["Tiempos t [h] (separados por coma)"].get().split(",")])
            d_pts = np.array([float(x) for x in self.inputs["Distancia [×10³ km] (sep. por coma)"].get().split(",")])
        except ValueError:
            messagebox.showerror("Error", "Asegúrese de ingresar solo números separados por comas.")
            return
            
        if len(t_pts) != len(d_pts) or len(t_pts) < 2:
            messagebox.showerror("Error", "Ambas listas deben tener el mismo número de elementos (mínimo 2).")
            return

        t_d = np.linspace(t_pts[0], t_pts[-1], 500)
        d_i = lagrange_interpolar(t_pts, d_pts, t_d)
        
        # Interpolar en t=50 como métrica de ejemplo, si está en el rango
        mid_point = (t_pts[0] + t_pts[-1]) / 2
        d_mid = lagrange_interpolar(t_pts, d_pts, np.array([mid_point]))[0]

        self.lbl_lag.configure(
            text=f"Grado del polinomio: {len(t_pts)-1}\n"
                 f"Puntos de control: {len(t_pts)}\n"
                 f"Predicción a {mid_point:.1f}h: {d_mid:.1f} ×10³ km")

        self.fig.clear()
        ax = self.fig.add_subplot(111)
        ax.plot(t_d, d_i, color=ACC3, lw=2.5, label=f"Polinomio de Lagrange")
        ax.scatter(t_pts, d_pts, color=ACC2, s=60, zorder=10, edgecolors="white", lw=1.5, label="Lecturas Telemetría")
        ax.axhline(384, color="#aaaaaa", ls="--", lw=1.5, alpha=0.5, label="Luna")
        
        ax.plot(mid_point, d_mid, marker="*", color=ACCENT, ms=14, zorder=11)
        ax.annotate(f"Predicción: {d_mid:.0f}km", (mid_point, d_mid), xytext=(mid_point+5, d_mid-20),
                    arrowprops=dict(arrowstyle="->", color=ACCENT), color=ACCENT)

        setup_plot_style(self.fig, ax, "Interpolación de Medidas Discretas de Posición", "Tiempo [h]", "Distancia [×10³ km]")
        ax.legend(facecolor=PANEL, edgecolor="#555555", labelcolor=TEXT, fontsize=10)
        
        self.fig.tight_layout(pad=3.0)
        self.canvas.draw()


class TabConvergencia:
    def __init__(self, parent):
        self.parent = parent
        parent.grid_columnconfigure(0, weight=1)
        parent.grid_rowconfigure(1, weight=1)
        
        # Header Controls
        self.top_frame = ctk.CTkFrame(parent, fg_color=PANEL)
        self.top_frame.grid(row=0, column=0, sticky="ew", padx=10, pady=10)
        
        ctk.CTkLabel(self.top_frame, text="🔍 CONVERGENCIA — f(E) = E − e·sin(E) − M = 0", font=ctk.CTkFont("Consolas", size=14, weight="bold"), text_color=ACCENT).pack(pady=10)
        
        ctrl = ctk.CTkFrame(self.top_frame, fg_color="transparent")
        ctrl.pack(pady=(0, 15))
        
        self.inputs = {}
        for lbl, val in [("Excentricidad (e):", "0.967"), ("Anomalía (M):", "1.2"), ("Valor inicial (x₀):", "1.0"), ("Tolerancia (tol):", "1e-8")]:
            ctk.CTkLabel(ctrl, text=lbl, text_color="#aaaaaa").pack(side="left", padx=(15, 5))
            entry = ctk.CTkEntry(ctrl, width=80)
            entry.insert(0, val)
            entry.pack(side="left")
            self.inputs[lbl] = entry
            
        ctk.CTkButton(ctrl, text="EVALUAR MÉTODOS", fg_color=ACCENT, command=self.run, font=ctk.CTkFont(weight="bold")).pack(side="left", padx=20)

        # Tablas body
        self.body = ctk.CTkFrame(parent, fg_color="transparent")
        self.body.grid(row=1, column=0, sticky="nsew", padx=5, pady=5)
        
        self.trees = {}
        cfgs = [
            ("Bisección (Intervalo 0.5 a 3.5)", ["Iter", "a", "b", "c", "f(c)", "Error"], 0, 0),
            ("Newton-Raphson",  ["Iter", "xₙ", "f(xₙ)", "f'(xₙ)", "xₙ₊₁", "Error"], 0, 1),
            ("Punto Fijo",      ["Iter", "xₙ", "xₙ₊₁", "Error"], 1, 0),
            ("Aitken (Δ²)",     ["Iter", "xₙ", "x₁", "x₂", "x_new", "Error"], 1, 1),
        ]
        
        # Style para las tablas de Treeview tradicional (no existen aún tablas nativas complejas en ctk)
        style = ttk.Style()
        style.theme_use("default")
        style.configure("Treeview", background="#2b2b2b", foreground="white", fieldbackground="#2b2b2b", borderwidth=0, font=("Consolas", 9))
        style.configure("Treeview.Heading", background="#1e1e1e", foreground=ACCENT, font=("Consolas", 10, "bold"), borderwidth=0)
        style.map("Treeview", background=[("selected", ACC2)])
        
        for name, cols, row, col in cfgs:
            frm = ctk.CTkFrame(self.body, fg_color=PANEL)
            frm.grid(row=row, column=col, sticky="nsew", padx=10, pady=10)
            self.body.grid_rowconfigure(row, weight=1)
            self.body.grid_columnconfigure(col, weight=1)

            ctk.CTkLabel(frm, text=name, text_color="white", font=ctk.CTkFont(weight="bold")).pack(pady=5)
            
            tree = ttk.Treeview(frm, columns=cols, show="headings", height=8)
            for c in cols:
                tree.heading(c, text=c)
                tree.column(c, width=80, anchor="center")
            
            sb = ttk.Scrollbar(frm, orient="vertical", command=tree.yview)
            tree.configure(yscrollcommand=sb.set)
            
            tree.pack(side="left", fill="both", expand=True, padx=(10, 0), pady=10)
            sb.pack(side="right", fill="y", pady=10, padx=(0, 10))
            self.trees[name] = tree

        self.run()

    def run(self):
        try:
            e   = float(self.inputs["Excentricidad (e):"].get())
            M   = float(self.inputs["Anomalía (M):"].get())
            x0  = float(self.inputs["Valor inicial (x₀):"].get())
            tol = float(self.inputs["Tolerancia (tol):"].get())
        except ValueError:
            messagebox.showerror("Error", "Ingrese valores numéricos válidos en la configuración.")
            return

        f  = lambda E: E - e * np.sin(E) - M
        df = lambda E: 1 - e * np.cos(E)
        g  = lambda E: M + e * np.sin(E)

        for t in self.trees.values():
            for row in t.get_children():
                t.delete(row)

        def _fill(tree, rows):
            for row in rows:
                tree.insert("", "end", values=tuple(f"{v:.6e}" if isinstance(v, float) else v for v in row))

        try:    _, h = biseccion(f, 0.5, 3.5, tol=tol); _fill(self.trees["Bisección (Intervalo 0.5 a 3.5)"], h)
        except Exception as ex: self.trees["Bisección (Intervalo 0.5 a 3.5)"].insert("", "end", values=(str(ex),))

        try:    _, h = newton_raphson(f, df, x0, tol=tol); _fill(self.trees["Newton-Raphson"], h)
        except Exception as ex: self.trees["Newton-Raphson"].insert("", "end", values=(str(ex),))

        try:    _, h = punto_fijo(g, x0, tol=tol); _fill(self.trees["Punto Fijo"], h)
        except Exception as ex: self.trees["Punto Fijo"].insert("", "end", values=(str(ex),))

        try:    _, h = aitken(g, x0, tol=tol); _fill(self.trees["Aitken (Δ²)"], h)
        except Exception as ex: self.trees["Aitken (Δ²)"].insert("", "end", values=(str(ex),))


class TabComparacion:
    def __init__(self, parent):
        self.parent = parent
        parent.grid_columnconfigure(0, weight=1)
        parent.grid_rowconfigure(1, weight=1)
        
        self.top_frame = ctk.CTkFrame(parent, fg_color=PANEL)
        self.top_frame.grid(row=0, column=0, sticky="ew", padx=10, pady=10)
        
        ctk.CTkLabel(self.top_frame, text="📊 RENDIMIENTO Y EFICIENCIA", font=ctk.CTkFont("Consolas", size=14, weight="bold"), text_color=ACCENT).pack(pady=10)
        
        ctrl = ctk.CTkFrame(self.top_frame, fg_color="transparent")
        ctrl.pack(pady=(0, 15))
        
        ctk.CTkLabel(ctrl, text="Establezca la dificultad (Excentricidad):").pack(side="left", padx=(10, 5))
        self.cmp_e = ctk.CTkEntry(ctrl, width=70)
        self.cmp_e.insert(0, "0.967"); self.cmp_e.pack(side="left")
        
        ctk.CTkLabel(ctrl, text="Anomalía M:").pack(side="left", padx=(20, 5))
        self.cmp_M = ctk.CTkEntry(ctrl, width=70)
        self.cmp_M.insert(0, "1.2"); self.cmp_M.pack(side="left")
        
        ToolTip(self.cmp_e, "El aumento de la excentricidad a valores cercanos a 1 dificulta la convergencia de Punto Fijo.")
        
        ctk.CTkButton(ctrl, text="Lanzar Benchmark", fg_color=ACC2, command=self.run, font=ctk.CTkFont(weight="bold")).pack(side="left", padx=25)

        self.fig_frame = ctk.CTkFrame(parent, fg_color=BG)
        self.fig_frame.grid(row=1, column=0, sticky="nsew", padx=10, pady=5)
        
        self.fig = Figure(figsize=(12, 6), facecolor=BG)
        self.canvas = FigureCanvasTkAgg(self.fig, master=self.fig_frame)
        self.canvas.get_tk_widget().pack(fill="both", expand=True)
        self.run()

    def run(self):
        try:
            e = float(self.cmp_e.get())
            M = float(self.cmp_M.get())
        except ValueError:
            messagebox.showerror("Error", "Valores inválidos.")
            return

        f  = lambda E: E - e * np.sin(E) - M
        df = lambda E: 1 - e * np.cos(E)
        g  = lambda E: M + e * np.sin(E)

        metodos = {}
        colores = [ACCENT, ACC2, ACC3, "#ff79c6"]
        for nombre, runner in [
            ("Bisección",      lambda: biseccion(f, 0.5, 3.5, tol=1e-12, max_iter=200)),
            ("Newton-Raphson", lambda: newton_raphson(f, df, M, tol=1e-12, max_iter=200)),
            ("Punto Fijo",     lambda: punto_fijo(g, M, tol=1e-12, max_iter=200)),
            ("Aitken (Δ²)",    lambda: aitken(g, M, tol=1e-12, max_iter=200)),
        ]:
            try:
                _, h = runner()
                idx_err = {"Bisección": 5, "Newton-Raphson": 5, "Punto Fijo": 3, "Aitken (Δ²)": 5}
                metodos[nombre] = [row[idx_err[nombre]] for row in h]
            except Exception:
                pass

        self.fig.clear()
        ax1 = self.fig.add_subplot(121)
        ax2 = self.fig.add_subplot(122)

        for (nombre, errores), color in zip(metodos.items(), colores):
            iters = range(1, len(errores) + 1)
            ax1.semilogy(iters, errores, label=nombre, color=color, lw=2.5, marker="o", ms=4)
            ax1.fill_between(iters, errores, alpha=0.05, color=color)

        setup_plot_style(self.fig, ax1, "Tasa de Convergencia", "Iteración", "Error absoluto (log)")
        ax1.legend(facecolor=PANEL, edgecolor="#555555", labelcolor=TEXT, fontsize=10)

        nombres = list(metodos.keys())
        n_iters = [len(v) for v in metodos.values()]
        bars = ax2.bar(nombres, n_iters, color=colores[:len(nombres)], edgecolor=BG, linewidth=1.5, width=0.6)
        
        for bar, n in zip(bars, n_iters):
            ax2.text(bar.get_x() + bar.get_width() / 2, bar.get_height() + 0.5,
                     str(n), ha="center", va="bottom", color="white", fontsize=12, fontweight="bold")

        setup_plot_style(self.fig, ax2, "Iteraciones Totales (tol=1e-12)", "", "Cantidad de Iteraciones")
        ax2.tick_params(axis="x", colors=TEXT, rotation=10, labelsize=11)

        self.fig.tight_layout(pad=3.0)
        self.canvas.draw()


# ══════════════════════════════════════════════════════════════
#  APLICACIÓN PRINCIPAL
# ══════════════════════════════════════════════════════════════

class App(ctk.CTk):
    def __init__(self):
        super().__init__()
        self.title("🚀 ARTEMIS II — Simulador de Métodos Numéricos Avanzado")
        self.geometry("1300x820")
        self.minsize(1000, 700)
        
        # Header
        header = ctk.CTkFrame(self, fg_color=PANEL, height=60, corner_radius=0)
        header.pack(fill="x", side="top")
        header.pack_propagate(False)
        ctk.CTkLabel(header, text="🚀 ARTEMIS II", font=ctk.CTkFont("Consolas", size=24, weight="bold"), text_color=ACCENT).pack(side="left", padx=20)
        ctk.CTkLabel(header, text="Laboratorio de Métodos Numéricos & Álgebra", text_color="#aaaaaa").pack(side="right", padx=20)
        
        # Tabs container
        self.tabview = ctk.CTkTabview(self, segmented_button_fg_color=PANEL, 
                                      segmented_button_selected_color=ACCENT,
                                      segmented_button_unselected_color=PANEL,
                                      text_color="white", anchor="w")
        self.tabview.pack(fill="both", expand=True, padx=20, pady=(10, 20))
        
        self.tab1 = self.tabview.add("🌍 Trayectoria (Kepler)")
        self.tab2 = self.tabview.add("🔥 Impulso (Motor SLS)")
        self.tab3 = self.tabview.add("📡 Telemetría Espacial")
        self.tab4 = self.tabview.add("🔍 Registros de Convergencia")
        self.tab5 = self.tabview.add("📊 Benchmark de Métodos")
        
        # Initialize Tabs
        TabTrayectoria(self.tab1)
        TabImpulso(self.tab2)
        TabTelemetria(self.tab3)
        TabConvergencia(self.tab4)
        TabComparacion(self.tab5)


if __name__ == "__main__":
    app = App()
    app.mainloop()