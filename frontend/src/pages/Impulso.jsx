import { useContext, useEffect, useState } from 'react';
import api from '../api';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Label } from 'recharts';
import { AlertCircle } from 'lucide-react';
import { SimulationContext } from '../context/SimulationContext';

export default function Impulso() {
  const { impulsoFromState, impulsoResultsState } = useContext(SimulationContext);
  const [formData, setFormData] = impulsoFromState;
  const [results, setResults] = impulsoResultsState;
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
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
    if (!results) calculate();
  }, []);

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header>
        <h2 className="text-3xl font-bold text-slate-100">Etapa Principal (Motor SLS)</h2>
        <p className="text-slate-400 mt-2">Integración de Simpson para descubrir exactamente cuánto momentum entrega el motor al cohete, eludiendo amortiguaciones atmosféricas complejas.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-slate-900 border border-slate-800 shadow-xl p-6 rounded-2xl flex flex-col gap-6">
          <h3 className="text-xl font-bold text-orange-500">Curva de Quemado</h3>
          
          <div className="space-y-5">
            <div>
              <label className="block text-sm text-slate-300 font-bold mb-1">Duración (t_max)</label>
              <input type="text" name="t_max" value={formData.t_max} onChange={handleChange} className="w-full bg-slate-950/50 border border-slate-700/80 rounded-xl px-4 py-2.5 text-slate-200 font-mono focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all"/>
              <p className="text-xs text-slate-500 mt-1">Segundos de escape encendido activo del cohete pesado SLS.</p>
            </div>
            
            <div>
              <label className="block text-sm text-slate-300 font-bold mb-1">Puntos de Muestreo Numérico (N)</label>
              <input type="text" name="n" value={formData.n} onChange={handleChange} className="w-full bg-slate-950/50 border border-slate-700/80 rounded-xl px-4 py-2.5 text-slate-200 font-mono focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all"/>
              <p className="text-xs text-slate-500 mt-1">Cuántas subdivisiones matemáticas (trapecios/parábolas) usará la computadora. Valores altos = más exactitud técnica.</p>
            </div>
          </div>

          <button onClick={calculate} disabled={loading} className="w-full bg-gradient-to-r from-orange-600 to-amber-500 hover:from-orange-500 hover:to-amber-400 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-orange-500/20 transition-all mt-auto">
            {loading ? 'Calculando Integrales...' : 'INTEGRAR IMPULSO'}
          </button>

          {error && <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 flex items-start gap-3"><AlertCircle size={20} className="shrink-0 mt-0.5"/><span className="text-sm">{error}</span></div>}
        </div>

        <div className="lg:col-span-2 space-y-6 flex flex-col">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-900 border border-slate-800 shadow-xl p-6 rounded-2xl flex flex-col">
              <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">Momento: Regla de Simpson (Refinada)</span>
              <div className="mt-2 text-3xl font-bold font-mono text-emerald-400">{results ? results.imp_simpson.toFixed(4) : '—'} <span className="text-sm font-sans text-emerald-400/50">GigaNewtons·s</span></div>
            </div>
            <div className="bg-slate-900 border border-slate-800 shadow-xl p-6 rounded-2xl flex flex-col">
              <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">Momento: Trapecio Simple (Ordinaria)</span>
              <div className="mt-2 text-3xl font-bold font-mono text-orange-400">{results ? results.imp_trapecio.toFixed(4) : '—'} <span className="text-sm font-sans text-orange-400/50">GigaNewtons·s</span></div>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 shadow-xl p-6 rounded-2xl flex-1 flex flex-col min-h-[400px]">
            <h3 className="text-lg font-bold text-white mb-2">Disipación Atmosférica del Motor</h3>
            <p className="text-xs text-slate-400 mb-6">El área coloreada total bajo esta curva modela la suma final de momento físico.</p>
            {results && (
              <div className="flex-1 mt-auto">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={results.curve} margin={{ top: 10, right: 10, bottom: 20, left: 20 }}>
                    <defs>
                      <linearGradient id="colorF" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f97316" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                    <XAxis dataKey="t" stroke="#64748b">
                      <Label value="Tiempo de Ignición [segundos]" offset={-15} position="insideBottom" fill="#94a3b8" fontSize={12} />
                    </XAxis>
                    <YAxis stroke="#64748b">
                      <Label value="Fuerza del Motor (MegaNewtons)" angle={-90} position="insideLeft" fill="#94a3b8" fontSize={12} style={{textAnchor: 'middle'}}/>
                    </YAxis>
                    <RechartsTooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '12px' }} />
                    <Area type="monotone" dataKey="F" stroke="#f97316" strokeWidth={3} fillOpacity={1} fill="url(#colorF)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
