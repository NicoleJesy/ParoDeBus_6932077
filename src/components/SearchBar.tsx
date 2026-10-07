import React from 'react';
import { Search, X, MapPin } from 'lucide-react';

interface SearchBarProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onSelectQuickFilter: (tag: string) => void;
}

const QUICK_TAGS = ['EBAIS', 'Hospital', 'Parque', 'Terminal', 'Mercado', 'Colegio'];

export const SearchBar: React.FC<SearchBarProps> = ({
  searchQuery,
  setSearchQuery,
  onSelectQuickFilter,
}) => {
  return (
    <div className="space-y-2 mb-3">
      {/* Campo de búsqueda con botón de limpieza */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
          <Search className="w-4 h-4" />
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Buscar por ruta, destino o parada (ej: EBAIS)..."
          className="w-full pl-10 pr-10 py-2.5 bg-slate-800/90 border border-slate-700/80 rounded-xl text-sm text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all shadow-inner"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => setSearchQuery('')}
            aria-label="Limpiar búsqueda"
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-200"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Atajos rápidos de paradas cantonales comunes */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs no-scrollbar">
        <span className="text-[11px] font-medium text-slate-400 flex items-center gap-1 shrink-0">
          <MapPin className="w-3 h-3 text-amber-400" />
          Frecuentes:
        </span>
        {QUICK_TAGS.map((tag) => {
          const isActive = searchQuery.toLowerCase() === tag.toLowerCase();
          return (
            <button
              key={tag}
              type="button"
              onClick={() => onSelectQuickFilter(isActive ? '' : tag)}
              className={`shrink-0 px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                isActive
                  ? 'bg-amber-500 text-slate-950 font-semibold'
                  : 'bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700/60'
              }`}
            >
              {tag}
            </button>
          );
        })}
      </div>
    </div>
  );
};
