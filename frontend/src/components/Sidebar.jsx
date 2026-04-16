import { NavLink } from 'react-router-dom';
import { Rocket, Flame, Radio, Target, BarChart2 } from 'lucide-react';

export default function Sidebar() {
  const links = [
    { to: '/trayectoria', icon: <Rocket size={18} />, label: 'Trayectoria Orbital' },
    { to: '/impulso', icon: <Flame size={18} />, label: 'Impulso Motor' },
    { to: '/telemetria', icon: <Radio size={18} />, label: 'Telemetría DSN' },
    { to: '/convergencia', icon: <Target size={18} />, label: 'Convergencia' },
    { to: '/benchmark', icon: <BarChart2 size={18} />, label: 'Benchmark' },
  ];

  return (
    <aside className="w-72 bg-slate-900 border-r border-slate-800/80 flex flex-col shrink-0 relative z-10 shadow-2xl shadow-black">
      <div className="p-8 border-b border-slate-800/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
            <Rocket className="text-white" size={22} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight">ARTEMIS II</h1>
            <p className="text-[10px] text-cyan-400/80 font-mono tracking-wider uppercase">Simulador Científico</p>
          </div>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-2 mt-2">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-300 font-medium relative overflow-hidden group ${
                isActive 
                  ? 'bg-slate-800/80 text-white shadow-md shadow-black/20' 
                  : 'text-slate-400 hover:bg-slate-800/40 hover:text-slate-200'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <div className={`relative z-10 transition-colors duration-300 ${isActive ? 'text-cyan-400' : 'group-hover:text-cyan-400'}`}>
                  {link.icon}
                </div>
                <span className="relative z-10 text-sm tracking-wide">{link.label}</span>
                {isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-8 bg-gradient-to-b from-cyan-400 to-blue-500 rounded-r-full shadow-[0_0_10px_rgba(34,211,238,0.5)]" />
                )}
              </>
            )}
          </NavLink>
        ))}
      </div>
      
      <div className="p-6 border-t border-slate-800/50 bg-slate-900/50">
        <div className="flex items-center gap-3 px-2">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[11px] font-medium text-slate-400 tracking-wider">Módulos en línea</span>
        </div>
      </div>
    </aside>
  );
}
