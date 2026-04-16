import { useState, useEffect } from 'react';
import api from '../api';
import { LineChart, Line, ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { AlertCircle } from 'lucide-react';

export default function Trayectoria() {
  const [formData, setFormData] = useState({
    altitud_parking: 200,
    e: 0.967,
    M: 1.2,
    tol: 1e-10
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [results, setResults] = useState(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: parseFloat(e.target.value) || e.target.value });
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
    calculate();
  }, []);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <header>
        <h2 className="text-3xl font-bold text-slate-100">Trayectoria Orbital (Kepler)</h2>
        <p className="text-slate-400 mt-2">Búsqueda de la Anomalía Excéntrica (E) vía Newton-Raphson</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Controls */}
        <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 space-y-6">
          <h3 className="text-xl font-bold text-cyan-400">Parámetros</h3>
          
          <div className="space-y-4">
            {Object.entries(formData).map(([k, v]) => (
              <div key={k}>
                <label className="block text-sm text-slate-400 mb-1 font-mono">{k}</label>
                <input 
                  type="text" 
                  name={k}
                  value={v} 
                  onChange={handleChange}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2 text-slate-100 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                />
              </div>
            ))}
          </div>

          <button 
            onClick={calculate}
            disabled={loading}
            className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-3 rounded-lg transition-colors"
          >
            {loading ? 'Calculando...' : 'SIMULAR'}
          </button>

          {error && (
            <div className="p-4 bg-red-900/30 border border-red-800 rounded-lg text-red-400 flex items-start gap-3">
              <AlertCircle size={20} className="shrink-0 mt-0.5" />
              <span className="text-sm">{error}</span>
            </div>
          )}

          <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700/50 text-sm">
            <span className="text-cyan-400 font-bold">Newton-Raphson:</span> Resuelve E - e*sin(E) - M = 0 para encontrar la anomalía excéntrica.
          </div>
        </div>

        {/* Results */}
        <div className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 flex flex-col justify-center">
              <span className="text-slate-400 text-sm uppercase font-bold tracking-wider">Anomalía Excéntrica</span>
              <span className="text-3xl font-mono text-cyan-400 mt-2">
                {results ? results.E_sol.toFixed(8) : '—'} <span className="text-sm text-cyan-600">rad</span>
              </span>
            </div>
            <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 flex flex-col justify-center">
              <span className="text-slate-400 text-sm uppercase font-bold tracking-wider">Delta-V Necesario</span>
              <span className="text-3xl font-mono text-orange-400 mt-2">
                {results ? results.dv.toFixed(4) : '—'} <span className="text-sm text-orange-600">km/s</span>
              </span>
            </div>
          </div>

          {results && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-slate-900 p-6 rounded-xl border border-slate-800">
                <h3 className="text-lg font-bold text-slate-100 mb-4">Error vs Iteración</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={results.history}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                      <XAxis dataKey="iter" stroke="#94a3b8" />
                      <YAxis scale="log" domain={['auto', 'auto']} stroke="#94a3b8" />
                      <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b' }} />
                      <Line type="monotone" dataKey="error" stroke="#06b6d4" strokeWidth={3} dot={{ fill: '#06b6d4' }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
              <div className="bg-slate-900 p-6 rounded-xl border border-slate-800">
                <h3 className="text-lg font-bold text-slate-100 mb-4">Órbita de Transferencia</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <ScatterChart>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                      <XAxis dataKey="x" type="number" stroke="#94a3b8" tick={{fontSize: 10}} />
                      <YAxis dataKey="y" type="number" stroke="#94a3b8" tick={{fontSize: 10}} />
                      <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b' }} />
                      <Scatter name="Orbit" data={results.orbit_tli} fill="#eab308" line={{stroke: '#eab308', strokeWidth: 2}} />
                    </ScatterChart>
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
