import { useState, useEffect } from 'react';
import api from '../api';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';
import { AlertCircle } from 'lucide-react';

export default function Impulso() {
  const [formData, setFormData] = useState({
    t_max: 500,
    n: 100
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
      const resp = await api.post('/impulso', formData);
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
        <h2 className="text-3xl font-bold text-slate-100">Motor SLS Block 1 (Impulso)</h2>
        <p className="text-slate-400 mt-2">Integración Numérica mediante Regla de Simpson y Trapecio</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 space-y-6">
          <h3 className="text-xl font-bold text-orange-500">Configuración</h3>
          
          <div className="space-y-4">
            {Object.entries(formData).map(([k, v]) => (
              <div key={k}>
                <label className="block text-sm text-slate-400 mb-1 font-mono">{k}</label>
                <input 
                  type="text" 
                  name={k}
                  value={v} 
                  onChange={handleChange}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2 text-slate-100 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
                />
              </div>
            ))}
          </div>

          <button 
            onClick={calculate}
            disabled={loading}
            className="w-full bg-orange-600 hover:bg-orange-500 text-white font-bold py-3 rounded-lg transition-colors"
          >
            {loading ? 'Calculando...' : 'CALCULAR IMPULSO'}
          </button>

          {error && (
            <div className="p-4 bg-red-900/30 border border-red-800 rounded-lg text-red-400 flex items-start gap-3">
              <AlertCircle size={20} className="shrink-0 mt-0.5" />
              <span className="text-sm">{error}</span>
            </div>
          )}
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 flex flex-col justify-center">
              <span className="text-slate-400 text-sm uppercase font-bold tracking-wider">Impulso Simpson</span>
              <span className="text-3xl font-mono text-emerald-400 mt-2">
                {results ? results.imp_simpson.toFixed(4) : '—'} <span className="text-sm text-emerald-600">GN·s</span>
              </span>
            </div>
            <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 flex flex-col justify-center">
              <span className="text-slate-400 text-sm uppercase font-bold tracking-wider">Impulso Trapecio</span>
              <span className="text-3xl font-mono text-orange-400 mt-2">
                {results ? results.imp_trapecio.toFixed(4) : '—'} <span className="text-sm text-orange-600">GN·s</span>
              </span>
            </div>
          </div>

          {results && (
            <div className="bg-slate-900 p-6 rounded-xl border border-slate-800">
              <h3 className="text-lg font-bold text-slate-100 mb-4">Curva de Empuje F(t)</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={results.curve}>
                    <defs>
                      <linearGradient id="colorF" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f97316" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis dataKey="t" stroke="#94a3b8" />
                    <YAxis stroke="#94a3b8" />
                    <RechartsTooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b' }} />
                    <Area type="monotone" dataKey="F" stroke="#f97316" strokeWidth={3} fillOpacity={1} fill="url(#colorF)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
