import React, { useEffect } from 'react';
import { BusRoute } from '../types/bus';
import { formatFare, formatDateSpanish } from '../utils/storage';
import {
  X,
  Star,
  MapPin,
  Clock,
  Building,
  DollarSign,
  Calendar,
  AlertCircle,
  History,
} from 'lucide-react';

interface RouteDetailModalProps {
  route: BusRoute | null;
  onClose: () => void;
  isFavorite: boolean;
  onToggleFavorite: (routeId: string) => void;
  onOpenReportModal: (route: BusRoute) => void;
}

/**
 * Modal deslizable o vista detallada para consultar una ruta completa con sus paradas y tarifa.
 * 
 * PUNTOS CRÍTICOS DONDE ALGUIEN SE EQUIVOCA:
 * 1. Bloqueo de scroll en el body (Scroll Lock):
 *    Cuando un modal se abre en un navegador móvil, si no bloqueas el overflow del body,
 *    el usuario hace scroll y se mueve la lista de abajo en lugar del contenido del modal.
 * 2. Cierre accesible con tecla 'Escape':
 *    Fundamental para accesibilidad y usabilidad rápida.
 */
export const RouteDetailModal: React.FC<RouteDetailModalProps> = ({
  route,
  onClose,
  isFavorite,
  onToggleFavorite,
  onOpenReportModal,
}) => {
  // Manejo de bloqueo de scroll del body y tecla Escape
  useEffect(() => {
    if (!route) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [route, onClose]);

  if (!route) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="route-modal-title"
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200"
    >
      {/* Fondo clicable para cerrar */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Contenedor del Modal / Hoja inferior */}
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-700/80 rounded-t-3xl sm:rounded-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden z-10 animate-in slide-in-from-bottom duration-200">
        
        {/* Barra superior de arrastre móvil y acciones */}
        <div className="sticky top-0 bg-slate-900/95 backdrop-blur-md px-5 pt-4 pb-3 border-b border-slate-800 z-10">
          <div className="w-12 h-1.5 bg-slate-700 rounded-full mx-auto mb-3 sm:hidden" />
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="font-black text-sm px-2.5 py-1 bg-amber-500 text-slate-950 rounded-lg">
                {route.code}
              </span>
              <button
                type="button"
                onClick={() => onToggleFavorite(route.id)}
                className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
              >
                <Star
                  className={`w-4 h-4 ${
                    isFavorite
                      ? 'fill-amber-400 text-amber-400'
                      : 'text-slate-400'
                  }`}
                />
                <span>{isFavorite ? 'En Favoritas' : 'Guardar favorita'}</span>
              </button>
            </div>

            <button
              type="button"
              onClick={onClose}
              aria-label="Cerrar modal"
              className="w-9 h-9 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <h2
            id="route-modal-title"
            className="text-lg font-bold text-white mt-2 leading-tight"
          >
            {route.name}
          </h2>
        </div>

        {/* Contenido scrolleable del modal */}
        <div className="overflow-y-auto px-5 py-4 space-y-5 flex-1">
          {/* Bloque principal de Tarifa Actual */}
          <div className="bg-gradient-to-br from-amber-500/15 via-slate-800 to-slate-850 border border-amber-500/30 rounded-2xl p-4 flex items-center justify-between gap-4">
            <div>
              <span className="text-xs uppercase tracking-wider font-bold text-amber-400 block mb-0.5">
                Tarifa Vigente
              </span>
              <div className="text-3xl font-black text-white tracking-tight">
                {formatFare(route.currentFare, route.currencySymbol)}
              </div>
              <p className="text-[11px] text-slate-300 mt-0.5 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-amber-400" />
                Registrado al: {formatDateSpanish(route.lastPriceUpdateDate)}
              </p>
            </div>

            <button
              type="button"
              onClick={() => onOpenReportModal(route)}
              className="shrink-0 flex items-center gap-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-3.5 py-2.5 rounded-xl shadow-md transition-all active:scale-95 text-xs"
            >
              <DollarSign className="w-4 h-4 stroke-[2.5]" />
              <span>Reportar cambio</span>
            </button>
          </div>

          {/* Información operativa de la ruta (Horario y Empresa) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700/60 flex items-start gap-2.5">
              <Clock className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <span className="text-slate-400 font-medium block">Horario & Frecuencia</span>
                <span className="font-semibold text-slate-100">{route.scheduleSummary}</span>
              </div>
            </div>

            <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700/60 flex items-start gap-2.5">
              <Building className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <span className="text-slate-400 font-medium block">Empresa Concesionaria</span>
                <span className="font-semibold text-slate-100">{route.company}</span>
              </div>
            </div>
          </div>

          {/* Lista interactiva de Paradas (Función 1) */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <MapPin className="w-4 h-4 text-amber-400" />
                Paradas del recorrido ({route.stops.length})
              </h3>
              <span className="text-[11px] text-slate-400">
                En orden de avance
              </span>
            </div>

            <div className="relative pl-6 space-y-4 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-700">
              {route.stops.map((stop, index) => {
                const isFirst = index === 0;
                const isLast = index === route.stops.length - 1;

                return (
                  <div key={stop.id} className="relative flex items-start gap-3">
                    {/* Punto indicador de la línea */}
                    <div
                      className={`absolute -left-6 top-1 w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px] ring-4 ring-slate-900 ${
                        isFirst
                          ? 'bg-emerald-500 text-slate-950 ring-emerald-500/20'
                          : isLast
                          ? 'bg-rose-500 text-white ring-rose-500/20'
                          : 'bg-slate-700 text-slate-200'
                      }`}
                    >
                      {stop.order}
                    </div>

                    <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-3 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-bold text-sm text-slate-100">
                          {stop.name}
                        </span>
                        {isFirst && (
                          <span className="text-[10px] font-bold px-1.5 py-0.5 bg-emerald-500/20 text-emerald-400 rounded">
                            Salida
                          </span>
                        )}
                        {isLast && (
                          <span className="text-[10px] font-bold px-1.5 py-0.5 bg-rose-500/20 text-rose-400 rounded">
                            Llegada
                          </span>
                        )}
                      </div>
                      {stop.landmark && (
                        <p className="text-xs text-slate-400 mt-1 flex items-center gap-1 font-medium">
                          <span className="text-amber-400">Punto:</span> {stop.landmark}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Historial de cambios de precio reportados */}
          <div className="pt-2 border-t border-slate-800">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <History className="w-3.5 h-3.5 text-amber-400" />
              Historial de cambios reportados ({route.priceReports.length})
            </h3>

            {route.priceReports.length === 0 ? (
              <p className="text-xs text-slate-500 italic bg-slate-800/30 p-3 rounded-xl border border-slate-800">
                No hay cambios de precio registrados aún para esta ruta.
              </p>
            ) : (
              <div className="space-y-2">
                {route.priceReports.map((report) => (
                  <div
                    key={report.id}
                    className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-2.5 text-xs flex items-center justify-between gap-2"
                  >
                    <div>
                      <div className="flex items-center gap-1.5 font-semibold text-slate-200">
                        <span>Anterior: {formatFare(report.oldFare, route.currencySymbol)}</span>
                        <span className="text-slate-500">➔</span>
                        <span className="text-amber-400 font-bold">
                          Nuevo: {formatFare(report.newFare, route.currencySymbol)}
                        </span>
                      </div>
                      {report.note && (
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          "{report.note}"
                        </p>
                      )}
                    </div>
                    <span className="text-[11px] text-slate-400 shrink-0 font-medium">
                      {formatDateSpanish(report.effectiveDate)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Botón inferior fijo de cierre rápido */}
        <div className="p-4 bg-slate-900 border-t border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-xl transition-colors text-sm"
          >
            Volver a la lista
          </button>
        </div>
      </div>
    </div>
  );
};
