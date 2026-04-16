import { useContext, useEffect, useState } from 'react';
import api from '../api';
import { ComposedChart, Line, Scatter, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Legend, Label } from 'recharts';
import { AlertCircle, Radio } from 'lucide-react';
import { SimulationContext } from '../context/SimulationContext';

export default function Telemetria() {
  const { telemetriaFromState, telemetriaResultsState } = useContext(SimulationContext);
  const [formData, setFormData] = telemetriaFromState;
  const [results, setResults] = telemetriaResultsState;
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const calculate = async () => {
    setLoading(true);
    setError('');
    try {
      const payload = {
        t_pts: formData.t_pts.split(',').map(n => parseFloat(n.trim())),
        d_pts: formData.d_pts.split(',').map(n => parseFloat(n.trim()))
      };
      const resp = await api.post('/telemetria', payload);
      setResults(resp.data);
    } catch (err) {
      setError(err.response?.data?.detail || err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!results) calculate();
  }, []);

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="flex items-center gap-4">
        <div className="p-3 bg-indigo-500/10 rounded-xl border border-indigo-500/20">
          <Radio className="text-indigo-400" size={32} />
        </div>
        <div>
          <h2 className="text-3xl font-bold text-white tracking-tight">Telemetría Espacial</h2>
          <p className="text-slate-400 mt-1 font-medium">Reconstrucción del camino interpolado al conectar silencios de radio terrestres.</p>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-slate-900 border border-slate-800 shadow-xl p-6 rounded-2xl flex flex-col gap-6">
          <h3 className="text-xl font-bold text-indigo-400">Datos Recibidos (DSN)</h3>
          
          <div className="space-y-5">
            <div>
              <label className="block text-sm text-slate-300 font-bold mb-1">Tiempos Registrados (X)</label>
              <input type="text" name="t_pts" value={formData.t_pts} onChange={handleChange} className="w-full bg-slate-950/50 border border-slate-700/80 rounded-xl px-4 py-2.5 text-slate-200 font-mono text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"/>
              <p className="text-xs text-slate-500 mt-1">Horas transcurridas de la misión. Los cortes de señal dejan huecos vacíos en estos datos (Separados por coma).</p>
            </div>
            
            <div>
              <label className="block text-sm text-slate-300 font-bold mb-1">Distancia Registrada (Y)</label>
              <input type="text" name="d_pts" value={formData.d_pts} onChange={handleChange} className="w-full bg-slate-950/50 border border-slate-700/80 rounded-xl px-4 py-2.5 text-slate-200 font-mono text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"/>
              <p className="text-xs text-slate-500 mt-1">Alejamiento desde la Tierra asociado a cada hora recibida. [Miles de kilómetros].</p>
            </div>
          </div>

          <button onClick={calculate} disabled={loading} className="w-full bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-indigo-500/20 transition-all mt-auto">
            {loading ? 'Calculando polinomio...' : 'INTERPOLAR MODELO'}
          </button>

          {error && <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 flex items-start gap-3"><AlertCircle size={20} className="shrink-0 mt-0.5"/><span className="text-sm">{error}</span></div>}
        </div>

        <div className="lg:col-span-2 space-y-6 flex flex-col">
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-slate-900 border border-slate-800 shadow-xl p-5 rounded-2xl">
              <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">Complejidad Geométrica</span>
              <div className="mt-2 text-2xl font-bold font-mono text-white">Grado {results ? results.degree : '—'}</div>
            </div>
            <div className="bg-slate-900 border border-slate-800 shadow-xl p-5 rounded-2xl">
              <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">Señales Físicas Base</span>
              <div className="mt-2 text-2xl font-bold font-mono text-white">{results ? results.points.length : '—'} Ecos</div>
            </div>
            <div className="bg-slate-900 border border-slate-800 shadow-xl p-5 rounded-2xl">
              <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">Predicción Mitad de Misión</span>
              <div className="mt-2 text-2xl font-bold font-mono text-indigo-400">{results ? results.midpoint.d.toFixed(1) : '—'} <span className="text-sm font-sans text-indigo-400/50">Mm</span></div>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 shadow-xl p-6 rounded-2xl flex-1 flex flex-col min-h-[400px]">
            <h3 className="text-lg font-bold text-white mb-2">Construcción Geométrica Analítica de Polinomio de Lagrange</h3>
            <p className="text-xs text-slate-400 mb-6">Muestra los ecos reales recolectados (Nodos Rojos) y cómo la curva matemática perfecta transita sobre ellos de forma limpia.</p>
            
            {results && (
              <div className="flex-1 mt-auto">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart margin={{ top: 10, right: 10, bottom: 20, left: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                    <XAxis dataKey="t" type="number" domain={['dataMin', 'dataMax']} stroke="#64748b" tick={{fill: '#64748b'}}>
                      <Label value="Tiempo Transcurrido (Horas de vuelo)" offset={-15} position="insideBottom" fill="#94a3b8" fontSize={12} />
                    </XAxis>
                    <YAxis dataKey="d" stroke="#64748b" tick={{fill: '#64748b'}}>
                       <Label value="Distancia hacia la Luna (Miles de km o Mm)" angle={-90} position="insideLeft" fill="#94a3b8" fontSize={12} style={{textAnchor: 'middle'}}/>
                    </YAxis>
                    <RechartsTooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '12px' }} itemStyle={{ color: '#e2e8f0' }}/>
                    <Legend wrapperStyle={{ paddingTop: '20px' }} />
                    <Line data={results.curve} type="monotone" dataKey="d" name="Curva Teórica (Lagrange)" stroke="#6366f1" strokeWidth={3} dot={false} />
                    <Scatter data={results.points} name="Puntos GPS Reales (Ecos DSN)" fill="#f43f5e" />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
