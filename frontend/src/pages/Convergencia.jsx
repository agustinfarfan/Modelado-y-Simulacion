import { useContext, useEffect, useState } from 'react';
import api from '../api';
import { Target } from 'lucide-react';
import { SimulationContext } from '../context/SimulationContext';

export default function Convergencia() {
  const { convergenciaFromState, convergenciaResultsState } = useContext(SimulationContext);
  // Usa los mismos form default que benchmark a nivel local o mantenemos sincronía, pero el layout ya estaba
  const [formData, setFormData] = convergenciaFromState;
  const [results, setResults] = convergenciaResultsState;
  const [loading, setLoading] = useState(false);

  // Auto update function doesn't need to be tightly coupled if we use the same variables.
  // Actually, we use the original logic setup.
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
    if(!results) calculate();
  }, []);

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="flex items-center gap-4">
        <div className="p-3 bg-teal-500/10 rounded-xl border border-teal-500/20">
          <Target className="text-teal-400" size={32} />
        </div>
        <div>
          <h2 className="text-3xl font-bold text-white tracking-tight">Trazas de Convergencia Interna</h2>
          <p className="text-slate-400 mt-1 font-medium">Observación cruda de las matrices algebraicas iterativas en memoria (Para uso de depuración o investigación).</p>
        </div>
      </header>
      
      <div className="bg-slate-900 border border-slate-800 shadow-xl p-4 rounded-xl flex flex-col sm:flex-row items-center gap-4">
          <p className="text-sm text-slate-400 flex-1">
             <span className="font-bold text-teal-400">Modo Administrador:</span> Estas tablas proyectan cada paso lógico que dieron los algoritmos hasta estabilizarse. Bisección puede tomar decenas de pasos mientras que Newton converge masivamente en 4, demostrando su fuerza numérica real en la ecuación orbital.
          </p>
      </div>

      {results && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-12">
          <MethodTable name="Bisección (Lento)" color="text-blue-400" data={results.Biseccion} cols={["iter", "a", "b", "c", "fc", "error"]} />
          <MethodTable name="Newton-Raphson (Derivada)" color="text-emerald-400" data={results.Newton} cols={["iter", "xn", "fxn", "dfxn", "xnew", "error"]} />
          <MethodTable name="Punto Fijo (Básico)" color="text-orange-400" data={results.PuntoFijo} cols={["iter", "xn", "xnew", "error"]} />
          <MethodTable name="Aceleración Steffensen / Aitken Δ²" color="text-purple-400" data={results.Aitken} cols={["iter", "xn", "x1", "x2", "xnew", "error"]} />
        </div>
      )}
    </div>
  );
}

function MethodTable({ name, color, data, cols }) {
  if (data?.error) {
    return (
      <div className="bg-slate-900 border border-slate-800 shadow-xl rounded-2xl p-6 flex flex-col justify-center items-center text-center">
        <h3 className={`text-lg font-bold ${color}`}>{name}</h3>
        <p className="text-red-400 mt-2 font-mono bg-red-950/50 p-2 rounded w-full border border-red-900/50">{data.error}</p>
        <p className="text-xs text-slate-500 mt-4">Este método falló estrepitosamente debido a las condiciones iniciales (Probable Derivada Cero en Newton o Rebote Infinito en Punto Fijo).</p>
      </div>
    );
  }

  return (
    <div className="bg-slate-900 border border-slate-800 shadow-xl rounded-2xl overflow-hidden flex flex-col h-[400px]">
      <div className="p-4 border-b border-slate-800/80 bg-slate-900 shrink-0">
        <h3 className={`font-bold ${color}`}>{name}</h3>
      </div>
      <div className="flex-1 overflow-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-slate-500 uppercase bg-slate-950 sticky top-0 shadow-lg z-10">
            <tr>{cols.map(c => <th key={c} className="px-4 py-3 font-mono border-b border-slate-800">{c}</th>)}</tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {data?.map((row, i) => (
              <tr key={i} className="hover:bg-slate-800/50 transition-colors">
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
