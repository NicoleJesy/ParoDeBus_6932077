import React from 'react';
import { BusRoute } from '../types/bus';
import { formatFare, formatDateSpanish } from '../utils/storage';
import { Star, MapPin, ArrowRight, DollarSign, Calendar, ChevronRight, Eye } from 'lucide-react';

interface RouteCardProps {
  route: BusRoute;
  isFavorite: boolean;
  onToggleFavorite: (routeId: string) => void;
  onSelectRoute: (route: BusRoute) => void;
  onOpenReportModal: (route: BusRoute) => void;
}

/**
 * Tarjeta de ruta de bus con previsualización fotográfica del lugar de destino.
 * 
 * PUNTOS CRÍTICOS DONDE ALGUIEN SE EQUIVOCA:
 * 1. Propagación de eventos (Event Bubbling):
 *    El botón de estrella para favoritas y el botón de reportar precio están dentro
 *    de la tarjeta cliqueable. Si no se llama `e.stopPropagation()`, al tocar la estrella
 *    se abrirá también el modal de detalle de la ruta.
 * 2. Carga de imágenes en móvil:
 *    Usar `referrerPolicy="no-referrer"` y `loading="lazy"` para ahorrar datos y evitar bloqueos.
 */
export const RouteCard: React.FC<RouteCardProps> = ({
  route,
  isFavorite,
  onToggleFavorite,
  onSelectRoute,
  onOpenReportModal,
}) => {
  return (
    <article
      onClick={() => onSelectRoute(route)}
      className="bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 hover:border-slate-600 rounded-2xl p-4 transition-all shadow-sm active:scale-[0.99] cursor-pointer group relative overflow-hidden"
    >
      {/* Indicador sutil de favorita en el borde izquierdo */}
      {isFavorite && (
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-amber-500 rounded-l" />
      )}

      {/* Cabecera de la tarjeta: Código de Ruta, Empresa y Botón Favorita */}
      <div className="flex items-start justify-between gap-3 mb-2.5">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center justify-center font-black text-xs px-2.5 py-1 bg-amber-500 text-slate-950 rounded-lg tracking-wider shadow-sm">
            {route.code}
          </span>
          <span className="text-xs text-slate-400 font-medium truncate max-w-[160px]">
            {route.company}
          </span>
        </div>

        {/* Botón de Favoritas con stopPropagation crítico */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite(route.id);
          }}
          aria-label={isFavorite ? 'Quitar de favoritas' : 'Guardar en favoritas'}
          className="min-w-[40px] min-h-[40px] flex items-center justify-center -mr-2 -mt-2 text-slate-400 hover:text-amber-400 rounded-xl transition-transform active:scale-90"
        >
          <Star
            className={`w-5 h-5 transition-colors ${
              isFavorite
                ? 'fill-amber-400 text-amber-400'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          />
        </button>
      </div>

      {/* Nombre principal de la ruta */}
      <h2 className="text-base font-bold text-white mb-2 leading-snug group-hover:text-amber-300 transition-colors">
        {route.name}
      </h2>

      {/* Trayecto: Origen -> Destino */}
      <div className="flex items-center gap-2 text-xs text-slate-300 mb-2.5 bg-slate-900/60 p-2.5 rounded-xl border border-slate-800">
        <div className="flex-1 truncate">
          <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">
            Origen
          </span>
          <span className="font-medium text-slate-200 truncate block">
            {route.origin}
          </span>
        </div>
        <ArrowRight className="w-4 h-4 text-amber-400 shrink-0" />
        <div className="flex-1 truncate">
          <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">
            Destino
          </span>
          <span className="font-medium text-slate-200 truncate block">
            {route.destination}
          </span>
        </div>
      </div>

      {/* Vista previa visual de cómo se ve el lugar de destino */}
      {route.destinationImageUrl && (
        <div className="mb-3 relative rounded-xl overflow-hidden border border-slate-700/60 bg-slate-950 group/img">
          <img
            src={route.destinationImageUrl}
            alt={`Lugar de destino: ${route.destination}`}
            referrerPolicy="no-referrer"
            loading="lazy"
            className="w-full h-24 sm:h-28 object-cover group-hover/img:scale-105 transition-transform duration-300 opacity-90 hover:opacity-100"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/20 to-transparent flex items-end p-2.5 justify-between">
            <span className="text-[11px] font-semibold text-slate-200 flex items-center gap-1 drop-shadow-sm truncate pr-2">
              <MapPin className="w-3 h-3 text-amber-400 shrink-0" />
              Destino: {route.destination}
            </span>
            <span className="text-[10px] bg-slate-900/90 text-amber-300 px-2 py-0.5 rounded-md font-bold shrink-0 flex items-center gap-1 border border-amber-500/30">
              <Eye className="w-3 h-3" />
              Ver foto
            </span>
          </div>
        </div>
      )}

      {/* Tarifa destacada y botón de reporte */}
      <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-700/60">
        <div>
          <span className="text-[11px] text-slate-400 block font-medium">
            Tarifa actual
          </span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-lg font-black text-amber-400">
              {formatFare(route.currentFare, route.currencySymbol)}
            </span>
            <span className="text-[11px] text-slate-400">
              ({route.stops.length} paradas)
            </span>
          </div>
        </div>

        {/* Botón de acción para reportar cambio de precio */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onOpenReportModal(route);
          }}
          className="flex items-center gap-1 text-xs font-semibold px-3 py-2 bg-slate-700 hover:bg-slate-600 text-slate-200 hover:text-white rounded-xl transition-colors border border-slate-600/70"
        >
          <DollarSign className="w-3.5 h-3.5 text-amber-400" />
          <span>Reportar precio</span>
        </button>
      </div>

      {/* Pie de tarjeta: Última fecha de actualización y ver paradas */}
      <div className="mt-2.5 flex items-center justify-between text-[11px] text-slate-400">
        <span className="flex items-center gap-1">
          <Calendar className="w-3 h-3 text-slate-400" />
          Precio al: {formatDateSpanish(route.lastPriceUpdateDate)}
        </span>
        <span className="flex items-center gap-0.5 text-amber-400/90 font-medium group-hover:translate-x-0.5 transition-transform">
          Ver paradas y fotos <ChevronRight className="w-3.5 h-3.5" />
        </span>
      </div>
    </article>
  );
};
