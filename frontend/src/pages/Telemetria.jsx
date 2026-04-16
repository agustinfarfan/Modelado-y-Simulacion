import { useState, useEffect } from 'react';
import api from '../api';
import { ComposedChart, Line, Scatter, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Legend } from 'recharts';
import { AlertCircle, Radio } from 'lucide-react';

export default function Telemetria() {
  const [formData, setFormData] = useState({
    t_pts: '0, 10, 24, 48, 72, 96',
    d_pts: '0, 38, 95, 201, 313, 384'
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [results, setResults] = useState(null);

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
    calculate();
  }, []);

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="flex items-center gap-4">
        <div className="p-3 bg-indigo-500/10 rounded-xl border border-indigo-500/20">
          <Radio className="text-indigo-400" size={32} />
        </div>
        <div>
          <h2 className="text-3xl font-bold text-white tracking-tight">Telemetría Espacial</h2>
          <p className="text-slate-400 mt-1 font-medium">Reconstrucción de trayectoria mediante Polinomio de Lagrange</p>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="bg-slate-900 border border-slate-800/80 p-6 rounded-2xl shadow-xl shadow-black/20 space-y-6">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">Puntos de Control</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-slate-400 mb-1.5 font-medium">Tiempos Registrados [h]</label>
              <input 
                type="text" 
                name="t_pts"
                value={formData.t_pts} 
                onChange={handleChange}
                className="w-full bg-slate-950/50 border border-slate-700/80 rounded-xl px-4 py-2.5 text-slate-200 font-mono text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
              />
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1.5 font-medium">Distancia Registrada [×10³ km]</label>
              <input 
                type="text" 
                name="d_pts"
                value={formData.d_pts} 
                onChange={handleChange}
                className="w-full bg-slate-950/50 border border-slate-700/80 rounded-xl px-4 py-2.5 text-slate-200 font-mono text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
              />
            </div>
          </div>

          <button 
            onClick={calculate}
            disabled={loading}
            className="w-full bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-indigo-500/20 transition-all"
          >
            {loading ? 'Calculando polinomio...' : 'INTERPOLAR DATOS'}
          </button>

          {error && (
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 flex items-start gap-3">
              <AlertCircle size={20} className="shrink-0 mt-0.5" />
              <span className="text-sm">{error}</span>
            </div>
          )}
        </div>

        <div className="lg:col-span-2 space-y-6 flex flex-col">
          {results && (
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-slate-900 border border-slate-800/80 p-5 rounded-2xl shadow-lg">
                <span className="text-slate-500 text-xs font-bold uppercase tracking-wider">Polinomio Resultante</span>
                <div className="mt-2 text-2xl font-bold text-white">Grado {results.degree}</div>
              </div>
              <div className="bg-slate-900 border border-slate-800/80 p-5 rounded-2xl shadow-lg">
                <span className="text-slate-500 text-xs font-bold uppercase tracking-wider">Nodos de Control</span>
                <div className="mt-2 text-2xl font-bold text-white">{results.points.length} Puntos</div>
              </div>
              <div className="bg-slate-900 border border-slate-800/80 p-5 rounded-2xl shadow-lg">
                <span className="text-slate-500 text-xs font-bold uppercase tracking-wider">Predicción Media ({results.midpoint.t.toFixed(1)}h)</span>
                <div className="mt-2 text-2xl font-bold text-indigo-400">{results.midpoint.d.toFixed(1)} <span className="text-sm font-medium text-indigo-400/50">Mm</span></div>
              </div>
            </div>
          )}

          <div className="bg-slate-900 border border-slate-800/80 p-6 rounded-2xl shadow-xl flex-1 flex flex-col min-h-[400px]">
            <h3 className="text-lg font-bold text-white mb-6">Modelo Geométrico Predictivo</h3>
            {results ? (
              <div className="flex-1 min-h-0">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                    <XAxis dataKey="t" type="number" domain={['dataMin', 'dataMax']} stroke="#64748b" tick={{fill: '#64748b'}} />
                    <YAxis dataKey="d" stroke="#64748b" tick={{fill: '#64748b'}} />
                    <RechartsTooltip 
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '12px', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} 
                      itemStyle={{ color: '#e2e8f0' }}
                    />
                    <Legend wrapperStyle={{ paddingTop: '20px' }} />
                    <Line data={results.curve} type="monotone" dataKey="d" name="Interpolación de Lagrange" stroke="#6366f1" strokeWidth={3} dot={false} />
                    <Scatter data={results.points} name="Puntos GPS Recibidos" fill="#f43f5e" />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center border-2 border-dashed border-slate-800/50 rounded-xl">
                <span className="text-slate-500 font-medium">Ejecute la interpolación para visualizar el modelo.</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
