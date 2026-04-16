import { useContext, useEffect, useState, useRef } from 'react';
import api from '../api';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Label } from 'recharts';
import { AlertCircle } from 'lucide-react';
import { SimulationContext } from '../context/SimulationContext';
// 3D Imports
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sphere, Line as ThreeLine, Stars } from '@react-three/drei';

function OrionShip({ points }) {
  const meshRef = useRef();
  const [progress, setProgress] = useState(0);

  useFrame((state, delta) => {
    if (!points || points.length === 0) return;
    
    // Avance porcentual basado en el delta time del monitor (ajuste de velocidad)
    setProgress((p) => {
      let next = p + delta * 0.15; 
      if (next >= 1) return 0; // Reinicio en bucle
      return next;
    });
    
    // Interpolación Lineal para viaje ultra suave entre nodos discretos
    const floatIndex = progress * (points.length - 1);
    const index = Math.floor(floatIndex);
    const nextIndex = Math.min(index + 1, points.length - 1);
    const factor = floatIndex - index;

    const p1 = points[index];
    const p2 = points[nextIndex];

    if (meshRef.current && p1 && p2) {
      meshRef.current.position.set(
        p1[0] + (p2[0] - p1[0]) * factor,
        p1[1] + (p2[1] - p1[1]) * factor,
        p1[2] + (p2[2] - p1[2]) * factor
      );
    }
  });

  return (
    <Sphere ref={meshRef} args={[0.05, 16, 16]}>
      <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={2} />
    </Sphere>
  );
}

function OrbitScene({ orbitData }) {
  const scaleFactor = 150; // Aumento estético para evitar valores diminutos
  // Desplazamos las coordenadas a Z=0 para el plano elíptico estándar 
  const points = orbitData.map(p => [(p.x) * scaleFactor, (p.y) * scaleFactor, 0]);
  
  // Radio de la tierra ajustado matemáticamente a escala con respecto a 1e9 de base
  const earthRadius = 0.006378 * scaleFactor;

  return (
    <Canvas camera={{ position: [0, -3, 3], fov: 60 }} className="bg-slate-950 rounded-2xl cursor-grab active:cursor-grabbing">
      {/* Iluminación Atmosférica Espacial */}
      <ambientLight intensity={0.15} />
      <directionalLight position={[10, 5, 10]} intensity={2.5} color="#ffffff" />
      <pointLight position={[-5, -5, -5]} intensity={1} color="#0284c7" />

      {/* Controles e Interacción */}
      <OrbitControls autoRotate autoRotateSpeed={0.8} enableDamping dampingFactor={0.05} />
      <Stars radius={100} depth={50} count={3000} factor={4} saturation={0} fade speed={1.5} />

      {/* Núcleo del Planeta Tierra (Sci-Fi Holográfico Solidificado) */}
      <Sphere args={[earthRadius, 64, 64]} position={[0,0,0]}>
        <meshStandardMaterial 
          color="#1e3a8a" 
          transparent={true}
          opacity={0.8}
          wireframe={true} 
          emissive="#2563eb"
          emissiveIntensity={0.5}
        />
      </Sphere>

      {/* Núcleo Sólido Interior Acuático */}
      <Sphere args={[earthRadius * 0.98, 32, 32]} position={[0,0,0]}>
         <meshBasicMaterial color="#0f172a" />
      </Sphere>

      {/* Trazo Dinámico de la Órbita TLI */}
      {points.length > 0 && (
         <>
           <ThreeLine 
              points={points} 
              color="#f59e0b" 
              lineWidth={3.5} 
              transparent 
              opacity={0.9} 
           />
           {/* La cápsula animada */}
           <OrionShip points={points} />
         </>
      )}
    </Canvas>
  );
}

export default function Trayectoria() {
  const { trayectoriaFromState, trayectoriaResultsState } = useContext(SimulationContext);
  const [formData, setFormData] = trayectoriaFromState;
  const [results, setResults] = trayectoriaResultsState;
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const calculate = async () => {
    setLoading(true);
    setError('');
    try {
      const resp = await api.post('/trayectoria', formData);
      setResults(resp.data);
    } catch (err) {
      setError(err.response?.data?.detail || err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!results) {
      calculate();
    }
  }, []);

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header>
        <h2 className="text-3xl font-bold text-slate-100 tracking-tight">Trayectoria Orbital (Inserción Translunar)</h2>
        <p className="text-slate-400 mt-2 font-medium">Búsqueda de la Anomalía Excéntrica mediante Newton-Raphson para predecir la posición balística de la cápsula Orion rumbo a la Luna.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-slate-900 shadow-xl border border-slate-800 p-6 rounded-2xl flex flex-col gap-6">
          <h3 className="text-xl font-bold text-cyan-400">Panel de Ingeniería</h3>
          
          <div className="space-y-5">
            <div>
              <label className="block text-sm text-slate-300 font-bold mb-1">Excentricidad (e)</label>
              <input type="text" name="e" value={formData.e} onChange={handleChange} className="w-full bg-slate-950/50 border border-slate-700/80 rounded-xl px-4 py-2.5 text-slate-200 font-mono focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all"/>
              <p className="text-xs text-slate-500 mt-1">Nivel de elipticidad de la órbita (0 = Circular, 0.99 = Casi parabólica).</p>
            </div>
            
            <div>
              <label className="block text-sm text-slate-300 font-bold mb-1">Anomalía Media (M)</label>
              <input type="text" name="M" value={formData.M} onChange={handleChange} className="w-full bg-slate-950/50 border border-slate-700/80 rounded-xl px-4 py-2.5 text-slate-200 font-mono focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all"/>
              <p className="text-xs text-slate-500 mt-1">Posición fraccional teórica del tiempo sobre la órbita [radianes].</p>
            </div>

            <div>
              <label className="block text-sm text-slate-300 font-bold mb-1">Altitud Parking (h)</label>
              <input type="text" name="altitud_parking" value={formData.altitud_parking} onChange={handleChange} className="w-full bg-slate-950/50 border border-slate-700/80 rounded-xl px-4 py-2.5 text-slate-200 font-mono focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all"/>
              <p className="text-xs text-slate-500 mt-1">Altura sobre el nivel del mar [km] alcanzada por el SLS antes de encender hacia la Luna.</p>
            </div>

            <div>
              <label className="block text-sm text-slate-300 font-bold mb-1">Tolerancia de Cómputo</label>
              <input type="text" name="tol" value={formData.tol} onChange={handleChange} className="w-full bg-slate-950/50 border border-slate-700/80 rounded-xl px-4 py-2.5 text-slate-200 font-mono focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all"/>
              <p className="text-xs text-slate-500 mt-1">Margen de error aceptable para apagar el motor informático.</p>
            </div>
          </div>

          <button onClick={calculate} disabled={loading} className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-cyan-500/20 transition-all mt-auto">
            {loading ? 'Calculando Geometría...' : 'SIMULAR VIAJE'}
          </button>

          {error && <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 flex items-start gap-3"><AlertCircle size={20} className="shrink-0 mt-0.5"/><span className="text-sm">{error}</span></div>}
        </div>

        <div className="lg:col-span-2 space-y-6 flex flex-col">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-900 shadow-xl p-6 rounded-2xl border border-slate-800">
              <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">Solución: Anomalía Excéntrica</span>
              <div className="mt-2 text-3xl font-bold font-mono text-cyan-400">{results ? results.E_sol.toFixed(8) : '—'} <span className="text-sm font-sans text-cyan-400/50">rad</span></div>
              <p className="text-xs text-slate-500 mt-2">Ángulo geométrico real corregido por Newton.</p>
            </div>
            <div className="bg-slate-900 shadow-xl p-6 rounded-2xl border border-slate-800">
              <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">Energía: Delta-V Requerido</span>
              <div className="mt-2 text-3xl font-bold font-mono text-orange-400">{results ? results.dv.toFixed(4) : '—'} <span className="text-sm font-sans text-orange-400/50">km/s</span></div>
              <p className="text-xs text-slate-500 mt-2">Combustible relativo necesario para iniciar inyección.</p>
            </div>
          </div>

          {results && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1">
              
              {/* Esfera 3D Interactiva */}
              <div className="bg-slate-900 shadow-xl border border-slate-800 rounded-2xl flex flex-col relative overflow-hidden min-h-[350px]">
                <div className="px-6 py-4 border-b border-slate-800 absolute top-0 left-0 w-full z-10 bg-slate-900/60 backdrop-blur-sm pointer-events-none">
                   <h3 className="text-lg font-bold text-white mb-1">Radar Espacial 3D</h3>
                   <p className="text-xs text-slate-300">Arrastra para rotar o navega la base estelar.</p>
                </div>
                {/* Render de Universo (Fiber WebGL) */}
                <div className="w-full h-full min-h-[350px] absolute inset-0">
                   <OrbitScene orbitData={results.orbit_tli} />
                </div>
              </div>

              {/* Decaimiento de Error 2D Tradicional */}
              <div className="bg-slate-900 shadow-xl border border-slate-800 p-6 rounded-2xl flex flex-col min-h-[350px]">
                <h3 className="text-lg font-bold text-white mb-2">Descenso del Error Matemático</h3>
                <p className="text-xs text-slate-400 mb-6">Demuestra la caída libre logarítmica de Newton.</p>
                <div className="flex-1">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={results.history} margin={{ top: 10, right: 10, bottom: 20, left: 10 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                      <XAxis dataKey="iter" stroke="#64748b">
                        <Label value="Ciclos u Operaciones" offset={-15} position="insideBottom" fill="#94a3b8" fontSize={12} />
                      </XAxis>
                      <YAxis scale="log" domain={['auto', 'auto']} stroke="#64748b" />
                      <RechartsTooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '12px' }} />
                      <Line type="monotone" dataKey="error" stroke="#06b6d4" strokeWidth={3} dot={{ fill: '#06b6d4' }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

            </div>
          )}
        </div>
      </div>
    </div>
  );
}
