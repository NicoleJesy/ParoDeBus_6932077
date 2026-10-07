/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { BusRoute, PriceReport } from './types/bus';
import {
  loadMergedRoutes,
  getSavedFavoriteIds,
  toggleFavoriteId,
  savePriceReport,
  formatFare,
  formatDateSpanish,
} from './utils/storage';
import { Header } from './components/Header';
import { SearchBar } from './components/SearchBar';
import { RouteCard } from './components/RouteCard';
import { RouteDetailModal } from './components/RouteDetailModal';
import { PriceReportModal } from './components/PriceReportModal';
import { Bus, Star, Search, AlertCircle, CheckCircle, Info } from 'lucide-react';

export default function App() {
  // Estado de las rutas fusionadas con los reportes locales
  const [routes, setRoutes] = useState<BusRoute[]>(() => loadMergedRoutes());

  // Estado de IDs de rutas favoritas
  const [favoriteIds, setFavoriteIds] = useState<string[]>(() => getSavedFavoriteIds());

  // Pestaña activa: 'all' (todas) o 'favorites' (guardadas)
  const [activeTab, setActiveTab] = useState<'all' | 'favorites'>('all');

  // Filtro de búsqueda
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modales
  const [selectedRouteForDetail, setSelectedRouteForDetail] = useState<BusRoute | null>(null);
  const [selectedRouteForReport, setSelectedRouteForReport] = useState<BusRoute | null>(null);

  // Mensaje flotante de confirmación (toast)
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  /**
   * PUNTO CRÍTICO DONDE ALGUIEN SE EQUIVOCA:
   * Al actualizar datos de una ruta (como el nuevo precio reportado),
   * si el modal de detalles está abierto (`selectedRouteForDetail`),
   * debe actualizarse su referencia en pantalla. De lo contrario, el modal
   * seguirá mostrando el precio viejo hasta que se cierre y vuelva a abrir.
   */
  const handleToggleFavorite = (routeId: string) => {
    const updatedFavorites = toggleFavoriteId(routeId);
    setFavoriteIds(updatedFavorites);

    const isNowFav = updatedFavorites.includes(routeId);
    const targetRoute = routes.find((r) => r.id === routeId);
    const routeCode = targetRoute ? targetRoute.code : 'Ruta';

    showToast(
      isNowFav
        ? `⭐ ${routeCode} agregada a tus favoritas`
        : `Ruta ${routeCode} removida de favoritas`
    );
  };

  /**
   * Registro y aplicación de un nuevo reporte de precio con fecha
   */
  const handlePriceReportSubmit = (report: PriceReport) => {
    // 1. Guardar en localStorage
    savePriceReport(report);

    // 2. Recargar todas las rutas con el nuevo reporte incorporado
    const updatedRoutes = loadMergedRoutes();
    setRoutes(updatedRoutes);

    // 3. Sincronizar el modal de detalle si estaba viendo esta misma ruta
    if (selectedRouteForDetail && selectedRouteForDetail.id === report.routeId) {
      const refreshedRoute = updatedRoutes.find((r) => r.id === report.routeId) || null;
      setSelectedRouteForDetail(refreshedRoute);
    }

    showToast(
      `✓ Nuevo precio de ${formatFare(report.newFare)} registrado con fecha ${formatDateSpanish(
        report.effectiveDate
      )}`
    );
  };

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage((current) => (current === message ? null : current));
    }, 3500);
  };

  /**
   * Filtrado inteligente de rutas:
   * Busca en código (R-101), nombre, origen, destino y dentro de los nombres
   * y puntos de referencia de las paradas intermedias.
   * 
   * PUNTO CRÍTICO DONDE ALGUIEN SE EQUIVOCA:
   * Los usuarios de bus frecuentemente no recuerdan el código de la ruta,
   * sino el lugar por el que pasa (ej: "la que pasa por el EBAIS o el Hospital").
   * Si solo filtras por título, la búsqueda es inútil para el vecino del cantón.
   */
  const filteredRoutes = useMemo(() => {
    let result = routes;

    // Filtro por pestaña favoritas
    if (activeTab === 'favorites') {
      result = result.filter((route) => favoriteIds.includes(route.id));
    }

    // Filtro por texto de búsqueda
    const query = searchQuery.trim().toLowerCase();
    if (!query) return result;

    return result.filter((route) => {
      const matchCode = route.code.toLowerCase().includes(query);
      const matchName = route.name.toLowerCase().includes(query);
      const matchOrigin = route.origin.toLowerCase().includes(query);
      const matchDest = route.destination.toLowerCase().includes(query);
      const matchCompany = route.company.toLowerCase().includes(query);

      // Búsqueda en paradas y puntos de referencia
      const matchStop = route.stops.some(
        (stop) =>
          stop.name.toLowerCase().includes(query) ||
          (stop.landmark && stop.landmark.toLowerCase().includes(query))
      );

      return matchCode || matchName || matchOrigin || matchDest || matchCompany || matchStop;
    });
  }, [routes, favoriteIds, activeTab, searchQuery]);

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans">
      {/* Encabezado fijo superior */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        favoritesCount={favoriteIds.length}
        totalRoutesCount={routes.length}
      />

      {/* Contenedor principal con ancho máximo de móvil */}
      <main className="flex-1 max-w-md w-full mx-auto px-4 pt-3 pb-20">
        {/* Barra de búsqueda interactiva */}
        <SearchBar
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          onSelectQuickFilter={(tag) => setSearchQuery(tag)}
        />

        {/* Resumen del filtro actual si hay búsqueda o favoritas */}
        {(searchQuery || activeTab === 'favorites') && (
          <div className="flex items-center justify-between text-xs text-slate-400 mb-3 px-1">
            <span>
              {activeTab === 'favorites' ? 'Rutas favoritas' : 'Resultados'}:{' '}
              <strong className="text-white">{filteredRoutes.length}</strong>{' '}
              {filteredRoutes.length === 1 ? 'ruta' : 'rutas'}
            </span>
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="text-amber-400 hover:underline font-medium"
              >
                Limpiar filtro
              </button>
            )}
          </div>
        )}

        {/* Lista de tarjetas de rutas */}
        {filteredRoutes.length > 0 ? (
          <div className="space-y-3">
            {filteredRoutes.map((route) => (
              <RouteCard
                key={route.id}
                route={route}
                isFavorite={favoriteIds.includes(route.id)}
                onToggleFavorite={handleToggleFavorite}
                onSelectRoute={(r) => setSelectedRouteForDetail(r)}
                onOpenReportModal={(r) => setSelectedRouteForReport(r)}
              />
            ))}
          </div>
        ) : (
          /* Estados vacíos bien explicados */
          <div className="bg-slate-800/50 border border-slate-700/60 rounded-2xl p-6 text-center my-6">
            {activeTab === 'favorites' && favoriteIds.length === 0 ? (
              <div>
                <div className="w-12 h-12 rounded-full bg-amber-500/10 text-amber-400 flex items-center justify-center mx-auto mb-3">
                  <Star className="w-6 h-6 stroke-[1.8]" />
                </div>
                <h3 className="font-bold text-white text-base mb-1">
                  Sin rutas favoritas guardadas
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed max-w-xs mx-auto mb-4">
                  Tocá la estrella en cualquier ruta para tenerla a mano todos los días sin
                  tener que buscarla.
                </p>
                <button
                  type="button"
                  onClick={() => setActiveTab('all')}
                  className="px-4 py-2 bg-amber-500 text-slate-950 font-bold rounded-xl text-xs shadow hover:bg-amber-400 transition-colors"
                >
                  Ver todas las rutas del cantón
                </button>
              </div>
            ) : (
              <div>
                <div className="w-12 h-12 rounded-full bg-slate-700/50 text-slate-400 flex items-center justify-center mx-auto mb-3">
                  <Search className="w-6 h-6 stroke-[1.8]" />
                </div>
                <h3 className="font-bold text-white text-base mb-1">
                  No se encontraron rutas
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed max-w-xs mx-auto mb-3">
                  No hay coincidencias para "{searchQuery}". Probá buscando por barrio, hospital,
                  terminal o código de ruta.
                </p>
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="px-3.5 py-1.5 bg-slate-700 hover:bg-slate-600 text-slate-200 font-semibold rounded-lg text-xs transition-colors"
                >
                  Restablecer búsqueda
                </button>
              </div>
            )}
          </div>
        )}

        {/* Mensaje informativo al pie de la lista */}
        <div className="mt-6 p-3 bg-slate-800/40 border border-slate-800 rounded-xl text-[11px] text-slate-400 flex items-start gap-2">
          <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <p>
            PARO DE BUS es una libreta digital para el cantón. Si el bus subió o cambió de precio,
            tocá <strong>Reportar precio</strong> con la fecha para que nadie pague de más.
          </p>
        </div>
      </main>

      {/* Modal 1: Consultar ruta con sus paradas y tarifa */}
      <RouteDetailModal
        route={selectedRouteForDetail}
        onClose={() => setSelectedRouteForDetail(null)}
        isFavorite={
          selectedRouteForDetail ? favoriteIds.includes(selectedRouteForDetail.id) : false
        }
        onToggleFavorite={handleToggleFavorite}
        onOpenReportModal={(route) => {
          setSelectedRouteForReport(route);
        }}
      />

      {/* Modal 2: Reportar cambio de precio con fecha */}
      <PriceReportModal
        route={selectedRouteForReport}
        onClose={() => setSelectedRouteForReport(null)}
        onSubmitReport={handlePriceReportSubmit}
      />

      {/* Mensaje Toast Flotante */}
      {toastMessage && (
        <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-50 max-w-xs w-[90%] bg-slate-950/95 border border-amber-500/40 text-amber-300 text-xs font-semibold px-4 py-3 rounded-2xl shadow-xl flex items-center gap-2.5 backdrop-blur-md animate-in slide-in-from-bottom-3 duration-200">
          <CheckCircle className="w-4 h-4 text-amber-400 shrink-0" />
          <span className="flex-1">{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
