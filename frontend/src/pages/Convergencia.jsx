import { useState, useEffect } from 'react';
import api from '../api';
import { Target } from 'lucide-react';

export default function Convergencia() {
  const [formData, setFormData] = useState({
    e: 0.967,
    M: 1.2,
    x0: 1.0,
    tol: 1e-8
  });
  
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);

  const calculate = async () => {
    setLoading(true);
    try {
      const resp = await api.post('/benchmark', formData);
      setResults(resp.data.results);
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
        <div className="p-3 bg-teal-500/10 rounded-xl border border-teal-500/20">
          <Target className="text-teal-400" size={32} />
        </div>
        <div>
          <h2 className="text-3xl font-bold text-white tracking-tight">Trazas de Convergencia</h2>
          <p className="text-slate-400 mt-1 font-medium">Tablas analíticas de iteraciones para la Ecuación de Kepler</p>
        </div>
      </header>

      {results && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <MethodTable 
            name="Bisección" 
            color="text-blue-400"
            data={results.Biseccion} 
            cols={["iter", "a", "b", "c", "fc", "error"]} 
          />
          <MethodTable 
            name="Newton-Raphson" 
            color="text-emerald-400"
            data={results.Newton} 
            cols={["iter", "xn", "fxn", "dfxn", "xnew", "error"]} 
          />
          <MethodTable 
            name="Punto Fijo" 
            color="text-orange-400"
            data={results.PuntoFijo} 
            cols={["iter", "xn", "xnew", "error"]} 
          />
          <MethodTable 
            name="Aceleración de Steffensen (Aitken Δ²)" 
            color="text-purple-400"
            data={results.Aitken} 
            cols={["iter", "xn", "x1", "x2", "xnew", "error"]} 
          />
        </div>
      )}
    </div>
  );
}

function MethodTable({ name, color, data, cols }) {
  if (data?.error) {
    return (
      <div className="bg-slate-900 border border-slate-800/80 rounded-2xl p-6 shadow-xl flex flex-col justify-center items-center text-center">
        <h3 className={`text-lg font-bold ${color}`}>{name}</h3>
        <p className="text-red-400 mt-2">{data.error}</p>
      </div>
    );
  }

  return (
    <div className="bg-slate-900 border border-slate-800/80 rounded-2xl shadow-xl overflow-hidden flex flex-col h-[400px]">
      <div className="p-4 border-b border-slate-800/50 bg-slate-900/50">
        <h3 className={`font-bold ${color}`}>{name}</h3>
      </div>
      <div className="flex-1 overflow-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-slate-500 uppercase bg-slate-950/50 sticky top-0 backdrop-blur-md">
            <tr>
              {cols.map(c => <th key={c} className="px-4 py-3 font-mono">{c}</th>)}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/50">
            {data?.map((row, i) => (
              <tr key={i} className="hover:bg-slate-800/30 transition-colors">
                {cols.map(c => (
                  <td key={c} className="px-4 py-2.5 font-mono text-slate-300">
                    {typeof row[c] === 'number' ? row[c].toExponential(4) : row[c]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
