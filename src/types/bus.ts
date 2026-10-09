/**
 * Definición de tipos para la aplicación PARO DE BUS.
 * 
 * NOTA PARA DESARROLLADORES:
 * Las fechas deben manejarse en formato ISO (YYYY-MM-DD) para evitar
 * desfases de huso horario (timezones) comunes cuando se usa new Date().
 */

export interface BusStop {
  id: string;
  name: string;
  landmark?: string; // Punto de referencia popular (ej: "Frente al EBAIS", "Por la pulpería")
  order: number;
}

export interface PriceReport {
  id: string;
  routeId: string;
  oldFare: number;
  newFare: number;
  effectiveDate: string; // Formato YYYY-MM-DD de la fecha en que cambió o rige el pasaje
  note?: string; // Referencia opcional (ej: "Aviso pegado en el parabrisas", "Aprobado por Aresep")
  createdAt: string; // Timestamp ISO de cuando se registró el reporte
}

export interface BusRoute {
  id: string;
  code: string; // Código visible de la ruta, ej: "R-101", "R-104B"
  name: string;
  origin: string;
  destination: string;
  currentFare: number; // Tarifa actual en moneda local (ej: 450 colones)
  currencySymbol: string; // "₡" por defecto en el cantón
  scheduleSummary: string; // Resumen de horario (ej: "4:30 AM - 10:00 PM")
  frequencyMinutes: number; // Frecuencia estimada en minutos (ej: 15 min)
  company: string; // Empresa o cooperativa que opera la concesión
  stops: BusStop[];
  destinationImageUrl?: string; // Fotografía real o referencia visual de cómo se ve el lugar de destino
  destinationDescription?: string; // Descripción visual del destino y referencias para bajarse
  lastPriceUpdateDate: string; // Fecha del último cambio conocido (YYYY-MM-DD)
  priceReports: PriceReport[]; // Historial de reportes comunitarios
}
