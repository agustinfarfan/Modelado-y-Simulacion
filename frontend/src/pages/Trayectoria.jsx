import { useContext, useEffect, useState } from 'react';
import api from '../api';
import { LineChart, Line, ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, ReferenceDot, Label } from 'recharts';
import { AlertCircle } from 'lucide-react';
import { SimulationContext } from '../context/SimulationContext';

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
        <h2 className="text-3xl font-bold text-slate-100">Trayectoria Orbital (Inserción Translunar)</h2>
        <p className="text-slate-400 mt-2">Búsqueda de la Anomalía Excéntrica mediante Newton-Raphson para predecir la posición balística de la cápsula Orion rumbo a la Luna.</p>
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

        <div className="lg:col-span-2 space-y-6">
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-slate-900 shadow-xl p-6 rounded-2xl border border-slate-800 flex flex-col">
                <h3 className="text-lg font-bold text-white mb-2">Mapa Espacial Escalonado</h3>
                <p className="text-xs text-slate-400 mb-6">Proyección cartesiana del plano de inyección Tierra-Luna.</p>
                <div className="h-64 mt-auto">
                  <ResponsiveContainer width="100%" height="100%">
                    <ScatterChart margin={{ top: 10, right: 10, bottom: 20, left: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                      <XAxis dataKey="x" type="number" stroke="#64748b" tick={{fontSize: 10}}>
                        <Label value="Mega-metros (Mm)" offset={-15} position="insideBottom" fill="#94a3b8" fontSize={12} />
                      </XAxis>
                      <YAxis dataKey="y" type="number" stroke="#64748b" tick={{fontSize: 10}} />
                      <RechartsTooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '12px' }} />
                      
                      {/* Planeta Tierra representativo */}
                      <ReferenceDot x={0} y={0} r={12} fill="#1d4ed8" stroke="#60a5fa" strokeWidth={2} />
                      <Scatter name="Nave Orion" data={results.orbit_tli} fill="#eab308" line={{stroke: '#eab308', strokeWidth: 2}} />
                    </ScatterChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="bg-slate-900 shadow-xl p-6 rounded-2xl border border-slate-800 flex flex-col">
                <h3 className="text-lg font-bold text-white mb-2">Descenso del Error Aleatorio</h3>
                <p className="text-xs text-slate-400 mb-6">Poder de convergencia de Newton-Raphson cayendo al cero.</p>
                <div className="h-64 mt-auto">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={results.history} margin={{ top: 10, right: 10, bottom: 20, left: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                      <XAxis dataKey="iter" stroke="#64748b">
                        <Label value="Iteración Computacional" offset={-15} position="insideBottom" fill="#94a3b8" fontSize={12} />
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
