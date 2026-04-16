import { useState, useEffect } from 'react';
import api from '../api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Cell } from 'recharts';
import { BarChart2 } from 'lucide-react';

const COLORS = ['#38bdf8', '#34d399', '#fb923c', '#c084fc'];

export default function Benchmark() {
  const [formData, setFormData] = useState({
    e: 0.999,
    M: 1.2,
    x0: 1.0,
    tol: 1e-12
  });
  
  const [loading, setLoading] = useState(false);
  const [chartData, setChartData] = useState([]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: parseFloat(e.target.value) || e.target.value });
  };

  const calculate = async () => {
    setLoading(true);
    try {
      const resp = await api.post('/benchmark', formData);
      const res = resp.data.results;
      
      const data = [
        { name: 'Bisección', iters: res.Biseccion?.error ? 0 : res.Biseccion?.length || 0 },
        { name: 'Newton-R', iters: res.Newton?.error ? 0 : res.Newton?.length || 0 },
        { name: 'Punto Fijo', iters: res.PuntoFijo?.error ? 0 : res.PuntoFijo?.length || 0 },
        { name: 'Aitken', iters: res.Aitken?.error ? 0 : res.Aitken?.length || 0 },
      ].filter(d => d.iters > 0);
      
      setChartData(data);
    } catch (err) {
      console.error(err);
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
        <div className="p-3 bg-rose-500/10 rounded-xl border border-rose-500/20">
          <BarChart2 className="text-rose-400" size={32} />
        </div>
        <div>
          <h2 className="text-3xl font-bold text-white tracking-tight">Benchmark de Eficiencia</h2>
          <p className="text-slate-400 mt-1 font-medium">Comparativa de iteraciones para tolerancias estrictas (1e-12)</p>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="bg-slate-900 border border-slate-800/80 p-6 rounded-2xl shadow-xl shadow-black/20 space-y-6">
          <h3 className="text-lg font-bold text-white">Casos de Estrés</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-slate-400 mb-1.5 font-medium">Excentricidad Orbital (e)</label>
              <input 
                type="text" 
                name="e"
                value={formData.e} 
                onChange={handleChange}
                className="w-full bg-slate-950/50 border border-slate-700/80 rounded-xl px-4 py-2.5 text-slate-200 font-mono focus:border-rose-500 focus:outline-none focus:ring-2 focus:ring-rose-500/20"
              />
              <p className="text-xs text-slate-500 mt-2">Valores cercanos a 1.0 dificultan la convergencia radicalmente.</p>
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1.5 font-medium">Tolerancia (Ceros sec.)</label>
              <input 
                type="text" 
                name="tol"
                value={formData.tol} 
                onChange={handleChange}
                className="w-full bg-slate-950/50 border border-slate-700/80 rounded-xl px-4 py-2.5 text-slate-200 font-mono focus:border-rose-500 focus:outline-none focus:ring-2 focus:ring-rose-500/20"
              />
            </div>
          </div>

          <button 
            onClick={calculate}
            disabled={loading}
            className="w-full bg-gradient-to-r from-rose-600 to-orange-600 hover:from-rose-500 hover:to-orange-500 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-rose-500/20 transition-all"
          >
            {loading ? 'Calculando...' : 'LANZAR BENCHMARK'}
          </button>
        </div>

        <div className="lg:col-span-2 bg-slate-900 border border-slate-800/80 p-6 rounded-2xl shadow-xl shadow-black/20 flex flex-col min-h-[400px]">
          <h3 className="text-lg font-bold text-white mb-6">Velocidad de Convergencia (Nº Iteraciones)</h3>
          
          {chartData.length > 0 ? (
            <div className="flex-1">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                  <XAxis dataKey="name" stroke="#64748b" tick={{fill: '#94a3b8', fontWeight: 600}} />
                  <YAxis stroke="#64748b" tick={{fill: '#64748b'}} />
                  <RechartsTooltip 
                    cursor={{fill: '#1e293b'}}
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '12px' }} 
                    itemStyle={{ color: '#e2e8f0', fontWeight: 'bold' }}
                  />
                  <Bar dataKey="iters" radius={[6, 6, 0, 0]}>
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
             <div className="flex-1 flex items-center justify-center border-2 border-dashed border-slate-800/50 rounded-xl">
               <span className="text-slate-500 font-medium">No hay datos que converjan (Cambia los parámetros).</span>
             </div>
          )}
        </div>
      </div>
    </div>
  );
}
