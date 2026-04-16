import { useContext, useEffect, useState } from 'react';
import api from '../api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Cell, Label } from 'recharts';
import { BarChart2, AlertCircle } from 'lucide-react';
import { SimulationContext } from '../context/SimulationContext';

const COLORS = ['#38bdf8', '#34d399', '#fb923c', '#c084fc'];

export default function Benchmark() {
  const { benchmarkFromState, benchmarkResultsState } = useContext(SimulationContext);
  const [formData, setFormData] = benchmarkFromState;
  const [chartData, setChartData] = benchmarkResultsState;
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const calculate = async () => {
    setLoading(true);
    setError('');
    try {
      const resp = await api.post('/benchmark', formData);
      const res = resp.data.results;
      
      const data = [
        { name: 'Bisección', iters: res.Biseccion?.error ? 0 : res.Biseccion?.length || 0, color: '#38bdf8' },
        { name: 'Newton-R', iters: res.Newton?.error ? 0 : res.Newton?.length || 0, color: '#34d399' },
        { name: 'Punto Fijo', iters: res.PuntoFijo?.error ? 0 : res.PuntoFijo?.length || 0, color: '#fb923c' },
        { name: 'Aitken', iters: res.Aitken?.error ? 0 : res.Aitken?.length || 0, color: '#c084fc' },
      ].filter(d => d.iters > 0);
      
      setChartData(data);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.detail || err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (chartData.length === 0) calculate();
  }, []);

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="flex items-center gap-4">
        <div className="p-3 bg-rose-500/10 rounded-xl border border-rose-500/20">
          <BarChart2 className="text-rose-400" size={32} />
        </div>
        <div>
          <h2 className="text-3xl font-bold text-white tracking-tight">Análisis de Rendimiento (Benchmark)</h2>
          <p className="text-slate-400 mt-1 font-medium">Sometiendo a estrés computacional a los algoritmos para descubrir cuán rápidos son buscando raíces frente a tolerancias microscópicas.</p>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-slate-900 border border-slate-800 shadow-xl p-6 rounded-2xl flex flex-col gap-6">
          <h3 className="text-xl font-bold text-rose-500">Casos de Estrés</h3>
          
          <div className="space-y-5">
            <div>
              <label className="block text-sm text-slate-300 font-bold mb-1">Excentricidad Orbital (e)</label>
              <input type="text" name="e" value={formData.e} onChange={handleChange} className="w-full bg-slate-950/50 border border-slate-700/80 rounded-xl px-4 py-2.5 text-slate-200 font-mono focus:border-rose-500 focus:ring-1 focus:ring-rose-500 transition-all"/>
              <p className="text-xs text-slate-500 mt-1">Los valores extremos cercanos a 1.0 (Órbita parabólica) rompen la estabilidad de muchos métodos tradicionales. Pruébalo usando e=0.999.</p>
            </div>
            <div>
              <label className="block text-sm text-slate-300 font-bold mb-1">Tolerancia de Máquina</label>
              <input type="text" name="tol" value={formData.tol} onChange={handleChange} className="w-full bg-slate-950/50 border border-slate-700/80 rounded-xl px-4 py-2.5 text-slate-200 font-mono focus:border-rose-500 focus:ring-1 focus:ring-rose-500 transition-all"/>
              <p className="text-xs text-slate-500 mt-1">Nivel exigido de precisión (Ej: 1e-12 pide tener 12 ceros correctos después de la coma decimal).</p>
            </div>
          </div>

          <button onClick={calculate} disabled={loading} className="w-full bg-gradient-to-r from-rose-600 to-orange-600 hover:from-rose-500 hover:to-orange-500 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-rose-500/20 transition-all mt-auto">
            {loading ? 'Calculando Velocidades...' : 'LANZAR BENCHMARK'}
          </button>

          {error && <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 flex items-start gap-3"><AlertCircle size={20} className="shrink-0 mt-0.5"/><span className="text-sm">{error}</span></div>}
        </div>

        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 shadow-xl p-6 rounded-2xl flex flex-col min-h-[400px]">
          <h3 className="text-lg font-bold text-white mb-2">Poder de Convergencia (Puntuación de Eficiencia)</h3>
          <p className="text-xs text-slate-400 mb-6">Entre MENOS iteraciones requiera un método, más POTENTE y veloz es para procesarse a bordo de Artemis. (Si un método falta, significa que fue destruido y no convergió).</p>
          
          {chartData.length > 0 ? (
            <div className="flex-1 mt-auto">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 20, right: 30, left: 10, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                  <XAxis dataKey="name" stroke="#64748b" tick={{fill: '#94a3b8', fontWeight: 600}}>
                     <Label value="Algoritmo" offset={-15} position="insideBottom" fill="#94a3b8" fontSize={12} />
                  </XAxis>
                  <YAxis stroke="#64748b" tick={{fill: '#64748b'}}>
                     <Label value="Ciclos u Operaciones Requeridas" angle={-90} position="insideLeft" fill="#94a3b8" fontSize={12} style={{textAnchor: 'middle'}}/>
                  </YAxis>
                  <RechartsTooltip cursor={{fill: '#1e293b'}} contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '12px' }} itemStyle={{ color: '#e2e8f0', fontWeight: 'bold' }}/>
                  <Bar dataKey="iters" radius={[6, 6, 0, 0]}>
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
             <div className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-red-900/50 bg-red-950/20 rounded-xl p-6">
               <AlertCircle className="text-red-500 mb-2" size={40} />
               <span className="text-red-300 font-medium text-center">Fallo Crítico: Los algoritmos jamás encontraron la respuesta con esta configuración y excedieron el Tiemout máximo de iteraciones.</span>
             </div>
          )}
        </div>
      </div>
    </div>
  );
}
