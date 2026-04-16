import { createContext, useState } from 'react';

export const SimulationContext = createContext();

export function SimulationProvider({ children }) {
  // Estados para Trayectoria
  const [trayectoriaForm, setTrayectoriaForm] = useState({ e: 0.967, M: 1.2, tol: 1e-10, altitud_parking: 200 });
  const [trayectoriaResults, setTrayectoriaResults] = useState(null);

  // Estados para Impulso
  const [impulsoForm, setImpulsoForm] = useState({ t_max: 500, n: 100 });
  const [impulsoResults, setImpulsoResults] = useState(null);

  // Estados para Telemetría
  const [telemetriaForm, setTelemetriaForm] = useState({ t_pts: '0, 10, 24, 48, 72, 96', d_pts: '0, 38, 95, 201, 313, 384' });
  const [telemetriaResults, setTelemetriaResults] = useState(null);

  // Estados para Convergencia
  const [convergenciaForm, setConvergenciaForm] = useState({ e: 0.967, M: 1.2, x0: 1.0, tol: 1e-8 });
  const [convergenciaResults, setConvergenciaResults] = useState(null);

  // Estados para Benchmark
  const [benchmarkForm, setBenchmarkForm] = useState({ e: 0.999, M: 1.2, x0: 1.0, tol: 1e-12 });
  const [benchmarkResults, setBenchmarkResults] = useState([]);

  return (
    <SimulationContext.Provider value={{
      trayectoriaFromState: [trayectoriaForm, setTrayectoriaForm],
      trayectoriaResultsState: [trayectoriaResults, setTrayectoriaResults],
      
      impulsoFromState: [impulsoForm, setImpulsoForm],
      impulsoResultsState: [impulsoResults, setImpulsoResults],
      
      telemetriaFromState: [telemetriaForm, setTelemetriaForm],
      telemetriaResultsState: [telemetriaResults, setTelemetriaResults],
      
      convergenciaFromState: [convergenciaForm, setConvergenciaForm],
      convergenciaResultsState: [convergenciaResults, setConvergenciaResults],
      
      benchmarkFromState: [benchmarkForm, setBenchmarkForm],
      benchmarkResultsState: [benchmarkResults, setBenchmarkResults],
    }}>
      {children}
    </SimulationContext.Provider>
  );
}
