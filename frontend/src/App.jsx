import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar.jsx';
import Trayectoria from './pages/Trayectoria.jsx';
import Impulso from './pages/Impulso.jsx';
import Telemetria from './pages/Telemetria.jsx';
import Convergencia from './pages/Convergencia.jsx';
import Benchmark from './pages/Benchmark.jsx';
import { SimulationProvider } from './context/SimulationContext.jsx';

function App() {
  return (
    <SimulationProvider>
      <BrowserRouter>
      <div className="flex h-screen overflow-hidden bg-slate-950 text-slate-200 selection:bg-cyan-500/30 font-sans">
        <Sidebar />
        <main className="flex-1 overflow-y-auto p-4 sm:p-8 lg:p-12 relative">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-cyan-900/10 via-slate-950 to-slate-950 pointer-events-none -z-10"></div>
          <Routes>
            <Route path="/" element={<Navigate to="/trayectoria" replace />} />
            <Route path="/trayectoria" element={<Trayectoria />} />
            <Route path="/impulso" element={<Impulso />} />
            <Route path="/telemetria" element={<Telemetria />} />
            <Route path="/convergencia" element={<Convergencia />} />
            <Route path="/benchmark" element={<Benchmark />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  </SimulationProvider>
  );
}

export default App;
