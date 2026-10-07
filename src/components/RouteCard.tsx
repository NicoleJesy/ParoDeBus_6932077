import React from 'react';
import { BusRoute } from '../types/bus';
import { formatFare, formatDateSpanish } from '../utils/storage';
import { Star, MapPin, Clock, ArrowRight, DollarSign, Calendar, ChevronRight } from 'lucide-react';

interface RouteCardProps {
  route: BusRoute;
  isFavorite: boolean;
  onToggleFavorite: (routeId: string) => void;
  onSelectRoute: (route: BusRoute) => void;
  onOpenReportModal: (route: BusRoute) => void;
}

/**
 * Tarjeta de ruta de bus diseñada específicamente para vista de celular.
 * 
 * PUNTOS CRÍTICOS DONDE ALGUIEN SE EQUIVOCA:
 * 1. Propagación de eventos (Event Bubbling):
 *    El botón de estrella para favoritas y el botón de reportar precio están dentro
 *    de la tarjeta cliqueable. Si no se llama `e.stopPropagation()`, al tocar la estrella
 *    se abrirá también el modal de detalle de la ruta.
 * 2. Tamaños táctiles (Touch Targets):
 *    En celular los dedos son imprecisos. Los botones interactivos deben tener un área
 *    mínima de toque de 40-44px aunque el icono visual sea pequeño.
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
            // EVITA abrir el modal de detalles al tocar la estrella
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
      <div className="flex items-center gap-2 text-xs text-slate-300 mb-3 bg-slate-900/60 p-2.5 rounded-xl border border-slate-800">
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

      {/* Tarifa destacada y Horario */}
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
            // EVITA disparar la selección de tarjeta
            e.stopPropagation();
            onOpenReportModal(route);
          }}
          className="flex items-center gap-1 text-xs font-semibold px-3 py-2 bg-slate-700 hover:bg-slate-600 text-slate-200 hover:text-white rounded-xl transition-colors border border-slate-600/70"
        >
          <DollarSign className="w-3.5 h-3.5 text-amber-400" />
          <span>Reportar precio</span>
        </button>
      </div>

      {/* Pie de tarjeta: Última fecha de actualización de precio y sugerencia */}
      <div className="mt-2.5 flex items-center justify-between text-[11px] text-slate-400">
        <span className="flex items-center gap-1">
          <Calendar className="w-3 h-3 text-slate-400" />
          Precio al: {formatDateSpanish(route.lastPriceUpdateDate)}
        </span>
        <span className="flex items-center gap-0.5 text-amber-400/90 font-medium group-hover:translate-x-0.5 transition-transform">
          Ver paradas <ChevronRight className="w-3.5 h-3.5" />
        </span>
      </div>
    </article>
  );
};
