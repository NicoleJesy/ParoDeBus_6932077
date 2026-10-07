import { BusRoute, PriceReport } from '../types/bus';
import { DEFAULT_ROUTES } from '../data/defaultRoutes';

/**
 * Claves de almacenamiento en localStorage.
 * TIP: Versionar las claves (v1) evita que la app truene si en el futuro
 * se modifica la estructura del esquema de datos.
 */
const STORAGE_KEYS = {
  FAVORITES: 'paro_de_bus_favorites_v1',
  COMMUNITY_PRICE_REPORTS: 'paro_de_bus_price_reports_v1',
};

/**
 * Obtiene la lista de IDs de rutas favoritas guardadas por el usuario.
 * 
 * PUNTO CRÍTICO DONDE ALGUIEN SE EQUIVOCA:
 * 1. Olvidar el try/catch: En navegadores con modo incógnito estricto o cookies bloqueadas,
 *    `localStorage.getItem` o `JSON.parse` pueden arrojar una excepción y romper toda la UI.
 * 2. Asumir que el contenido devuelto es siempre un array: Si el usuario manipuló el storage,
 *    debemos verificar con `Array.isArray`.
 */
export function getSavedFavoriteIds(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.FAVORITES);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error('Error al leer favoritas de localStorage:', error);
    return [];
  }
}

/**
 * Guarda o quita una ruta de favoritas.
 * Devuelve la lista actualizada de IDs favoritos.
 */
export function toggleFavoriteId(routeId: string): string[] {
  try {
    const currentFavorites = getSavedFavoriteIds();
    const exists = currentFavorites.includes(routeId);
    const updated = exists
      ? currentFavorites.filter((id) => id !== routeId)
      : [...currentFavorites, routeId];

    localStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(updated));
    return updated;
  } catch (error) {
    console.error('Error al guardar favorita en localStorage:', error);
    return [];
  }
}

/**
 * Obtiene todos los reportes de precio guardados localmente por la comunidad/usuario.
 */
export function getStoredPriceReports(): PriceReport[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.COMMUNITY_PRICE_REPORTS);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error('Error al leer reportes de precio de localStorage:', error);
    return [];
  }
}

/**
 * Guarda un nuevo reporte de cambio de precio y actualiza la tarifa actual de la ruta.
 * 
 * PUNTO CRÍTICO DONDE ALGUIEN SE EQUIVOCA:
 * 1. Guardar el precio como string: Si se guarda "500" como texto en vez de número,
 *    las comparaciones de precios o formatos monetarios fallarán más adelante.
 *    Siempre hay que convertir a Number() o validar.
 * 2. No registrar la fecha del reporte: Sin fecha es imposible saber qué reporte es más reciente
 *    si se registran varios.
 */
export function savePriceReport(report: PriceReport): PriceReport[] {
  try {
    const current = getStoredPriceReports();
    // Agregamos el nuevo reporte al inicio (más reciente primero)
    const updated = [report, ...current];
    localStorage.setItem(STORAGE_KEYS.COMMUNITY_PRICE_REPORTS, JSON.stringify(updated));
    return updated;
  } catch (error) {
    console.error('Error al guardar reporte de precio:', error);
    return [];
  }
}

/**
 * Fusiona las rutas base con los reportes de precio almacenados en el dispositivo.
 * 
 * PUNTO CRÍTICO DONDE ALGUIEN SE EQUIVOCA:
 * 1. Mutar el arreglo original `DEFAULT_ROUTES`: Si mutas la constante en memoria,
 *    React no detectará los cambios o tendrás efectos secundarios no deseados al refrescar.
 *    Siempre devolvemos objetos inmutables con spread syntax.
 * 2. Ordenar las fechas: Al determinar el `currentFare` de la ruta, el reporte con la
 *    `effectiveDate` más reciente debe mandar sobre el valor base predeterminado.
 */
export function loadMergedRoutes(): BusRoute[] {
  const localReports = getStoredPriceReports();

  return DEFAULT_ROUTES.map((route) => {
    // Clonamos los reportes base
    const routeReports = [...route.priceReports];

    // Adjuntamos reportes locales pertenecientes a esta ruta
    const userReportsForRoute = localReports.filter((rep) => rep.routeId === route.id);
    const combinedReports = [...userReportsForRoute, ...routeReports];

    // Si hay reportes registrados por usuarios, ordenamos para encontrar el más reciente
    if (combinedReports.length > 0) {
      // Orden descendente por fecha de vigencia
      const sorted = [...combinedReports].sort((a, b) => {
        return new Date(b.effectiveDate).getTime() - new Date(a.effectiveDate).getTime();
      });

      const latestReport = sorted[0];
      return {
        ...route,
        currentFare: latestReport.newFare,
        lastPriceUpdateDate: latestReport.effectiveDate,
        priceReports: sorted,
      };
    }

    return {
      ...route,
      priceReports: combinedReports,
    };
  });
}

/**
 * Formatea una fecha YYYY-MM-DD al español legible (ej: "15 de feb. de 2026").
 * 
 * PUNTO CRÍTICO DONDE ALGUIEN SE EQUIVOCA:
 * `new Date("2026-03-01")` interpreta la fecha como UTC a medianoche.
 * Al llamar `.toLocaleDateString()` en zonas horarias de América (UTC-6, UTC-5),
 * el navegador resta 6 horas y muestra "28 de febrero", ¡restando un día entero!
 * Para evitarlo, descomponemos año, mes y día de forma manual o usamos mediodía local.
 */
export function formatDateSpanish(dateString: string): string {
  if (!dateString) return 'Fecha no especificada';

  // Manejo a prueba de desfases de zona horaria
  const parts = dateString.split('-');
  if (parts.length === 3) {
    const year = parseInt(parts[0], 10);
    const monthIndex = parseInt(parts[1], 10) - 1;
    const day = parseInt(parts[2], 10);
    const date = new Date(year, monthIndex, day);
    return date.toLocaleDateString('es-CR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  }

  return dateString;
}

/**
 * Formatea un monto numérico a moneda del cantón (ej: ₡450)
 */
export function formatFare(amount: number, symbol = '₡'): string {
  return `${symbol}${amount.toLocaleString('es-CR')}`;
}
