import React from 'react';
import { Bus, Star, Search, Sparkles } from 'lucide-react';

interface HeaderProps {
  activeTab: 'all' | 'favorites';
  setActiveTab: (tab: 'all' | 'favorites') => void;
  favoritesCount: number;
  totalRoutesCount: number;
}

/**
 * Encabezado principal optimizado para pantallas de celular.
 * Permite cambiar con un solo toque entre todas las rutas y las favoritas.
 */
export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  favoritesCount,
  totalRoutesCount,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 px-4 pt-3 pb-3">
      <div className="max-w-md mx-auto">
        <div className="flex items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-amber-500 flex items-center justify-center text-slate-950 shadow-lg shadow-amber-500/20 font-black">
              <Bus className="w-6 h-6 stroke-[2.2]" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="font-black text-lg tracking-tight text-white uppercase">
                  PARO DE BUS
                </h1>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-500/15 text-amber-400 px-1.5 py-0.5 rounded border border-amber-500/30">
                  Cantonal
                </span>
              </div>
              <p className="text-xs text-slate-400 leading-none mt-0.5">
                Tarifas y paradas sin tener que andar preguntando
              </p>
            </div>
          </div>
        </div>

        {/* Selector de pestañas móvil con targets táctiles grandes (>= 44px) */}
        <div className="grid grid-cols-2 gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800/80">
          <button
            type="button"
            onClick={() => setActiveTab('all')}
            className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-semibold transition-all min-h-[42px] ${
              activeTab === 'all'
                ? 'bg-slate-800 text-amber-400 shadow-sm border border-slate-700'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Bus className="w-4 h-4" />
            <span>Todas las rutas</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                activeTab === 'all'
                  ? 'bg-amber-400/20 text-amber-300'
                  : 'bg-slate-800 text-slate-400'
              }`}
            >
              {totalRoutesCount}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('favorites')}
            className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-semibold transition-all min-h-[42px] ${
              activeTab === 'favorites'
                ? 'bg-amber-500 text-slate-950 shadow-md font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Star
              className={`w-4 h-4 ${
                activeTab === 'favorites'
                  ? 'fill-slate-950 text-slate-950'
                  : 'text-amber-400'
              }`}
            />
            <span>Mis Favoritas</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                activeTab === 'favorites'
                  ? 'bg-slate-950/25 text-slate-950'
                  : 'bg-slate-800 text-slate-400'
              }`}
            >
              {favoritesCount}
            </span>
          </button>
        </div>
      </div>
    </header>
  );
};
